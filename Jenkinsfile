node {

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
        sh 'docker build -t saiprakash305/my-node-app:latest .'
        sh 'docker images'
    }

    stage("Docker Login") {
        withCredentials([
            string(
                credentialsId: 'DOCKER_HUB_PASSWORD',
                variable: 'PASSWORD'
            )
        ]) {
            sh 'echo "$PASSWORD" | docker login -u saiprakash305 --password-stdin'
        }
    }

    stage("Push Image to Docker Hub") {
        sh 'docker push saiprakash305/my-node-app:latest'
    }

    stage("Kubernetes Deployment") {
        sh 'kubectl apply -f k8s/deployment.yaml'
        sh 'kubectl apply -f k8s/service.yaml'
        sh 'kubectl apply -f k8s/ingress.yaml'
        sh 'kubectl apply -f k8s/secrets.yml'
    }

    stage("Check Deployment") {
        sh 'kubectl get pods'
        sh 'kubectl get svc'
        sh 'kubectl get ingress'
    }
}
