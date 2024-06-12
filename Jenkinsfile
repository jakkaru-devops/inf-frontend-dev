pipeline {
    agent {
        label "Node"
    }

    environment {
        APP_NAME = "complete-prodcution-e2e-pipeline"
        RELEASE = "1.0.0"
        DOCKER_USER = "dmancloud"
        DOCKER_PASS = 'dockerhub'
        BUILD_NUMBER = '1213123213'
        IMAGE_NAME = "${DOCKER_USER}" + "/" + "${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        CR_REGISTRY = "crpn9ikb6hp5v19o9957"
        CR_REPOSITORY = "inf-frontend-dev"
        CI_PROJECT_NAME = "CI_PROJECT_NAME"
        SOURCE_REPO_ARGOCD = "https://github.com/jakkaru-devops/inf-argocd"
        dockerImage = ''
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

        stage('Building image') {
            steps{
                script {
                    dockerImage = docker.build registry + ":$BUILD_NUMBER"
                }
            }
        }

        stage('dockerImage') {
            steps {
                echo "$dockerImage"
            }
        }

        
    }
}
