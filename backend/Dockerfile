# Java 17 기반의 가벼운 이미지를 사용
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 빌드 결과물(JAR 파일)을 이미지 안으로 복사
# build/libs/ 디렉토리의 .jar 파일을 app.jar로 이름을 바꿔서 복사
COPY build/libs/*.jar app.jar

# 컨테이너 8080 포트 개방
EXPOSE 8080

# 컨테이너가 시작될 때 이 명령어를 실행
ENTRYPOINT ["java", "-jar", "app.jar"]