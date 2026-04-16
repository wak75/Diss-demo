pipeline {
    agent any

    parameters {
        string(name: 'BRANCH_NAME', defaultValue: 'main', description: 'Branch to build')
    }

    tools {
        nodejs 'nodejs'
    }

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        APP_NAME = 'diss-demo'
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials' // Jenkins credentials ID for Docker Hub
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: "${params.BRANCH_NAME}", url: 'https://github.com/wak75/Diss-demo.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        docker build -t \${DOCKER_USER}/${APP_NAME}:${IMAGE_TAG} -t \${DOCKER_USER}/${APP_NAME}:latest .
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push "$DOCKER_USER"/${APP_NAME}:${IMAGE_TAG}
                        docker push "$DOCKER_USER"/${APP_NAME}:latest
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            withCredentials([usernamePassword(
                credentialsId: 'dockerhub-credentials',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )]) {
                sh "docker rmi \${DOCKER_USER}/${APP_NAME}:${IMAGE_TAG} || true"
                sh "docker rmi \${DOCKER_USER}/${APP_NAME}:latest || true"
            }
        }
        success {
            echo "Pipeline completed successfully! Image pushed with tag ${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}