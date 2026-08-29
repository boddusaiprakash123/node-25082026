node {

    def DOCKER_IMAGE = "saiprakash305/my-node-app"
    def DOCKER_TAG = "${BUILD_NUMBER}"

    stage("Git Clone") {
        git(
            credentialsId: 'GIT_HUB_CREDENTIALS',
            url: 'https://github.com/boddusaiprakash123/node-25082026.git',
            branch: 'main'
        )
    }

    stage("Node Build") {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm install'
    }

    stage("Docker Build") {
        sh 'docker version'

        sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."

        sh 'docker images'
    }

    stage("Docker Login") {
        withCredentials([
            string(
                credentialsId: 'DOCKER_HUB_PASSWORD',
                variable: 'PASSWORD'
            )
        ]) {
            sh '''
                echo "$PASSWORD" | docker login \
                -u saiprakash305 \
                --password-stdin
            '''
        }
    }

    stage("Push Image to Docker Hub") {
        sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
    }

    stage("Kubernetes Deployment") {

        sh '''
            kubectl apply -f k8s/deployment.yaml -n nodejs-app
            kubectl apply -f k8s/service.yaml -n nodejs-app
            kubectl apply -f k8s/ingress.yaml -n nodejs-app
            kubectl apply -f k8s/secrets.yml -n nodejs-app
        '''

        sh "kubectl set image deployment/nodejs-app nodejs-app=${DOCKER_IMAGE}:${DOCKER_TAG} -n nodejs-app"

        sh "kubectl rollout status deployment/nodejs-app -n nodejs-app"
    }

    stage("Check Deployment") {

        sh 'kubectl get pods -n nodejs-app'

        sh 'kubectl get deployment -n nodejs-app'

        sh 'kubectl get svc -n nodejs-app'

        sh 'kubectl get ingress -n nodejs-app'
    }
}
