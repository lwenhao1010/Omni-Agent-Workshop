# =============================================================================
# Go Language Support - Makefile Module
# =============================================================================

# Go tool definitions
GOIMPORTS := goimports
GOFUMPT := gofumpt
GOLINES := golines
GOCYCLO := gocyclo
STATICCHECK := staticcheck
GOLANGCI_LINT := golangci-lint

# Go project variables - use dynamic directories from config
GO := go
GO_DIRS := $(shell \
	if [ -n "$(LOCALCI_CONFIG)" ] && [ -f "$(LOCALCI_CONFIG)" ]; then \
		makefiles/parse_localci.sh enabled go $(LOCALCI_CONFIG) | cut -d'|' -f2 | tr '\n' ' '; \
	else \
		echo "demo-apps/backends/go"; \
	fi)

GO_PRIMARY_DIR := $(shell echo $(GO_DIRS) | cut -d' ' -f1)
GO_DIR := $(GO_PRIMARY_DIR)
GOFILES := $(shell \
	for dir in $(GO_DIRS); do \
		if [ -d "$$dir" ]; then \
			find $$dir -name "*.go" 2>/dev/null || true; \
		fi; \
	done)
GOMODULES := $(shell if [ -n "$(GO_PRIMARY_DIR)" ] && [ -d "$(GO_PRIMARY_DIR)" ]; then cd $(GO_PRIMARY_DIR) && $(GO) list -m 2>/dev/null || echo "No Go module"; fi)

# =============================================================================
# Core Go Commands
# =============================================================================

install-tools-go: ## 🛠️ Install Go development tools
	@if [ -d "$(GO_DIR)" ]; then \
		echo "$(YELLOW)Installing Go tools...$(RESET)"; \
		$(GO) install golang.org/x/tools/cmd/goimports@latest; \
		$(GO) install mvdan.cc/gofumpt@latest; \
		$(GO) install github.com/segmentio/golines@latest; \
		$(GO) install github.com/fzipp/gocyclo/cmd/gocyclo@latest; \
		$(GO) install honnef.co/go/tools/cmd/staticcheck@2025.1.1; \
		$(GO) install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.5.0; \
		echo "$(GREEN)Go tools installed$(RESET)"; \
	else \
		echo "$(BLUE)Skipping Go tools (no Go project detected)$(RESET)"; \
	fi

check-tools-go: ## ✅ Check Go development tools availability
	@if [ -d "$(GO_DIR)" ]; then \
		echo "$(YELLOW)Checking Go tools...$(RESET)"; \
		command -v $(GO) >/dev/null 2>&1 || (echo "$(RED)go is not installed$(RESET)" && exit 1); \
		command -v $(GOIMPORTS) >/dev/null 2>&1 || (echo "$(RED)goimports is not installed. Run 'make install-tools-go'$(RESET)" && exit 1); \
		command -v $(GOFUMPT) >/dev/null 2>&1 || (echo "$(RED)gofumpt is not installed. Run 'make install-tools-go'$(RESET)" && exit 1); \
		command -v $(GOLINES) >/dev/null 2>&1 || (echo "$(RED)golines is not installed. Run 'make install-tools-go'$(RESET)" && exit 1); \
		command -v $(GOCYCLO) >/dev/null 2>&1 || (echo "$(RED)gocyclo is not installed. Run 'make install-tools-go'$(RESET)" && exit 1); \
		command -v $(STATICCHECK) >/dev/null 2>&1 || (echo "$(RED)staticcheck is not installed. Run 'make install-tools-go'$(RESET)" && exit 1); \
		command -v $(GOLANGCI_LINT) >/dev/null 2>&1 || (echo "$(RED)golangci-lint is not installed. Run 'make install-tools-go'$(RESET)" && exit 1); \
		echo "$(GREEN)Go tools available$(RESET)"; \
		echo "  Module: $(GOMODULES)"; \
		echo "  Go files: $(words $(GOFILES))"; \
		echo "  Go version: $$($(GO) version)"; \
	fi

fmt-go: ## ✨ Format Go code
	@if [ -n "$(GO_DIRS)" ]; then \
		echo "$(YELLOW)Formatting Go code in: $(GO_DIRS)$(RESET)"; \
		for dir in $(GO_DIRS); do \
			if [ -d "$$dir" ]; then \
				echo "$(YELLOW)  Processing $$dir...$(RESET)"; \
				gofiles="$$(find $$dir -name "*.go" 2>/dev/null || true)"; \
				if [ -n "$$gofiles" ]; then \
					if command -v $(GOIMPORTS) >/dev/null 2>&1; then \
						$(GOIMPORTS) -w $$gofiles >/dev/null 2>&1 || true; \
					fi; \
					if command -v $(GOFUMPT) >/dev/null 2>&1; then \
						$(GOFUMPT) -w $$gofiles >/dev/null 2>&1 || true; \
					fi; \
					if command -v $(GOLINES) >/dev/null 2>&1; then \
						$(GOLINES) -w -m 120 $$gofiles >/dev/null 2>&1 || true; \
					fi; \
				else \
					echo "$(BLUE)    No Go files found in $$dir$(RESET)"; \
				fi; \
			else \
				echo "$(RED)    Directory $$dir does not exist$(RESET)"; \
			fi; \
		done; \
		echo "$(GREEN)Go code formatting completed$(RESET)"; \
	else \
		echo "$(BLUE)Skipping Go formatting (no Go projects configured)$(RESET)"; \
	fi

check-go: ## 🔍 Check Go code quality
	@if [ -n "$(GO_DIRS)" ]; then \
		echo "$(YELLOW)Checking Go code quality in: $(GO_DIRS)$(RESET)"; \
		for dir in $(GO_DIRS); do \
			if [ -d "$$dir" ]; then \
				echo "$(YELLOW)  Processing $$dir...$(RESET)"; \
				cd $$dir; \
				echo "$(YELLOW)    Checking format compliance...$(RESET)"; \
				gofiles="$$(find . -name "*.go" 2>/dev/null || true)"; \
				if [ -n "$$gofiles" ]; then \
					if command -v $(GOIMPORTS) >/dev/null 2>&1; then \
						unformatted="$$($(GOIMPORTS) -l $$gofiles)"; \
						if [ -n "$$unformatted" ]; then \
							echo "$(RED)    Files not formatted: $$unformatted$(RESET)"; \
							echo "$(YELLOW)    Run 'make fmt-go' to fix$(RESET)"; \
							exit 1; \
						fi; \
					fi; \
				fi; \
				if command -v $(GOCYCLO) >/dev/null 2>&1; then \
					echo "$(YELLOW)    Running gocyclo...$(RESET)"; \
					$(GOCYCLO) -over 10 . || (echo "$(RED)High cyclomatic complexity detected$(RESET)" && exit 1); \
				fi; \
				if command -v $(STATICCHECK) >/dev/null 2>&1; then \
					echo "$(YELLOW)    Running staticcheck...$(RESET)"; \
					PKGS="$$(go list ./... 2>/dev/null)"; \
					if [ -n "$$PKGS" ]; then \
						$(STATICCHECK) $$PKGS || (echo "$(RED)staticcheck failed$(RESET)" && exit 1); \
					fi; \
				fi; \
				if command -v $(GOLANGCI_LINT) >/dev/null 2>&1; then \
					echo "$(YELLOW)    Running golangci-lint...$(RESET)"; \
					GOCACHE=$$(pwd)/.gocache GOLANGCI_LINT_CACHE=$$(pwd)/.golangci-cache $(GOLANGCI_LINT) run ./... --timeout=5m || (echo "$(RED)golangci-lint failed$(RESET)" && exit 1); \
				fi; \
				cd - > /dev/null; \
			else \
				echo "$(RED)    Directory $$dir does not exist$(RESET)"; \
			fi; \
		done; \
		echo "$(GREEN)Go code quality checks completed$(RESET)"; \
	else \
		echo "$(BLUE)Skipping Go checks (no Go projects configured)$(RESET)"; \
	fi

test-go: ## 🧪 Run Go tests
	@if [ -n "$(GO_DIRS)" ]; then \
		echo "$(YELLOW)Running Go tests in: $(GO_DIRS)$(RESET)"; \
		for dir in $(GO_DIRS); do \
			if [ -d "$$dir" ]; then \
				echo "$(YELLOW)  Testing $$dir...$(RESET)"; \
				cd $$dir && GOCACHE=$$(pwd)/.gocache $(GO) test ./... -v; \
				cd - > /dev/null; \
			else \
				echo "$(RED)    Directory $$dir does not exist$(RESET)"; \
			fi; \
		done; \
		echo "$(GREEN)Go tests completed$(RESET)"; \
	else \
		echo "$(BLUE)Skipping Go tests (no Go projects configured)$(RESET)"; \
	fi

build-go: ## 📦 Build Go projects
	@if [ -n "$(GO_DIRS)" ]; then \
		echo "$(YELLOW)Building Go services in: $(GO_DIRS)$(RESET)"; \
		for dir in $(GO_DIRS); do \
			if [ -d "$$dir" ]; then \
				echo "$(YELLOW)  Building $$dir...$(RESET)"; \
				cd $$dir && \
				mkdir -p bin && \
				GOCACHE=$$(pwd)/.gocache $(GO) build -o bin/server ./cmd/server && \
				echo "$(GREEN)  Built: $$dir/bin/server$(RESET)"; \
				cd - > /dev/null; \
			else \
				echo "$(RED)    Directory $$dir does not exist$(RESET)"; \
			fi; \
		done; \
		echo "$(GREEN)Go build completed$(RESET)"; \
	else \
		echo "$(BLUE)Skipping Go build (no Go projects configured)$(RESET)"; \
	fi

clean-go: ## 🧹 Clean Go build artifacts
	@if [ -n "$(GO_DIRS)" ]; then \
		echo "$(YELLOW)Cleaning Go build artifacts in: $(GO_DIRS)$(RESET)"; \
		for dir in $(GO_DIRS); do \
			if [ -d "$$dir" ]; then \
				echo "$(YELLOW)  Cleaning $$dir...$(RESET)"; \
				cd $$dir && \
				$(GO) clean && \
				rm -rf bin/ .gocache/ .golangci-cache/ coverage/ && \
				echo "$(GREEN)  Cleaned: $$dir$(RESET)"; \
				cd - > /dev/null; \
			else \
				echo "$(RED)    Directory $$dir does not exist$(RESET)"; \
			fi; \
		done; \
		echo "$(GREEN)Go build artifacts cleaned$(RESET)"; \
	else \
		echo "$(BLUE)Skipping Go clean (no Go projects configured)$(RESET)"; \
	fi