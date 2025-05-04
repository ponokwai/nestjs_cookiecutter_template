# NestJS Cookiecutter Template

A production-ready NestJS application template with observability, Docker integration, and best practices built-in.

## Features

- ✅ Modern NestJS configuration (v11+)
- ✅ TypeScript with strict type checking
- ✅ Complete observability stack
  - OpenTelemetry integration for distributed tracing
  - Prometheus metrics endpoint
  - Structured logging with Winston
- ✅ Docker and Docker Compose setup
- ✅ API documentation with Swagger/OpenAPI
- ✅ REST API best practices
- ✅ Unit and E2E testing setup
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Well-organized and scalable project structure

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Cookiecutter](https://cookiecutter.readthedocs.io/en/latest/installation.html)
- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (recommended)
- [Docker](https://docs.docker.com/get-docker/) (optional, for containerization)

## Usage

### Generate a New Project

```bash
# Install cookiecutter if you don't have it
pip install cookiecutter

# Generate your project
cookiecutter git@github.com:PaystackHQ/cookiecutter-nestjs-template.git
```

### Cookiecutter Prompts

During project generation, you'll be prompted for several values:

- `directory_name`: The name of the directory where your project will be created (default: my-nest-app)
- `project_name`: A human-readable name for your project (default: My NestJS App)
- `description`: A short description of your project
- `author_name`: Your name or organization name
- `project_slug`: The slugified name of your project (automatically generated from directory_name)

### Project Setup

After generating your project:

```bash
# Navigate to your project directory
cd <directory_name>

# Install dependencies
pnpm install

# Environment Variables Setup
# Create a .env file from the .env.example template
cp .env.example .env
# Then edit the .env file with your actual environment variables

# Start the development server
pnpm run start:dev
```

### Docker Setup

The template includes a Docker setup for containerization:

```bash
# Build and run with Docker Compose
cd <directory_name>
docker-compose -f infra/docker-compose.yml up --build
```

This will start your NestJS application on port 3000 with environment variables configured for production use, including OpenTelemetry endpoints.

## Project Structure

```
<directory_name>/
├── Dockerfile                # Docker configuration for the application
├── eslint.config.mjs         # ESLint configuration
├── nest-cli.json             # NestJS CLI configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── infra/                    # Infrastructure configuration
│   └── docker-compose.yml    # Docker Compose configuration
├── src/                      # Application source code
│   ├── app.module.ts         # Root application module
│   ├── main.ts               # Application entry point
│   ├── books/                # Example feature module (REST API)
│   │   ├── books.controller.ts # Controller with REST endpoints
│   │   ├── books.service.ts    # Service layer
│   │   ├── books.types.ts      # Type definitions
│   │   └── dto/              # Data Transfer Objects
│   └── observability/        # Complete observability stack
│       ├── logger/           # Structured logging with Winston
│       ├── metrics/          # Prometheus metrics
│       └── tracing/          # OpenTelemetry tracing
└── test/                     # End-to-end tests
```

## Environment Variables

The application uses environment variables for configuration. The template includes a `.env.example` file with default values that you should use to create your own `.env` file:

```bash
# Create a .env file from the template
cp .env.example .env
```

The `.env.example` file includes the following variables:

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

Customize these values in your `.env` file according to your project requirements.

## Observability

The template includes a complete observability setup:

- **Distributed Tracing**: OpenTelemetry is configured to trace HTTP requests and important application events
- **Metrics**: Prometheus metrics endpoint at `/metrics`
- **Logging**: Structured logging with Winston
- **Visualization**: Grafana dashboards for metrics and traces

## Development

```bash
# Start in development mode with hot reload
pnpm run start:dev

# Run unit tests
pnpm run test

# Run end-to-end tests
pnpm run test:e2e

# Check code coverage
pnpm run test:cov

# Lint code
pnpm run lint

# Format code
pnpm run format
```

## Customizing the Template

This cookiecutter template is designed to be a starting point. Feel free to:

1. Add additional NestJS modules for your specific use cases
2. Extend the observability setup with custom metrics or traces
3. Integrate with databases like PostgreSQL, MongoDB, etc.
4. Add authentication and authorization
5. Extend the Docker Compose setup with additional services
# nestjs_cookiecutter_template
