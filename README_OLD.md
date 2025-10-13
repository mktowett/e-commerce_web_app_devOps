# 🚀 E-Commerce PERN Store - Complete DevOps Pipeline

<div align="center">

![DevOps](https://img.shields.io/badge/DevOps-Automated-blue?style=for-the-badge)
![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-red?style=for-the-badge&logo=jenkins)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?style=for-the-badge&logo=grafana&logoColor=white)

### **Production-Ready E-Commerce Platform with Full DevOps Automation**

*A comprehensive demonstration of modern DevOps practices: Infrastructure as Code, CI/CD automation, containerization, and real-time monitoring*

[🌐 Live Demo](http://51.21.235.209:3000) • [📊 Grafana Dashboards](http://51.21.235.209:3001) • [🔧 Jenkins Pipeline](http://51.21.235.209:8080) • [📈 Prometheus](http://51.21.235.209:9090)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Deployments](#-live-deployments)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [DevOps Pipeline](#-devops-pipeline)
- [Infrastructure](#-infrastructure)
- [Monitoring & Observability](#-monitoring--observability)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [CI/CD Workflow](#-cicd-workflow)
- [What I Learned](#-what-i-learned)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)

---

## 🎯 Overview

This project showcases a **complete end-to-end DevOps implementation** for a full-stack e-commerce application. It demonstrates enterprise-level practices including Infrastructure as Code, automated CI/CD pipelines, containerization, orchestration, and comprehensive monitoring.

**What makes this project special:**
- ✅ **Zero-downtime deployments** with automated health checks
- ✅ **Infrastructure as Code** - entire AWS infrastructure provisioned via Terraform
- ✅ **Automated CI/CD** - from code commit to production in minutes
- ✅ **Real-time monitoring** - custom Prometheus metrics with Grafana dashboards
- ✅ **Production-ready** - security groups, proper networking, and best practices
- ✅ **Fully documented** - comprehensive runbooks and architecture diagrams

## Features

- User authentication (JWT + Google OAuth)
- Product catalog with search and filtering
- Shopping cart functionality
- Order management
- Payment processing (Stripe integration)
- Admin dashboard
- Responsive design
- **DevOps Integration**:
  - Docker containerization for all services
  - Jenkins CI/CD pipeline
  - Automated testing with Jest
  - Health monitoring endpoints

## Screenshots

![Homepage Screen Shot](https://user-images.githubusercontent.com/51405947/104136952-a3509100-5399-11eb-94a6-0f9b07fbf1a2.png)

## Database Schema

[![ERD](https://user-images.githubusercontent.com/51405947/133893279-8872c475-85ff-47c4-8ade-7d9ef9e5325a.png)](https://dbdiagram.io/d/5fe320fa9a6c525a03bc19db)

## Run Locally

Clone the project

```bash
  git clone <your-repository-url>
```

Go to the project directory

```bash
  cd e-commerce-store
```

Install dependencies

```bash
  npm install
```

Go to server directory and install dependencies

```bash
  npm install
```

Go to client directory and install dependencies

```bash
  npm install
```

Go to server directory and start the server

```bash
  npm run dev
```

Go to client directory and start the client

```bash
  npm run client
```

Start both client and server concurrently from the root directory

```bash
  npm run dev
```

Go to http://localhost:3000 to view the app running on your browser.

## Running with Docker

Make sure you have Docker and Docker Compose installed.

### Development Environment

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production Environment

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9000
- **Health Check**: http://localhost:9000/api/health
- **API Documentation**: http://localhost:9000/api/docs
- **Database**: localhost:5432

## Testing

The project includes a comprehensive test suite with automated database setup.

### Running Tests

```bash
# Run all tests
cd server && npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- __tests__/health.test.js
```

### Test Coverage

- **Health API**: Basic functionality verification
- **Authentication**: User signup, login, and validation
- **User Management**: CRUD operations with role-based access
- **Product Management**: API endpoint testing

### Test Features

- Automated test database setup and teardown
- Proper foreign key constraint handling
- JWT token authentication testing
- Role-based authorization testing

## CI/CD Pipeline

This project uses Jenkins for continuous integration and deployment:

### Pipeline Stages

1. **Checkout**: Pull latest code from repository
2. **Build**: Build Docker images for client and server
3. **Test**: Run automated test suite
4. **Push**: Push images to Docker registry
5. **Deploy**: Deploy to production environment (main branch only)

### Jenkins Configuration

The pipeline is defined in `Jenkinsfile` and includes:
- Docker image building and tagging
- Automated testing with database setup
- Conditional deployment based on branch
- Docker registry integration

## Deployment

### Manual Deployment

```bash
# Deploy using Docker Compose
docker-compose up --build
```

### Automated Deployment

The application automatically deploys when changes are pushed to the `main` branch through the Jenkins pipeline.

## Tech Stack

### Frontend
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Windmill React UI](https://windmillui.com/react-ui) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [react-hot-toast](https://react-hot-toast.com/docs) - Notifications
- [react-spinners](https://www.npmjs.com/package/react-spinners) - Loading indicators
- [react-helmet-async](https://www.npmjs.com/package/react-helmet-async) - Head management

### Backend
- [Node.js](https://nodejs.org/en/) - Runtime environment
- [Express](http://expressjs.com/) - Web framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [node-postgres](https://node-postgres.com/) - PostgreSQL client
- [JWT](https://jwt.io/) - Authentication
- [Stripe](https://stripe.com/) - Payment processing

### DevOps & Testing
- [Docker](https://www.docker.com/) - Containerization
- [Docker Compose](https://docs.docker.com/compose/) - Multi-container orchestration
- [Jenkins](https://www.jenkins.io/) - CI/CD pipeline
- [Jest](https://jestjs.io/) - Testing framework
- [Supertest](https://github.com/visionmedia/supertest) - HTTP testing

## Environment Variables

To run this project, you will need to add the following environment variables to your .env files in both client and server directory

#### client/.env

`VITE_GOOGLE_CLIENT_ID`

`VITE_GOOGLE_CLIENT_SECRET`

`VITE_API_URL`

`VITE_STRIPE_PUB_KEY`

### server/.env

`POSTGRES_USER`

`POSTGRES_HOST`

`POSTGRES_PASSWORD`

`POSTGRES_DATABASE`

`POSTGRES_DB_TEST`

`POSTGRES_PORT`

`PORT`

`SECRET`

`REFRESH_SECRET`

`SMTP_FROM`

`STRIPE_SECRET_KEY`

## Project Status

✅ **All tests passing** - Comprehensive test suite with 22 tests covering authentication, user management, and API endpoints

✅ **Docker ready** - Fully containerized application with development and production configurations

✅ **CI/CD integrated** - Jenkins pipeline for automated testing and deployment

✅ **Health monitoring** - Health check endpoints for monitoring application status

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

Project Link: [https://github.com/mktowett/e-commerce_web_app_devOps](https://github.com/mktowett/e-commerce_web_app_devOps)
