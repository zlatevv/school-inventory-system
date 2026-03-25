# --- Етап 1: Билдване (Компилиране) на кода с Java 21 ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Копираме pom.xml и сваляме зависимостите
COPY pom.xml .

# Копираме самия сорс код и го компилираме
COPY src ./src
RUN mvn clean package -DskipTests

# --- Етап 2: Стартиране на приложението с Java 21 ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Взимаме готовия .jar файл от първия етап
COPY --from=build /app/target/*.jar app.jar

# Командата за стартиране
ENTRYPOINT ["java", "-jar", "app.jar"]
