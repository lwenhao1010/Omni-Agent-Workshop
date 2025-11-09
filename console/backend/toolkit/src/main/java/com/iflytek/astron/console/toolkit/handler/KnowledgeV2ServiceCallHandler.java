package com.iflytek.astron.console.toolkit.handler;

import com.alibaba.fastjson2.JSON;
import com.iflytek.astron.console.toolkit.config.properties.RepoAuthorizedConfig;
import com.iflytek.astron.console.toolkit.config.properties.ApiUrl;
import com.iflytek.astron.console.toolkit.entity.core.knowledge.*;
import com.iflytek.astron.console.toolkit.util.OkHttpUtil;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class KnowledgeV2ServiceCallHandler {
    @Resource
    private ApiUrl apiUrl;
    @Resource
    private RepoAuthorizedConfig repoAuthorizedConfig;

    /**
     * Document parsing and chunking
     *
     * @param request
     * @return
     */
    public KnowledgeResponse documentSplit(SplitRequest request) {
        String url = apiUrl.getKnowledgeUrl().concat("/v1/document/split");
        String reqBody = JSON.toJSONString(request);
        log.info("documentSplit url = {}, request = {}", url, reqBody);
        String post = OkHttpUtil.post(url, reqBody);
        log.info("documentSplit response = {}", post);
        return JSON.parseObject(post, KnowledgeResponse.class);
    }

    /**
     * Document upload and chunking (multipart/form-data)
     *
     * @param multipartFile multipart file to upload
     * @param lengthRange chunking length range
     * @param separator separator list
     * @param ragType RAG type
     * @param resourceType resource type (0=file, 1=html)
     * @return KnowledgeResponse
     */
    public KnowledgeResponse documentUpload(MultipartFile multipartFile,
            List<Integer> lengthRange, List<String> separator,
            String ragType, Integer resourceType) {
        String url = apiUrl.getKnowledgeUrl().concat("/v1/document/upload");

        try {
            log.info("documentUpload fileName: {}, fileSize: {} bytes",
                    multipartFile.getOriginalFilename(), multipartFile.getSize());

            Map<String, Object> params = new HashMap<>();
            params.put("file", multipartFile);
            if (lengthRange != null) {
                params.put("lengthRange", JSON.toJSONString(lengthRange));
            }
            if (separator != null && !separator.isEmpty()) {
                params.put("separator", JSON.toJSONString(separator));
            }
            params.put("ragType", ragType);
            if (resourceType != null) {
                params.put("resourceType", resourceType.toString());
            }

            log.info("documentUpload url = {}, ragType = {}, resourceType = {}", url, ragType, resourceType);
            String post = OkHttpUtil.postMultipart(url, new HashMap<>(), null, params, null);
            log.info("documentUpload response = {}", post);
            return JSON.parseObject(post, KnowledgeResponse.class);
        } catch (Exception e) {
            log.error("documentUpload error: {}", e.getMessage(), e);
            KnowledgeResponse errorResponse = new KnowledgeResponse();
            errorResponse.setCode(-1);
            errorResponse.setMessage("Upload failed: " + e.getMessage());
            return errorResponse;
        }
    }

    public KnowledgeResponse saveChunk(KnowledgeRequest request) {
        String url = apiUrl.getKnowledgeUrl().concat("/v1/chunks/save");
        String reqBody = JSON.toJSONString(request);
        log.info("saveChunk url = {}, request = {}", url, reqBody);
        String post = OkHttpUtil.post(url, reqBody);
        log.info("saveChunk response = {}", post);
        return JSON.parseObject(post, KnowledgeResponse.class);
    }

    public KnowledgeResponse updateChunk(KnowledgeRequest request) {
        String url = apiUrl.getKnowledgeUrl().concat("/v1/chunk/update");
        String reqBody = JSON.toJSONString(request);
        log.info("updateChunk url = {}, request = {}", url, reqBody);
        String post = OkHttpUtil.post(url, reqBody);
        log.info("updateChunk response = {}", post);
        return JSON.parseObject(post, KnowledgeResponse.class);
    }

    public KnowledgeResponse deleteDocOrChunk(KnowledgeRequest request) {
        String url = apiUrl.getKnowledgeUrl().concat("/v1/chunk/delete");
        String reqBody = JSON.toJSONString(request);
        log.info("deleteDocOrChunk url = {}, request = {}", url, reqBody);
        String post = OkHttpUtil.post(url, reqBody);
        log.info("deleteDocOrChunk response = {}", post);
        return JSON.parseObject(post, KnowledgeResponse.class);
    }

    public KnowledgeResponse knowledgeQuery(QueryRequest request) {
        String url = apiUrl.getKnowledgeUrl().concat("/v1/chunk/query");
        String reqBody = JSON.toJSONString(request);
        log.info("knowledgeQuery request url:{}\ndata:{}", url, reqBody);
        String respData = OkHttpUtil.post(url, reqBody);
        log.info("knowledgeQuery response data:{}", respData);
        return JSON.parseObject(respData, KnowledgeResponse.class);
    }
}
