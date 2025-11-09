"""
Knowledge service API routing module.

This module provides RESTful API interfaces related to RAG (Retrieval-Augmented Generation),
including document splitting, knowledge chunk saving, updating, deleting, querying, and other functions.
"""

import json
from typing import Any, Callable, List, Optional, Tuple, Union, cast

from common.otlp.metrics.meter import Meter
from common.otlp.trace.span import Span
from common.service import get_otlp_metric_service, get_otlp_span_service
from common.service.otlp.metric.metric_service import OtlpMetricService
from common.service.otlp.span.span_service import OtlpSpanService
from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from loguru import logger

from knowledge.consts.error_code import CodeEnum
from knowledge.domain.entity.chunk_dto import (
    ChunkDeleteReq,
    ChunkQueryReq,
    ChunkSaveReq,
    ChunkUpdateReq,
    FileSplitReq,
    QueryDocReq,
    RAGType,
)
from knowledge.domain.response import ErrorResponse, SuccessDataResponse
from knowledge.exceptions.exception import (
    CustomException,
    ProtocolParamException,
    ThirdPartyException,
)
from knowledge.service.rag_strategy_factory import RAGStrategyFactory

rag_router = APIRouter(prefix="/knowledge/v1")


# --- Dependency Functions ---
def get_app_id(request: Request) -> str:
    """Dependency function to get app_id from request headers"""
    return request.headers.get("app_id", "")


def get_span_and_metric(
    app_id: str, function_name: str = "unknown_function"
) -> Tuple[Span, Meter]:
    """Dependency function to create and return Span and Meter instances"""

    metric_service = cast(OtlpMetricService, get_otlp_metric_service())
    metric = metric_service.get_meter()(func=function_name)
    span_service = cast(OtlpSpanService, get_otlp_span_service())
    span = span_service.get_span()(app_id=app_id)
    return span, metric


# --- Helper Functions ---
async def handle_rag_operation(
    *,
    span_context: Span,
    metric: Meter,
    operation_callable: Callable[..., Any],
    **operation_kwargs: Any,
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Unified handling of RAG operations, response logging, metric counting, and exception handling.

    Args:
        span_context: Distributed tracing Span context
        metric: Metric counter
        operation_callable: Function that actually calls RAG functionality
        **operation_kwargs: Parameters passed to operation_callable

    Returns:
        Operation result response

    Raises:
        Various possible exceptions, but they will be caught and return error responses
    """
    try:
        # Execute core operation
        result_data = await operation_callable(**operation_kwargs, span=span_context)

        # Record successful output and metrics
        # set_safe_attribute(span_context, result_data)
        """Safely set attributes, handling complex types"""
        if isinstance(result_data, (dict, list)):
            # Convert complex types to JSON string
            span_context.add_info_events(
                {"usr_output": json.dumps(result_data, ensure_ascii=False, default=str)}
            )
        elif (
            isinstance(result_data, (str, int, float, bool, bytes))
            or result_data is None
        ):
            # Basic types, convert to string for consistent handling
            span_context.add_info_events({"usr_output": str(result_data)})
        else:
            # Other types (like custom objects), try to stringify
            span_context.add_info_events({"usr_output": str(result_data)})

        metric.in_success_count()

        return SuccessDataResponse(data=result_data, sid=span_context.sid)

    except ProtocolParamException as e:
        error_msg = f"{operation_callable.__name__} ProtocolParamException, reason {e}"
        logger.error(error_msg)
        span_context.record_exception(e)
        metric.in_error_count(code=CodeEnum.ParameterCheckException.code)
        return ErrorResponse(code_enum=CodeEnum.ParameterCheckException, message=str(e))

    except ThirdPartyException as e:
        error_msg = f"{operation_callable.__name__} err (ThirdParty), reason {e}"
        logger.error(error_msg)
        span_context.record_exception(e)
        metric.in_error_count(code=e.code)
        # Create a CodeEnum-like object for the response
        error_code = type("ErrorCode", (), {"code": e.code, "msg": e.message})()
        return ErrorResponse(code_enum=error_code, message=e.message)

    except CustomException as e:
        error_msg = f"{operation_callable.__name__} err (Custom), reason {e}"
        logger.error(error_msg)
        span_context.record_exception(e)
        metric.in_error_count(code=e.code)
        # Create a CodeEnum-like object for the response
        error_code = type("ErrorCode", (), {"code": e.code, "msg": e.message})()
        return ErrorResponse(code_enum=error_code, message=e.message)

    except Exception as e:  # pylint: disable=W0718
        # Intentionally catch all exceptions here as part of global exception handling
        error_msg = f"{operation_callable.__name__} err (Unexpected), reason {e}"
        logger.error(error_msg)
        span_context.record_exception(e)
        metric.in_error_count(code=CodeEnum.ServiceException.code)
        return ErrorResponse(
            code_enum=CodeEnum.ServiceException,
            message=f"Internal server error:{error_msg}",
        )


# --- Route Handler Functions ---
@rag_router.post("/document/split")
async def file_split(
    split_request: FileSplitReq, app_id: str = Depends(get_app_id)
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Parse the text provided by the user first, then perform chunking.

    Args:
        split_request: File splitting request parameters
        app_id: Application identifier

    Returns:
        Result of the splitting operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="file_split")
    request_dict = split_request.model_dump()

    with span.start(func_name="file_split") as span_context:
        # Record and validate
        span_context.add_info_events(
            {"usr_input": json.dumps(request_dict, ensure_ascii=False)}
        )
        strategy = RAGStrategyFactory.get_strategy(split_request.ragType)

        # Use helper function to handle core operations and exceptions
        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.split,
            fileUrl=split_request.file,
            resourceType=split_request.resourceType,
            lengthRange=split_request.lengthRange,
            overlap=split_request.overlap,
            separator=split_request.separator,
            titleSplit=split_request.titleSplit,
            cutOff=split_request.cutOff,
        )


async def parse_length_range(lengthRange: Optional[str]) -> Optional[List[int]]:
    parsed_length_range = None
    if lengthRange:
        try:
            parsed_length_range = json.loads(lengthRange)
            # Invalid
            if not all(isinstance(x, int) for x in parsed_length_range):
                raise ProtocolParamException(
                    msg="The lengthRange must be an array of integers"
                )
        except (json.JSONDecodeError, ValueError) as e:
            raise ProtocolParamException(
                msg=f"Invalid lengthRange format: {str(e)}；The lengthRange must be an array of integers"
            )
    return parsed_length_range


async def parse_separator(separator: Optional[str]) -> Optional[List[str]]:
    parsed_separator = None
    if separator:
        try:
            parsed_separator = json.loads(separator)
            # Invalid
            if not all(isinstance(x, str) for x in parsed_separator):
                raise ProtocolParamException(
                    msg="The separator must be an array of strings"
                )
        except (json.JSONDecodeError, ValueError) as e:
            raise ProtocolParamException(
                msg=f"Invalid separator format: {str(e)}；The separator must be an array of strings"
            )
    return parsed_separator


@rag_router.post("/document/upload")
async def file_upload(
    file: UploadFile = File(),
    ragType: RAGType = Form(),
    lengthRange: Optional[str] = Form(
        None, description='Length range JSON array, such as "[256, 1024]"'
    ),
    separator: Optional[str] = Form(
        None, description='Delimiter JSON array, such as ["\\n", ". "]'
    ),
    app_id: str = Depends(get_app_id),
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Parse file content and perform chunking.

    2. Form-data mode: Upload file or provide URL with form parameters

    Args:
        file: Uploaded file (form-data mode)
        ragType: RAG type (form-data mode)
        lengthRange: Split length range as JSON string (form-data mode)
        separator: Separator list as JSON string (form-data mode)
        app_id: Application identifier

    Returns:
        Result of the splitting operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="file_upload")

    with span.start(func_name="file_upload") as span_context:
        # Record and validate
        span_context.add_info_events(
            {
                "usr_input": json.dumps(
                    {
                        "file": file.filename,
                        "ragType": ragType,
                        "lengthRange": lengthRange,
                        "separator": separator,
                    },
                    ensure_ascii=False,
                )
            }
        )
        strategy = RAGStrategyFactory.get_strategy(ragType)

        try:
            # Use a unified parameter parsing function
            parsed_length_range = await parse_length_range(lengthRange)
            parsed_separator = await parse_separator(separator)

        except ProtocolParamException as e:
            error_msg = f"file_upload ProtocolParamException, reason {e}"
            logger.error(error_msg)
            span_context.record_exception(e)
            metric.in_error_count(code=CodeEnum.ParameterCheckException.code)
            return ErrorResponse(
                code_enum=CodeEnum.ParameterCheckException, message=str(e)
            )

        # Use helper function to handle core operations and exceptions
        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.split,
            file=file,
            lengthRange=parsed_length_range,
            separator=parsed_separator,
        )


@rag_router.post("/chunks/save")
async def chunk_save(
    save_request: ChunkSaveReq, app_id: str = Depends(get_app_id)
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Save the chunked data to the database, or add new chunks.

    Args:
        save_request: Knowledge chunk save request parameters
        app_id: Application identifier

    Returns:
        Result of the save operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="chunk_save")
    request_dict = save_request.model_dump()

    with span.start(func_name="chunk_save") as span_context:
        span_context.add_info_events(
            {"usr_input": json.dumps(request_dict, ensure_ascii=False)}
        )
        strategy = RAGStrategyFactory.get_strategy(save_request.ragType)

        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.chunks_save,
            docId=save_request.docId,
            group=save_request.group,
            uid=save_request.uid,
            chunks=save_request.chunks,
        )


@rag_router.post("/chunk/update")
async def chunk_update(
    update_request: ChunkUpdateReq, app_id: str = Depends(get_app_id)
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Update knowledge chunks.

    Args:
        update_request: Knowledge chunk update request parameters
        app_id: Application identifier

    Returns:
        Result of the update operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="chunk_update")
    request_dict = update_request.model_dump()

    with span.start(func_name="chunk_update") as span_context:
        span_context.add_info_events(
            {"usr_input": json.dumps(request_dict, ensure_ascii=False)}
        )
        strategy = RAGStrategyFactory.get_strategy(update_request.ragType)

        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.chunks_update,
            docId=update_request.docId,
            group=update_request.group,
            uid=update_request.uid,
            chunks=update_request.chunks,
        )


@rag_router.post("/chunk/delete")
async def chunk_delete(
    delete_request: ChunkDeleteReq, app_id: str = Depends(get_app_id)
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Delete knowledge chunks.

    Args:
        delete_request: Knowledge chunk delete request parameters
        app_id: Application identifier

    Returns:
        Result of the delete operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="chunk_delete")
    request_dict = delete_request.model_dump()

    with span.start(func_name="chunk_delete") as span_context:
        span_context.add_info_events(
            {"usr_input": json.dumps(request_dict, ensure_ascii=False)}
        )
        strategy = RAGStrategyFactory.get_strategy(delete_request.ragType)

        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.chunks_delete,
            docId=delete_request.docId,
            chunkIds=delete_request.chunkIds,
        )


@rag_router.post("/chunk/query")
async def chunk_query(
    query_request: ChunkQueryReq, app_id: str = Depends(get_app_id)
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Retrieve similar document chunks based on user input content.

    Args:
        query_request: Knowledge chunk query request parameters
        app_id: Application identifier

    Returns:
        Result of the query operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="chunk_query")
    request_dict = query_request.model_dump()

    with span.start(func_name="chunk_query") as span_context:
        span_context.add_info_events(
            {"usr_input": json.dumps(request_dict, ensure_ascii=False)}
        )
        strategy = RAGStrategyFactory.get_strategy(query_request.ragType)

        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.query,
            query=query_request.query,
            doc_ids=query_request.match.docIds,
            repo_ids=query_request.match.repoId,
            top_k=query_request.topN,
            threshold=query_request.match.threshold,
            flow_id=query_request.match.flowId,
        )


@rag_router.post("/document/chunk")
async def query_doc(
    query_request: QueryDocReq, app_id: str = Depends(get_app_id)
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Query document chunk information.

    Args:
        query_request: Document query request parameters
        app_id: Application identifier

    Returns:
        Result of the query operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="query_doc")

    with span.start(func_name="query_doc") as span_context:
        span_context.add_info_events({"file_id": query_request.docId})
        strategy = RAGStrategyFactory.get_strategy(query_request.ragType)

        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.query_doc,
            docId=query_request.docId,
        )


@rag_router.post("/document/name")
async def query_doc_name(
    query_request: QueryDocReq, app_id: str = Depends(get_app_id)
) -> Union[SuccessDataResponse, ErrorResponse]:
    """
    Query document name information.

    Args:
        query_request: Document query request parameters
        app_id: Application identifier

    Returns:
        Result of the query operation
    """
    span, metric = get_span_and_metric(app_id=app_id, function_name="query_doc_name")

    with span.start(func_name="query_doc_name") as span_context:
        span_context.add_info_events({"file_id": query_request.docId})
        strategy = RAGStrategyFactory.get_strategy(query_request.ragType)

        return await handle_rag_operation(
            span_context=span_context,
            metric=metric,
            operation_callable=strategy.query_doc_name,
            docId=query_request.docId,
        )
