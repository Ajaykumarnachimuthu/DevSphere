# =============================================================================
# DevSphere Spring Boot Backend Dockerfile (Multi-stage Build)
# =============================================================================

# Stage 1: Build JAR using Maven with Eclipse Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal, secure JRE 21 runtime container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root security user
RUN addgroup -S devsphere && adduser -S devsphere -G devsphere

# Copy built artifact
COPY --from=builder /app/target/devsphere-backend-*.jar app.jar

USER devsphere:devsphere

EXPOSE 8080
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

# Optimized JVM memory options for container environments
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

