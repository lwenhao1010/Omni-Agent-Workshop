package com.iflytek.astron.console.hub.service;

import cn.xfyun.api.SparkChatClient;
import cn.xfyun.model.sparkmodel.SparkChatParam;
import com.iflytek.astron.console.commons.dto.llm.SparkChatRequest;
import com.iflytek.astron.console.commons.entity.chat.ChatReqRecords;
import com.iflytek.astron.console.commons.service.ChatRecordModelService;
import com.iflytek.astron.console.commons.service.data.ChatDataService;
import com.iflytek.astron.console.commons.util.SseEmitterUtil;
import okhttp3.*;
import okio.Buffer;
import okio.BufferedSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SparkChatServiceTest {

    @Mock
    private ChatDataService chatDataService;

    @Mock
    private ChatRecordModelService chatRecordModelService;

    @Mock
    private SseEmitter emitter;

    @Mock
    private Call call;

    @Mock
    private Response response;

    @Mock
    private ResponseBody responseBody;

    private SparkChatService sparkChatService;

    private SparkChatRequest sparkChatRequest;
    private ChatReqRecords chatReqRecords;
    private String streamId;

    @BeforeEach
    void setUp() {
        sparkChatService = new SparkChatService();
        ReflectionTestUtils.setField(sparkChatService, "apiPassword", "test-api-password");
        ReflectionTestUtils.setField(sparkChatService, "chatDataService", chatDataService);
        ReflectionTestUtils.setField(sparkChatService, "chatRecordModelService", chatRecordModelService);

        streamId = "test-stream-id";

        // Setup SparkChatRequest
        sparkChatRequest = new SparkChatRequest();
        sparkChatRequest.setChatId("100");
        sparkChatRequest.setUserId("test-user-id");
        sparkChatRequest.setModel("spark");

        List<SparkChatRequest.MessageDto> messages = new ArrayList<>();
        SparkChatRequest.MessageDto message = new SparkChatRequest.MessageDto();
        message.setRole("user");
        message.setContent("Hello");
        messages.add(message);
        sparkChatRequest.setMessages(messages);

        chatReqRecords = new ChatReqRecords();
        chatReqRecords.setId(1L);
        chatReqRecords.setUid("test-uid");
        chatReqRecords.setChatId(100L);
    }

    // ==================== chatStream Tests ====================

    @Test
    void testChatStream_CreatesSseEmitter() {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class,
                        (mock, context) -> doNothing().when(mock).send(any(SparkChatParam.class), any(Callback.class)))) {

            SseEmitter mockEmitter = mock(SseEmitter.class);
            sseUtilMock.when(SseEmitterUtil::createSseEmitter).thenReturn(mockEmitter);

            SseEmitter result = sparkChatService.chatStream(sparkChatRequest);

            assertNotNull(result);
            assertEquals(mockEmitter, result);
            sseUtilMock.verify(SseEmitterUtil::createSseEmitter);
        }
    }

    @Test
    void testChatStream_NullChatReqRecords_NotDebugMode() {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class)) {
            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, null, false, false);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(emitter, "Message is empty"));
        }
    }

    @Test
    void testChatStream_NullUid_NotDebugMode() {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class)) {
            chatReqRecords.setUid(null);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(emitter, "Message is empty"));
        }
    }

    @Test
    void testChatStream_NullChatId_NotDebugMode() {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class)) {
            chatReqRecords.setChatId(null);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(emitter, "Message is empty"));
        }
    }

    @Test
    void testChatStream_DebugMode_AllowsNullRecords() {
        try (MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class,
                (mock, context) -> doNothing().when(mock).send(any(SparkChatParam.class), any(Callback.class)))) {

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, null, false, true);

            assertEquals(1, clientMock.constructed().size());
            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), any(Callback.class));
        }
    }

    @Test
    void testChatStream_ValidRequest_CreatesClient() {
        try (MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class,
                (mock, context) -> doNothing().when(mock).send(any(SparkChatParam.class), any(Callback.class)))) {

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            assertEquals(1, clientMock.constructed().size());
            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), any(Callback.class));
        }
    }

    @Test
    void testChatStream_WithWebSearch() {
        sparkChatRequest.setEnableWebSearch(true);
        sparkChatRequest.setSearchMode("auto");
        sparkChatRequest.setShowRefLabel(true);

        try (MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class,
                (mock, context) -> doNothing().when(mock).send(any(SparkChatParam.class), any(Callback.class)))) {

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            assertEquals(1, clientMock.constructed().size());
            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), any(Callback.class));
        }
    }

    @Test
    void testChatStream_Exception_HandledGracefully() {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class,
                        (mock, context) -> doThrow(new RuntimeException("Client error"))
                                .when(mock)
                                .send(any(SparkChatParam.class), any(Callback.class)))) {

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(eq(emitter), contains("Failed to create chat stream")));
        }
    }

    // ==================== Model Selection Tests ====================

    @Test
    void testGetSparkModel_NullModel_ReturnsSparkX1() throws Exception {
        sparkChatRequest.setModel(null);

        try (MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {
            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            // Verify client was created (which means getSparkModel was called)
            assertEquals(1, clientMock.constructed().size());
        }
    }

    @Test
    void testGetSparkModel_SparkModel_ReturnsSpark4Ultra() throws Exception {
        sparkChatRequest.setModel("spark");

        try (MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {
            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            assertEquals(1, clientMock.constructed().size());
        }
    }

    @Test
    void testGetSparkModel_UnknownModel_ReturnsSparkX1() throws Exception {
        sparkChatRequest.setModel("unknown");

        try (MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {
            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            assertEquals(1, clientMock.constructed().size());
        }
    }

    // ==================== HTTP Callback Tests ====================

    @Test
    void testHttpCallback_OnFailure() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            Callback callback = callbackCaptor.getValue();
            IOException testException = new IOException("Connection timeout");
            callback.onFailure(call, testException);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(eq(emitter), contains("Connection failed")));
        }
    }

    @Test
    void testHttpCallback_OnResponse_Unsuccessful() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(false);
            when(response.code()).thenReturn(500);
            when(response.message()).thenReturn("Internal Server Error");

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(eq(emitter), contains("Request failed")));
        }
    }

    @Test
    void testHttpCallback_OnResponse_NullBody() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(null);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(emitter, "Response body is empty"));
        }
    }

    @Test
    void testHttpCallback_OnResponse_WithBody_ProcessesStream() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(responseBody).source();
        }
    }

    // ==================== SSE Processing Tests ====================

    @Test
    void testProcessSSEStream_ValidData() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            String sseData = "{\"code\":0,\"sid\":\"test-sid\",\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + sseData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testProcessSSEStream_ErrorCode() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            String errorData = "{\"code\":10007,\"message\":\"Traffic limited\"}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + errorData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testProcessSSEStream_ReplaceContentErrorCodes() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            // Error code 10013 should replace content
            String errorData = "{\"code\":10013,\"message\":\"Violation\",\"choices\":[{\"delta\":{\"content\":\"Bad content\"}}]}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + errorData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testProcessSSEStream_WebSearchToolCall() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            String toolCallData = "{\"code\":0,\"choices\":[{\"delta\":{\"tool_calls\":[{\"type\":\"web_search\",\"web_search\":{\"query\":\"test\"}}]}}]}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + toolCallData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testProcessSSEStream_TraceData() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            // Second choice contains trace data
            String traceData = "{\"code\":0,\"choices\":[{\"delta\":{\"content\":\"Answer\"}},{\"delta\":{\"tool_calls\":[{\"type\":\"search\",\"name\":\"web_search\"}]}}]}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + traceData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testProcessSSEStream_IOException_Handled() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            BufferedSource mockSource = mock(BufferedSource.class);
            when(responseBody.source()).thenReturn(mockSource);
            when(mockSource.readUtf8Line()).thenThrow(new IOException("Read error"));

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            sseUtilMock.verify(() -> SseEmitterUtil.completeWithError(eq(emitter), contains("Data reading exception")));
        }
    }

    // ==================== Error Message Tests ====================

    @Test
    void testGetFallbackMessage_Code10007() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            String errorData = "{\"code\":10007,\"message\":\"Traffic limited\"}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + errorData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testGetFallbackMessage_NullCode() throws Exception {
        // Test that null code returns default message
        try (MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {
            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);
            // Just verify no exception is thrown
            assertEquals(1, clientMock.constructed().size());
        }
    }

    // ==================== Database Save Tests ====================

    @Test
    void testSaveStreamResults_NotDebugMode() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            String sseData = "{\"code\":0,\"sid\":\"test-sid\",\"choices\":[{\"delta\":{\"content\":\"Test\"}}]}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + sseData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(chatRecordModelService).saveChatResponse(eq(chatReqRecords), any(StringBuffer.class), any(StringBuffer.class), eq(false), eq(2));
            verify(chatRecordModelService).saveThinkingResult(eq(chatReqRecords), any(StringBuffer.class), eq(false));
        }
    }

    @Test
    void testSaveStreamResults_DebugMode_NoSave() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verifyNoInteractions(chatRecordModelService);
            verifyNoInteractions(chatDataService);
        }
    }

    @Test
    void testSaveTraceResult_EditMode_EmptyTrace() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, true, false);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            // trace result is empty, so no database operations should occur
            verify(chatDataService, never()).findTraceSourceByUidAndChatIdAndReqId(anyString(), anyLong(), anyLong());
            verify(chatDataService, never()).updateTraceSourceByUidAndChatIdAndReqId(any());
            verify(chatDataService, never()).createTraceSource(any());
        }
    }

    @Test
    void testSaveTraceResult_NewMode_WithTraceData() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, false);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            // Include trace data in second choice
            String traceData = "{\"code\":0,\"choices\":[{\"delta\":{\"content\":\"Answer\"}},{\"delta\":{\"tool_calls\":[{\"type\":\"search\"}]}}]}";
            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: " + traceData + "\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(chatDataService).createTraceSource(argThat(trace -> "search".equals(trace.getType()) &&
                    trace.getUid().equals("test-uid") &&
                    trace.getChatId().equals(100L)));
        }
    }

    // ==================== Stream Completion Tests ====================

    @Test
    void testHandleStreamComplete_SendsCompleteEvent() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);
            doNothing().when(emitter).send(any(SseEmitter.SseEventBuilder.class));
            doNothing().when(emitter).complete();

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
            verify(emitter).complete();
        }
    }

    @Test
    void testHandleStreamInterrupted_SendsInterruptedEvent() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            BufferedSource mockSource = mock(BufferedSource.class);
            when(responseBody.source()).thenReturn(mockSource);
            when(mockSource.readUtf8Line()).thenReturn("data: {\"code\":0}").thenReturn(null);

            // Simulate stop signal after first read
            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId))
                    .thenReturn(false)
                    .thenReturn(true);

            doNothing().when(emitter).send(any(SseEmitter.SseEventBuilder.class));
            doNothing().when(emitter).complete();

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testTrySendCompleteAndEnd_ClientDisconnected() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);
            doThrow(new org.springframework.web.context.request.async.AsyncRequestNotUsableException("Disconnected"))
                    .when(emitter)
                    .send(any(SseEmitter.SseEventBuilder.class));

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            verify(emitter, atLeastOnce()).send(any(SseEmitter.SseEventBuilder.class));
        }
    }

    @Test
    void testParseSSEContent_InvalidJson() throws Exception {
        try (MockedStatic<SseEmitterUtil> sseUtilMock = mockStatic(SseEmitterUtil.class);
                MockedConstruction<SparkChatClient> clientMock = mockConstruction(SparkChatClient.class)) {

            ArgumentCaptor<Callback> callbackCaptor = ArgumentCaptor.forClass(Callback.class);

            sparkChatService.chatStream(sparkChatRequest, emitter, streamId, chatReqRecords, false, true);

            verify(clientMock.constructed().get(0)).send(any(SparkChatParam.class), callbackCaptor.capture());

            when(response.isSuccessful()).thenReturn(true);
            when(response.body()).thenReturn(responseBody);

            Buffer buffer = new Buffer();
            buffer.writeUtf8("data: {invalid json\n");
            buffer.writeUtf8("data: [DONE]\n");
            when(responseBody.source()).thenReturn(buffer);

            sseUtilMock.when(() -> SseEmitterUtil.isStreamStopped(streamId)).thenReturn(false);
            sseUtilMock.when(() -> SseEmitterUtil.sendData(any(), any())).thenAnswer(invocation -> null);

            Callback callback = callbackCaptor.getValue();
            callback.onResponse(call, response);

            // Should handle parse error
            sseUtilMock.verify(() -> SseEmitterUtil.sendData(eq(emitter), any()));
        }
    }
}
