pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'cagatay', url: 'https://github.com/cagataycndss/Splitbro.git'
            }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    // Pull backend .env securely from Jenkins Credentials
                    withCredentials([file(credentialsId: 'backend-env-file', variable: 'BACKEND_ENV')]) {
                        sh 'cp $BACKEND_ENV splitbro-backend/.env'
                    }

                    // Pull mobile .env securely from Jenkins Credentials
                    withCredentials([file(credentialsId: 'mobile-env-file', variable: 'MOBILE_ENV')]) {
                        sh 'cp $MOBILE_ENV splitbro-mobile/.env'
                    }
                }
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sleep 10
                    sh 'curl -f http://localhost:5000 || echo "Backend henuz hazir degil"'
                }
            }
        }
    }

    post {
        success {
            echo 'Deploy basarili: Splitbro calisiyor.'
        }
        failure {
            echo 'Deploy basarisiz: loglari kontrol et.'
        }
    }
}
