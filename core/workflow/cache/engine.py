"""
Workflow engine cache management module.

This module provides caching functionality for workflow engines,
including retrieval and storage operations for both debug and release engines.
"""

from datetime import datetime

from workflow.engine.dsl_engine import WorkflowEngine
from workflow.extensions.middleware.getters import get_cache_service
from workflow.extensions.otlp.trace.span import Span

# Cache prefix with hourly timestamp for engine cache keys
ENGINE_CACHE_PREFIX = (
    f'sparkflowV2:flow_engine:{datetime.utcnow().strftime("%Y%m%d%H")}'
)
# Cache expiration time in seconds (30 minutes)
ENGINE_CACHE_EXPIRE_TIME = 60 * 30


def get_engine(
    is_release: bool, flow_id: str, version: str, app_alias_id: str
) -> bytes | None:
    """
    Retrieve workflow engine from cache.

    :param is_release: Whether this is a release version engine
    :param flow_id: Flow ID
    :param version: Engine version
    :param app_alias_id: Application alias ID
    :return: Serialized engine bytes if found, None otherwise
    """
    if is_release:
        key = f"{ENGINE_CACHE_PREFIX}:release:{flow_id}:{version}:{app_alias_id}"
    else:
        key = f"{ENGINE_CACHE_PREFIX}:debug:{flow_id}:{version}:{app_alias_id}"
    cache_service = get_cache_service()
    return cache_service[key]


def set_engine(
    is_release: bool,
    flow_id: str,
    version: str,
    app_alias_id: str,
    sparkflow_engine: WorkflowEngine,
    span: Span,
) -> None:
    """
    Store workflow engine in cache.

    :param is_release: Whether this is a release version engine
    :param flow_id: Flow ID
    :param version: Engine version
    :param app_alias_id: Application alias ID
    :param sparkflow_engine: Workflow engine to store
    :param span: Tracing span for monitoring
    :return: None
    """
    if is_release:
        key = f"{ENGINE_CACHE_PREFIX}:release:{flow_id}:{version}:{app_alias_id}"
    else:
        key = f"{ENGINE_CACHE_PREFIX}:debug:{flow_id}:{version}:{app_alias_id}"
    engine_obj = sparkflow_engine.dumps(span)
    if engine_obj:
        cache_service = get_cache_service()
        cache_service[key] = engine_obj
