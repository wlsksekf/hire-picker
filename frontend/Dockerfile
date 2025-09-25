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
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 스테이지에서 생성된 결과물 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# 3000번 포트 개방
EXPOSE 3000

# Next.js 서버 실행
CMD ["npm", "start"]
