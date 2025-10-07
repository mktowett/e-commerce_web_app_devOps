pipeline {
  agent any
  environment {
    DOCKERHUB_NS = 'mktowett'
    TAG          = "${env.BUILD_NUMBER}"
  }
  options { timestamps() }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Build Docker images') {
      steps {
        sh '''
          set -e
          docker build -t ${DOCKERHUB_NS}/pern-client:${TAG} ./client
          docker build -t ${DOCKERHUB_NS}/pern-server:${TAG} ./server
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
