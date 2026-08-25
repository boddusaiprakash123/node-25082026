pipeline {

    agent any

    environment {

        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '290780119905'

        ECR_REGISTRY =
            "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        ECR_REPOSITORY = 'nodeapplication'

        EKS_CLUSTER = 'netflix-cluster'

        K8S_NAMESPACE = 'nodejs-app'

        DEPLOYMENT_NAME = 'nodejs-app'

        CONTAINER_NAME = 'nodejs-app'

        IMAGE_TAG = "${BUILD_NUMBER}"

        IMAGE =
            "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

        KUBECONFIG = '/var/lib/jenkins/.kube/config'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Tools') {
            steps {
                sh '''
                    git --version
                    docker --version
                    aws --version
                    kubectl version --client
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    echo "Building:"
                    echo "${IMAGE}"

                    docker build \
                        -t ${IMAGE} \
                        .
                '''
            }
        }

        stage('ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password \
                        --region ${AWS_REGION} \
                    | docker login \
                        --username AWS \
                        --password-stdin \
                        ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Image') {
            steps {
                sh '''
                    docker push ${IMAGE}
                '''
            }
        }

        stage('Configure EKS') {
            steps {
                sh '''
                    aws eks update-kubeconfig \
                        --region ${AWS_REGION} \
                        --name ${EKS_CLUSTER} \
                        --kubeconfig ${KUBECONFIG}

                    kubectl config current-context
                '''
            }
        }

        stage('Check EKS Access') {
            steps {
                sh '''
                    kubectl get pods \
                        -n ${K8S_NAMESPACE}
                '''
            }
        }

        stage('Deploy Kubernetes') {
            steps {
                sh '''
                    kubectl apply \
                        -f k8s/deployment.yaml \
                        -n ${K8S_NAMESPACE}

                    kubectl apply \
                        -f k8s/service.yaml \
                        -n ${K8S_NAMESPACE}

                    kubectl apply \
                        -f k8s/ingress.yaml \
                        -n ${K8S_NAMESPACE}
                '''
            }
        }

        stage('Update Image') {
            steps {
                sh '''
                    kubectl set image \
                        deployment/${DEPLOYMENT_NAME} \
                        ${CONTAINER_NAME}=${IMAGE} \
                        -n ${K8S_NAMESPACE}
                '''
            }
        }

        stage('Rollout') {
            steps {
                sh '''
                    kubectl rollout status \
                        deployment/${DEPLOYMENT_NAME} \
                        -n ${K8S_NAMESPACE} \
                        --timeout=5m
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    kubectl get deployment -n ${K8S_NAMESPACE}
                    kubectl get pods -n ${K8S_NAMESPACE}
                    kubectl get svc -n ${K8S_NAMESPACE}
                    kubectl get ingress -n ${K8S_NAMESPACE}
                '''
            }
        }
    }

    post {

        success {
            echo "Deployment successful!"
        }

        failure {
            echo "Deployment failed!"
        }

        always {
            sh '''
                docker logout ${ECR_REGISTRY} || true
                docker image prune -f || true
            '''
        }
    }
}
