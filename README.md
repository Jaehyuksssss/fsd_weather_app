# 날씨 앱 (FSD)

## 프로젝트 목적

- 요구사항(날씨/검색/즐겨찾기/상세)을 FSD 구조로 구현
- React + TypeScript + Tanstack Query 활용

## 문서

- [요구사항 체크리스트](./docs/requirements.md)
- [기술 의사결정 로그](./docs/decisions.md)

## 데모

- 배포 URL: https://app.figmaboy.org/
- QR: `public/qr_deploy.svg`

![Demo QR](./public/qr_deploy.svg)

## 로컬 실행 방법

```bash
npm install
npm run dev
```

- 브라우저 **현재 위치** 기능은 보통 **secure context(HTTPS)** 에서 동작합니다.
  - 로컬 개발은 `localhost`에서 정상 동작합니다.
  - 권한 팝업이 뜨면 허용해 주세요.

## 배포/인프라(Infra)

- **권장 구성**: S3(정적 호스팅) + CloudFront(CDN)
  - 정적 산출물: `npm run build` → `dist/`
  - SPA 라우팅: 404를 `index.html`로 리라이트(CloudFront 에러 응답 매핑)
  - 캐시: 배포 시 CloudFront invalidation 필요(또는 파일 해시 기반 캐시 전략)
- 배포 관련 의사결정: [docs/decisions.md](./docs/decisions.md) 참고

## 구현 기능

- **현재 위치 날씨**
  - 첫 진입 시 현재 위치를 감지하고 현재 기온/당일 최저·최고/시간대별 기온 표시
  - 실패 시 IP 기반 위치 → 마지막 저장 위치 → 기본값(서울) 순으로 fallback
- **검색**
  - 제공된 `korea_districts.json` 기반 자동완성(키보드 내비게이션/IME (한글 입력 시 엔터를 치면 글자가 두 번 입력되는 버그 대응)
  - 선택한 장소를 지오코딩(Open‑Meteo → Nominatim fallback) 후 날씨 조회
- **선택한 장소 카드**
  - 지오코딩 로딩/실패 상태 표시
  - 날씨 정보 없을 때 “해당 장소의 정보가 제공되지 않습니다.” 표시
- **즐겨찾기**
  - 최대 6개 저장(localStorage)
  - 카드에 현재 기온/최저·최고 표시 + 별칭 수정 가능
  - 카드 클릭 시 상세(`/place/:placeId`)로 이동
- **상세 페이지**
  - 현재 기온/최저·최고/시간대별 기온 표시

## 구현 상세

### 앱 엔트리 / 라우팅 / 전역 Provider

- **엔트리**
  - `src/main.tsx`에서 React 앱을 마운트
  - `src/app/App.tsx`는 **조립만** 담당 (`AppProviders` + `AppRouter`)
- **라우팅**
  - `src/app/router/router.tsx`
    - `/` → `HomePage`
    - `/place/:placeId` → `PlacePage`
- **전역 Provider**
  - `src/app/providers/QueryProvider.tsx`에서 `QueryClientProvider`
  - `src/app/providers/createQueryClient.ts`에서 `QueryClient` 생성
  - `src/app/providers/AppProviders.tsx`는 provider를 한 곳에서 묶어 확장(추후 theme/storage 등) 고려

### 도메인 모델(FSD entities)

- **Place**
  - `src/entities/place/model/types.ts`
  - 좌표는 Open‑Meteo 기준으로 `CoordsLatLon { lat, lon }` 사용
  - `buildPlaceId(label)`로 라벨 기반 id 생성
- **Weather**
  - `src/entities/weather/model/types.ts`
  - `WeatherModel { currentTempC, minTempC, maxTempC, hourly[] }`
- **Favorite**
  - `src/entities/favorite/model/types.ts`
  - `{ placeId, label, alias?, coords, createdAt }`

### API 클라이언트 / 데이터 매핑

- **Open‑Meteo 공통 fetch 유틸**
  - `src/shared/api/openMeteoClient.ts`
  - `buildQuery()`로 querystring 생성, `fetchJson()`에서 non‑2xx를 에러로 처리
- **날씨 조회(Open‑Meteo)**
  - `src/entities/weather/api/getOpenMeteoWeather.ts`
  - `/forecast` 호출 후 `WeatherModel`로 매핑
  - `currentTempC`는 `current.time` 기준으로 hourly에서 같은 “시(hour)” 값을 우선 사용
  - 시간대별은 “현재 시각 이후”로 slice 해서 12개만 노출
- **역지오코딩(좌표 → 위치명)**
  - `src/entities/place/api/getPlaceByCoords.ts`
  - BigDataCloud free reverse-geocode 사용 (`localityLanguage=ko`)
  - 결과를 `Place { placeId, label, coords }`로 반환

### TanStack Query(캐시/로딩 상태)

- **날씨 Query**
  - `src/entities/weather/query/useWeatherQuery.ts`
  - key: `["open-meteo-weather", lat, lon]`
  - `staleTime=60s`, `retry=false`
- **역지오코딩 Query**
  - `src/entities/place/query/usePlaceQuery.ts`
  - key: `["place-reverse", lat, lon]`
  - `staleTime=5m`, `gcTime=30m`, `retry=false`

### 현재 위치 감지 + fallback 전략

- **브라우저 geolocation(재시도 포함)**
  - `src/features/detect-location/model/useDetectLocation.ts`
  - 옵션 후보를 순차 재시도:
    - 캐시 빠른 조회(UX) → 기본 옵션 → high accuracy(마지막 수단)
- **ResolvedLocation(Geo → IP → last saved → Seoul)**
  - `src/features/detect-location/model/useResolvedLocation.ts`
  - 흐름:
    - geolocation success → 즉시 사용 + lastCoords 저장
    - geolocation error → `ipwho.is`로 1회 IP 위치 추정 후 저장
    - IP 실패 → last saved coords 사용
    - 모두 실패 → 기본값 서울
  - 사용처:
    - `src/widgets/my-location-card/ui/MyLocationCard.tsx`
    - `src/widgets/selected-preview/ui/SelectedPreview.tsx`(선택 좌표가 없을 때)

### 검색(자동완성/최근검색/지오코딩)

- **자동완성 데이터**
  - `src/entities/place/lib/koreaDistricts.ts`에서 `public/assets/korea_districts.json` 로드
  - 정렬 기준: prefix 우선 → 매칭 위치(앞일수록) → 라벨 길이(짧을수록) → locale
- **검색 UI**
  - `src/widgets/search-bar/ui/SearchBar.tsx`
  - IME 입력을 위해 composition 중에는 keydown 처리를 막음
  - Enter는 “명시적으로 하이라이트된 항목”이 있을 때만 선택(자동 선택 금지)
  - 최근 검색어(localStorage) 표시/삭제/전체삭제 지원
- **선택한 장소 지오코딩**
  - `src/features/select-place/model/useSelectPlace.ts`에서 선택 상태/지오코딩 상태를 관리
  - `src/features/geocode-place/api/geocodePlace.ts`
    - localStorage 캐시 확인 → Open‑Meteo geocoding → Nominatim fallback
  - `src/features/geocode-place/api/geocodeOpenMeteo.ts`
    - 한국 행정명 normalize + 후보 쿼리(전체/상위제거/끝2토큰/끝1토큰)로 재시도

### 즐겨찾기(Favorites): 저장/별칭/상세/순서 편집

- **저장소(localStorage)**
  - `src/entities/favorite/repo/favoritesRepo.ts`
  - 최대 6개 제한, 중복(placeId) 방지
- **상태 Hook**
  - `src/entities/favorite/model/useFavorites.ts`
  - `addFavorite/removeFavorite/updateAlias/reorderFavorite` 제공
- **목록 UI + 순서 편집 모드**
  - `src/widgets/favorites-list/ui/FavoritesList.tsx`
  - “순서 편집” 버튼으로 reorder mode 전환
    - **편집 모드 ON**: 카드 전체 드래그로 순서 변경, 상세 이동/별칭/삭제 버튼은 숨김(실수 방지)
    - **편집 모드 OFF**: 카드 클릭으로 상세 이동, 별칭/삭제 정상
- **상세 페이지**
  - `src/pages/place/PlacePage.tsx`
  - URL의 `placeId`로 favorites에서 검색 후 날씨 조회
  - 별칭 인풋은 바깥 클릭 시 저장/종료(UX 개선)

### 시간대별 스와이프(UI)

- `src/shared/ui/SwipeScroll.tsx`
  - 마우스/터치 드래그로 가로 스크롤(텍스트 선택 하이라이트 방지)
  - 좌/우 화살표 버튼(`showArrows`) + 시작/끝 자동 disabled
  - 화살표는 “시간대별” 헤더 줄과 같은 층에서 좌/우 배치

### localStorage 키 정리

- `favorites:v1` : 즐겨찾기 목록(순서 포함)
- `search:recent:v1` : 최근 검색어(최대 5개)
- `geocode:coordsByLabel:v1` : 라벨 → 좌표 지오코딩 캐시
- `weather:lastCoords:v1` : 마지막으로 성공한 좌표(현재 위치 fallback)

## 사용 API

- Open‑Meteo Weather (날씨)
- Open‑Meteo Geocoding (지오코딩)
- Nominatim (지오코딩 fallback)
- BigDataCloud (역지오코딩: 위치명)
- ipwho.is (IP 기반 대략 위치)

## 폴더 구조 (FSD)

- `src/app`: 전역 provider, router, layout
- `src/pages`: 라우트 단위 조립(Home, Place)
- `src/widgets`: 화면 블록(SearchBar/MyLocation/Favorites/Detail 등)
- `src/features`: 사용자 행동 단위(위치 탐지, 지오코딩 등)
- `src/entities`: 도메인 모델/쿼리/저장소(favorite, place, weather)
- `src/shared`: 공용 UI/유틸/클라이언트

## 기술 스택

- React + TypeScript
- Vite
- TailwindCSS
- `react-router-dom`
- `@tanstack/react-query`
- Open‑Meteo (Weather/Geocoding)
- Nominatim/BigDataCloud/ipwho.is (보조 API)

## 기술적 의사결정

- 의사결정 로그: [docs/decisions.md](./docs/decisions.md)
