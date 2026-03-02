FROM jenkins/jenkins:lts

USER root

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Docker CLI
RUN apt-get install -y docker.io

# Verify installations
RUN node --version && npm --version && docker --version

USER jenkins
