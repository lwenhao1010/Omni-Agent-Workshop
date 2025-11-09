package com.iflytek.astron.console.hub.enums;

import lombok.Getter;

/**
 * @author yun-zhi-ztl
 */

@Getter
public enum BotVersionEnum {
    BASE_BOT(1, "Command Assistant"),
    WORKFLOW(3, "Workflow Assistant");

    public final Integer version;
    public final String desc;

    BotVersionEnum(Integer version, String desc) {
        this.version = version;
        this.desc = desc;
    }
}
