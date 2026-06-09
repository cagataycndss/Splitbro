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
