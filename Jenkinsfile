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

        stage('Building image') {
            steps {
                sh "echo docker build -t $IMAGE_NAME:$IMAGE_TAG ."
            }
        }
        
    }
}
