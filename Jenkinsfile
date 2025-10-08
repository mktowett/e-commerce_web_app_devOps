pipeline {
  agent any
  environment {
    DOCKERHUB_NS = 'mktowett'
    TAG          = "${env.BUILD_NUMBER}"
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
  }
  options { timestamps() }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Prep cache') {
      steps {
        sh '''
          docker pull ${DOCKERHUB_NS}/pern-client:latest || true
          docker pull ${DOCKERHUB_NS}/pern-server:latest || true
        '''
      }
    }

    stage('Build Docker images') {
      steps {
        sh '''
          set -e
          docker build \
            --build-arg BUILDKIT_INLINE_CACHE=1 \
            --cache-from ${DOCKERHUB_NS}/pern-client:latest \
            -t ${DOCKERHUB_NS}/pern-client:${TAG} ./client

          docker build \
            --build-arg BUILDKIT_INLINE_CACHE=1 \
            --cache-from ${DOCKERHUB_NS}/pern-server:latest \
            -t ${DOCKERHUB_NS}/pern-server:${TAG} ./server

          docker tag ${DOCKERHUB_NS}/pern-client:${TAG} ${DOCKERHUB_NS}/pern-client:latest
          docker tag ${DOCKERHUB_NS}/pern-server:${TAG} ${DOCKERHUB_NS}/pern-server:latest
        '''
      }
    }

    stage('Push to DockerHub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DUSER', passwordVariable: 'DPASS')]) {
          sh '''
            echo "$DPASS" | docker login -u "$DUSER" --password-stdin
            docker push ${DOCKERHUB_NS}/pern-client:${TAG}
            docker push ${DOCKERHUB_NS}/pern-client:latest
            docker push ${DOCKERHUB_NS}/pern-server:${TAG}
            docker push ${DOCKERHUB_NS}/pern-server:latest
          '''
        }
      }
    }
  }
}
