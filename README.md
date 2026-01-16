# 날씨 앱 (FSD)

- **문서**
  - [요구사항 체크리스트](./docs/requirements.md)
  - [기술 의사결정 로그](./docs/decisions.md)

## 데모

- 배포 URL: (추후 작성)

## 실행 방법

```bash
npm install
npm run dev
```

- 브라우저 **현재 위치** 기능은 보통 **secure context(HTTPS)** 에서 동작합니다.
  - 로컬 개발은 `localhost`에서 정상 동작합니다.
  - 권한 팝업이 뜨면 허용해 주세요.

## 구현 기능

- **현재 위치 날씨**
  - 현재 위치 기반으로 현재 기온/당일 최저·최고/시간대별 기온 표시
  - 권한 거부/실패 시 IP 기반 추정 → 마지막 저장 위치 → 기본값(서울) fallback
- **검색**
  - 제공된 `korea_districts.json` 기반 자동완성(키보드 내비게이션/IME 대응)
  - 선택한 장소의 좌표 지오코딩(Open‑Meteo → Nominatim fallback) 후 날씨 조회
- **즐겨찾기**
  - 최대 6개 저장(localStorage)
  - 카드에 현재/최저·최고 표시 + 별칭 수정 가능
  - 카드 클릭 시 상세(`/place/:placeId`)로 이동하여 전체 정보 표시

## 기술 스택

- React + TypeScript
- Vite
- TailwindCSS
- `react-router-dom`
- `@tanstack/react-query`
- Open‑Meteo (Weather API)
- Nominatim (Geocoding fallback)

## 기술적 의사결정

- 의사결정 로그: [docs/decisions.md](./docs/decisions.md)

## 폴더 구조

- `src/app`: 전역 provider, router, layout
- `src/pages`: 라우트 단위 조립(Home, Place)
- `src/widgets`: 화면 블록(SearchBar/MyLocation/Favorites/Detail 등)
- `src/features`: 사용자 행동 단위(위치 탐지, 지오코딩 등)
- `src/entities`: 도메인 모델/쿼리/저장소(favorite, place, weather)
- `src/shared`: 공용 UI/유틸/클라이언트

## 단점/대신 비용

- **FSD 분리**: 파일 수가 늘고, 초기 탐색 비용이 있습니다.
- **외부 API 다중 의존(Open‑Meteo + Nominatim)**: 장애/정책 변경 시 교체 비용이 생깁니다(캐싱으로 호출량 완화).
