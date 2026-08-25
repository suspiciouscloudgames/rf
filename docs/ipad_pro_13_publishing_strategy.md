# iPad Pro 13 퍼블리싱 및 전시 운영 전략

작성 기준일: 2026-08-24<br>
대상 프로젝트: FeedReNew_Co<br>
대상 기기: iPad Pro 13-inch<br>
설계·검증 기준: 2752 × 2064, 가로 4:3<br>
문서 상태: 퍼블리싱 방식 결정 및 출시 준비 기준

## 1. 결론

이 프로젝트에는 다음 구성이 가장 적합하다.

> **Vercel 정적 배포 + 홈 화면에 설치한 PWA + iPad Guided Access**

이 구성은 현재 Vite·React·React Three Fiber 기반 코드를 네이티브 앱으로 다시 감싸지 않고 배포할 수 있으며, 성능·운영 편의·복구 가능성의 균형이 가장 좋다.

- **성능:** 정적 파일을 CDN에서 빠르게 전달하고 PWA 캐시로 재실행 속도와 네트워크 장애 내성을 확보한다.
- **운영:** Git 기반 배포, Preview 검수, Production 승격과 이전 배포 롤백이 쉽다.
- **안정성:** 홈 화면 standalone 실행, Guided Access, 오프라인 사전 점검과 WebGL 복구 정책을 조합할 수 있다.
- **개발 범위:** 현재 웹 렌더링 구조와 비주얼을 유지한다. 별도의 네이티브 렌더러 이식은 필요하지 않다.

Cloudflare Pages도 정적 배포 대안으로 충분하다. 다만 한 프로젝트에서 Preview 검수와 Production 승격·롤백을 단순하게 운영하려는 현재 상황에서는 Vercel을 1순위로 권장한다.

## 2. 배포 방식 비교

| 방식 | GPU·WebGL 성능 | 운영 편의 | 오프라인·장애 대응 | 권장 용도 | 종합 판단 |
| --- | --- | --- | --- | --- | --- |
| Vercel + PWA | 현재 Safari/WebKit 렌더 성능 유지 | 매우 좋음 | PWA 캐시 및 롤백 가능 | 온라인 또는 제한적 오프라인 전시 | **기본 권장** |
| Cloudflare Pages + PWA | Vercel과 실질적으로 동일 | 좋음 | PWA 캐시 가능 | 기존 Cloudflare 운영 환경 | 좋은 대안 |
| 로컬 Mac/공유기 서버 | 렌더 성능은 동일 | 현장 장비 의존도가 높음 | 인터넷 단절에는 강하지만 서버·공유기가 단일 장애점 | 완전 폐쇄망 전시 | 특수 상황용 |
| Capacitor iOS 앱 | WebView 기반이므로 WebGL 성능 향상은 제한적 | 빌드·서명·배포 관리 필요 | 에셋 완전 번들 및 MDM 배포 가능 | App Store/MDM/완전 오프라인 필수 환경 | 필요 조건이 있을 때만 |
| 개발 서버 직접 실행 | 최적화되지 않은 개발 환경 | 재현성과 운영 안정성이 낮음 | 장애 복구 체계 없음 | 로컬 개발 전용 | **전시 사용 금지** |

호스팅 서비스는 초기 HTML·JavaScript·미디어 전달 속도와 캐시 안정성에는 영향을 주지만, Morph Room이 실행되는 동안의 GPU 프레임 성능을 직접 개선하지는 않는다. 지속 프레임 성능은 iPad의 Safari/WebKit, WebGL 렌더 해상도, 셰이더 비용과 장면 업데이트 비용에 의해 결정된다.

## 3. 권장 운영 구조

```text
Git main
  └─ Vercel Preview 배포
       └─ 2752×2064 기준 시각·기능 검수
            └─ Production 승격
                 └─ iPad PWA 업데이트 확인
                      └─ Guided Access로 전시 실행
```

### 3.1 배포 환경

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`
- Production에서는 `npm run dev`와 `npm run preview`를 사용하지 않는다.
- Preview URL에서 검증을 끝낸 빌드만 Production으로 승격한다.
- 전시 중에는 자동 배포하지 않고, 정해진 유지보수 시간에만 Production을 갱신한다.

### 3.2 iPad 실행 환경

- Safari에서 Production URL을 연 뒤 홈 화면에 추가한다.
- 홈 화면 아이콘으로 standalone 모드에서 실행한다.
- 가로 방향을 고정하고 Guided Access를 활성화한다.
- 상시 전원과 자동 잠금 해제를 설정한다.
- 전시 시작 전 Production 버전, 오프라인 실행, 터치 입력과 오디오 정책을 확인한다.

여러 대의 기관 관리 iPad를 운영하는 경우 Guided Access 대신 MDM의 Single App Mode를 우선 검토한다.

## 4. 현재 프로젝트에서 유지할 설정

현재 PWA 설정은 다음 기반을 이미 갖추고 있다.

- standalone 표시 모드
- landscape 방향
- Apple 홈 화면 실행용 메타 태그
- JavaScript, CSS, HTML, 이미지, 영상과 JSON의 Workbox 프리캐시
- Morph Room DPR 범위 `0.65–1.0`

Morph Room의 최대 DPR이 1인 것은 대상 iPad에서 중요한 성능 안전장치다. 2752×2064는 기기의 물리 픽셀 기준이며, WebGL 캔버스를 무조건 DPR 2로 렌더링할 필요는 없다. UI는 DOM 해상도를 유지하면서 3D 렌더 버퍼의 비용을 제한하는 현재 방향을 유지한다.

실기 검증 없이 DPR 상한을 2로 올리지 않는다. 이는 픽셀 수와 셰이더 부하를 크게 늘려 장시간 실행 시 발열과 스로틀링 위험을 높인다.

## 5. 출시 전 필수 보강

### P0 — 재현 가능한 빌드

- `package.json`의 `latest` 의존성을 검증된 정확한 버전으로 고정한다.
- `package-lock.json`과 `pnpm-lock.yaml` 중 실제 배포에 사용하는 잠금 파일 하나만 유지한다.
- CI와 로컬 검증에서 동일하게 `npm ci`를 사용한다.
- Node.js 버전도 프로젝트 설정으로 고정한다.

통과 기준: 새 환경에서 같은 커밋을 빌드했을 때 동일한 의존성 조합과 성공 결과가 재현되어야 한다.

### P1 — PWA 업데이트 정책 변경

현재 `vite-plugin-pwa`는 `registerType: 'autoUpdate'`로 설정되어 있다. 자동 업데이트는 열린 전시 앱이 새 서비스 워커에 의해 예상하지 못한 시점에 갱신되거나 재로드될 수 있으므로 장시간 전시 운영에 적합하지 않다.

권장 정책:

- 새 버전을 감지해도 관객 화면에서는 즉시 적용하지 않는다.
- 관리자 전용 업데이트 확인 또는 다음 앱 재시작 때 적용한다.
- 유지보수 시간에 온라인 상태에서 업데이트한 뒤 Production 버전과 오프라인 실행을 다시 검증한다.
- 문제 발생 시 이전 Production 배포로 즉시 롤백한다.

통과 기준: 전시 실행 중 새 배포가 발생해도 화면이 자동 재로드되지 않아야 한다.

### P2 — WebGL 장애 복구

- `webglcontextlost`와 `webglcontextrestored` 이벤트를 처리한다.
- 복구 중에는 브라우저 기본 오류 대신 프로젝트 톤에 맞는 안전한 오버레이를 표시한다.
- 현재 단계, 선택 신호와 필요한 재생 상태를 복원한다.
- 제한 시간 내 복구되지 않을 때만 통제된 앱 재시작을 수행한다.
- 정상 실행 경로에서는 카메라, Morph Room, 파티클과 UI 비주얼에 영향을 주지 않는다.

통과 기준: 강제 컨텍스트 손실 후 관객 조작 없이 정상 화면과 입력이 복구되어야 한다.

### P3 — 프로덕션 진단 비용 제거

- 매 프레임 Canvas `dataset`을 쓰는 진단 코드는 개발 모드 또는 명시적 진단 모드로 제한한다.
- 필요한 진단 샘플은 초당 2–4회 이하로 제한한다.
- Production에서는 불필요한 콘솔 출력과 성능 문자열 생성을 중단한다.
- 파티클 수, UI, Morph Room 셰이더와 시간축은 변경하지 않는다.

통과 기준: 고정 카메라·고정 시간의 A/B 이미지와 실제 전환 영상이 기존 비주얼과 일치해야 한다.

### P4 — 오프라인 범위 확정

- 초기 온라인 실행에서 필요한 모든 핵심 에셋이 캐시되는지 확인한다.
- 비행기 모드에서 앱을 완전히 종료하고 홈 화면에서 재실행한다.
- 영상, GLB, 이미지, 폰트와 JSON 누락 여부를 전 단계에서 확인한다.
- iPad 저장 공간 부족 시 Safari/PWA 데이터가 제거될 가능성을 운영 위험으로 관리한다.

PWA 캐시는 완전 영구 저장소가 아니다. 따라서 전시 시작 전 매일 오프라인 재실행 테스트를 수행하고, Production URL을 다시 불러올 수 있는 네트워크 복구 수단을 준비한다.

## 6. 단계별 출시 절차

각 단계는 **구현 → 빌드 검증 → 2752×2064 시각 검증 → 실기 검증 → 다음 단계** 순서로 진행한다.

### 단계 0 — 기준선 동결

- 현재 승인된 기본 URL 상태와 Morph Room 패널 값을 기록한다.
- Hub, 2-step, 2→3, Observation, Hub 복귀 화면을 캡처한다.
- 카메라 회전 전체와 가구 침강 전환을 영상으로 기록한다.
- 파티클과 UI가 비교 대상에서 누락되지 않도록 전체 화면 기준선을 보관한다.

### 단계 1 — 배포 재현성 확보

- 의존성 및 Node 버전 고정
- 잠금 파일 단일화
- Production build와 Preview 검증

### 단계 2 — 전시용 PWA 업데이트 제어

- 자동 갱신 제거
- 관리자 승인 또는 재시작 적용 방식 추가
- 온라인 업데이트와 오프라인 재실행 검증

### 단계 3 — 장기 실행 안전장치

- WebGL 컨텍스트 복구
- 프로덕션 진단 비용 제거
- 백그라운드 복귀 시 시간 점프 및 미디어 상태 확인

### 단계 4 — Vercel Production 구성

- Preview와 Production 환경 분리
- Production 도메인 고정
- 배포·승격·롤백 절차 문서화
- 전시 중 배포 금지와 유지보수 시간 확정

### 단계 5 — 실제 iPad 검증

- 30분 기능 및 비주얼 테스트
- 1시간 발열·메모리 예비 테스트
- 4시간 반복 전환 테스트
- 8시간 최종 전시 지속 테스트
- 네트워크 단절, PWA 재실행, 기기 재부팅과 복구 테스트

세부 렌더 성능 최적화 순서는 [iPad 전시 환경 성능 안정화 계획](./ipad_exhibition_performance_plan.md)을 따른다.

## 7. 출시 승인 기준

### 성능

- iPad Pro 13에서 목표 30fps 이상을 시각적으로 안정되게 유지한다.
- 1% low와 긴 프레임이 관객 경험을 방해하지 않는다.
- 8시간 실행 후 지속적인 프레임 저하나 과도한 발열 스로틀링이 없다.
- DPR, 셰이더 품질 또는 파티클을 승인 없이 낮춰 목표를 맞추지 않는다.

### 비주얼

- 모든 비교는 2752×2064, 가로 4:3을 기준으로 한다.
- Morph Room의 크기, low camera, 회전 구도, 색감, Bloom, Vignetting과 표면 안정성이 기준선과 일치한다.
- 가구 형태·배치·침강과 나무 크기·형태가 승인된 상태를 유지한다.
- 기존 파티클과 UI는 픽셀 위치, 수량, 표시 타이밍과 움직임을 유지한다.

### 운영

- 홈 화면 PWA가 브라우저 UI 없이 실행된다.
- Guided Access 또는 MDM Single App Mode가 설정되어 있다.
- 전시 중 새 배포가 자동 적용되지 않는다.
- 운영자가 업데이트, 오프라인 확인, 강제 종료, 재실행과 롤백 절차를 수행할 수 있다.

### 장애 복구

- 네트워크가 끊겨도 이미 캐시된 전시 흐름이 실행된다.
- WebGL 컨텍스트 손실에서 복구되거나 통제된 재시작이 이루어진다.
- iPad 재부팅 후 운영자가 5분 이내에 정상 전시 상태로 복귀시킬 수 있다.

## 8. 현장 운영 체크리스트

### 전시 시작 전

- [ ] iPad가 상시 전원에 연결되어 있다.
- [ ] 화면 방향이 가로로 고정되어 있다.
- [ ] 자동 잠금, 알림, 제스처와 멀티태스킹 노출을 차단했다.
- [ ] 홈 화면 PWA에서 Production 버전을 확인했다.
- [ ] Hub → 2-step → 3-step → Hub 1회 순환을 확인했다.
- [ ] Morph Room 카메라 회전, Bloom, Vignetting, 가구 침강과 파티클/UI를 확인했다.
- [ ] 비행기 모드 재실행 테스트를 통과했다.
- [ ] Guided Access 또는 Single App Mode를 시작했다.

### 전시 종료 후

- [ ] 당일 검은 화면, 입력 멈춤, 강제 재시작과 네트워크 장애를 기록했다.
- [ ] 기기 온도와 장시간 프레임 저하 여부를 기록했다.
- [ ] 다음 날 업데이트가 필요한 경우에만 유지보수 모드로 전환했다.
- [ ] 업데이트 후 온라인 및 오프라인 실행을 모두 재검증했다.

## 9. Capacitor로 전환해야 하는 조건

다음 조건 중 하나가 확정될 때만 Capacitor 패키징을 별도 프로젝트 단계로 검토한다.

- App Store 또는 사내 앱 배포가 필수다.
- MDM으로 설치 파일과 버전을 강제 관리해야 한다.
- 인터넷 없이 최초 설치부터 모든 대용량 에셋을 제공해야 한다.
- 네이티브 기기 API나 네이티브 키오스크 제어가 필요하다.

Capacitor는 배포 포장과 네이티브 연동에는 유리하지만, Three.js/WebGL 장면이 WebView에서 실행되는 구조 자체는 유지된다. 따라서 현재 Morph Room의 GPU 성능을 높이는 수단으로 우선 선택하지 않는다.

## 10. 참고 자료

- [Vercel의 Vite 배포 가이드](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel CDN 캐시](https://vercel.com/docs/caching/cdn-cache)
- [Cloudflare Pages의 Vite 배포 가이드](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)
- [vite-plugin-pwa 업데이트 동작](https://vite-pwa-org.netlify.app/guide/auto-update)
- [Apple: Safari용 웹사이트 최적화](https://developer.apple.com/documentation/webkit/optimizing-your-website-for-safari)
- [Apple: 홈 화면 웹 앱](https://developer.apple.com/videos/play/wwdc2023/10120/)
- [Apple: Guided Access](https://support.apple.com/guide/ipad/lock-ipad-to-one-app-ipada16d1374/26/ipados/26)
- [WebKit 저장소 정책 및 제거 조건](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [Capacitor 공식 문서](https://capacitorjs.com/docs)
