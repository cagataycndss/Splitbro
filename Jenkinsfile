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
                    // Create splitbro-backend/.env
                    sh '''
                    cat <<EOT > splitbro-backend/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://cagataycandas40_db_user:lBdg0erpMaKp0vr6@splitbro.dlapv16.mongodb.net/?appName=splitbro
JWT_SECRET=splitbro_super_secret_key_12345
GEMINI_API_KEY=AIzaSyCl7OfiqX2Q5GOYLMSChu7RUjB2iJxUVug
REDIS_URL=redis://127.0.0.1:6379
RABBITMQ_URL=amqp://127.0.0.1:5672
EOT
                    '''
                    
                    // Create splitbro-mobile/.env
                    sh '''
                    cat <<EOT > splitbro-mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.1.34:5000/api
EOT
                    '''
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
