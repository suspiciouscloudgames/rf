# Morph Room 회전 시각 안정화 설계

기준일: 2026-08-20  
대상: `morph-plan` 2step 회전 장면  
상태: 원인 재현 완료, Temporal Flicker 제어 구현, 윤곽 및 Front Wall 안정화는 설계 단계

## 1. 목표

- 회전 중 얇은 벽, 창틀, 문틀의 픽셀 단위 자글거림을 줄인다.
- 카메라를 향하는 벽이 투명해질 때 두 번째 표면이 한 프레임씩 튀는 현상을 제거한다.
- 평면 치수, 벽 두께, 카메라, 색상과 회전 속도는 바꾸지 않는다.
- iPad Pro M2에서 안정적인 30fps 목표를 유지한다.
- 필름 효과 문제와 Raymarching 안정성 문제를 분리해 검증한다.

## 2. 현재 원인

### 2.1 Temporal Film

시간에 따라 변하는 효과가 세 군데 존재한다.

1. Shader 내부 12fps Grain 패턴 교체
2. Shader 내부 랜덤 밝기 Flicker
3. DOM `morph-film-overlay`와 전역 `noise` 위치 애니메이션

이 항목은 `morphTemporalFlickerEnabled`로 제어한다. Off 상태에서도 정적 Grain과 색조는 유지한다.

### 2.2 Raymarching 윤곽

현재 Morph 모드는 실효 DPR이 최대 1이며, 실루엣은 실제 Geometry Edge가 아니라 Raymarching의 Hit/Miss와 `discard`로 결정된다. 얇은 구조물이 회전할 때 같은 픽셀이 Hit와 Miss를 반복해 시간적 앨리어싱이 발생한다.

현재 주요 값:

- 1차 최대 64 step
- Hit threshold `0.0045`
- 최소 전진 거리 `0.002`
- 벽 반두께 `0.072`
- 실효 DPR 최대 `1`
- 기본 회전 주기 `210초`

### 2.3 Front Wall 합성

현재 `frontWall > 0.015`이면 두 번째 Raymarching 결과를 즉시 완전 합성한다. `frontWall` 값은 회전과 추정 Normal에 따라 변하므로 경계 픽셀이 단일 표면과 2중 표면 합성 사이를 오갈 수 있다.

또한 Front Wall 판정이 Waver가 포함된 전체 SDF의 추정 Normal을 사용하므로, 벽 자체가 축 정렬 구조임에도 시간 변화가 판정에 들어간다.

## 3. 변경 원칙

문제를 한 번에 수정하지 않고 아래 순서를 지킨다.

1. Temporal Film을 끈 기준선 확보
2. Front Wall 합성 가중치 안정화
3. Front Wall 방향 판정 안정화
4. Raymarching 윤곽 Coverage 적용
5. 그래도 부족할 때만 선택적 추가 샘플 적용

각 단계는 고정 카메라 이미지와 회전 영상을 이전 단계와 비교한 뒤 다음 단계로 진행한다.

## 4. 설계 A — Front Wall 합성 가중치

### 현재 방식

```glsl
if (frontWall > 0.015) {
  // 두 번째 표면을 찾으면 즉시 전체 합성
}
```

### 제안 방식

두 번째 표면의 기여도를 연속적인 값으로 만든다.

```glsl
float secondSurfaceWeight = smoothstep(
  FRONT_WALL_SECONDARY_START,
  FRONT_WALL_SECONDARY_FULL,
  frontWall
);

if (secondSurfaceWeight > 0.001) {
  // 두 번째 표면 탐색
  float secondaryAlpha = secondOpacity
    * (1.0 - firstOpacity)
    * secondSurfaceWeight;
  // first + weighted secondary 합성
}
```

초기 후보값:

- `FRONT_WALL_SECONDARY_START = 0.02`
- `FRONT_WALL_SECONDARY_FULL = 0.20`

목표는 분기 자체를 완전히 제거하는 것이 아니라, 분기를 넘는 첫 프레임의 시각적 기여도를 0에 가깝게 만드는 것이다.

## 5. 설계 B — 안정적인 벽 방향 판정

Front Wall 판정에는 Waver가 적용된 최종 Normal 대신 구조용 Normal을 사용한다.

우선순위:

1. `buildingWallField` 전용 Gradient로 Stable Wall Normal 계산
2. 성능이 부족하면 가장 가까운 축 정렬 벽의 방향 ID를 Field 결과에 포함
3. 바닥, 프레임, 나무는 Front Wall 대상에서 제외

권장 Field 결과:

```glsl
struct SceneSample {
  float distance;
  float wallInfluence;
  float featureInfluence;
  vec3 stableWallNormal;
};
```

GLSL 구조체 비용이나 드라이버 호환성이 문제가 되면 `vec4`와 별도 함수로 분리한다. 시각적 SDF에는 Waver를 유지하되 카메라 방향 판정만 안정화한다.

## 6. 설계 C — Raymarching Edge Coverage

일반 MSAA는 Fragment Shader의 `discard` 실루엣을 충분히 처리하지 못한다. 따라서 Shader 내부 Coverage가 필요하다.

### 6.1 1차안: Near-miss Coverage

Raymarching 중 최소 화면 공간 오차를 추적한다.

```glsl
float minimumNormalizedDistance = LARGE_VALUE;

for (...) {
  float distanceToSurface = sceneField(point).x;
  float pixelFootprint = estimatePixelFootprint(point);
  minimumNormalizedDistance = min(
    minimumNormalizedDistance,
    abs(distanceToSurface) / max(pixelFootprint, EPSILON)
  );
}
```

Hit하지 못했지만 표면에 충분히 가까운 픽셀은 즉시 `discard`하지 않고 0~1 Coverage로 변환한다. 내부 픽셀은 기존 단일 Raymarching 결과를 그대로 사용한다.

### 6.2 Pixel Footprint

GLSL3 derivative를 사용한다.

```glsl
float pixelFootprint = max(
  length(dFdx(point)),
  length(dFdy(point))
);
```

Derivative가 불안정한 GPU를 대비해 최소·최대 범위를 둔다. Hit threshold도 고정값 하나가 아니라 `pixelFootprint` 기반 범위 안에서 계산한다.

### 6.3 2차안: 선택적 2-sample

Near-miss 구간 픽셀에만 Subpixel Offset Ray를 하나 더 발사한다.

- 내부 표면: 기존 1 sample
- 완전 배경: 즉시 discard
- 윤곽 후보: 최대 2 sample

전체 2×2 Supersampling은 Plan Morph의 현재 비용상 사용하지 않는다.

## 7. 설계 D — 시간 안정성

윤곽 AA 이후에도 Waver가 얇은 벽의 Hit/Miss를 크게 바꾸면 다음을 검토한다.

- 구조 벽의 SDF에는 Waver 진폭을 낮추고 프레임·나무에는 현재 값을 유지
- 또는 Waver는 Shading Normal에만 적용하고 구조 실루엣에는 제한적으로 적용

이는 Morph Room의 형태감을 바꿀 수 있으므로 마지막 단계로 미룬다.

## 8. 성능 예산

우선 적용 대상은 Front Wall 안정화와 단일 Coverage 계산이다. 추가 Raymarching은 윤곽 후보에만 허용한다.

목표 예산:

- 데스크톱 GPU frame time 증가 10% 이하
- iPad Pro 13-inch(2752 × 2064) GPU frame time 증가 15% 이하
- 2step에서 안정적인 30fps 이상
- 30분 회전 테스트 중 WebGL context loss 없음

비용이 예산을 넘으면 DPR 증가보다 Front Wall 2차 Raymarching의 호출 범위를 먼저 줄인다.

## 9. 검증 장면

### 정적 기준선

- Temporal Flicker Off
- Waver Amount 0
- 동일 카메라와 FOV
- 회전각 `0°, 15°, 30°, 45°, 60°, 75°, 90°`
- 창틀, 문틀, 전면 벽, 나무 외곽을 별도 Crop 비교

### 동적 기준선

- 기본 210초 회전
- Temporal Flicker Off/On 각각 녹화
- Front Wall Fade Angle `30°, 58°, 75°`
- Room Opacity와 Front Wall Opacity 기본값 유지

### 통과 기준

- Flicker Off에서 Shader와 DOM 필름 패턴이 시간에 따라 바뀌지 않음
- 회전 중 얇은 윤곽의 한 프레임 Hit/Miss 반전이 기준선보다 50% 이상 감소
- Front Wall 경계에서 두 번째 표면이 한 프레임에 완전 등장하지 않음
- 구조 실루엣 이동이 기존 기준선 대비 1px을 넘지 않음
- 색, 카메라, 치수와 회전 속도 변화 없음

## 10. 구현 단계

1. `morphTemporalFlickerEnabled` 기준선 및 브라우저 검증 — 구현됨
2. Second Surface Weight 적용
3. Stable Wall Normal 적용
4. Edge Coverage 디버그 표시 추가
5. Edge Coverage 본 적용
6. 필요 시 윤곽 후보 2-sample 실험
7. iPad Pro 13-inch(2752 × 2064) 성능·회귀 검증

각 단계는 별도 커밋 또는 최소한 독립된 Diff로 유지해 시각 문제가 생기면 한 단계만 되돌릴 수 있게 한다.

## 11. A/B 테스트 구조

### 11.1 기본 원칙

A/B 테스트는 같은 장면을 좌우에 동시에 렌더링하지 않는다. Plan Morph Shader는 이미 비용이 높기 때문에 동시 렌더는 GPU 부하와 발열을 두 배로 만들고 성능 비교를 왜곡한다.

한 Canvas와 한 Plan Morph Material을 유지하면서 Shader Uniform만 전환한다.

| Variant | 의미 |
| --- | --- |
| `A · Baseline` | 현재 Raymarching, Front Wall 판정과 합성식을 그대로 유지 |
| `B · Stabilized` | Front Wall 안정화와 Edge Coverage 후보를 적용 |

Variant 전환 시 다음 상태는 유지해야 한다.

- Camera position, target, FOV
- Plan Morph rotation
- Stage와 transition progress
- Waver/Ripple 시간
- 색상과 Opacity
- 렌더 DPR

Variant 변경으로 React 컴포넌트나 Material이 Remount되면 정확한 A/B가 아니므로, `uStabilityVariant` Uniform 값만 `0` 또는 `1`로 바꾼다.

### 11.2 실험 상태 저장 위치

전시용 `tuningStore`와 분리된 `morphStabilityExperimentStore`를 권장한다. 안정화 후보는 실험 기능이므로 기존 로컬 저장값과 섞지 않는다.

```ts
type MorphStabilityVariant = 'baseline' | 'stabilized'

interface MorphStabilityExperimentState {
  variant: MorphStabilityVariant
  freezeTime: boolean
  freezeRotation: boolean
  rotationAngle: number
  debugView: 'none' | 'edge-candidate' | 'front-wall-risk'
}
```

URL 쿼리로 동일 상태를 다시 열 수 있게 한다.

```text
?room=morph-plan&stability=a
?room=morph-plan&stability=b
?room=morph-plan&stability=a&freeze=1&angle=45&time=0
?room=morph-plan&stability=b&freeze=1&angle=45&time=0
```

`room=morph-plan`의 기본값은 검증된 `B · Stabilized`로 둔다. `stability=a`를 명시하면 기존 Baseline을 재현할 수 있다.

### 11.3 튜닝 패널

`Morph Stability Lab` 섹션을 추가한다.

- `A · Baseline`
- `B · Stabilized`
- `Freeze Rotation`
- `Rotation Angle`
- `Freeze Shader Time`
- `Debug View`

UI 전환은 `aria-pressed`를 사용하는 Segmented Control로 만들며 선택값을 Canvas dataset에도 기록한다.

```text
data-morph-stability-variant="baseline|stabilized"
data-morph-stability-debug="none|edge-candidate|front-wall-risk"
data-plan-morph-rotation="..."
```

이 값은 브라우저 자동 검증이 동일 조건을 확인하는 데 사용한다. 매 프레임 문자열 기록은 개발/튜닝 패널 활성 상태에서만 허용한다.

## 12. B Variant 세부 설계

### 12.1 단일 Variant Uniform

```glsl
uniform float uStabilityVariant; // 0.0 = A, 1.0 = B
```

Baseline 코드는 조건문 안에서 그대로 유지한다. B를 추가하는 과정에서 A의 상수, 분기와 합성 순서를 정리하거나 리팩터링하지 않는다. 그래야 A가 실제 현재 화면의 기준선으로 남는다.

### 12.2 Front Wall Weight

```glsl
float baselineSecondaryWeight = step(0.015, frontWall);
float stabilizedSecondaryWeight = smoothstep(0.02, 0.20, frontWall);
float secondaryWeight = mix(
  baselineSecondaryWeight,
  stabilizedSecondaryWeight,
  uStabilityVariant
);
```

B에서는 두 번째 표면의 Alpha에 `secondaryWeight`를 곱한다.

```glsl
float secondaryAlpha = secondOpacity
  * (1.0 - firstOpacity)
  * secondaryWeight;
```

A에서는 현재와 동일하게 임계값을 넘는 순간 두 번째 표면이 완전 합성된다. B에서는 임계각을 지나며 두 번째 표면이 연속적으로 증가한다.

### 12.3 Stable Wall Normal

Waver가 포함된 전체 `sceneField` Normal을 Front Wall 판정에 사용하지 않는다. 축 정렬 벽 Primitive를 평가할 때 가장 가까운 벽의 명시적 Normal을 함께 반환한다.

```glsl
vec4 buildingWallSample(vec3 point) {
  // x = signed distance, yzw = stable wall normal
}
```

각 벽 조각을 평가할 때 가장 작은 Distance와 해당 방향을 함께 저장한다.

```glsl
void selectWall(
  inout vec4 nearestWall,
  float distanceToWall,
  vec3 wallNormal
) {
  if (distanceToWall < nearestWall.x) {
    nearestWall = vec4(distanceToWall, wallNormal);
  }
}
```

Front Wall 계산은 다음처럼 분기한다.

```glsl
vec3 baselineNormal = estimatedSceneNormal;
vec3 stabilizedNormal = buildingWallSample(firstPoint).yzw;
vec3 frontWallNormal = normalize(mix(
  baselineNormal,
  stabilizedNormal,
  uStabilityVariant * wallInfluence
));
```

렌더용 Shading Normal과 AO는 기존 Normal을 계속 사용한다. 오직 카메라 방향 판정만 구조 Normal로 안정화한다.

### 12.4 Edge Candidate 검출

바로 Alpha를 변경하지 않고 먼저 Debug View를 구현한다. 1차 Raymarch 중 가장 작은 정규화 거리를 기록한다.

```glsl
float closestDistance = LARGE_VALUE;
vec3 closestPoint = point;

for (...) {
  float distanceToSurface = sceneField(point).x;
  if (abs(distanceToSurface) < closestDistance) {
    closestDistance = abs(distanceToSurface);
    closestPoint = point;
  }
}
```

화면 공간 Ray Footprint는 Loop 밖에서 계산하고, 가장 가까운 지점까지의 Ray Depth를 곱해 월드 거리 단위로 변환한다.

```glsl
vec3 rayDirection = normalize(vLocalPosition - uCameraLocal);
float angularFootprint = max(
  length(dFdx(rayDirection)),
  length(dFdy(rayDirection))
);
float closestRayDepth = length(closestPoint - uCameraLocal);
float worldPixelFootprint = max(
  closestRayDepth * angularFootprint,
  0.0001
);
float edgeScore = closestDistance / worldPixelFootprint;
```

Primary Miss는 `edgeScore`로 표면 근접도를 판정한다. Primary Hit는 거리 점수만으로 내부 픽셀까지 후보가 되는 것을 막기 위해 `abs(dot(normal, -rayDirection))` 기반 Grazing Risk를 함께 사용한다.

`edge-candidate` Debug View에서 다음 색을 사용한다.

- 검정: 내부 또는 완전 배경
- 노랑: 추가 Sample 후보
- 빨강: 프레임마다 Hit/Miss가 바뀔 가능성이 높은 영역

Debug View 검증 전에는 최종 Alpha에 Edge Score를 적용하지 않는다.

### 12.5 선택적 2-sample Coverage

Debug View로 후보 범위가 확인되면 후보 픽셀에서만 두 번째 Ray를 발사한다.

```glsl
bool edgeCandidate = edgeScore < EDGE_CANDIDATE_LIMIT;
float silhouetteCoverage = primaryHit ? 1.0 : 0.0;

if (uStabilityVariant > 0.5 && edgeCandidate) {
  bool secondaryHit = marchSecondarySubpixelRay(...);
  silhouetteCoverage = (
    float(primaryHit) + float(secondaryHit)
  ) * 0.5;
}
```

Subpixel Ray는 `dFdx(rayDirection)`과 `dFdy(rayDirection)`의 고정 조합으로 이동한다. 프레임마다 Jitter 위치를 바꾸지 않는다. 시간에 따라 Jitter가 바뀌면 새로운 Flicker가 생긴다.

최종 Alpha:

```glsl
float finalAlpha = compositedOpacity
  * revealFade
  * silhouetteCoverage;
```

Primary가 Miss이고 Secondary만 Hit한 경우에는 Secondary Hit Point의 Normal, Color와 Depth를 사용한다.

## 13. A/B 검증 방식

### 13.1 시각 비교

한 각도에서 다음 순서로 캡처한다.

1. Flicker Off
2. Freeze Time On
3. Freeze Rotation On
4. A 캡처
5. Material Remount 없이 B 전환
6. B 캡처
7. 동일한 dataset 값 확인

각도 세트:

```text
0°, 15°, 30°, 45°, 58°, 60°, 75°, 90°
```

`58°`는 현재 Front Wall Fade Angle 기본값이므로 별도로 포함한다.

### 13.2 회전 비교

- 같은 시작각과 210초 회전 주기
- A 20초 녹화
- 새로고침 후 같은 시작각에서 B 20초 녹화
- 창틀, 문틀, 전면 벽 ROI를 분리 비교

시각 A/B에서는 개발자 도구, 튜닝 패널과 Debug Overlay를 닫는다.

### 13.3 성능 비교

A와 B를 각각 별도 페이지 실행으로 측정한다. Live Toggle 직후의 Shader Compilation과 캐시 워밍업 구간은 제외한다.

- 10초 워밍업
- 60초 측정
- 평균 FPS, 1% low, 긴 프레임 수
- GPU frame time 가능 시 기록
- iPad 온도 안정화 후 같은 순서 반복

좌우 동시 렌더나 한 페이지의 두 Canvas는 성능 판정에 사용하지 않는다.

## 14. A/B 합격 기준

### Front Wall

- `frontWall` 임계각 전후에서 두 번째 표면의 Alpha가 단조롭게 증가
- 인접 프레임에서 두 번째 표면이 0에서 완전 표시로 전환되지 않음
- 기존 Front Wall 최소 Opacity와 Fade Angle 체감 유지

### Edge

- 회전 중 창틀·문틀 Edge의 Hit/Miss 반전 픽셀 50% 이상 감소
- 기준 실루엣 대비 1px보다 큰 팽창 또는 수축 없음
- 얇은 구조가 흐려져 사라지거나 두꺼워지지 않음

### Performance

- 데스크톱 GPU 비용 증가 10% 이하
- iPad Pro 13-inch(2752 × 2064) GPU 비용 증가 15% 이하
- 2step 안정적 30fps 이상

기준을 만족하지 못하면 B를 전시 기본값으로 승격하지 않는다.

## 15. 구현 권장 순서

1. Experiment Store와 URL Query 추가 — 구현됨
2. A/B UI와 Freeze Rotation/Time 추가 — 구현됨
3. `uStabilityVariant` 연결 — 구현됨, 현재 A와 B 화면 동일
4. Front Wall Weight만 B에 적용하고 A/B 검증 — 구현됨
5. Stable Wall Normal을 B에 추가하고 다시 검증 — 구현됨
6. Edge Candidate Debug View 추가 — 구현됨
7. 선택적 2-sample을 B에 추가
8. 시각·성능 기준 통과 후에만 B를 일반 코드로 승격

각 단계에서 A Shader 경로의 출력이 기존 기준 이미지와 같은지 먼저 확인한다.

현재 A/B 기반은 일반 URL에서 `A · Baseline`, 회전과 Shader Time은 Live가 기본값이다. 실험 상태는 localStorage에 저장하지 않으며 URL Query로만 재현한다. Freeze Time 동안 Waver는 지정 시간에 고정하고 진행 중 Ripple은 비활성화해 캡처 간 차이를 제거한다.

B1은 `A · Baseline`의 `frontWall > 0.015` 조건과 합성식을 그대로 보존한다. `B · Candidate`에서만 `smoothstep(0.02, 0.20, frontWall)`을 두 번째 표면의 기여도에 적용하며, Weight가 사실상 0인 구간에서는 추가 Raymarch를 생략한다.

B2는 `B · Candidate`에서 `buildingWallField`만 유한차분한 Wall-only Normal을 Front Wall 카메라 방향 판정에 사용한다. 전체 `sceneField`의 Waver와 Ripple은 Shading Normal과 AO에는 그대로 남지만 Front Wall 판정에는 영향을 주지 않는다. Wall 영향도가 `0.015` 이하인 픽셀에서는 추가 Normal 계산을 생략하고, 유효한 Gradient를 얻지 못하면 기존 Scene Normal로 복귀한다.

B3는 `debug=edge`일 때만 1차 Raymarch 중 최소 표면 거리와 해당 지점을 추적한다. Primary Miss는 깊이를 반영한 World Pixel Footprint 대비 근접도를, Primary Hit는 Grazing Risk와 근접도를 결합해 후보를 표시한다. 검정은 내부 또는 안정 영역, 노랑은 추가 Sample 후보, 빨강은 고위험 후보를 뜻한다. Normal View에서는 이 추적 분기를 실행하지 않으며 최종 Alpha와 실루엣은 아직 변경하지 않는다.

## 16. 회전 뒷면 가시성 보존

### 16.1 확인된 원인

238° 뒷면 고정각의 `Front Wall Risk` 진단에서 넓은 외벽이 빨강으로 나타났다. 이 영역은 Front Wall 감쇠 대상이지만 Raymarch 방향 뒤에 합성할 두 번째 표면이 없었다. 따라서 첫 표면 Alpha만 낮아지고 배경이 드러나 외벽 형태가 유실됐다.

첫 표면 Alpha를 복구한 뒤에도 외벽은 충분히 보이지 않았다. 고정 방향광과 반대가 된 뒷면 Normal의 `diffuse`가 Shadow Color에 가까워져, 불투명하지만 배경과 거의 같은 명도로 렌더링되는 두 번째 원인이 있었다.

### 16.2 B 전용 수정

- 1차 전체 필드는 카메라 쪽 외벽을 약한 반투명 셸로 유지한다.
- 2차 내부 필드는 룸 중심보다 카메라 쪽에 있는 벽을 제외하고 바닥·내벽·반대편 구조를 추적한다.
- Normal 방향이 아니라 카메라 근접 반공간으로 cutaway 대상을 정해 정면과 뒷면, 시선과 평행한 측벽을 동일하게 처리한다.
- B는 외벽 셸 직후부터 내부 필드를 직접 48회 추적해 별도의 벽 탈출 루프와 3번째 레이어를 사용하지 않는다.
- Wall Influence가 smooth union에서 약해진 픽셀은 `buildingWallField` 실제 거리로 벽 후보를 복구한다.
- B 벽면에는 최소 Diffuse와 Shadow/Base Color 사이의 최소 색상값을 보장한다.
- A는 기존 Alpha, 조명, 합성 경로를 그대로 유지한다.
- `front-wall-risk`에서 빨강은 외벽 셸만 남는 영역, 초록은 내부 표면까지 합성된 영역을 뜻한다.

### 16.3 고정각 검증

| 조건 | 결과 |
| --- | --- |
| B4, 180°/260°, Time 0, visibility 1 | 외벽 셸 뒤로 바닥·문틀·내부 벽이 표시됨 |
| B, 58°, Time 0, visibility 1 | 기존 정면 구조, 문, 내벽, 오브젝트 유지 |
| 정적 검증 | TypeScript, production build, `git diff --check` 통과 |
| 브라우저 | 두 고정각 모두 콘솔 오류 0 |

### 16.4 회전 회귀 검증

- B4의 고정각 검증에서는 `b4-bidirectional-cutaway`를 확인한다.
- 명시적 `stability=a`로 전환하면 `baseline`으로 복귀하며, 일반 `room=morph-plan` URL은 B4를 기본 사용한다.
- 1280×900 Headless Chrome 상대 측정에서 A 평균 프레임 간격 138.5ms, B4 150.9ms로 약 9.0% 증가했다. 소프트웨어 렌더러의 절대 FPS가 아닌 A/B 상대 회귀 확인용이며, 실제 전시 GPU의 60초 성능 판정을 대체하지 않는다.
