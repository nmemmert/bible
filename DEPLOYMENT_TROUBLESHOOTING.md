# Deployment Troubleshooting Guide

## Registry Mirror Error (ghcr.1panel.live)

If you encounter this error when deploying:
```
Error response from daemon: Get "https://ghcr.1panel.live/v2/": dial tcp: lookup ghcr.1panel.live: no such host
```

This means the Docker host has a misconfigured registry mirror pointing to `ghcr.1panel.live`.

### Solutions:

#### Option 1: Fix the Registry Mirror (Recommended)
Ask your hosting provider or system administrator to fix the Docker daemon configuration:

1. Edit `/etc/docker/daemon.json` on the host
2. Remove or fix the `registry-mirrors` configuration
3. It should look like this (or have no registry-mirrors at all):
```json
{
  "registry-mirrors": []
}
```
4. Restart Docker: `sudo systemctl restart docker`

#### Option 2: Use Direct Docker Run
Instead of using docker-compose, use docker run with the image name:

```bash
docker run -d \
  --name bible-study-hub \
  -p 5000:5000 \
  -v $(pwd)/bibles/json-bibles:/usr/src/app/bibles/json-bibles \
  -v $(pwd)/bible_study.db:/usr/src/app/bible_study.db \
  -e FLASK_APP=main.py \
  -e FLASK_ENV=production \
  -e SECRET_KEY=your-secret-key-change-this \
  --restart unless-stopped \
  ghcr.io/nmemmert/bible:latest
```

#### Option 3: Pull Image First
Sometimes pre-pulling the image helps:

```bash
# Pull directly
docker pull ghcr.io/nmemmert/bible:latest

# Then start with compose
docker-compose up -d
```

#### Option 4: Use Docker Hub Mirror (if available)
If you also pushed to Docker Hub, you can modify docker-compose.yml:

```yaml
services:
  bible-study-hub:
    image: nmemmert/bible:latest  # Docker Hub instead of ghcr.io
    # ... rest of config
```

Then push to Docker Hub:
```bash
docker tag bible-study-hub:latest nmemmert/bible:latest
docker push nmemmert/bible:latest
```

#### Option 5: Build on the Host
Use the build compose file instead:

```bash
# Upload your code to the server, then:
docker-compose -f docker-compose.build.yml up -d --build
```

This builds the image locally on the host instead of pulling from a registry.

## Contact Your Provider

If none of the above work, contact your hosting provider and let them know:

1. Their Docker daemon has a misconfigured registry mirror (`ghcr.1panel.live`)
2. This prevents pulling images from GitHub Container Registry (ghcr.io)
3. They need to either:
   - Remove the broken mirror configuration
   - Fix the mirror to properly proxy ghcr.io
   - Allow direct access to ghcr.io

## Checking Mirror Configuration

To see the current mirror configuration on the host:

```bash
docker info | grep -i mirror
# or
cat /etc/docker/daemon.json
```

## Alternative: Deploy Without Docker

If Docker issues persist, you can deploy directly with Python:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py
```

Or use gunicorn for production:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```
