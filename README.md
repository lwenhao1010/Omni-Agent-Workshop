# Omni-Agent Workshop | 多维智能体工坊


<div align="center">



[![License](https://img.shields.io/badge/license-apache2.0-blue.svg)](LICENSE)
[![基于 AstronAgent](https://img.shields.io/badge/基于-AstronAgent-blue.svg)](https://github.com/iflytek/astron-agent)

</div>

## 📻 项目简介

   **Omni-Agent Workshop（多维智能体工坊）** 是一个基于科大讯飞Astron—Agent二次开发的多维智能体平台。在本地部署的平台上搭建了三种不同类型的智能体，分别为指令型、工作流以及实时交互数字人。

<div></div>

   **指令型智能体**是一个精通多种语言的程序员。能够帮助用户高效完成各类编程语言相关的开发任务，提供高质量代码解决方案。

<div></div>

   **工作流智能体**是一个对用户提交的简历进行打分并根据不足给出改进的简历优化工作流。

<div></div>

   **实时交互数字人智能体**是一个解忧平台主持人，能将用户的内容转化为流畅、幽默的节目文本，确保每句话都能引起观众的共鸣。通过智能体工作流的编排，将用户输入的文本内容自动改写为播客风格的口播稿，并使用讯飞超拟人合成技术生成高质量语音。同时虚拟人会对内容进行播报。

下图为指令型智能体的界面使用截图
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/codeagent.png"/>
   指令型智能体<div></div>
</div>
<div></div>
下图为工作流智能体的界面使用截图
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/workagent.png"/>
   工作流智能体<div></div>
</div>
<div></div>
下图为实时交互数字人智能体的界面使用截图
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/numberagent.png"/>
   实时交互数字人智能体<div></div>
</div>


**工作流智能体演示效果**：https://lwh.lwenhao.cn/rgzndl/resume.mp4<div></div>

**实时交互数字人智能体演示效果**：https://lwh.lwenhao.cn/rgzndl/number.mp4<div></div>

### 核心能力

- **AI 内容改写**：集成科大讯飞的大模型，将普通文本智能改编为电台特色的播客风格逐字稿
- **超拟人语音合成**：基于讯飞星火语音合成技术，生成自然流畅的播客音频
- **可视化工作流编排**：通过 AstronAgent 的工作流引擎，实现"文本输入 → AI 改写 → 语音合成"的自动化流程
- **开箱即用**：基于 Docker Compose 一键部署，无需复杂配置

### 技术特点

- ✅ 基于企业级开源项目 [AstronAgent](https://github.com/iflytek/astron-agent) 二次开发
- ✅ 微服务架构，支持高可用部署
- ✅ 支持自定义播客风格、发音人、语速等参数
- ✅ 完整的工作流可视化调试能力

## 🚀 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ 可用内存
- 20GB+ 可用磁盘空间

### 一键部署

```bash
# 1. 克隆项目
git clone https://github.com/lwenhao1010/xunfei-Astron-Agent.git
cd astron-agent/docker/astronAgent

# 2. 复制环境变量配置
cp .env.example .env

# 3. 编辑环境变量（可选，使用默认配置即可快速体验），主要是env文件里关于api的设置，如PLATFORM_APP_ID、PLATFORM_APP_KEY、SPARK_API_PASSWORD等信息
vim .env

# 4. 启动所有服务
docker compose -f docker-compose-with-auth.yaml up -d

# 5. 查看服务状态
docker compose ps
```

### 访问应用

启动完成后，访问以下地址：

- **应用前端**：http://localhost

<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/astron.png"/>
   应用前端登录界面
   <div></div>
</div>

- **应用后端**：http://localhost8000<div></div>
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/casdoor.png"/>
   应用后端登录界面<div></div>
</div>

- **默认账户**：admin123
- **默认密码**：admin123<div></div>
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/first ui.png"/>
   应用前端界面<div></div>
</div>
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/casdoor ui.png"/>
   应用后端界面<div></div>
</div>

## 📖 使用指南

### 1.添加大模型

1. 登录系统后，进入「模型管理」页面
2. 创建新的大模型，配置以下内容：
   - **模型名称**：自己随意定义即可
   - **model**：使用的大模型类型，如xdeepseekv31
   - **模型描述**：自己随意定义即可
   - **接口地址**：使用的大模型的API接口
   - **密钥**：使用的大模型的API的key值
3. 创建并进行保存
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/big model.png"/>
   添加大模型<div></div>
</div>

### 2.创建指令型智能体

1. 登录系统后，进入「提示词」页面
2. 创建新提示词，配置以下内容：
   - **通用配置**：智能体的提示词
   - **高级配置**：大模型的相关配置
3. 创建并进行保存
4. 用户输入问题，智能体就会进行解答
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/order.png"/>
   创建指令型智能体<div></div>
</div>

### 3.创建工作流智能体

1. 登录系统后，进入「工作流」页面
2. 创建新工作流，配置以下节点：
   - **开始节点**：定义用户输入和文件上传
   - **分支器**：判断用户有没有上传文件，有的话就进入OCR节点，没有就进入文本处理节点
   - **OCR节点**：识别文档中的文字，并传送给大模型
   - **文本处理节点**：提示用户上传文档
   - **大模型节点**：配置大模型，设置角色提示词
   - **结束节点**：输出大模型的思考结果
3. 保存并运行工作流
4. 输入文本和简历文件，即可得到简历的得分和相关改进内容
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/workflow.png"/>
   创建工作流智能体<div></div>
</div>

#### 工作流智能体配置示例

```
用户输入 → DeepSeek 改写 → 输出音频
```

**提示词示例**：

```
# 角色
你是一位专业的简历评估专家，具备丰富的人力资源经验，能够以客观、精准的视角对各类简历进行深入分析和打分。
## 技能
### 技能 1：简历打分
1. 仔细审阅用户提供的简历，从工作经验丰富度、技能与岗位匹配度、教育背景相关性等多个专业维度进行考量。
2. 依据严格的行业标准，结合具体的行业领域方向，侧重于个人能力，对简历给出 0 - 100 分的具体分数。
3. 详细说明打分依据，例如工作经验的具体优势和不足对分数的影响、技能与岗位的契合程度如何体现等。
===回复示例===
   -  📋 分数: <具体分数>
   -  💬 打分依据: <详细阐述打分的理由>
===示例结束===
### 技能 2：简历优势
1. 深入剖析简历中的突出亮点和优势部分，尤其关注与工作经验、工作经历和工作技能相关的内容。
2. 明确说明这些优势在求职过程中的具体作用，如吸引招聘者关注、增加面试机会等。
===回复示例===
   -  💡 优势: <具体优势内容>
   -  🎯 作用: <优势在求职中的具体作用>
===示例结束===
### 技能 3：简历不足点
1. 准确找出简历中存在的问题和不足之处，主要围绕工作经验、工作经历和工作技能方面。
2. 详细解释这些缺陷可能对求职产生的负面效应，如降低竞争力、减少被邀约面试的几率等。
===回复示例===
   -  ❌ 缺陷: <具体缺陷内容>
   -  👎 负面效应: <缺陷对求职的负面影响>
===示例结束===
### 技能 4：简历优化意见
1. 针对简历的缺陷，给出切实可行的具体优化建议，结合行业领域和个人能力提升的方向。
2. 清晰说明优化后的预期效果，如提升简历的专业性、增加被青睐的可能性等。
===回复示例===
   -  ✍️ 优化建议: <具体的优化措施>
   -  🌟 预期效果: <优化后可能带来的好处>
===示例结束===
## 限制:
- 输出内容不能使用一、二级标题，只能使用###三级标题
- 格围绕简历相关内容进行分析，拒绝回答与简历无关的话题。
- 所输出的内容必须按照给定的格式进行组织，不能偏离框架要求。
- 对优势、缺陷的描述以及优化建议要高度具体、明确，具备很强的可操作性。
- 保持专业水准，杜绝使用空洞套话。
- 主要围绕工作经验、工作经历、工作技能，要结合行业领域方向，侧重于个人能力，给出分析
```

### 4.创建实时交互数字人智能体

1. 登录系统后，进入「实时交互数字人」页面
2. 创建新虚拟人，配置以下节点：
   - **开始节点**：定义用户输入
   - **大模型节点**：配置大模型，设置角色风格改写提示词
   - **结束节点**：输出大模型的思考结果
3. 保存并运行
4. 输入文本，即可生成虚拟人的在线解忧
<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/real-time.png"/>
   创建实时交互数字人智能体<div></div>
</div>

#### 实时交互数字人智能体配置示例

```
用户输入 → DeepSeek 改写 → 输出音频
```

**提示词示例**：

```
# 角色
你是一名解忧大师，一个嘴上贫、心里明白的技术博主。现在你主持一档叫「解忧电台」的节目，这节目嘛，主打一个——有点干货、有点废话，但绝不无聊。
# 原始内容：{{input}}
# 任务
把用户提供的原始内容改编成适合单口相声或播客节目风格的逐字稿。
要像电台聊天那样自然，有节奏、有情绪、有点梗。
# 注意点
确保语言口语化，像真在跟听众唠嗑。
专业术语要用“人话”解释，越通俗越好。
整体节奏轻松点，有点幽默，有点温度，听着像朋友聊天，不像老师讲课。
保持对话的自然过渡，别让听众觉得跳。
输出时只要口播稿，不要加格式，不要写提示内容。
# 示例
欢迎收听解忧电台，咱这节目啊，不讲大道理，也不装深沉。
今天这话题呢，有点意思——保证听完你会想，卧槽，原来还能这么想。
来，别磨叽，直接开整。
```

### 5.工坊界面

<div align=center>
<img src="https://github.com/lwenhao1010/xunfei-Astron-Agent/blob/main/images/final ui.png"/>
   工坊界面<div></div>
</div>

## 🛠️ 技术架构

### 核心服务

| 服务             | 说明                          | 端口        |
| ---------------- | ----------------------------- | ----------- |
| console-hub      | 控制台后端服务                | 8080        |
| console-frontend | 前端界面                      | 1881        |
| core-workflow    | 工作流引擎                    | 7880        |
| core-aitools     | AI 工具服务（包含超拟人合成） | 18668       |
| nginx            | 反向代理                      | 80          |
| postgres         | PostgreSQL 数据库             | 5432        |
| mysql            | MySQL 数据库                  | 3306        |
| redis            | Redis 缓存                    | 6379        |
| minio            | 对象存储                      | 18998/18999 |

### 数据库说明

- **PostgreSQL**：工作流数据、用户配置
- **MySQL**：工具元数据、智能体配置
  - `astron_console.tool_box`：工具注册表
  - `spark-link.tools_schema`：工具 Schema 定义

## 🔧 常见问题

### 工作流执行失败？

检查以下配置：

1. **工具版本号**：确保 `tools_schema` 表中工具版本为 `V1.0`
2. **服务地址**：超拟人合成服务地址应为 `http://core-aitools:18668`
3. **app_id**：确保工具的 `app_id` 与工作流一致

手动修复命令：

```bash
# 修复工具版本号和服务地址
docker compose exec mysql mysql -uroot -proot123 spark-link -e "
UPDATE tools_schema 
SET version='V1.0', 
    app_id='680ab54f',
    open_api_schema = REPLACE(open_api_schema, 'https://core-aitools:18669', 'http://core-aitools:18668')
WHERE tool_id='tool@8b2262bef821000';"

# 重启相关服务
docker compose restart core-link core-workflow
```

### 容器重启后出现 502 错误？

这是因为容器 IP 地址变化导致 Nginx 无法连接到 console-hub。解决方法：

```bash
docker compose restart nginx
```

### 如何查看服务日志？

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f console-hub
docker compose logs -f core-workflow
```

## 🤝 贡献指南

本项目基于 [AstronAgent](https://github.com/iflytek/astron-agent) 二次开发。

如果您有任何建议或发现问题，欢迎提交 Issue 或 Pull Request。

## 📄 开源协议

本项目基于 Apache 2.0 协议开源，可自由商业使用。

## 🙏 致谢

- [讯飞 AstronAgent](https://github.com/iflytek/astron-agent) - 提供强大的智能体开发平台
- [讯飞星火](https://www.xfyun.cn) - 提供大模型和语音合成能力
- [DeepSeek](https://www.deepseek.com) - 提供高性能中文大模型

---

**Omni-Agent Workshop（多维智能体工坊）** - 让 AI 成为你的搭档 🎙️
