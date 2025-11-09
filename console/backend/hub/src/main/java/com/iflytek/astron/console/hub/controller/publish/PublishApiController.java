package com.iflytek.astron.console.hub.controller.publish;

import com.iflytek.astron.console.commons.annotation.RateLimit;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.hub.dto.publish.AppListDTO;
import com.iflytek.astron.console.hub.dto.publish.BotApiInfoDTO;
import com.iflytek.astron.console.hub.dto.publish.CreateAppVo;
import com.iflytek.astron.console.hub.dto.publish.CreateBotApiVo;
import com.iflytek.astron.console.hub.service.publish.PublishApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author yun-zhi-ztl
 */
@Slf4j
@Tag(name = "Publish Api Controller", description = "Publish Aot As Api")
@RestController
@RequestMapping("/publish-api")
@RequiredArgsConstructor
@Validated
public class PublishApiController {

    @Autowired
    private PublishApiService publishApiService;

    @Operation(summary = "Create User App", description = "create user app")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @PostMapping("/create-user-app")
    public ApiResult<Boolean> createUserApp(@RequestBody CreateAppVo createAppVo) {
        return ApiResult.success(publishApiService.createApp(createAppVo));
    }

    @Operation(summary = "Get App List", description = "Get user app list")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @GetMapping("/app-list")
    public ApiResult<List<AppListDTO>> getAppList() {
        return ApiResult.success(publishApiService.getAppList());
    }

    @Operation(summary = "Create Bot Api", description = "create bot api with user app")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @PostMapping("/create-bot-api")
    public ApiResult<BotApiInfoDTO> createBotApi(HttpServletRequest request, @RequestBody CreateBotApiVo createBotApiVo) {
        return ApiResult.success(publishApiService.createBotApi(createBotApiVo, request));
    }

    @Operation(summary = "Get Bot Api Info", description = "Get Bot Api Info")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @GetMapping("/get-bot-api-info")
    public ApiResult<BotApiInfoDTO> usageRealTime(@RequestParam Long botId) {
        return ApiResult.success(publishApiService.getApiInfo(botId));
    }

}
