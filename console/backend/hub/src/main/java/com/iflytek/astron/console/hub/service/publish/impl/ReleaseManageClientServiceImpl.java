package com.iflytek.astron.console.hub.service.publish.impl;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.enums.bot.ReleaseTypeEnum;
import com.iflytek.astron.console.commons.service.data.UserLangChainDataService;
import com.iflytek.astron.console.commons.util.MaasUtil;
import com.iflytek.astron.console.hub.dto.publish.ReleaseBotReqDto;
import com.iflytek.astron.console.hub.dto.publish.ReleaseBotRespDto;
import com.iflytek.astron.console.hub.service.publish.ReleaseManageClientService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * @author yun-zhi-ztl
 */
@Service
@Slf4j
public class ReleaseManageClientServiceImpl implements ReleaseManageClientService {

    // Basic URL configuration, read from config file
    @Value("${maas.workflowVersion}")
    private String baseUrl;

    // User language chain data service dependency injection
    @Autowired
    private UserLangChainDataService userLangChainDataService;

    // Constant definition area
    // API path for getting version name
    private static final String GET_VERSION_NAME_URL = "/get-version-name";
    // Success indicator for release
    private static final String RELEASE_SUCCESS = "SUCCESS";
    // API path for adding versions (currently empty)
    private static final String ADD_VERSION_URL = "";
    // Content-Type value in HTTP headers
    private static final String APPLICATION_JSON = "application/json";
    // HTTP header field name related to authentication
    private static final String AUTHORIZATION_HEADER = "Authorization";
    // HTTP header field name related to space ID
    private static final String SPACE_ID_HEADER = "space-id";


    // OkHttp client instance, configured with connection pool, timeouts and other parameters
    private static final OkHttpClient HTTP_CLIENT = new OkHttpClient().newBuilder()
            .connectionPool(new ConnectionPool(100, 5, TimeUnit.MINUTES))
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build();

    @Override
    public String getVersionNameByBotId(Long botId, Long spaceId, HttpServletRequest request) {
        // Query corresponding flow ID based on robot ID
        String flowId = userLangChainDataService.findFlowIdByBotId(botId.intValue());
        if (StrUtil.isBlank(flowId)) {
            log.error("getVersionNameByBotId - Failed to get flowId by botId, botId={}", botId);
            return null;
        }
        // Call private method to get version name
        return getVersionName(flowId, spaceId, request);
    }

    @Override
    public void releaseBotApi(Integer botId, String flowId, String versionName, Long spaceId, HttpServletRequest request) {
        // Call private method to perform robot API publishing operation
        releaseBot(botId.toString(), flowId, ReleaseTypeEnum.BOT_API.getCode(), RELEASE_SUCCESS, "", versionName, spaceId, request);
    }

    /**
     * Core logic implementation for releasing robot versions
     *
     * @param botId Robot ID
     * @param flowId Flow ID
     * @param channel Channel type code
     * @param result Result status string
     * @param desc Description information
     * @param versionName Version name
     * @param spaceId Space ID
     * @param request HTTP request object, used to obtain authentication info etc.
     * @return Returns release result response object
     */
    private ReleaseBotRespDto releaseBot(String botId, String flowId, Integer channel, String result,
            String desc, String versionName, Long spaceId, HttpServletRequest request) {
        try {
            // Build request data transfer object
            ReleaseBotReqDto releaseBotDto = new ReleaseBotReqDto(botId, flowId, channel, result, desc, versionName);
            // Create HTTP POST request with JSON formatted body
            Request releaseBotRequest = buildRequest(ADD_VERSION_URL, spaceId, request)
                    .post(RequestBody.create(MediaType.parse(APPLICATION_JSON), JSON.toJSONString(releaseBotDto)))
                    .build();
            // Execute request and process response result
            return executeRequestForReleaseBot(releaseBotRequest, flowId);
        } catch (Exception e) {
            log.error("Failed to release bot for flowId: {}, botId: {}, error: {}", flowId, botId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Get version name for specified workflow
     *
     * @param flowId Flow ID
     * @param spaceId Space ID
     * @param request HTTP request object, used to obtain authentication info etc.
     * @return Returns version name string
     */
    private String getVersionName(String flowId, Long spaceId, HttpServletRequest request) {
        try {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("flowId", flowId);
            MediaType jsonMediaType = MediaType.get("application/json; charset=utf-8");
            RequestBody requestBody = RequestBody.create(JSON.toJSONString(jsonObject), jsonMediaType);
            // Create HTTP POST request
            Request versionRequest = buildRequest(GET_VERSION_NAME_URL, spaceId, request)
                    .addHeader("Content-Type", "application/json")
                    .post(requestBody)
                    .build();
            // Execute request and parse version name
            return executeRequestForVersionName(versionRequest, flowId);
        } catch (Exception e) {
            log.error("Failed to get version name for flowId: {}, error: {}", flowId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Build basic HTTP request builder
     *
     * @param url API relative path
     * @param spaceId Space ID (optional)
     * @param request HTTP request object, used to obtain authentication info etc.
     * @return Returns configured Request.Builder instance
     */
    private Request.Builder buildRequest(String url, Long spaceId, HttpServletRequest request) {
        Request.Builder builder = new Request.Builder()
                .url(baseUrl + url) // Concatenate complete URL
                .addHeader(AUTHORIZATION_HEADER, MaasUtil.getAuthorizationHeader(request)); // Add authentication header
        // If space ID exists, add it to request headers
        if (spaceId != null) {
            builder.addHeader(SPACE_ID_HEADER, spaceId.toString());
            log.debug("Added space-id header: {}", spaceId);
        }
        return builder;
    }

    /**
     * Execute HTTP request for releasing robot versions and parse response into ReleaseBotRespDto
     * object
     *
     * @param request HTTP request object
     * @param flowId Flow ID (for logging purposes)
     * @return Returns parsed response data object
     */
    private ReleaseBotRespDto executeRequestForReleaseBot(Request request, String flowId) {
        try (Response response = HTTP_CLIENT.newCall(request).execute()) {
            // Check if HTTP response was successful and has body content
            ResponseBody body = response.body();
            if (!response.isSuccessful() || body == null) {
                log.error("HTTP request failed for flowId: {}, status: {}", flowId, response.code());
                return null;
            }
            // Parse response JSON data
            String responseBody = body.string();
            if (responseBody == null) {
                log.error("Response body string is null for flowId: {}", flowId);
                return null;
            }
            JSONObject responseJson = JSONObject.parseObject(responseBody);
            // Ensure response contains required 'data' field
            if (!responseJson.containsKey("data")) {
                log.error("Missing 'data' field in response for flowId: {}, response: {}", flowId, responseJson);
                return null;
            }
            // Deserialize 'data' field content into ReleaseBotRespDto object
            return JSON.parseObject(responseJson.getString("data"), ReleaseBotRespDto.class);
        } catch (Exception e) {
            log.error("IO exception occurred while executing request for flowId: {}, error: {}", flowId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Execute HTTP request for getting version name and parse workflowVersionName field from response
     *
     * @param request HTTP request object
     * @param flowId Flow ID (for logging purposes)
     * @return Returns parsed version name string
     */
    private String executeRequestForVersionName(Request request, String flowId) {
        try (Response response = HTTP_CLIENT.newCall(request).execute()) {
            // Check if HTTP response was successful and has body content
            ResponseBody body = response.body();
            if (!response.isSuccessful() || body == null) {
                log.error("HTTP request failed for flowId: {}, status: {}", flowId, response.code());
                return null;
            }
            // Parse response JSON data
            String responseBody = body.string();
            if (responseBody == null) {
                log.error("Response body string is null for flowId: {}", flowId);
                return null;
            }
            JSONObject responseJson = JSONObject.parseObject(responseBody);
            // Ensure response contains required 'data' and 'workflowVersionName' fields
            if (!responseJson.containsKey("data") || !responseJson.getJSONObject("data").containsKey("workflowVersionName")) {
                log.error("Missing required fields in response for flowId: {}, response: {}", flowId, responseJson);
                return null;
            }
            // Extract and return workflowVersionName field value
            return responseJson.getJSONObject("data").getString("workflowVersionName");
        } catch (Exception e) {
            log.error("Exception occurred while getting version name for flowId: {}, error: {}", flowId, e.getMessage(), e);
            return null;
        }
    }
}
