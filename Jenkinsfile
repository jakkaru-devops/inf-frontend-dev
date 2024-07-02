pipeline {
    agent any

    environment {
        RELEASE = "1.0.0"
        PASSWORD = "123"
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
                git branch: 'main', credentialsId: 'jenkins-github', url: 'https://github.com/jakkaru-devops/inf-frontend-dev.git'
            }

        }

        stage('List derictory ') {
            steps {
                sh "ls -la"
            }
        }

        stage('Build and push Docker image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'nexus', passwordVariable: 'PSW', usernameVariable: 'USER')]){
                            sh "echo ${PSW} | docker login -u ${USER} --password-stdin 158.160.19.53:8082"

                            echo 'Building Image ...'
                            sh "echo $PASSWORD | sudo -S docker build -t 158.160.19.53:8082/:$IMAGE_TAG ."
                            
                            echo 'Pushing image to docker hosted rerpository on Nexus'
                            sh "docker push 158.160.19.53:8082/sanskriti-portfolio:$IMAGE_TAG"
                    }
            
                }
            }
        }

        stage('Cleanup Artifacts') {
            steps {
                sh "sudo docker rmi 51.250.111.109:8082/:$IMAGE_TAG"    
            }
        }   
    }
}
