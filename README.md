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
- ✅ Example REST API module (System) for reference implementation
- ✅ Unit and E2E testing setup
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Git hooks with Husky and lint-staged for pre-commit checks
- ✅ Conventional commit message enforcement with commitlint
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
- `app_name`: The name of your app (default: My NestJs App)
- `description`: A short description of your project
- `author_name`: Your name or organization name (default: Patrick Onokwai)
- `project_slug`: The slugified name of your project (automatically generated from app_name)
- `team_namespace`: The devops namespace for your app (default: platform-engineering)
- `production_branch`: The branch to be used for production deployment (default: main)
- `staging_branch`: The branch to be used for staging deployment (default: dev)


### Project Setup

After generating your project:

```bash
# Navigate to your project directory
cd <project_slug>

# Install dependencies
pnpm install

# Environment Variables Setup
# Create a .env file from the .env.example template
cp .env.example .env
# Then edit the .env file with your actual environment variables

# Start the development server
pnpm run start:dev
```

## Customizing the Template

This cookiecutter template is designed to be a starting point. Feel free to:

1. Add additional NestJS modules for your specific use cases
2. Extend the observability setup with custom metrics or traces
3. Integrate with databases like PostgreSQL, MongoDB, etc.
4. Add authentication and authorization
5. Extend the Docker Compose setup with additional services
