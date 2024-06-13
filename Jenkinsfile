pipeline {
    agent {
        label "Node"
    }

    environment {
        RELEASE = "1.0.0"
        DOCKER_USER = "dmancloud"
        DOCKER_PASS = 'dockerhub'
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        CR_REGISTRY = "cr.yandex/crpn9ikb6hp5v19o9957"
        CR_REPOSITORY = "inf-frontend-dev"
        IMAGE_NAME = "${CR_REGISTRY}" + "/" + "${CR_REPOSITORY}"
    }

    stages {

         stage("Cleanup Workspace"){
            steps {
                cleanWs()
            }

        }
    
        stage("Checkout from SCM"){
            steps {
                git branch: 'main', credentialsId: 'ssh-key-jenkins-github', url: 'https://github.com/jakkaru-devops/inf-frontend-dev.git'
            }

        }

        stage('List derictory ') {
            steps {
                sh "ls -la"
            }
        }

        // stage('Building image') {
        //     steps {
        //         sh "sudo docker build -t $IMAGE_NAME:$IMAGE_TAG ."
        //     }
        // }
        stage('Build and push Docker image') {
            steps {
                script {
                    // Получение учетных данных Yandex Cloud Container Registry
                    def registryUrl = 'cr.yandex/crpn9ikb6hp5v19o9957'

                    // Авторизация в Yandex Cloud Container Registry
                    docker.withRegistry(registryUrl,  credentialsId: 'iam_token') {

                        sh "sudo docker build -t $IMAGE_NAME:$IMAGE_TAG ."
                        sh "docker push $IMAGE_NAME:$IMAGE_TAG"
                    }
                }
            }
        }


        stage('Cleanup Artifacts') {
            steps {
                sh "sudo docker rmi $IMAGE_NAME:$IMAGE_TAG"    
            }
        }   
    }
}
