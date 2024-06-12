pipeline {
    agent {
        label "Node"
    }

    environment {
        APP_NAME = "complete-prodcution-e2e-pipeline"
        RELEASE = "1.0.0"
        DOCKER_USER = "dmancloud"
        DOCKER_PASS = 'dockerhub'
        IMAGE_NAME = "${DOCKER_USER}" + "/" + "${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        CR_REGISTRY = "crpn9ikb6hp5v19o9957"
        CR_REPOSITORY = "inf-frontend-dev"
        CI_PROJECT_NAME = "CI_PROJECT_NAME"
        SOURCE_REPO_ARGOCD = "https://github.com/jakkaru-devops/inf-argocd"
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


        stage('Short tag for Docker') {
            steps {
               echo "GITHUB_SHA_SHORT=$(echo $GITHUB_SHA | cut -c 1-6)" >> $GITHUB_ENV
            }
        }

        stage('Test GITHUB_SHA_SHORT') {
            steps {
               echo "echo ${{ env.GITHUB_SHA_SHORT }}"
            }
        }

        stage('Сборка') {
            steps {
                echo 'Выполняем команды для сборки'
            }
        }

        stage('Тестирование') {
            steps {
                echo 'Тестируем нашу сборку'
            }
        }

        stage('Развертывание') {
            steps {
                echo 'Переносим код в рабочую среду или создаем артефакт'
            }
        }

          stage('Развертывание - 2') {
            steps {
                echo 'Переносим код в ASS'
            }
        }
    }
}
