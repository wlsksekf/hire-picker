# 로컬 개발 환경 설정 가이드

이 문서는 새로운 팀원이 자신의 PC에서 `hirepicker` 프로젝트를 실행하기 위한 로컬 개발 환경 설정 방법을 안내합니다.

## 1. 환경 변수 설정

프로젝트를 실행하기 위해서는 데이터베이스 접속 정보 등 몇 가지 환경 변수 설정이 필요합니다.

1.  프로젝트 최상위 경로에 있는 `.env.example` 파일을 복사하여, 같은 위치에 `.env` 라는 이름의 새 파일을 만듭니다.

    ```bash
    cp .env.example .env
    ```

2.  방금 생성한 `.env` 파일을 열고, 아래 내용을 자신의 로컬 환경에 맞게 수정합니다.

    -   `DB_URL`: 접속할 데이터베이스의 전체 URL입니다. 로컬 PC에 MySQL을 설치하고 `resume`이라는 데이터베이스를 생성했다면, 예시 값을 그대로 사용해도 좋습니다.
    -   `DB_USERNAME`: 로컬 DB의 사용자 이름입니다. (예: `root`)
    -   `DB_PASSWORD`: 로컬 DB의 비밀번호입니다. **이 값은 실제 사용하는 비밀번호로 반드시 변경해야 합니다.**

    ```dotenv
    # .env 파일 수정 예시
    DB_URL=jdbc:mysql://localhost:3306/resume?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
    DB_USERNAME=root
    DB_PASSWORD=내_로컬_DB_비밀번호
    ```

    **중요:** `.env` 파일은 `.gitignore`에 의해 Git 추적에서 제외되므로, 민감한 정보가 실수로 저장소에 올라갈 걱정은 하지 않으셔도 됩니다.

## 2. 애플리케이션 실행

이 프로젝트는 Docker Compose를 사용하여 로컬 환경에서 전체 애플리케이션(프론트엔드, 백엔드, Nginx)을 한 번에 실행할 수 있습니다.

1.  PC에 Docker Desktop이 설치 및 실행되어 있는지 확인합니다.

2.  프로젝트 최상위 경로에서 다음 명령어를 실행합니다.

    ```bash
    docker compose -f docker-compose.prod.yml up --build
    ```

    -   `--build` 옵션은 코드가 변경되었을 때 Docker 이미지를 새로 빌드하여 실행하라는 의미입니다.

3.  빌드 및 실행이 완료되면, 웹 브라우저에서 `http://localhost` 로 접속하여 애플리케이션을 확인할 수 있습니다.

## 3. 애플리케이션 종료

실행 중인 애플리케이션을 종료하려면, 터미널에서 `Ctrl + C`를 누르거나 새 터미널을 열어 다음 명령어를 실행합니다.

```bash
docker compose -f docker-compose.prod.yml down
```

## 4. 테스트 환경 설정

백엔드 테스트 코드를 로컬 PC에서 직접 실행할 때, 개발용 데이터베이스(`resume`)를 그대로 사용하도록 설정합니다.

1.  `backend/src/test/resources/` 폴더가 없다면 생성해 주세요.

2.  해당 폴더 안에 `application.yml` 파일을 새로 만들고, 아래 내용을 붙여넣으세요.

    -   아래 설정은 테스트 시에도 개발용 DB를 사용하되, 테이블 구조를 절대 변경하지 않도록(`ddl-auto: none`) 하여 데이터 손실을 방지합니다.

    ```yaml
    # backend/src/test/resources/application.yml

    spring:
      jpa:
        hibernate:
          # 테스트 시 테이블 구조를 변경하지 않음(절대 수정하면 안됨 db 다날아감)
          ddl-auto: none
    ```
    **참고:** 이 설정을 추가하면, 테스트 코드는 `.env` 파일에 설정된 개발용 DB(`resume`)에 접속하여 실행됩니다.