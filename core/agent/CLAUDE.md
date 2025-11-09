# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential Commands (use these exact commands):**
- `python scripts/quality_check.py` - Run all quality checks (Black, isort, Flake8, MyPy, Pylint)
- `python -m black --line-length=88 .` - Format code with Black
- `python -m isort . --settings-path=pyproject.toml` - Sort imports
- `python -m mypy <filename> --config-file=pyproject.toml` - Type checking
- `python -m pylint <filename> --rcfile=pyproject.toml` - Static analysis
- `python -m flake8 <filename>` - Code style checking

**Application Commands:**
- `python main.py` - Run the main application entry point
- `python api/app.py` - Start the FastAPI server with uvicorn
- `uvicorn api.app:app --host 0.0.0.0 --port 8000` - Manual server startup

**Always run quality checks before completing any task.**

## Architecture Overview

Agent follows Domain-Driven Design (DDD) principles with clear separation of concerns across architectural layers. The system is organized for modern open-source development standards.

### DDD Architecture Layers

**API Layer (`api/`)**
- **V1 Routes** (`api/v1/`) - Versioned RESTful API endpoints
- **Schemas** (`api/schemas/`) - Request/response validation models (DTO/VO)
- **Main Application** (`api/app.py`) - FastAPI server with routing and middleware

**Service Layer (`service/`)**
- **Application Services** - Orchestrates business workflows
- **Builders** (`service/builder/`) - Service construction and dependency injection
- **Plugins** (`service/plugin/`) - Extensible plugin architecture
- **Runners** (`service/runner/`) - Service execution engines

**Engine Layer (`engine/`)**
- **Workflow Engine** - Independent workflow orchestration system
- **Node System** (`engine/nodes/`) - Agent implementations (Chat, CoT, CoT Process)
- **Entities** (`engine/entities/`) - Engine-specific domain objects

**Domain Layer (`domain/`)**
- **Core Business Logic** - Pure business rules and entities
- **Models** (`domain/models/`) - Domain models and business entities
- **Entities** (`domain/entity/`) - Business entities and value objects

**Repository Layer (`repository/`)**
- **Data Access Abstraction** - Database operations and persistence
- **MySQL Integration** - Database client and table definitions
- **Bot Configuration Management** - Configuration persistence

**Cache Layer (`cache/`)**
- **Session Management** - Redis-based caching and state management
- **Performance Optimization** - Fast data access for frequently used data

**Infrastructure Layer (`infra/`)**
- **Cross-cutting Concerns** - Authentication, configuration, monitoring
- **Configuration Management** (`infra/config/`) - Environment and application settings
- **Authentication** (`infra/app_auth.py`) - Security infrastructure
- **External Integrations** - Third-party service connections

### Agent System Components

**Chat Agent** (`engine/nodes/chat/`)
- Conversational interactions with context management
- Real-time streaming responses
- Session state persistence

**CoT Agent** (`engine/nodes/cot/`)
- Chain-of-thought reasoning implementation
- Step-by-step problem solving
- Plugin integration for external tool usage

**CoT Process Agent** (`engine/nodes/cot_process/`)
- Process-based chain-of-thought implementation
- Complex multi-step reasoning workflows
- Enhanced context handling

### Plugin Architecture

**Base Plugin** (`service/plugin/base.py`)
- Common plugin interface and functionality
- Standardized plugin lifecycle management
- Configuration and dependency injection

**Specialized Plugins**
- **Knowledge Plugin** - Knowledge base integration and retrieval
- **Link Plugin** - External resource and URL handling
- **MCP Plugin** - Model Context Protocol implementation
- **Workflow Plugin** - Workflow orchestration and execution

## Development Patterns

### Code Quality Standards
- **Line Length**: 88 characters maximum
- **Type Annotations**: Required for all functions and methods
- **Import Organization**: Using isort with Black compatibility
- **Static Analysis**: MyPy strict mode with comprehensive checks
- **Code Style**: Black formatting with Pylint analysis

### Adding New Components

**Adding New Agent Types:**
1. Create node implementation in `engine/nodes/<type>/`
2. Implement base agent interface from `engine/nodes/base.py`
3. Add corresponding prompt handling and runner logic
4. Register in service builders (`service/builder/`)

**Adding New Plugins:**
1. Inherit from `service/plugin/base.py`
2. Implement required plugin methods and interfaces
3. Add plugin configuration support
4. Register in plugin system and service builders

**Adding New API Endpoints:**
1. Create router in `api/v1/`
2. Define request/response models in `api/schemas/`
3. Implement business logic using service layer components
4. Include router in `api/app.py`

**Adding New Data Access:**
1. Create data access classes in `repository/`
2. Define domain models in `domain/models/`
3. Add caching logic in `cache/` if needed
4. Configure in infrastructure layer

### Configuration Management
- **Multi-layer Configuration**: Environment variables, database config, code-based settings
- **Infrastructure Layer** (`infra/config/`) - Centralized configuration management
- **Database Persistence** - Configuration stored in MySQL via repository layer
- **Cache Integration** - Redis for session state and performance optimization
- **Monitoring** - xingchen-utils integration for distributed tracing and metrics

## Quality Assurance

### Pre-commit Checklist
1. Run `python scripts/quality_check.py` to validate all code quality tools
2. Ensure all type annotations are present
3. Verify imports are properly organized
4. Check that line length stays within 88 characters
5. Test API endpoints with appropriate test data

### Testing Strategy
- Unit tests in `test/` directory
- Workflow agent node testing in `test/workflow_agent_node_test.py`
- Integration testing through API endpoints
- Quality validation through automated linting tools

## Key Implementation Notes

- **Async Operations**: FastAPI with async/await patterns for performance
- **Type Safety**: Strict MyPy configuration with comprehensive type checking
- **Modular Design**: Plugin-based architecture for extensibility
- **Error Handling**: Comprehensive validation with custom error responses
- **Monitoring**: Integrated tracing and metrics through xingchen-utils
- **Database**: SQLAlchemy 2.0 with MySQL backend
- **Caching**: Redis integration for performance optimization

## Working with the Codebase

- Project uses Python 3.11 with strict typing requirements
- FastAPI for web framework with automatic OpenAPI generation
- Modular plugin architecture allows for easy extension
- Configuration through multiple layers (environment, database, code)
- Quality enforced through multiple linting tools (Black, isort, MyPy, Pylint, Flake8)
- Development follows clean architecture principles with separation of concerns