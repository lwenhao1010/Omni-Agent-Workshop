"""Data Upload Schema Definitions.

This module contains the Pydantic model for validating data upload requests.
It defines the required fields and their constraints for uploading data
to database tables.
"""

from memory.database.api.schemas.export_data_types import ExportDataInput


class UploadDataInput(ExportDataInput):  # pylint: disable=too-few-public-methods
    """Input validation model for uploading data to database tables.

    Attributes:
        app_id (str): Application ID (required, no Chinese/special characters)
        database_id (int): Target database ID (required)
        uid (str): User ID (required, 1-64 chars, no Chinese/special characters)
        table_name (str): Name of the target table (required)
        env (Literal["prod", "test"]): Environment (required, either 'prod' or 'test')
    """
