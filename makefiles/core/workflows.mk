# =============================================================================
# Intelligent Workflow Core Implementation - Core Workflows Module  
# =============================================================================

# Include detection mechanism
include makefiles/core/detection.mk

# =============================================================================
# Intelligent Setup - setup
# =============================================================================
smart_setup: ## 🛠️ Intelligent environment setup (tools+hooks+branch strategy)
	@echo "$(BLUE)🛠️  Intelligent environment setup starting...$(RESET)"
	$(call show_project_status)
	@echo ""
	@echo "$(YELLOW)Installing development tools...$(RESET)"
	@$(MAKE) --no-print-directory smart_install_tools
	@echo ""
	@echo "$(YELLOW)Configuring Git hooks...$(RESET)"
	@$(MAKE) --no-print-directory hooks-install
	@echo ""
	@echo "$(YELLOW)Setting up branch strategy...$(RESET)"
	@$(MAKE) --no-print-directory branch-setup
	@echo ""
	@echo "$(GREEN)✅ Intelligent environment setup complete!$(RESET)"
	@echo "$(BLUE)Available core commands:$(RESET) setup format check test build push clean"

# Intelligent tool installation
smart_install_tools:
	@echo "$(YELLOW)Installing tools for active projects: $(ACTIVE_PROJECTS)$(RESET)"
	@for project in $(ACTIVE_PROJECTS); do \
		case $$project in \
			go) echo "  - Installing Go tools..." && $(MAKE) --no-print-directory install-tools-go ;; \
			java) echo "  - Installing Java tools..." && $(MAKE) --no-print-directory install-tools-java ;; \
			python) echo "  - Installing Python tools..." && $(MAKE) --no-print-directory install-tools-python ;; \
			typescript) echo "  - Installing TypeScript tools..." && $(MAKE) --no-print-directory install-tools-typescript ;; \
		esac; \
	done

# =============================================================================
# Intelligent Formatting - format
# =============================================================================
smart_format: ## ✨ Intelligent code formatting (detects active projects)
	@if [ -z "$(ACTIVE_PROJECTS)" ]; then \
		echo "$(RED)❌ No active projects detected$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)✨ Intelligent formatting: $(GREEN)$(ACTIVE_PROJECTS)$(RESET)"
	@if [ -n "$(LOCALCI_CONFIG)" ]; then \
		echo "$(YELLOW)Using configuration: $(LOCALCI_CONFIG)$(RESET)"; \
		for lang in $(ACTIVE_PROJECTS); do \
			apps="$$(makefiles/parse_localci.sh enabled $$lang $(LOCALCI_CONFIG) | cut -d'|' -f2)"; \
			if [ -n "$$apps" ]; then \
				for dir in $$apps; do \
					echo "  - Formatting($$lang): $$dir"; \
					case $$lang in \
						go) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory fmt-go; fi ;; \
						java) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory fmt-java; fi ;; \
						python) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory fmt-python; fi ;; \
						typescript) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory fmt-typescript; fi ;; \
					esac; \
				done; \
			fi; \
		done; \
	else \
		for project in $(ACTIVE_PROJECTS); do \
			case $$project in \
				go) echo "  - Formatting Go code..." && $(MAKE) --no-print-directory fmt-go ;; \
				java) echo "  - Formatting Java code..." && $(MAKE) --no-print-directory fmt-java ;; \
				python) echo "  - Formatting Python code..." && $(MAKE) --no-print-directory fmt-python ;; \
				typescript) echo "  - Formatting TypeScript code..." && $(MAKE) --no-print-directory fmt-typescript ;; \
			esac; \
		done; \
	fi
	@echo "$(GREEN)✅ Formatting complete: $(ACTIVE_PROJECTS)$(RESET)"

# =============================================================================
# Intelligent Quality Check - check
# =============================================================================
smart_check: ## 🔍 Intelligent code quality check (detect active projects)
	@if [ -z "$(ACTIVE_PROJECTS)" ]; then \
		echo "$(RED)❌ No active projects detected$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🔍 Intelligent quality check: $(GREEN)$(ACTIVE_PROJECTS)$(RESET)"
	@if [ -n "$(LOCALCI_CONFIG)" ]; then \
		echo "$(YELLOW)Using configuration: $(LOCALCI_CONFIG)$(RESET)"; \
		for lang in $(ACTIVE_PROJECTS); do \
			apps="$$(makefiles/parse_localci.sh enabled $$lang $(LOCALCI_CONFIG) | cut -d'|' -f2)"; \
			if [ -n "$$apps" ]; then \
				for dir in $$apps; do \
					echo "  - Checking($$lang): $$dir"; \
					case $$lang in \
						go) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory check-go; fi ;; \
						java) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory check-java; fi ;; \
						python) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory check-python; fi ;; \
						typescript) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory check-typescript; fi ;; \
					esac; \
				done; \
			fi; \
		done; \
	else \
		for project in $(ACTIVE_PROJECTS); do \
			case $$project in \
				go) echo "  - Checking Go code..." && $(MAKE) --no-print-directory check-go ;; \
				java) echo "  - Checking Java code..." && $(MAKE) --no-print-directory check-java ;; \
				python) echo "  - Checking Python code..." && $(MAKE) --no-print-directory check-python ;; \
				typescript) echo "  - Checking TypeScript code..." && $(MAKE) --no-print-directory check-typescript ;; \
			esac; \
		done; \
	fi
	@echo "$(YELLOW)Checking comment language compliance...$(RESET)"
	@if [ -n "$(LOCALCI_CONFIG)" ]; then \
		for lang in $(ACTIVE_PROJECTS); do \
			case $$lang in \
				go) $(MAKE) --no-print-directory check-comments-go ;; \
				java) $(MAKE) --no-print-directory check-comments-java ;; \
				python) $(MAKE) --no-print-directory check-comments-python ;; \
				typescript) $(MAKE) --no-print-directory check-comments-typescript ;; \
			esac; \
		done; \
	else \
		$(MAKE) --no-print-directory check-comments; \
	fi
	@echo "$(GREEN)✅ Quality check complete: $(ACTIVE_PROJECTS)$(RESET)"

# =============================================================================
# Intelligent Testing - test
# =============================================================================
smart_test: ## 🧪 Intelligent test execution (detect active projects)
	@if [ -z "$(ACTIVE_PROJECTS)" ]; then \
		echo "$(RED)❌ No active projects detected$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🧪 Intelligent testing: $(GREEN)$(ACTIVE_PROJECTS)$(RESET)"
	@if [ -n "$(LOCALCI_CONFIG)" ]; then \
		for lang in $(ACTIVE_PROJECTS); do \
			apps="$$(makefiles/parse_localci.sh enabled $$lang $(LOCALCI_CONFIG) | cut -d'|' -f2)"; \
			if [ -n "$$apps" ]; then \
				for dir in $$apps; do \
					echo "  - Testing($$lang): $$dir"; \
					case $$lang in \
						go) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory test-go; fi ;; \
						java) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory test-java; fi ;; \
						python) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory test-python; fi ;; \
						typescript) echo "    Skipping TypeScript tests (not configured yet)" ;; \
					esac; \
				done; \
			fi; \
		done; \
	else \
		for project in $(ACTIVE_PROJECTS); do \
			case $$project in \
				go) echo "  - Running Go tests..." && $(MAKE) --no-print-directory test-go ;; \
				java) echo "  - Running Java tests..." && $(MAKE) --no-print-directory test-java ;; \
				python) echo "  - Running Python tests..." && $(MAKE) --no-print-directory test-python ;; \
				typescript) echo "  - Skipping TypeScript tests (not configured yet)" ;; \
			esac; \
		done; \
	fi
	@echo "$(GREEN)✅ Testing complete: $(ACTIVE_PROJECTS)$(RESET)"

# =============================================================================
# Intelligent Build - build
# =============================================================================
smart_build: ## 📦 Intelligent project build (detect active projects)
	@if [ -z "$(ACTIVE_PROJECTS)" ]; then \
		echo "$(RED)❌ No active projects detected$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)📦 Intelligent build: $(GREEN)$(ACTIVE_PROJECTS)$(RESET)"
	@if [ -n "$(LOCALCI_CONFIG)" ]; then \
		for lang in $(ACTIVE_PROJECTS); do \
			apps="$$(makefiles/parse_localci.sh enabled $$lang $(LOCALCI_CONFIG) | cut -d'|' -f2)"; \
			if [ -n "$$apps" ]; then \
				for dir in $$apps; do \
					echo "  - Building($$lang): $$dir"; \
					case $$lang in \
						go) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory build-go; fi ;; \
						java) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory build-java; fi ;; \
						python) echo "    (Python doesn't need building)" ;; \
						typescript) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory build-typescript; fi ;; \
					esac; \
				done; \
			fi; \
		done; \
	else \
		for project in $(ACTIVE_PROJECTS); do \
			case $$project in \
				go) echo "  - Building Go project..." && $(MAKE) --no-print-directory build-go ;; \
				java) echo "  - Building Java project..." && $(MAKE) --no-print-directory build-java ;; \
				python) echo "  - Python doesn't need building (interpreted execution)" ;; \
				typescript) echo "  - Building TypeScript project..." && cd frontend-ts && npm run build ;; \
			esac; \
		done; \
	fi
	@echo "$(GREEN)✅ Build complete: $(ACTIVE_PROJECTS)$(RESET)"

# (dev series commands have been removed)

# =============================================================================
# Intelligent Push - push
# =============================================================================
smart_push: ## 📤 Intelligent safe push (branch check + quality check)
	@echo "$(BLUE)📤 Intelligent safe push$(RESET)"
	@echo "$(YELLOW)Checking branch naming convention...$(RESET)"
	@$(MAKE) --no-print-directory check-branch
	@echo "$(YELLOW)Running pre-push quality check...$(RESET)"
	@$(MAKE) --no-print-directory smart_format
	@$(MAKE) --no-print-directory smart_check
	@echo "$(YELLOW)Pushing to remote repository...$(RESET)"
	@$(MAKE) --no-print-directory safe-push
	@echo "$(GREEN)✅ Safe push complete$(RESET)"

# =============================================================================
# Intelligent Clean - clean
# =============================================================================
smart_clean: ## 🧹 Intelligent cleanup of build artifacts
	@echo "$(BLUE)🧹 Intelligent cleanup: $(GREEN)$(ACTIVE_PROJECTS)$(RESET)"
		@if [ -n "$(LOCALCI_CONFIG)" ]; then \
			for lang in $(ACTIVE_PROJECTS); do \
			apps="$$(makefiles/parse_localci.sh enabled $$lang $(LOCALCI_CONFIG) | cut -d'|' -f2)"; \
			if [ -n "$$apps" ]; then \
				for dir in $$apps; do \
					echo "  - Cleaning($$lang): $$dir"; \
					case $$lang in \
						go) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory clean-go; fi ;; \
						java) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory clean-java; fi ;; \
						python) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory clean-python; fi ;; \
						typescript) if [ -d "$$dir" ]; then $(MAKE) --no-print-directory clean-typescript; fi ;; \
					esac; \
				done; \
			fi; \
		done; \
	else \
		for project in $(ACTIVE_PROJECTS); do \
			case $$project in \
				go) echo "  - Cleaning Go build artifacts..." && \
					if [ -d "backend-go" ]; then cd backend-go && go clean && rm -f bin/* || true; else echo "    Go directory does not exist"; fi ;; \
				java) echo "  - Cleaning Java build artifacts..." && \
					if [ -d "backend-java" ]; then $(MAKE) --no-print-directory clean-java; else echo "    Java directory does not exist"; fi ;; \
				python) echo "  - Cleaning Python cache..." && \
						if [ -d "backend-python" ]; then find backend-python -type d -name "__pycache__" -exec rm -rf {} \; 2>/dev/null || true; else echo "    Python directory does not exist"; fi ;; \
				typescript) echo "  - Cleaning TypeScript build artifacts..." && \
					if [ -d "frontend-ts" ]; then cd frontend-ts && rm -rf dist node_modules/.cache || true; else echo "    TypeScript directory does not exist"; fi ;; \
			esac; \
		done; \
	fi
	@echo "$(GREEN)✅ Cleanup complete: $(ACTIVE_PROJECTS)$(RESET)"

# =============================================================================
# Intelligent CI Pipeline - ci
# =============================================================================
smart_ci: ## 🤖 Complete CI pipeline (format + check + test + build)
	@echo "$(BLUE)🤖 Complete CI pipeline starting$(RESET)"
	@$(MAKE) --no-print-directory smart_format
	@$(MAKE) --no-print-directory smart_check  
	@$(MAKE) --no-print-directory smart_test
	@$(MAKE) --no-print-directory smart_build
	@echo "$(GREEN)✅ CI pipeline complete$(RESET)"

# =============================================================================
# Intelligent Fix - fix  
# =============================================================================
smart_fix: ## 🛠️ Intelligent code fix (formatting + partial auto-fixes)
	@echo "$(BLUE)🛠️ Intelligent code fix$(RESET)"
	@$(MAKE) --no-print-directory smart_format
	@echo "$(GREEN)✅ Auto-fix complete (mainly formatting)$(RESET)"

# =============================================================================
# Utility Functions
# =============================================================================
smart_status: ## 📊 Show detailed project status
	@echo "$(BLUE)📊 Project Status Details$(RESET)"
	$(call show_project_status)
	@echo ""
	@if [ -n "$(LOCALCI_CONFIG)" ]; then \
		echo "$(YELLOW)LocalCI Configuration: $(LOCALCI_CONFIG)$(RESET)"; \
		if [ -f "$(LOCALCI_CONFIG)" ]; then \
			echo "-- Enabled Applications --"; \
				for lang in $(ACTIVE_PROJECTS); do \
				apps="$$(makefiles/parse_localci.sh enabled $$lang $(LOCALCI_CONFIG))"; \
				if [ -n "$$apps" ]; then \
					echo "  $$lang:"; \
					echo "$$apps" | while IFS='|' read -r name dir; do echo "    - $$name -> $$dir"; done; \
				fi; \
			done; \
			echo "-- All Applications (including disabled) --"; \
			makefiles/parse_localci.sh all $(LOCALCI_CONFIG) | awk -F'|' '{ printf "  %s: %s [%s] -> %s\n", $$1, $$2, $$4, $$3 }'; \
		fi; \
	fi
	@echo ""
	@echo "$(BLUE)Active Project Count:$(RESET) $(PROJECT_COUNT)"
	@echo "$(BLUE)Multi-project Environment:$(RESET) $(IS_MULTI_PROJECT)"

smart_info: ## ℹ️ Show tools and dependency information
	@echo "$(BLUE)ℹ️  Tools and Dependency Information$(RESET)"
	@$(MAKE) --no-print-directory smart_status
	@echo ""
	@for project in $(ACTIVE_PROJECTS); do \
		case $$project in \
			go) echo "$(YELLOW)Go Tool Status:$(RESET)" && $(MAKE) --no-print-directory check-tools-go ;; \
			java) echo "$(YELLOW)Java Tool Status:$(RESET)" && $(MAKE) --no-print-directory check-tools-java ;; \
			python) echo "$(YELLOW)Python Tool Status:$(RESET)" && $(MAKE) --no-print-directory check-tools-python ;; \
			typescript) echo "$(YELLOW)TypeScript Tool Status:$(RESET)" && $(MAKE) --no-print-directory check-tools-typescript ;; \
		esac; \
		echo ""; \
	done
