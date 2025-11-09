"""
Database-related constants.

This module defines execution environments and database operation modes
for database nodes in the workflow system.
"""

from enum import Enum


class ExecuteEnv(Enum):
    """
    SQL statement execution environment enumeration.

    Defines different environments where SQL statements can be executed.
    """

    TEXT = "test"
    PROD = "prod"


class DBMode(Enum):
    """
    Database node mode enumeration.

    Defines different operation modes for database nodes in the workflow.
    """

    CUSTOM = 0
    ADD = 1
    UPDATE = 2
    SEARCH = 3
    DELETE = 4
