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
