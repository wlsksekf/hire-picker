# --- 1. 빌드(Build) 스테이지 ---
# 의존성 설치 레이어와 소스 코드 빌드 레이어를 분리하여 캐싱 효율 극대화
FROM node:18-alpine AS builder

WORKDIR /app

# package.json, package-lock.json 복사
COPY package.json package-lock.json ./

# 의존성 설치 (개발 의존성 포함)
RUN npm install

# 소스 코드 전체 복사
COPY . .

# Next.js 앱 빌드
RUN npm run build

# --- 2. 프로덕션(Production) 스테이지 ---
# 실제 서비스를 위한 최종 이미지
FROM node:18-alpine

WORKDIR /app

# 프로덕션 환경임을 명시
ENV NODE_ENV=production

# 빌드 스테이지에서 package.json 파일들만 복사
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 프로덕션에 필요한 의존성만 설치 (devDependencies 제외)
RUN npm install --production

# 빌드 스테이지에서 생성된 빌드 결과물(.next)과 public 폴더 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 3000번 포트 개방
EXPOSE 3000

# Next.js 프로덕션 서버 실행
CMD ["npm", "start"]