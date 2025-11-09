"""
Base service interface for middleware services.

This module defines the abstract base class for all middleware services,
providing a common interface for service lifecycle management.
"""

from abc import ABC

from workflow.extensions.middleware.utils import ServiceType


class Service(ABC):
    """
    Abstract base class for all middleware services.

    This class defines the common interface that all services must implement,
    including service identification, readiness state, and lifecycle management.
    """

    name: ServiceType
    ready: bool = False

    def teardown(self) -> None:
        """
        Clean up resources when the service is being shut down.

        This method should be overridden by subclasses to perform any necessary
        cleanup operations such as closing connections, releasing resources, etc.
        """
        pass

    def set_ready(self) -> None:
        """
        Mark the service as ready for use.

        This method sets the ready flag to True, indicating that the service
        has been properly initialized and is ready to handle requests.
        """
        self.ready = True
