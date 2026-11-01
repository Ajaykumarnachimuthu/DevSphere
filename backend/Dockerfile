# =============================================================================
# DevSphere Spring Boot Backend Dockerfile (Multi-stage Build)
# =============================================================================

# Stage 1: Build JAR using Maven with Eclipse Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cap Maven memory usage to prevent OOM on free-tier builders (e.g. Render 512MB limit)
ENV MAVEN_OPTS="-Xmx384m"

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

# Optimized JVM memory limits explicitly tuned for 512MB RAM cloud containers (Render Free Tier)
ENTRYPOINT ["java", "-Xms128m", "-Xmx320m", "-XX:MaxMetaspaceSize=128m", "-XX:+UseG1GC", "-jar", "app.jar"]

