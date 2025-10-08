pipeline {
  agent any

  options { timestamps() }

  environment {
    REGISTRY_NS     = 'mktowett'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Test (health check only)') {
      steps {
        sh '''
          # Simple health test - no database required
          docker run --rm -v "$WORKSPACE/server":/app -w /app \
            node:18-alpine sh -lc "npm ci && npm test"
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
          set -e
          SHORT_SHA="$(git rev-parse --short HEAD)"

          # Ensure builder exists (idempotent)
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
      when {
        expression {
          // Works for single Pipeline jobs where GIT_BRANCH may be 'origin/main'
          def b = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: '')
          b = b.replaceFirst(/^origin\//, '')
          return b == 'main'
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USR', passwordVariable: 'DOCKERHUB_PSW')]) {
          sh '''
            set -e
            echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin

            cd /opt/pern
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d

            # Post-deploy health check via Nginx → backend
            echo "Verifying health at http://127.0.0.1/api/health ..."
            for i in $(seq 1 15); do
              code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/health || true)
              if [ "$code" = "200" ]; then
                echo "Health OK"
                exit 0
              fi
              echo "Waiting for health... ($i/15)"
              sleep 2
            done
            echo "Health check failed"
            exit 1
          '''
        }
      }
    }
  }

  post {
    success {
      sh '''
        SHORT_SHA="$(git rev-parse --short HEAD)"
        echo "Images pushed:"
        echo "  - ${REGISTRY_NS}/pern-client:latest"
        echo "  - ${REGISTRY_NS}/pern-client:${SHORT_SHA}"
        echo "  - ${REGISTRY_NS}/pern-server:latest"
        echo "  - ${REGISTRY_NS}/pern-server:${SHORT_SHA}"
      '''
    }
    always {
      sh 'docker logout || true'
    }
  }
}
