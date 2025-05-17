<h1 align="center">
  A Patrick Onokwai Project
</h1>

# {{ cookiecutter.app_name }}

{{ cookiecutter.description }}

## Features

- 🚀 Modern NestJS framework (v11+)
- 📊 Complete observability stack
  - OpenTelemetry tracing integration
  - Prometheus metrics endpoint
  - Structured logging with Winston
- 🐳 Docker and Docker Compose setup
- 📚 API documentation with Swagger/OpenAPI
- ✅ Example REST API module (System)
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

### Code Quality Tools

This project uses several tools to ensure code quality and consistency:

#### Pre-commit Hooks

We use Husky and lint-staged to automatically run quality checks before each commit:

- **ESLint**: Checks for code quality issues and enforces coding standards
- **Prettier**: Ensures consistent code formatting
- **Commitlint**: Enforces conventional commit message format (TypeScript-based configuration)

These checks run automatically when you commit code. To bypass these checks in exceptional circumstances:

```bash
git commit --no-verify -m "Your commit message"
```

#### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Valid commit types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Examples of valid commit messages:**
```
feat(auth): implement JWT authentication
fix: resolve memory leak in connection pool
docs: update API documentation
style: format code according to style guide
refactor(users): simplify user registration logic
```

**Common reasons for commit rejection:**
- Missing type prefix (`feat:`, `fix:`, etc.)
- Type not from the allowed list
- Description starts with capital letter
- No description after the type
- Description too long (>72 characters)

#### Troubleshooting Husky Hooks

If you experience issues with the pre-commit or commit-msg hooks:

1. **Ensure hooks are executable**:
   ```bash
   chmod +x .husky/pre-commit .husky/commit-msg .husky/_/husky.sh
   ```

2. **Re-initialize Husky**:
   ```bash
   pnpm run prepare
   ```

3. **Verify Node.js version**:
   This project uses Node.js v22.11.0 (specified in `.nvmrc`). Use nvm to switch to the correct version:
   ```bash
   nvm use
   ```

4. **Check package manager**:
   If you're not using pnpm, the hooks will fall back to npx. For best results, use pnpm:
   ```bash
   npm install -g pnpm
   pnpm install
   ```
feat(auth): implement JWT authentication
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
├── docker-compose.yml      # Docker Compose configuration
├── README.md               # This file
├── eslint.config.mjs       # ESLint configuration
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── src/                    # Application source code
│   ├── app.module.ts       # Root application module
│   ├── main.ts             # Application entry point
│   └── modules/            # Feature modules
│       ├── system/         # Example feature module (REST API)
│       │   ├── system.controller.ts  # REST endpoints
│       │   ├── system.service.ts     # Business logic
│       │   ├── system.module.ts      # Module definition
│       │   └── dto/                  # Data Transfer Objects
│       └── observability/     # Complete observability stack
│           ├── logger/        # Structured logging with Winston
│           ├── metrics/       # Prometheus metrics
│           └── tracing/       # OpenTelemetry tracing
└── test/                   # End-to-end tests
```

## Docker Setup

The template includes a Docker setup for containerization:

```bash
# Build and run with Docker Compose
docker-compose up --build
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

# {cookiecutter.app_name}

{{cookiecutter.description}}

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

A **System Module** has been included as a reference implementation demonstrating:
- REST API endpoints with Swagger documentation
- Proper logging with Winston
- Telemetry integration
- Metrics collection

> **IMPORTANT**: The System module is provided as an example only. It should be removed before deploying to production.

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

