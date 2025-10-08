# Jenkins CI/CD Runbook — E-Commerce PERN Store

## Overview
Complete CI/CD pipeline for a full-stack e-commerce application built with PostgreSQL, Express, React, and Node.js.

**Repository:** `https://github.com/mktowett/e-commerce_web_app_devOps`  
**Pipeline:** `pern-pipeline`  
**Docker Registry:** DockerHub (`mktowett/pern-client`, `mktowett/pern-server`)

## Branch & Triggers
- **Build & Test:** All branches (automatic on push)
- **Deploy:** **main** branch only (automatic)
- **Webhook:** GitHub → Jenkins (`/jenkins/github-webhook/`) ✅
- **Manual Trigger:** Available via Jenkins UI

## Pipeline Stages

### 1. **Checkout SCM**
- Pulls latest code from GitHub repository
- Sets up workspace with full repository content

### 2. **Test (Server with Ephemeral Postgres)**
- **Duration:** ~30-60 seconds
- **Network:** Creates isolated Docker network `ci-test`
- **Database:** Spins up `postgres:15-alpine` container
- **Environment Variables:**
  ```
  NODE_ENV=test
  POSTGRES_HOST=test-db
  POSTGRES_PORT=5432
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=newpassword
  POSTGRES_DB=ecommercestore_test
  SECRET=test_secret
  REFRESH_SECRET=test_refresh_secret
  ```
- **Test Suite:** Currently runs health check test only (database tests disabled for CI stability)
- **Expected Result:** `PASS __tests__/health.test.js` (1 test passed)

### 3. **Docker Login**
- Authenticates with DockerHub using stored credentials
- Credential ID: `dockerhub`

### 4. **Build & Push Images**
- **Build Tool:** Docker Buildx (multi-platform support)
- **Client Image:** `mktowett/pern-client:latest` + `mktowett/pern-client:<short-sha>`
- **Server Image:** `mktowett/pern-server:latest` + `mktowett/pern-server:<short-sha>`
- **Dockerfile Locations:**
  - Client: `client/Dockerfile`
  - Server: `server/Dockerfile`

### 5. **Deploy (Main Branch Only)**
- **Target Host:** Production server at `/opt/pern`
- **Compose File:** `docker-compose.prod.yml`
- **Process:**
  1. Docker login
  2. Pull latest images
  3. Deploy with `docker compose up -d`
  4. Health check verification

### 6. **Post-Deploy Health Check**
- **Endpoint:** `GET http://127.0.0.1/api/health`
- **Expected Response:** HTTP 200
- **Timeout:** 30 seconds (15 attempts, 2s intervals)
- **Failure Action:** Pipeline fails if health check doesn't pass

## Runtime Layout (Production Server)

```
/opt/pern/
├── docker-compose.prod.yml    # Production compose configuration
├── .env                       # Runtime environment variables (not in git)
├── nginx/                     # Custom nginx configuration (optional)
│   └── nginx.conf
└── logs/                      # Application logs (optional)
```

## Required Credentials (Jenkins)

| Credential ID | Type | Purpose | Required Fields |
|---------------|------|---------|-----------------|
| `dockerhub` | Username/Password | DockerHub registry access | Username: `mktowett`<br>Password: DockerHub token |
| `github` | Personal Access Token | GitHub API access (optional) | Token with repo permissions |

## Application Architecture

### **Frontend (React + Vite)**
- **Port:** 3000 (internal), 80/443 (external via Nginx)
- **Build:** Static files served by Nginx
- **Environment:** Production optimized build

### **Backend (Node.js + Express)**
- **Port:** 9000 (internal), accessible via `/api` route
- **Database:** PostgreSQL connection
- **Features:** JWT auth, Stripe payments, REST API

### **Database (PostgreSQL)**
- **Port:** 5432 (internal only)
- **Persistence:** Docker volume mounted
- **Backups:** Configured via compose (optional)

## Environment Variables (.env)

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=ecommercestore
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Application Secrets
SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
SMTP_FROM=noreply@yourdomain.com

# Payment Integration
STRIPE_SECRET_KEY=sk_live_...

# Client Configuration
VITE_API_URL=https://yourdomain.com/api
VITE_STRIPE_PUB_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Health Verification Commands

### **Quick Health Check**
```bash
# Through Nginx (external)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/health

# Direct backend (internal)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9000/api/health
```

### **Container Status**
```bash
# Check all containers
docker compose -f /opt/pern/docker-compose.prod.yml ps

# Check logs
docker compose -f /opt/pern/docker-compose.prod.yml logs -f --tail=50

# Check specific service
docker compose -f /opt/pern/docker-compose.prod.yml logs server
```

### **Port Verification**
```bash
# Check listening ports
ss -tlnp | grep -E ':3000|:9000|:5432|:80|:443'

# Check nginx routing
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/api/health
```

## Manual Operations

### **Rollback to Previous Version**
```bash
# Find previous image SHA
docker images mktowett/pern-server --format "table {{.Tag}}\t{{.CreatedAt}}"

# Update compose to use specific SHA
sed -i 's/:latest/:PREVIOUS_SHA/g' /opt/pern/docker-compose.prod.yml

# Redeploy
cd /opt/pern
docker compose pull
docker compose up -d
```

### **View Application Logs**
```bash
# All services
docker compose -f /opt/pern/docker-compose.prod.yml logs -f

# Specific service with timestamp
docker compose -f /opt/pern/docker-compose.prod.yml logs -f -t server

# Last 100 lines
docker compose -f /opt/pern/docker-compose.prod.yml logs --tail=100
```

### **Database Operations**
```bash
# Connect to database
docker compose -f /opt/pern/docker-compose.prod.yml exec db psql -U postgres -d ecommercestore

# Backup database
docker compose -f /opt/pern/docker-compose.prod.yml exec db pg_dump -U postgres ecommercestore > backup.sql

# Restore database
docker compose -f /opt/pern/docker-compose.prod.yml exec -T db psql -U postgres ecommercestore < backup.sql
```

## Common Troubleshooting

### **Pipeline Issues**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Docker login fails** | `401 Unauthorized` during push | Check DockerHub credentials in Jenkins |
| **Test failures** | Database connection refused | Verify test database setup in pipeline |
| **Build failures** | Docker build context errors | Check Dockerfile paths and build context |
| **Deploy failures** | Compose pull/up errors | Check production server Docker setup |

### **Production Issues**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **502 Bad Gateway** | Nginx can't reach backend | Check server container status |
| **Database connection** | Server logs show DB errors | Verify PostgreSQL container and credentials |
| **Static files 404** | Frontend assets not loading | Check client container and Nginx config |
| **Health check fails** | `/api/health` returns non-200 | Check server logs and database connectivity |

### **Webhook Issues**
```bash
# Check GitHub webhook deliveries
# Go to: GitHub Repo → Settings → Webhooks → Recent Deliveries

# Verify Jenkins webhook endpoint
curl -X POST http://your-jenkins-url/jenkins/github-webhook/

# Check Jenkins logs
tail -f /var/log/jenkins/jenkins.log | grep webhook
```

## Security Considerations

- **Secrets Management:** All sensitive data in `.env` file, not in repository
- **Container Security:** Images built from official base images, regularly updated
- **Network Security:** Internal services not exposed externally
- **Authentication:** JWT tokens for API access, secure session management
- **HTTPS:** SSL termination at Nginx level (recommended)

## Performance Monitoring

### **Resource Usage**
```bash
# Container resource usage
docker stats

# System resources
htop
df -h
free -h
```

### **Application Metrics**
- **Health Endpoint:** `/api/health` - Basic application status
- **Database Queries:** Monitor slow queries and connection pool
- **Response Times:** Monitor API endpoint performance
- **Error Rates:** Track 4xx/5xx responses

## Maintenance Schedule

- **Weekly:** Review application logs for errors
- **Monthly:** Update base Docker images and redeploy
- **Quarterly:** Review and rotate secrets/tokens
- **As Needed:** Database maintenance and optimization

---

## Quick Reference

**Pipeline URL:** `http://your-jenkins-url/jenkins/job/pern-pipeline/`  
**Production Health:** `http://your-domain.com/api/health`  
**DockerHub Images:** `https://hub.docker.com/u/mktowett`  
**Repository:** `https://github.com/mktowett/e-commerce_web_app_devOps`
