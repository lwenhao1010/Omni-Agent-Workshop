import os
from pathlib import Path

from dotenv import load_dotenv
from loguru import logger

from workflow.configs.app_config import WorkflowConfig
from workflow.consts.runtime_env import RuntimeEnv


def set_env() -> None:
    """
    Set environment variables by loading configuration from environment files.

    This function determines the appropriate configuration file based on the
    runtime environment (local vs production) and loads the environment
    variables from the corresponding .env file.

    :raises ValueError: If no configuration file is found
    :raises Exception: Re-raises any other exceptions that occur during loading
    """
    # Determine the runtime environment (defaults to Local)
    running_env = os.getenv("RUNTIME_ENV", "")

    # Select the appropriate configuration file based on environment
    if running_env == RuntimeEnv.Local.value:
        env_file = Path(__file__).parent.parent / "config.local.env"
    else:
        env_file = Path(__file__).parent.parent / "config.env"

    logger.debug(f"config.env: {env_file}")

    # Load environment variables from the configuration file
    if os.path.exists(env_file):
        load_dotenv(env_file, override=False)
        logger.debug("Using config.env file.")
    else:
        raise ValueError("No config.env file found.")


set_env()
workflow_config = WorkflowConfig()
