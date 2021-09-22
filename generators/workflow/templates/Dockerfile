# This is an example of Docker image to run the WDK bot
# You might want to customize the copied files
FROM eclipse-temurin:11

RUN useradd -m -d /opt/symphony symphony
USER symphony

COPY . /opt/symphony

WORKDIR /opt/symphony
EXPOSE 8080

CMD ["java", "-jar", "workflow-bot-app.jar"]
