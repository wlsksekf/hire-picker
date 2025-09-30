# backend/Dockerfile

# ======================================================================
#  1. Build Stage: 소스코드를 컴파일하여 .jar 파일을 만드는 단계
# ======================================================================

# Gradle과 JDK 17이 모두 포함된 이미지를 'builder'라는 별명의 빌드 환경으로 사용
FROM gradle:jdk17-focal AS builder

# 작업 디렉토리를 /app으로 설정
WORKDIR /app

# 현재 폴더(backend/)의 모든 소스코드를 이미지 안의 /app 폴더로 복사
COPY . .

# gradlew 실행 권한을 부여하고, Gradle을 이용해 프로젝트를 빌드
# 이 명령이 성공하면 이미지 안의 /app/build/libs/ 경로에 .jar 파일이 생성됨
RUN chmod +x ./gradlew && ./gradlew build --no-daemon


# ======================================================================
#  2. Release Stage: 빌드된 .jar 파일을 실행하는 최종 이미지를 만드는 단계
# ======================================================================

# 실제 앱을 실행할 때는 가벼운 JRE(Java 실행 환경) 이미지를 사용
FROM openjdk:17-jre-slim

# 작업 디렉토리를 /app으로 설정
WORKDIR /app

# Build Stage(builder)에서 생성된 .jar 파일을 현재 스테이지로 복사
# --from=builder 옵션이 스테이지 간 파일을 복사하게 해주는 핵심
COPY --from=builder /app/build/libs/*.jar app.jar

# 컨테이너의 8080 포트를 외부에 노출하도록 설정
EXPOSE 8080

# 컨테이너가 시작될 때 "java -jar app.jar" 명령을 실행하여 애플리케이션을 구동
ENTRYPOINT ["java", "-jar", "app.jar"]