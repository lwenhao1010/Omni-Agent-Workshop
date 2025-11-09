"""
Server startup module responsible for FastAPI application initialization and startup.
"""

import os

import uvicorn
from fastapi import FastAPI
from plugin.aitools.api.route import app
from plugin.aitools.const.const import SERVICE_APP_KEY, SERVICE_PORT_KEY

from common.initialize.initialize import initialize_services


class AIToolsServer:

    def start(self) -> None:
        # self.set_env()
        self.setup_server()
        self.start_uvicorn()

    @staticmethod
    def setup_server() -> None:
        """初始化服务套件"""

        os.environ["CONFIG_ENV_PATH"] = "./plugin/aitools/config.env"
        need_init_services = [
            "settings_service",
            "oss_service",
            "kafka_producer_service",
            "otlp_sid_service",
            "otlp_span_service",
            "otlp_metric_service",
        ]
        initialize_services(services=need_init_services)

    @staticmethod
    def start_uvicorn() -> None:

        if not (service_app := os.getenv(SERVICE_APP_KEY)):
            raise ValueError(f"Missing {SERVICE_APP_KEY} environment variable")
        if not (service_port := os.getenv(SERVICE_PORT_KEY)):
            raise ValueError(f"Missing {SERVICE_PORT_KEY} environment variable")

        uvicorn_config = uvicorn.Config(
            app=service_app,
            host="0.0.0.0",
            port=int(service_port),
            workers=20,
            reload=False,
            ws_ping_interval=None,
            ws_ping_timeout=NotImplemented,
            # log_config=None
        )
        uvicorn_server = uvicorn.Server(uvicorn_config)
        uvicorn_server.run()


def aitools_app() -> FastAPI:
    """
    description: create ai tools app
    :return:
    """
    main_app = FastAPI()
    main_app.include_router(app)

    return main_app
