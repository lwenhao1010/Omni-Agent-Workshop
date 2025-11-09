"""
Database service factory module.

This module provides a factory class for creating database service instances
with configurable connection parameters.
"""

import os
from typing import Optional

from workflow.extensions.middleware.database.manager import DatabaseService
from workflow.extensions.middleware.factory import ServiceFactory


class DatabaseServiceFactory(ServiceFactory):
    """
    Factory class for creating DatabaseService instances.

    This factory handles the creation of database service instances with
    automatic configuration from environment variables when no explicit
    database URL is provided.
    """

    def __init__(self) -> None:
        """
        Initialize the DatabaseServiceFactory.

        Sets up the factory to create DatabaseService instances.
        """
        super().__init__(DatabaseService)

    def create(self, database_url: Optional[str] = None) -> DatabaseService:
        """
        Create a new DatabaseService instance.

        If no database URL is provided, the method will construct one from
        environment variables (MYSQL_HOST, MYSQL_PORT, MYSQL_USER,
        MYSQL_PASSWORD, MYSQL_DB).

        :param database_url: Optional database connection URL. If None,
                            will be constructed from environment variables
        :return: A configured DatabaseService instance
        """
        if database_url is None:
            # Extract database connection parameters from environment variables
            host = os.getenv("MYSQL_HOST")
            port = os.getenv("MYSQL_PORT")
            user = os.getenv("MYSQL_USER")
            password = os.getenv("MYSQL_PASSWORD")
            db = os.getenv("MYSQL_DB")
            # Construct MySQL connection URL using PyMySQL driver
            database_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db}"
        return DatabaseService(database_url=database_url)
