# WeChatScene

本仓库维护可复用的微信场景和消息组件。音频、字幕对齐、Director、Worker 调度和母版拼接由调用方负责。

- 默认展示完整聊天长页面，使用 Remotion 帧驱动平滑上滚。
- 普通消息左白右绿；曹义德律师固定在左并作为收款方，咨询人固定在右并发起转账。
- 咨询费默认500元，转账和收款回执共享 transferId。
- 律师聊天头像使用 public/img/wechat-avatars/caoyide-wechat-avatar.png。
- 文字使用中文，普通陈述句通常省略句末句号；标点属于内容编辑，不自动改写用户原文。
- 默认隐藏顶部栏和输入栏；原生微信栏位可通过 props 启用。
- 私人素材和每片输入放 private/ 或 inputs/，产物放 out/。
- 修改后运行 npm run verify，并对影响画面的改动渲染静帧检查。

## ChatGPT 每日生产职责

- ChatGPT 聊天任务是每日内容模型和流程控制器；GitHub Actions 只做校验与渲染，不调用模型。
- 每天读取 `content/topic-sources/` 下3份原始文档，并结合最近提交历史或 `daily-input/latest.json` 选择近期未重复的题目。
- 不修改、重排或润色选题源文档。
- 生成恰好12条消息，每条不超过52字。曹义德固定左侧、白气泡、收款；咨询人固定右侧、绿气泡、付款。
- 每日对话必须且只能包含一笔500元咨询费：右侧 `fee-sent` 使用 `accepted`，左侧 `fee-receipt` 使用 `received`，两者共享 `transferId: consultation-fee`。
- 普通陈述句通常不用句末句号，不添加视频标题、品牌条或无意义英文。
- 将结果写入 `daily-input/latest.json` 并提交到 `main`，由提交触发纯渲染 GitHub Actions；随后检查该次工作流结果。
- 不生成配音，不提交视频、长图、日志或 `generated/` 目录。
