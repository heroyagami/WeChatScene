# WeChatScene

可独立运行和嵌入的 Remotion 微信聊天场景。默认完整长页面平滑上滚，包含文字、图片、视频缩略卡、500元转账和收款回执。

## 本地运行

需要 Node.js 20+、npm。首次 Remotion 渲染可能下载 Chrome Headless Shell。

```sh
npm ci
npm run dev
npm run verify
npm run compositions
npm run render
```

默认导出1080×1440、30fps、15秒静音视频到 out/wechat.mp4。主生产系统负责配音和最终混流，本组件不请求任何 AI API。

```sh
npm run render -- --props=examples/consultation.json
npx remotion render src/remotion.tsx WeChatLandscape out/landscape.mp4
npm run cards
```

cards 输出两张真正含透明通道的PNG：out/transfer-sent.png（右尖角，咨询人发起）与 out/transfer-received.png（左尖角，曹义德律师收款）。可直接复用组件或重新导出其他金额。

预先导出的500元素材已放在 public/transfer-cards/，可直接用 staticFile('transfer-cards/transfer-sent.png') 和 staticFile('transfer-cards/transfer-received.png') 调用。

## 在已有 Remotion 工程中调用

这是源码包；在工作区配置本地依赖或将 src 与 public/img 复制到目标工程，保持 React/Remotion 版本兼容。当前锁定 Remotion 4.0.438。消费方应将本包 public/img 合并到自己的 public/img，或显式传入全部头像与媒体地址。不要把另一工程的口播头像替代聊天头像。

```tsx
import {
  WeChatScene,
  createConsultationTransfer,
} from "@heroyagami/wechat-scene";

const [sent, receipt] = createConsultationTransfer({ id: "consultation-001" });
const messages = [
  sent,
  { id: "fee-note", role: "right" as const, text: "咨询费" },
  { id: "reply", role: "left" as const, text: "收到" },
  receipt,
];
// 放在调用方 Composition/Sequence 内，继承其帧数和尺寸
<WeChatScene messages={messages} />;
```

金额用 amount 修改，默认500；senderAvatar/lawyerAvatar 可显式传微信头像。转账与回执共享 transferId，表示一笔付款。accepted 是发起方卡片在收款完成后的状态；received 是收款方回执。需要表现待收款时可用 pending，但其外观是补充实现。

```tsx
import { TransferCard } from "@heroyagami/wechat-scene";
<TransferCard amount={500} state="accepted" side="right" />;
<TransferCard amount={500} state="received" side="left" />;
```

## 输入与时间轴

JSON 输入见 examples/consultation.json。CLI 入口使用 sceneSchema 检查尺寸、帧数、消息、交易关系和媒体字段。直接嵌入时可先 sceneSchema.parse(input) 或 validateTransfers(messages) 校验。

- mode 默认 scroll：从首帧保留所有消息，仅滚动页面。startFrame 不会让消息逐条弹出。
- reveal/mixed 为旧工程兼容模式，需显式选用；mixed 不是默认长页面效果。
- layout 支持 full/portrait，以及横屏中的 landscape-centered/landscape-left。
- width、height、fps、durationInFrames 可由 JSON 覆盖。调用方按音频/SRT提供场景时长，组件不推断配音时间。
- showTopBar/showInputBar 默认 false；启用后为原生微信栏位，不是视频标题或品牌条。
- image/video 使用 media.src；video 是静态缩略卡，不会播放素材音视频。
- 默认左侧为曹义德律师专用微信头像，右侧为咨询人示例头像。素材库位于 public/img/wechat-avatars。
- 私人脚本、照片、音频和生产输入放 private/、inputs/；生成结果放 out/，这些目录已忽略。

来源与边界见 MIGRATION.md。此前图片生成的卡片不是本组件依赖；本仓库直接用 SVG 绘制，金额、状态和左右位置均可调整。

## 每日云端长图滚动视频

本仓库可以作为独立项目每天生成一条微信场景视频，与 `vibe-motion-private` 无关。选题原文保存在 `content/topic-sources/`，ChatGPT 聊天任务读取这些文档并保持原有内容和顺序。

视频制作分为内容与渲染两部分：ChatGPT 生成当天12条微信对话并提交 `daily-input/latest.json`；GitHub Actions 校验输入，Remotion 按当天消息内容计算高度并渲染一张1080像素宽的完整长图，再由另一个 composition 只移动这张图片，生成 **1920×1080、16:9 横屏、30fps、60秒、无音轨** 的平滑上滚视频。消息不会逐条出现。

横屏视频不会把微信界面拉伸到1920像素。聊天长图始终按最多1080像素宽等比显示，并居中放在1920×1080画布中，两侧使用微信灰背景补齐，因此微信气泡、头像和字体比例保持不变。

ChatGPT 是模型和每日控制器。ChatGPT 定时任务负责读取选题源、避开近期重复题目、生成并提交当天输入，然后观察渲染结果。GitHub Actions 只执行确定性的校验和 Remotion 渲染，不调用 GitHub Models 或 OpenAI API，不需要相关 Secret。定时调度属于 ChatGPT 任务，Actions 本身不配置 cron；也可在 Actions 页面手动重跑渲染。

`.github/workflows/render-daily.yml` 会在 `daily-input/latest.json`、核心渲染代码或工作流自身更新时自动运行，也支持手动 `workflow_dispatch`。每次运行先执行 `npm run verify`，再生成长图和视频；任一步失败则不会上传不完整产物。

每次成功运行上传四个文件作为 GitHub Actions Artifact，保留30天：

- `wechat-日期.mp4`：1920×1080、60秒无声滚动视频
- `wechat-日期.png`：完整微信聊天长图
- `wechat-日期.json`：消息数据
- `wechat-日期-manifest.json`：日期、选题、输入来源以及分辨率、帧率、时长等生产记录

本地可使用已提交的 `daily-input/latest.json` 检查完整渲染链，全程不调用模型：

```powershell
npm run daily:prepare
npm run daily:long-image
npm run daily:render
```
