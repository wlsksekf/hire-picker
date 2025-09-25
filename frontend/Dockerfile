# --- 1. 빌드(Build) 스테이지 ---
FROM node:18-alpine as builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 먼저 복사 (캐싱 활용)
COPY package.json package-lock.json ./
RUN npm install

# 소스 코드 전체 복사 및 빌드
COPY . .
RUN npm run build

# --- 2. 서빙(Serve) 스테이지 ---
FROM nginx:1.23-alpine

# 우리가 만든 Nginx 설정을 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 스테이지에서 생성된 빌드 결과물을 Nginx의 웹 루트로 복사
COPY --from=builder /app/out /usr/share/nginx/html
# Next.js의 기본 빌드 출력 폴더는 .next 이지만, 정적 export는 out 폴더를 사용.
# package.json의 build 스크립트를 "build": "next build && next export"로 수정해야 할 수 있음.

# 컨테이너 80 포트 개방
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]