package com.iflytek.astron.console.hub.strategy.publish;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Publish strategy factory Manages and provides access to different publish strategies
 */
@Slf4j
@Component
public class PublishStrategyFactory {

    private final Map<String, PublishStrategy> strategyMap;

    public PublishStrategyFactory(List<PublishStrategy> publishStrategies) {
        this.strategyMap = publishStrategies.stream()
                .collect(Collectors.toMap(
                        PublishStrategy::getPublishType,
                        Function.identity()));

        log.info("Initialized publish strategies: {}", strategyMap.keySet());
    }

    /**
     * Get publish strategy by type
     *
     * @param publishType Publish type (MARKET, MCP, WECHAT, API, FEISHU)
     * @return Publish strategy implementation
     * @throws IllegalArgumentException if publish type is not supported
     */
    public PublishStrategy getStrategy(String publishType) {
        PublishStrategy strategy = strategyMap.get(publishType);
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported publish type: " + publishType);
        }
        return strategy;
    }

    /**
     * Check if publish type is supported
     *
     * @param publishType Publish type to check
     * @return true if supported, false otherwise
     */
    public boolean isSupported(String publishType) {
        return strategyMap.containsKey(publishType);
    }

    /**
     * Get all supported publish types
     *
     * @return Set of supported publish types
     */
    public java.util.Set<String> getSupportedTypes() {
        return strategyMap.keySet();
    }
}
