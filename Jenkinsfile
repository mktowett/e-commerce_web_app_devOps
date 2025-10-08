pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    REGISTRY_NS     = 'mktowett'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Test (server on ephemeral Postgres)') {
      steps {
        sh '''
          set -e
          # Clean up from previous runs
          docker rm -f test-db 2>/dev/null || true
          docker network create ci-test 2>/dev/null || true

          # 1) Start Postgres on an isolated Docker network
          docker run -d --name test-db --network ci-test \
            -e POSTGRES_DB=ecommercestore_test \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=newpassword \
            --health-cmd="pg_isready -U postgres" \
            --health-interval=1s --health-timeout=5s --health-retries=30 \
            postgres:15-alpine

          # 2) Wait for DB to be healthy
          echo "Waiting for test-db to be healthy..."
          until [ "$(docker inspect -f '{{.State.Health.Status}}' test-db)" = "healthy" ]; do
            sleep 1
          done

          # 3) Run server tests on the SAME network; connect by service name
          docker run --rm --network ci-test \
            -v "$WORKSPACE/server":/app -w /app \
            -e NODE_ENV=test \
            -e POSTGRES_HOST=test-db \
            -e POSTGRES_PORT=5432 \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=newpassword \
            -e POSTGRES_DB=ecommercestore_test \
            -e SECRET=test_secret \
            -e REFRESH_SECRET=test_refresh_secret \
            node:18-alpine sh -lc "npm ci && npm test"
        '''
      }
      post {
        always {
          sh 'docker rm -f test-db || true; docker network rm ci-test || true'
        }
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
      when { branch 'main' }
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
