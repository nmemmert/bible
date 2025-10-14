# Docker Deployment Guide

## Quick Start

### Using Docker Compose (Recommended)

1. **Basic deployment:**
   ```bash
   docker-compose up -d
   ```

2. **Production deployment with volumes:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Access the application:**
   - Open your browser to `http://localhost:5000`

### Using Docker Run

```bash
docker run -d \
  --name bible-study-hub \
  -p 5000:5000 \
  -v $(pwd)/bibles/json-bibles:/usr/src/app/bibles/json-bibles \
  -v $(pwd)/bible_study.db:/usr/src/app/bible_study.db \
  --restart unless-stopped \
  ghcr.io/nmemmert/bible:latest
```

## Configuration

### Environment Variables

Create a `.env` file from the template:
```bash
cp .env.example .env
```

Then edit `.env` and set your configuration:
- `SECRET_KEY` - **REQUIRED**: Generate with `python -c "import secrets; print(secrets.token_hex(32))"`
- `FLASK_ENV` - Set to `production` for production deployment
- `DATABASE_URL` - SQLite database path (default: `sqlite:///bible_study.db`)

### Volumes

The application uses these volumes for data persistence:

- **Bible JSON files**: `/usr/src/app/bibles/json-bibles`
  - Contains all Bible translation files
  - Should be mounted to persist custom Bible versions

- **Database**: `/usr/src/app/bible_study.db`
  - SQLite database for user accounts, notes, bookmarks, etc.
  - **Important**: Back this up regularly!

- **ESV API Key** (optional): `/usr/src/app/esv-api-key.txt`
  - If you have an ESV API key, mount this file

## Docker Compose Files

### `docker-compose.yml` (Simple)
Basic configuration for local development/testing with bind mounts.

### `docker-compose.production.yml` (Production)
Production-ready configuration with:
- Named volumes for better data management
- Health checks
- Automatic restart policy
- Optional Nginx reverse proxy (commented out)

## Common Commands

### Start the application
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f bible-study-hub
```

### Stop the application
```bash
docker-compose down
```

### Update to latest version
```bash
docker-compose pull
docker-compose up -d
```

### Backup database
```bash
docker cp bible-study-hub:/usr/src/app/bible_study.db ./backup_$(date +%Y%m%d).db
```

### Restore database
```bash
docker cp ./backup_20241014.db bible-study-hub:/usr/src/app/bible_study.db
docker-compose restart
```

## Health Check

The container includes a health check endpoint at `/health`. Check container health:
```bash
docker inspect --format='{{.State.Health.Status}}' bible-study-hub
```

## Nginx Reverse Proxy (Optional)

For production deployments with HTTPS, uncomment the nginx service in `docker-compose.production.yml` and create an `nginx.conf` file.

### Example nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream bible_app {
        server bible-study-hub:5000;
    }

    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            proxy_pass http://bible_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs bible-study-hub

# Check if port 5000 is already in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac
```

### Permission issues with volumes
```bash
# On Linux, ensure proper ownership
sudo chown -R 1000:1000 ./bibles/json-bibles
sudo chown 1000:1000 ./bible_study.db
```

### Reset the application
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Security Notes

1. **Always change the SECRET_KEY** in production
2. **Use HTTPS** in production (via Nginx or reverse proxy)
3. **Regular backups** of the database
4. **Keep the image updated**: `docker-compose pull && docker-compose up -d`

## Support

For issues or questions:
- GitHub: https://github.com/nmemmert/bible
- Check container logs: `docker-compose logs -f`
