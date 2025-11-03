# Hire Picker

채용/커리어 매칭 플랫폼 ‘hirepicker’ 모노레포입니다. Spring Boot 백엔드와 Next.js 프론트엔드로 구성됩니다.

## 요구 사항
- JDK 17
- Node.js 18+ (npm 9+ 권장)
- MySQL 8+ / Redis 6+

## 환경 변수(예시)
- DB: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- 인증: `JWT_SECRET`
- OAuth: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
- 메일: `SENDGRID_API_KEY`
- 결제: `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_WIDGET_SECRET_KEY`, `TOSS_API_SECRET_KEY`
- AI: `GOOGLE_API_KEY`
- S3: `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_NAME`

루트의 `.env` 또는 OS 환경변수로 주입하세요.

## 백엔드 실행(개발)
```bash
cd backend
./gradlew bootRun
```
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI: `http://localhost:8080/api-docs`
- Actuator(개발): `http://localhost:8080/actuator`

## 프론트엔드 실행(개발)
```bash
cd frontend
npm ci
npm run dev
```
- 프록시: `/api/*` → `http://localhost:8080`
- 개발 포트: `http://localhost:3000`

## 테스트
```bash
cd backend && ./gradlew test
cd ../frontend && npm test
```

## 국제화/인코딩
- 저장소 전역 `.editorconfig`로 UTF-8, LF, 들여쓰기 규칙을 고정합니다.
- Bean Validation 메시지를 `messages.properties`/`messages_ko.properties`로 한글 일원화했습니다.

## 트러블슈팅
- DB 커넥션 문제: `DB_URL/USER/PASSWORD` 재확인 및 방화벽/보안그룹 체크.
- Redis 연결 실패: 로컬 Redis(6379) 기동 여부 확인.
- CORS/프록시: 프론트의 `next.config.js` 리라이트 설정 확인.

## 배포(개요)
- 운영 프로필 `prod` 사용 권장.
- Actuator 공개 범위를 최소화하고 인증/망 분리를 적용하세요.

