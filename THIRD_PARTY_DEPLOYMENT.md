# Deployment Instructions for Third-Party Systems

## Issue: Registry Mirror Blocking GitHub Container Registry

Your hosting provider uses a China mainland registry mirror (`docker.1panel.live`) that blocks access to GitHub Container Registry (ghcr.io).

## ✅ SOLUTION: Build from Source

**Use this command to deploy:**

```bash
docker-compose -f docker-compose.build.yml up -d --build
```

This will:
1. Build the Docker image locally from the source code
2. Skip trying to pull from any registry
3. Start the container immediately

## Step-by-Step Deployment

### 1. Upload Your Code
Upload all files to your server, including:
- `Dockerfile`
- `docker-compose.build.yml`
- All Python files
- `requirements.txt`
- `bibles/` directory
- `templates/` directory
- `static/` directory
- `daemon.sh`

### 2. Build and Start
SSH into your server and run:

```bash
cd /path/to/your/bible/directory
docker-compose -f docker-compose.build.yml up -d --build
```

### 3. Check Status
```bash
docker-compose -f docker-compose.build.yml ps
docker-compose -f docker-compose.build.yml logs -f
```

### 4. Access Your App
Open: `http://your-server-ip:5000`

## Alternative: Use Makefile

Create a `Makefile` for easier deployment:

```makefile
.PHONY: build up down logs restart

build:
	docker-compose -f docker-compose.build.yml build

up:
	docker-compose -f docker-compose.build.yml up -d

down:
	docker-compose -f docker-compose.build.yml down

logs:
	docker-compose -f docker-compose.build.yml logs -f

restart: down up

deploy: build up logs
```

Then just run:
```bash
make deploy
```

## Why This Works

- ✅ Builds image locally - no registry needed
- ✅ Uses your uploaded source code
- ✅ Bypasses the `docker.1panel.live` mirror completely
- ✅ Works on any Docker host regardless of mirror configuration

## Updating Your Deployment

When you make changes:

1. Upload new code to server
2. Rebuild and restart:
```bash
docker-compose -f docker-compose.build.yml up -d --build
```

## Troubleshooting

### Build fails
Check logs:
```bash
docker-compose -f docker-compose.build.yml build --progress=plain
```

### Container keeps restarting
Check container logs:
```bash
docker logs bible-study-hub
```

### Port already in use
Change the port in `docker-compose.build.yml`:
```yaml
ports:
  - "8080:5000"  # Use port 8080 instead
```

## File Permissions

If you encounter permission errors:
```bash
chmod +x daemon.sh
chmod -R 755 bibles/
chmod 644 requirements.txt
```

## Environment Variables

Create a `.env` file in the same directory:
```env
SECRET_KEY=your-secure-secret-key-here
FLASK_ENV=production
```

Then the compose file will automatically use these values.

## Production Recommendations

1. **Use a reverse proxy** (Nginx) for HTTPS
2. **Set a strong SECRET_KEY** in `.env`
3. **Back up the database** regularly:
   ```bash
   docker cp bible-study-hub:/usr/src/app/bible_study.db ./backup.db
   ```
4. **Monitor logs**:
   ```bash
   docker-compose -f docker-compose.build.yml logs -f --tail=100
   ```

## Still Having Issues?

Contact your hosting provider and show them this error:
```
Error response from daemon: pull access denied for docker.1panel.live/bible-study-hub, 
repository does not exist or may require 'docker login': denied: only support mainland China
```

Tell them:
- Their Docker daemon has a mandatory China mainland registry mirror
- This blocks all international container registries
- You need to either:
  - Disable the mirror for your account
  - Whitelist ghcr.io
  - Allow building from source (which this solution does)
