# 迁移记录

来源：heroyagami/vibe-motion-private，提交1ad0d5e277fb8c7c0e28d81527d2c26e45be0dc1。

迁入：WeChatScene、WeChatSkin、ChatEngine、消息类型、微信头像素材。保留旧消息的 transferStatus 和 reveal/mixed 模式以兼容已有数据。

本次适配：独立 Remotion 入口与包导出、默认 scroll、实际 DOM 高度测量、竖屏/横屏布局、转账 SVG 卡片、交易关联校验、500元示例、类型与单元测试。

转账卡按用户提供的微信截图布局重新实现为可配置 SVG：浅橙整卡、勾选图标、金额、状态、转账文字和左右尖角。它是组件重建，不是截图像素裁剪。accepted/received 对应截图；pending 是补充状态，未提供其原始截图作像素验收。

未迁入：口播头像/波形、配音、字幕对齐、Director、Worker Harness、Shotcraft、母版拼接，以及截图中的私人对话/人物照片。

原仓库保持原样；这次为独立提取，不删除旧副本、不修改原生产系统的调用。新版本通过本仓库导出入口或 Remotion CLI 调用。仓库尚未公开发布 npm 包。
