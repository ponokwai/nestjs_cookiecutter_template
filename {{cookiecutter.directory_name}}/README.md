<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# {{ cookiecutter.project_name }}

{{ cookiecutter.description }}

## Features

- 🚀 Modern NestJS framework (v11+)
- 📊 Complete observability stack
  - OpenTelemetry tracing integration
  - Prometheus metrics endpoint
  - Structured logging with Winston
- 🐳 Docker and Docker Compose setup
- 📚 API documentation with Swagger/OpenAPI
- ✅ Example REST API module (Books)
- 🧪 Unit and E2E testing setup
- 🔍 Code quality tools (ESLint, Prettier)

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (recommended)
- [Docker](https://docs.docker.com/get-docker/) (optional, for containerization)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Environment Variables Setup
# Create a .env file from the .env.example template
cp .env.example .env
# Then edit the .env file with your actual environment variables
```

### Running the Application

```bash
# Development mode
pnpm run start

# Watch mode (recommended for development)
pnpm run start:dev

# Production mode
pnpm run start:prod
```

### Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Environment Variables

This application uses environment variables for configuration. The `.env.example` file includes the following variables that you should configure in your own `.env` file:

```
# General
NODE_ENV=development
SERVICE_NAME=my-service
SERVICE_VERSION=1.0.0

# Logging
LOG_LEVEL=info
OTLP_LOGS_ENABLED=false
OTLP_LOGS_ENDPOINT=http://localhost:4318/v1/logs

# Metrics
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics

# Tracing
TRACING_ENABLED=true
TRACING_SAMPLER_TYPE=trace_id_ratio
TRACING_SAMPLER_RATIO=0.1
OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces

# Logger
USE_JSON_LOGGER=true
DEBUG=false
```

## Project Structure

```
.
├── Dockerfile              # Docker configuration for the application
├── README.md               # This file
├── eslint.config.mjs       # ESLint configuration
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── infra/                  # Infrastructure configuration
│   └── docker-compose.yml  # Docker Compose configuration
├── src/                    # Application source code
│   ├── app.module.ts       # Root application module
│   ├── main.ts             # Application entry point
│   ├── books/              # Example feature module (REST API)
│   │   ├── books.controller.ts  # REST endpoints
│   │   ├── books.service.ts     # Business logic
│   │   ├── books.types.ts       # Type definitions
│   │   └── dto/                 # Data Transfer Objects
│   └── observability/      # Complete observability stack
│       ├── logger/         # Structured logging with Winston
│       ├── metrics/        # Prometheus metrics
│       └── tracing/        # OpenTelemetry tracing
└── test/                   # End-to-end tests
```

## Docker Setup

The template includes a Docker setup for containerization:

```bash
# Build and run with Docker Compose
docker-compose -f infra/docker-compose.yml up --build
```

## Observability Features

### Tracing

OpenTelemetry is configured to automatically trace HTTP requests and provide detailed distributed tracing. The tracing service is configured in the `src/observability/tracing` directory. 

Custom traces can be added using the `@Trace()` decorator:

```typescript
import { Trace } from './observability/decorators/trace.decorator';

@Trace()
async myMethod() {
  // This method will be automatically traced
}
```

### Metrics

The application exposes Prometheus metrics at the `/metrics` endpoint. The metrics service is configured in the `src/observability/metrics` directory.

### Logging

Structured logging is provided by Winston and configured in the `src/observability/logger` directory. The logger supports both console and JSON formats and can be configured via environment variables.

# {{cookiecutter.project_name}}

{{cookiecutter.project_description}}

## Key Features

This project has been bootstrapped with the following features:

### 1. API Documentation
- **Swagger UI**: Full API documentation with interactive testing capabilities
  - Available at `/api/docs` when the application is running

### 2. Observability
- **Winston**: Advanced logging with customizable transports and log levels
- **OpenTelemetry**: Distributed tracing, metrics, and logging for better visibility into application performance
- **Prometheus**: Metrics collection and monitoring integration

### 3. DevOps
- CI/CD workflows for automated deployment:
  - Staging deployment configuration
  - Production deployment configuration

## Sample Implementation

A **Books Module** has been included as a reference implementation demonstrating:
- REST API endpoints with Swagger documentation
- Proper logging with Winston
- Telemetry integration
- Metrics collection

> **IMPORTANT**: The Books module is provided as an example only. It should be removed before deploying to production.

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Environment Variables Setup
# Create a .env file from the .env.example template
cp .env.example .env
# Then edit the .env file with your actual environment variables
```

### Running the Application

```bash
# Development mode
pnpm run start

# Watch mode (recommended for development)
pnpm run start:dev

# Production mode
pnpm run start:prod
```

### Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

