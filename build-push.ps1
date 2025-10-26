@echo off
echo Building and pushing Docker image to GitHub Container Registry...

REM Build the image
docker build -f Dockerfile.backend -t ghcr.io/nmemmert/bible:latest .

REM Login to GitHub Container Registry (requires personal access token)
echo Logging into GitHub Container Registry...
echo You need a GitHub Personal Access Token with 'write:packages' permission
echo Create one at: https://github.com/settings/tokens
echo Then run: docker login ghcr.io -u nmemmert
echo And enter your token as the password

REM After login, push the image
echo Pushing image...
docker push ghcr.io/nmemmert/bible:latest

echo Done!