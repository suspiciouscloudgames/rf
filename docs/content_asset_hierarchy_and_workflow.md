# 콘텐츠 에셋 하이라키 및 운영 가이드

기준일: 2026-08-16

## 1. 목적

이 문서는 이미지, 2.5D 포털, 3D 모델, 텍스트, 사운드, 비디오 파일을 어디에 보관하고 어떻게 연결하거나 교체해야 하는지 정의한다.

핵심 원칙은 다음과 같다.

1. 제작 원본과 브라우저 런타임 파일을 분리한다.
2. 런타임 파일명과 경로는 영문 소문자 `kebab-case`를 사용한다.
3. 콘텐츠 ID는 코드와 파일에서 동일하게 사용한다.
4. 기존 경로는 현재 동작을 보호하기 위해 즉시 이동하지 않는다.
5. 새 콘텐츠부터 이 문서의 표준 경로를 사용한다.
6. 대용량 모델, 영상, 오디오 원본은 Git LFS로 관리한다.

## 2. 저장 영역의 구분

| 영역 | 경로 | 용도 | 브라우저 직접 접근 |
|---|---|---|---|
| 제작 원본 | `artwork/` | 편집 원본, 고해상도 소스, 작업 파일 | 불가 |
| 런타임 바이너리 | `public/assets/` | 이미지, 2.5D, GLB, 오디오, 비디오 | 가능 |
| 런타임 텍스트 예정 영역 | `public/content/` | 향후 런타임 JSON 로더가 읽을 텍스트 | 가능하지만 현재 미연결 |
| 현재 빌드형 텍스트 | `src/content/`, `src/locales/` | 현재 앱이 import하는 텍스트와 큐 | 빌드 후 번들에 포함 |
| 디자인 레퍼런스 | `references/` | 비교 이미지와 디자인 참고 자료 | 앱에서 사용하지 않음 |

### 2.1 제작 원본과 런타임 파일의 차이

```text
artwork/의 원본
    ↓ 편집·정리·압축·익스포트
public/assets/의 런타임 파일
    ↓ 코드 또는 콘텐츠 매니페스트에서 경로 연결
브라우저 표시/재생
```

`artwork/` 파일을 교체해도 앱 화면은 바뀌지 않는다. 앱이 실제로 사용하는 것은 `public/assets/` 아래의 익스포트 파일이다.

## 3. 표준 폴더 구조

```text
artwork/
├─ depth-portal/
│  └─ {portal-id}/
│     ├─ source/
│     ├─ working/
│     └─ preview/
├─ images/
│  └─ {content-id}/
├─ models/
│  └─ {model-id}/
├─ audio/
│  └─ {audio-id}/
└─ video/
   └─ {video-id}/

public/assets/
├─ images/
│  ├─ hub/
│  ├─ observations/
│  │  └─ {observation-id}/
│  └─ ui/
├─ depth-portal/
│  └─ {portal-id}/
├─ models/
│  ├─ environment/
│  ├─ props/
│  └─ observations/
│     └─ {observation-id}/
├─ audio/
│  ├─ ambience/
│  ├─ narration/
│  │  ├─ ja/
│  │  └─ en/
│  └─ sfx/
└─ video/
   ├─ hub/
   └─ observations/
      └─ {observation-id}/

public/content/
├─ manifests/
├─ ui/
├─ observations/
└─ subtitles/
```

중괄호로 표시한 `{portal-id}`, `{content-id}`, `{observation-id}`는 실제 콘텐츠 ID로 교체한다.

예:

```text
public/assets/images/observations/observation-05/detail-01.webp
public/assets/models/observations/observation-03/column.glb
public/assets/audio/narration/ja/observation-05.m4a
public/assets/video/observations/observation-05/archive-loop.mp4
```

## 4. 파일명 규칙

### 4.1 공통 규칙

- 영문 소문자 사용
- 공백과 한글 파일명 사용 금지
- 단어 구분은 하이픈 사용
- 같은 대상의 ID는 폴더와 코드에서 동일하게 유지
- `final`, `final-final`, `new` 같은 상태 이름 사용 금지
- 제작 버전은 `v001`, `v002` 형식 사용

좋은 예:

```text
construction-space-v002.blend
observation-05-narration-ja-v003.wav
detail-01.webp
archive-loop.mp4
```

나쁜 예:

```text
최종 진짜최종.png
new model 2.glb
sound_final_last.wav
```

### 4.2 콘텐츠 ID 규칙

| 종류 | ID 예시 |
|---|---|
| 관찰 콘텐츠 | `observation-05` |
| 신호 | `signal-05` |
| 2.5D 포털 | `construction-space` |
| 3D 모델 | `square-column` |
| 탐색 콘텐츠 | `trace-video` |
| 사운드 | `observation-05-narration-ja` |

## 5. 콘텐츠 유형별 사용 방법

## 5.1 일반 이미지

### 제작 원본

```text
artwork/images/{content-id}/
```

PSD, TIFF, 원본 PNG, 고해상도 사진처럼 브라우저에 그대로 배포하지 않을 파일을 보관한다.

### 런타임 파일

```text
public/assets/images/observations/{observation-id}/
public/assets/images/hub/
public/assets/images/ui/
```

권장 포맷:

- 사진: WebP 또는 AVIF
- 투명 배경: WebP 또는 PNG
- UI 아이콘: SVG 또는 WebP
- Depth/Mask 데이터: PNG

브라우저 경로 예시:

```text
/assets/images/observations/observation-05/detail-01.webp
```

### 파일 교체 조건

이미 연결된 이미지와 동일한 경로, 화면비, 역할을 유지하면 코드 변경 없이 파일만 교체할 수 있다. Git 또는 배포 서비스를 사용하는 경우에는 파일 변경을 반영하는 새 배포가 필요하다.

화면비 또는 투명도 규격이 달라지면 레이아웃, 크롭, 머티리얼 설정 수정이 필요할 수 있다.

## 5.2 2.5D 포털

### 제작 원본

```text
artwork/depth-portal/{portal-id}/source/
artwork/depth-portal/{portal-id}/working/
artwork/depth-portal/{portal-id}/preview/
```

### 런타임 파일 세트

```text
public/assets/depth-portal/{portal-id}/
├─ color.webp
├─ depth.png
├─ midground-color.webp
├─ midground-mask.png
├─ foreground-color.webp
├─ foreground-mask.png
└─ fallback.webp
```

현재 연결된 포털 ID는 `construction-space`이며 `signal-05`에서 사용한다.

### 파일만 교체할 수 있는 조건

기존 `construction-space` 포털을 교체하면서 다음 조건을 모두 유지하면 코드 변경 없이 런타임 파일만 교체할 수 있다.

- 파일명 동일
- 모든 컬러·마스크·Depth 파일의 픽셀 크기 동일
- 화면비 동일
- UV 정렬 동일
- Depth Map의 흑백 방향 동일
- 전경 및 중경 마스크 의미 동일

Depth Map은 현재 **밝을수록 먼 영역**, **어두울수록 가까운 영역**이라는 전제에 맞춰 사용한다.

### 코드 수정이 필요한 경우

- 새 `{portal-id}` 추가
- 다른 신호에 포털 연결
- 이미지 화면비 변경
- 레이어 수 증가
- `depthScale`, `depthGamma`, `maxParallax` 변경
- 새로운 핫스폿 좌표 추가

새 포털 ID를 추가할 때는 최소 다음 파일이 변경된다.

```text
src/scene/depth-portal/DepthPortalAssets.ts
src/scene/depth-portal/depthPortalConfig.ts
src/signals/signalData.ts
```

## 5.3 3D 모델

### 제작 원본

```text
artwork/models/{model-id}/
```

Blender, FBX, 고해상도 텍스처, 베이크 원본을 보관한다.

### 런타임 파일

```text
public/assets/models/environment/
public/assets/models/props/
public/assets/models/observations/{observation-id}/
```

권장 런타임 포맷은 GLB이다.

```text
/assets/models/props/smartphone-stand.glb
/assets/models/observations/observation-03/square-column.glb
```

### 현재 구현 상태

현재 집 내부의 테이블, 의자, 스마트폰 스탠드, 기둥, 액자는 Three.js 기본 도형으로 생성된다. 추가로 `signal-04`에는 `feed_projection_01.glb`가 연결되어 Observation Entry Click부터 작은 크기로 표시된다.

```text
제작 원본: artwork/models/feed_projection_01.glb
런타임 파일: public/assets/models/observations/observation-04/feed-projection-01.glb
```

따라서 현재는 GLB 파일을 폴더에 넣는 것만으로 화면에 나타나지 않는다. `useGLTF` 기반 로더, 위치, 크기, 재질, 포커스 그룹 연결 작업이 필요하다.

### 파일만 교체할 수 있는 조건

모델 로더가 한 번 연결된 이후 다음 조건을 유지하면 같은 경로의 GLB 파일만 교체할 수 있다.

- 루트 좌표계와 축 방향 동일
- 모델 원점 동일
- 실제 크기 또는 scale 기준 동일
- 코드에서 참조하는 노드 이름 동일
- 애니메이션 클립 이름 동일
- 필요한 텍스처가 GLB에 포함되어 있음

노드명 또는 리깅 구조가 바뀌면 코드 수정이 필요하다.

## 5.4 텍스트

텍스트는 **구조 코드**, **현재 빌드형 콘텐츠**, **향후 런타임 교체형 콘텐츠**로 구분한다.

### A. 구조 코드에 유지해야 하는 항목

다음 항목은 일반 문장이 아니라 프로그램 구조이므로 코드 또는 검증된 설정 스키마에 유지해야 한다.

- `signal-01~05` ID
- `observation-01~05` ID
- Stage, Transition, Observation Mode 이름
- 컴포넌트와 UI 표시 조건
- 타임라인 액션 종류
- 카메라 및 3D 좌표
- 포털 핫스폿 좌표
- 에셋 ID와 신호 연결 관계

이 항목들은 단순 텍스트 파일 교체 대상이 아니다.

### B. 현재 파일 수정 후 빌드가 필요한 텍스트

| 텍스트 종류 | 현재 파일 | 코드 수정 필요 | 빌드 필요 |
|---|---|---:|---:|
| 공통 UI 문구 | `src/locales/ja.json`, `en.json` | 스키마 유지 시 없음 | 필요 |
| 신호별 제목·내레이션 | `src/content/focusContent.ts` | TypeScript 파일 수정 | 필요 |
| 2.5D 자막 문장·시작 시간 | `src/content/observationSubtitles.ts` | TypeScript 파일 수정 | 필요 |
| 30초 길이 및 이벤트 데이터 | `src/content/observations.json` | 스키마 유지 시 없음 | 필요 |
| Explore 항목의 표시 구조 | `src/ui/ExploreInterface.tsx` | 필요 | 필요 |
| 로딩 문구 | `src/app/App.tsx` | 필요 | 필요 |
| 좌표 표시 문자열 | `src/ui/Interface.tsx` | 필요 | 필요 |

`src` 아래 파일은 Vite 빌드 시 JavaScript 번들에 포함된다. 문장만 바꾸더라도 `npm run build`와 새 배포가 필요하다.

### C. 향후 파일만 교체하는 런타임 텍스트

다음 폴더는 런타임 JSON 콘텐츠를 위한 예약 구조이다.

```text
public/content/ui/
public/content/observations/
public/content/subtitles/
public/content/manifests/
```

권장 구조:

```text
public/content/ui/ja.json
public/content/ui/en.json
public/content/observations/observation-05.ja.json
public/content/observations/observation-05.en.json
public/content/subtitles/observation-05.ja.json
public/content/subtitles/observation-05.en.json
public/content/manifests/content-manifest.json
```

예시 자막 파일:

```json
{
  "observationId": "observation-05",
  "language": "ja",
  "cues": [
    { "start": 10, "text": "暗がりの奥で、まだ形にならない記憶が呼吸している。" }
  ]
}
```

주의: 이 폴더는 현재 앱에 아직 연결되어 있지 않다. 실제로 파일 교체만으로 텍스트를 업데이트하려면 다음 구현이 추가로 필요하다.

1. 런타임 JSON fetch 로더
2. JSON 스키마 검증
3. 로드 실패 시 현재 내장 텍스트 fallback
4. 언어 및 observation ID별 캐시
5. PWA 캐시 갱신 또는 콘텐츠 버전 쿼리

이 로더가 구현된 뒤에는 문장과 자막 큐를 JSON 파일 교체만으로 변경할 수 있다. Git 기반 배포에서는 코드 수정은 없어도 새 콘텐츠 파일을 배포하는 과정은 필요하다.

## 5.5 사운드

### 제작 원본

```text
artwork/audio/{audio-id}/
```

WAV, AIFF, 멀티트랙, 편집 세션, 고해상도 마스터를 보관한다.

### 런타임 파일

```text
public/assets/audio/ambience/
public/assets/audio/narration/ja/
public/assets/audio/narration/en/
public/assets/audio/sfx/
```

권장 포맷:

- 긴 배경음: AAC/M4A 또는 MP3
- 짧은 효과음: OGG 또는 MP3
- 제작 마스터: WAV 또는 AIFF

예:

```text
/assets/audio/ambience/hub-room-tone.mp3
/assets/audio/narration/ja/observation-05.m4a
/assets/audio/sfx/signal-enter.ogg
```

### 현재 구현 상태

첫 사용자 입력에서 브라우저 오디오 권한을 해제하는 상태는 구현되어 있지만 실제 사운드 재생기와 타임라인 연결은 아직 없다. 따라서 현재는 파일을 추가하는 것만으로 재생되지 않는다.

사운드를 실제로 사용하려면 다음 항목이 필요하다.

- Audio 또는 Web Audio 로더
- Stage/Transition/Timeline 큐 연결
- 음량과 페이드 설정
- 언어별 내레이션 선택
- 허브 복귀 시 정지 및 상태 초기화
- 모바일 자동재생 제한 대응

재생기가 연결된 이후 동일한 경로와 길이 조건을 유지하면 사운드 파일만 교체할 수 있다. 길이가 달라지면 자막과 카메라 타이밍 재조정이 필요할 수 있다.

## 5.6 비디오

### 제작 원본

```text
artwork/video/{video-id}/
```

### 런타임 파일

```text
public/assets/video/hub/
public/assets/video/observations/{observation-id}/
```

현재 실제 연결 경로는 다음과 같다.

```text
public/assets/hub-background.mp4
public/assets/archive-signal.mp4
```

위 두 파일은 기존 동작 보호를 위해 현재 위치를 유지한다. 새 비디오부터 표준 `public/assets/video/` 구조를 사용하고, 기존 비디오는 관련 코드 경로를 함께 변경할 때 이동한다.

같은 경로, 코덱, 역할을 유지하면 코드 수정 없이 파일을 교체할 수 있다. 영상 길이가 Guided 타임라인과 연결되는 경우 길이 변경 시 큐 검토가 필요하다.

## 6. 파일 교체와 코드 수정 판단표

| 변경 작업 | 파일만 교체 | 코드 수정 | 빌드/배포 |
|---|---:|---:|---:|
| 같은 경로의 일반 이미지 교체 | 가능 | 없음 | 배포 필요 |
| 같은 규격의 기존 2.5D 세트 교체 | 가능 | 없음 | 배포 필요 |
| 새 2.5D 포털 ID 추가 | 불가 | 필요 | 필요 |
| 현재 절차형 오브젝트를 GLB로 교체 | 불가 | 필요 | 필요 |
| 이미 연결된 GLB를 같은 구조로 교체 | 가능 | 없음 | 배포 필요 |
| `src/locales/*.json` 문장 수정 | 파일 수정 가능 | 없음 | 빌드 필요 |
| `focusContent.ts` 문장 수정 | 불가 | TypeScript 수정 | 빌드 필요 |
| 현재 자막 문장 또는 시작 시간 수정 | 불가 | TypeScript 수정 | 빌드 필요 |
| 향후 `public/content` JSON 문장 수정 | 로더 구현 후 가능 | 없음 | 콘텐츠 배포 필요 |
| 새 사운드 최초 연결 | 불가 | 필요 | 필요 |
| 이미 연결된 동일 경로 사운드 교체 | 가능 | 없음 | 배포 필요 |

## 7. PWA 캐시 주의사항

이 프로젝트는 Service Worker를 사용하는 PWA이다. 동일한 파일명으로 런타임 파일을 교체하면 브라우저가 이전 파일을 캐시하고 있을 수 있다.

안전한 갱신 방법은 다음 중 하나이다.

1. 파일명에 버전을 추가하고 매니페스트 경로를 변경한다.

```text
observation-05-narration-ja-v002.m4a
```

2. 콘텐츠 매니페스트에 버전을 추가한다.

```json
{
  "version": "2026-08-16-02"
}
```

3. 런타임 콘텐츠 fetch에 버전 쿼리를 사용한다.

```text
/content/subtitles/observation-05.ja.json?v=2026-08-16-02
```

배포 후에는 이전 Service Worker와 캐시가 정리되었는지 확인해야 한다.

## 8. Git LFS 규칙

다음 대용량 확장자는 Git LFS 대상으로 설정한다.

- 영상: MP4, MOV, WebM
- 3D: GLB, FBX, Blend, 외부 BIN
- 오디오 마스터: WAV, AIF, AIFF, FLAC, M4A
- 2.5D 제작 원본: 지정된 PNG, PSD, EXR

작은 JSON, TypeScript, SVG, 런타임 WebP 파일은 일반 Git으로 관리한다.

## 9. 콘텐츠 추가 체크리스트

### 이미지

- [ ] 제작 원본은 `artwork/images/`에 저장
- [ ] 런타임 WebP/PNG를 `public/assets/images/`에 익스포트
- [ ] 파일명은 영문 소문자 kebab-case
- [ ] 코드 또는 콘텐츠 데이터에 브라우저 경로 연결
- [ ] 데스크톱과 모바일 화면비 검증

### 2.5D

- [ ] 모든 컬러, Depth, Mask 크기 일치
- [ ] Depth 흑백 방향 확인
- [ ] 전경 및 중경 마스크 정렬 확인
- [ ] fallback 이미지 준비
- [ ] 포털 ID와 signal 연결 확인
- [ ] 진입, Guided, 복귀 전환 검증

### 3D 모델

- [ ] 원점과 축 방향 정리
- [ ] GLB 크기 및 텍스처 압축 확인
- [ ] 단위와 scale 기준 기록
- [ ] 노드 및 애니메이션 이름 고정
- [ ] 포커스 그룹과 카메라 타깃 연결
- [ ] 모바일 성능 검증

### 텍스트

- [ ] 구조 ID와 표시 문장 구분
- [ ] 일본어 및 영어 파일 동시 갱신
- [ ] 자막 시간축이 Entry Clock인지 Observation Clock인지 표시
- [ ] 현재 빌드형인지 향후 런타임형인지 확인
- [ ] PWA 캐시 버전 확인

### 사운드

- [ ] 제작 마스터와 런타임 압축본 분리
- [ ] 언어와 observation ID를 파일명에 포함
- [ ] 시작 시점과 페이드 길이 기록
- [ ] 모바일 사용자 입력 후 재생 확인
- [ ] 허브 복귀 시 정지 확인

## 10. 권장 콘텐츠 요청 형식

```text
[콘텐츠 유형]
[콘텐츠 ID / 신호 ID]
[제작 원본 경로]
[런타임 파일 경로]
[표시 또는 재생 단계]
[사용 시간축과 시작 시각]
[파일 교체인지 신규 연결인지]
[유지해야 하는 화면비·길이·노드명]
[검증 기준]
```

예:

```text
콘텐츠 유형: 사운드 / 일본어 내레이션
Observation: observation-05 / signal-05
런타임 경로: /assets/audio/narration/ja/observation-05.m4a
재생 구간: Guided Observation
시간축: Entry Clock E 10초 시작
작업 종류: 신규 연결
자막 큐와 시작 시점을 유지
허브 복귀 시 0.6초 페이드아웃 후 정지
```

## 11. 현재 파일의 분류

| 현재 경로 | 분류 | 상태 |
|---|---|---|
| `artwork/depth-portal/construction-space/` | 2.5D 제작 원본 | 표준 구조 |
| `public/assets/depth-portal/construction-space/` | 2.5D 런타임 | 표준 구조, 사용 중 |
| `public/assets/hub-background.mp4` | Hub 런타임 비디오 | 사용 중, 이전 경로 |
| `public/assets/archive-signal.mp4` | Explore 런타임 비디오 | 사용 중, 이전 경로 |
| `artwork/models/feed_projection_01.glb` | signal-04 3D 제작 원본 | 사용 중 |
| `public/assets/models/observations/observation-04/feed-projection-01.glb` | signal-04 런타임 GLB | 사용 중 |
| `references/*.png` | 디자인 레퍼런스 | 앱에서 미사용 |
| `src/locales/*.json` | 빌드형 공통 UI 텍스트 | 사용 중 |
| `src/content/focusContent.ts` | 빌드형 신호별 내레이션 | 사용 중 |
| `src/content/observationSubtitles.ts` | 빌드형 자막 큐 | 사용 중 |
| `public/content/` | 런타임 텍스트 예약 구조 | 아직 로더 미연결 |
