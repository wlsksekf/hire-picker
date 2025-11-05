# ✨ hirepicker (하이어피커)

> Your next career starts here. / 당신의 다음 커리어를 'hirepicker'에서.

## 📖 About / 프로젝트 소개

'hirepicker' is a comprehensive career platform that goes beyond simply listing jobs. It supports users from resume management to seamless communication with companies, facilitating a successful career journey.

<details>
<summary>🇰🇷 한국어 설명 (Korean Description)</summary>

'hirepicker'은 단순히 일자리를 나열하는 것을 넘어, 사용자의 이력서 관리부터 기업과의 원활한 소통까지 지원하여 성공적인 커리어 여정을 돕는 서비스입니다. 저희 팀은 [**이 프로젝트를 통해 해결하고 싶었던 문제점이나 개발 동기**]를 바탕으로 이 프로젝트를 시작했습니다.

</details>

---

## 🚀 Features / 주요 기능

* **User Management**: Secure authentication (Login/Sign-up) based on JWT and Social Login.
* **Resume Management**: Intuitive CRUD for resumes and PDF download functionality.
* **Job Postings**: Advanced search and filtering for job postings by conditions (role, tech stack, location, etc.).
* **Application Tracking**: Easy application process and status tracking for job seekers.
* **Company Reviews**: Share and read vivid reviews on company culture and interviews.

<details>
<summary>🇰🇷 한국어 기능 설명 (Korean Features)</summary>

* **회원 관리**: JWT 기반의 안전한 로그인/회원가입 및 소셜 로그인 기능
* **이력서 관리**: 직관적인 UI를 통해 이력서 작성, 수정, 삭제(CRUD) 및 PDF 다운로드 기능
* **채용 공고**: 조건별(직무, 기술 스택, 지역 등) 채용 공고 검색 및 필터링
* **지원 관리**: 간편한 입사 지원 및 지원 현황 트래킹
* **기업 리뷰**: 사용자들이 남긴 생생한 기업 문화 및 면접 후기 공유

</details>

---

## 🛠️ Tech Stack / 기술 스택

### Backend

<img alt="Java" src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white"> <img alt="Spring Boot" src="https://img.shields.io/badge/Spring Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white"> <img alt="Spring Security" src="https://img.shields.io/badge/Spring Security-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white">

### Frontend

<img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img alt="Zustand" src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white"> <img alt="Axios" src="https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white">

### Database

<img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">

### DevOps

<img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"> <img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white">

---

## 🔧 Getting Started / 실행 방법

### 사전 준비

프로젝트를 실행하기 위해 아래의 도구들이 필요합니다.

*   Git
*   JDK 17
*   Node.js (v18 이상 권장)
*   Docker & Docker Compose
*   (수동 실행 시) MySQL, Redis

### 1. 프로젝트 클론

```bash
# HTTPS
git clone https://github.com/wlsksekf/hirepicker.git

# SSH
# git clone git@github.com:wlsksekf/hirepicker.git

cd hirepicker
```

### 2. 환경 변수 설정

프로젝트 루트 디렉토리(`.git` 폴더가 있는 위치)에 `.env` 파일을 생성하고, 아래 내용을 참고하여 본인의 환경에 맞게 값을 채워주세요. 이 파일은 데이터베이스, 외부 API 키 등 민감한 정보를 관리합니다.

```env
# .env 예시

# DB (MySQL)
DB_URL=jdbc:mysql://localhost:3306/your_database
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Redis
# docker-compose 사용 시 'redis-dev' 또는 'hirepicker-redis'로 자동 설정됩니다.
# 수동 실행 시 로컬 Redis 호스트 주소를 입력하세요. (예: localhost)
SPRING_DATA_REDIS_HOST=localhost

# Google OAuth 2.0
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret

# Toss Payments (결제 위젯)
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
TOSS_WIDGET_SECRET_KEY=your_toss_widget_secret_key
TOSS_API_SECRET_KEY=your_toss_api_secret_key

# Google Generative AI (Gemini)
GOOGLE_API_KEY=your_google_api_key

# AWS S3 (파일 스토리지)
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key
S3_BUCKET_NAME=your_s3_bucket_name
```

### 3. 실행하기

아래 두 가지 방법 중 하나를 선택하여 프로젝트를 실행할 수 있습니다.

--- 

#### 방법 1: Docker Compose 사용 (권장)

이 방법은 Docker를 사용하여 **Redis, Backend, Frontend, Nginx를 한 번에 실행**합니다. 로컬에 데이터베이스나 다른 서비스를 직접 설치할 필요가 없어 가장 간편합니다.

1.  **Docker 실행**
    Docker Desktop이 실행 중인지 확인하세요.

2.  **docker-compose 실행**
    프로젝트 루트 디렉토리에서 아래 명령어를 실행합니다.

    ```bash
    # 개발 환경용 프로필(dev)을 사용하여 모든 서비스를 빌드하고 실행합니다.
    docker-compose --profile dev up --build
    ```

3.  **확인**
    *   웹 애플리케이션: `http://localhost`
    *   Backend API 문서 (Swagger UI): `http://localhost:8080/swagger-ui.html`

--- 

#### 방법 2: 수동으로 직접 실행

각 서버를 로컬 환경에서 직접 실행하는 방법입니다. 로컬에 **MySQL**과 **Redis**가 설치 및 실행 중이어야 합니다.

1.  **Backend 서버 실행**

    ```bash
    # 1. backend 디렉토리로 이동
    cd backend

    # 2. Gradle을 사용하여 Spring Boot 애플리케이션 실행
    # (Windows)
    ./gradlew.bat bootRun
    
    # (macOS/Linux)
    # ./gradlew bootRun
    ```

    *   서버가 `http://localhost:8080`에서 실행됩니다.
    *   API 문서는 `http://localhost:8080/swagger-ui.html`에서 확인할 수 있습니다.

2.  **Frontend 서버 실행**

    ```bash
    # 1. frontend 디렉토리로 이동
    cd frontend

    # 2. 의존성 패키지 설치
    npm install

    # 3. 개발 서버 실행
    npm run dev
    ```

    *   개발 서버가 `http://localhost:3000`에서 실행됩니다.

---

## 👥 Team / 팀원 소개

| Role / 역할 | Name / 이름 | GitHub |
| :---: | :---: | :---: |
| Team Lead, Frontend, Backend | 김진환 | [wlsksekf](https://github.com/wlsksekf) |
| Frontend, Backend | 허가람 | [CodeGlove](https://github.com/CodeGlove) |
| Frontend, Backend | 김완희 | [wanhee79](https://github.com/wanhee79) |
| Frontend, Backend | 신준수 | [sjs0506](https://github.com/sjs0506) |
| Frontend, Backend | 박재윤 | [park990](https://github.com/park990) |