pipeline {
  agent any
  options {
    timestamps()
  }
  environment {
    REGISTRY_NS = 'mktowett'
    SHORT_SHA   = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Test') {
      steps {
        sh '''
          docker run --rm -v "$WORKSPACE/server":/app -w /app node:18-alpine sh -lc '
            npm ci && npm test
          '
        '''
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USR', passwordVariable: 'DOCKERHUB_PSW')]) {
          sh 'echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin'
        }
      }
    }

    stage('Build & Push Images') {
      steps {
        sh '''
          docker buildx create --use --name ci-builder || true

          # Client
          docker buildx build \
            -f client/Dockerfile \
            -t ${REGISTRY_NS}/pern-client:latest \
            -t ${REGISTRY_NS}/pern-client:${SHORT_SHA} \
            --push \
            client

          # Server
          docker buildx build \
            -f server/Dockerfile \
            -t ${REGISTRY_NS}/pern-server:latest \
            -t ${REGISTRY_NS}/pern-server:${SHORT_SHA} \
            --push \
            server
        '''
      }
    }

    stage('Deploy (main only)') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USR', passwordVariable: 'DOCKERHUB_PSW')]) {
          sh '''
            set -e
            echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin
            cd /opt/pern
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Images pushed: ${REGISTRY_NS}/pern-client:latest, ${REGISTRY_NS}/pern-server:latest"
      echo "Commit tag: ${SHORT_SHA}"
    }
    always {
      sh 'docker logout || true'
    }
  }
}
