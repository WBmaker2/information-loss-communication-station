# 정보 손실 통신소

전해지는 동안 달라진 뜻을 찾아, 근거에 맞는 안전 전달문을 고르는 초등 학습 웹앱입니다.

## 학습 목표와 기능 범위

- 원문과 바로 다음 전달문을 비교해 빠짐, 근거 없는 추가, 뜻 바뀜, 뜻 유지를 구분합니다.
- 시간·장소·수량부터 조건·출처·확실성까지 뜻 조각을 근거로 고릅니다.
- 3~4학년 기본 항로와 5~6학년 확장 항로에서 모두 합쳐 5개의 가상 사건을 제공합니다.
- 자유 입력, 드래그, 점수·순위, 계정, 영구 저장은 사용하지 않습니다.

## 실행과 검증

Node.js 22.13 이상에서 실행합니다.

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

`npm test`는 제품 환영 화면의 서버 렌더링, starter 제거, 데이터 항로 노출, 저장·자유 입력 API 부재를 확인합니다. `npm run typecheck`는 TypeScript 타입 일치를 검사하고, `npm run test:e2e`는 실제 Chromium에서 안내 활동과 사건 학습 흐름을 확인합니다. 의미 판정 규칙은 `domain/`의 순수 함수와 고정 사건 데이터로 구성됩니다.

## 개인정보 비수집 원칙

학생 이름, 실제 친구 이야기, 음성, 계정 정보를 입력하거나 전송하지 않습니다. 선택 상태는 브라우저 메모리 안에서만 유지되어 새로고침하면 초기화됩니다. 수업에서는 실제 긴급 안내나 안전 판단을 이 앱으로 대신하지 않습니다.

## GitHub Pages

이 프로젝트는 브라우저 메모리에서만 학습 상태를 관리하는 정적 앱으로
GitHub Pages에서도 사용할 수 있습니다.

- `npm run build:pages`: GitHub Pages용 정적 사이트 빌드
- 공개 주소: https://wbmaker2.github.io/information-loss-communication-station/
- 배포 방식: `.github/workflows/deploy-pages.yml`
- 정적 진입점: `pages/index.html`
