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

cards 输出两张真正含透明通道的PNG：out/transfer-sent.png（左尖角，已被接收）与 out/transfer-received.png（右尖角，已收款）。可直接复用组件或重新导出其他金额。

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
  { id: "fee-note", role: "left" as const, text: "咨询费" },
  { id: "reply", role: "right" as const, text: "收到" },
  receipt,
];
// 放在调用方 Composition/Sequence 内，继承其帧数和尺寸
<WeChatScene messages={messages} />;
```

金额用 amount 修改，默认500；senderAvatar/lawyerAvatar 可显式传微信头像。转账与回执共享 transferId，表示一笔付款。accepted 是发起方卡片在收款完成后的状态；received 是收款方回执。需要表现待收款时可用 pending，但其外观是补充实现。

```tsx
import { TransferCard } from "@heroyagami/wechat-scene";
<TransferCard amount={500} state="accepted" side="left" />;
<TransferCard amount={500} state="received" side="right" />;
```

## 输入与时间轴

JSON 输入见 examples/consultation.json。CLI 入口使用 sceneSchema 检查尺寸、帧数、消息、交易关系和媒体字段。直接嵌入时可先 sceneSchema.parse(input) 或 validateTransfers(messages) 校验。

- mode 默认 scroll：从首帧保留所有消息，仅滚动页面。startFrame 不会让消息逐条弹出。
- reveal/mixed 为旧工程兼容模式，需显式选用；mixed 不是默认长页面效果。
- layout 支持 full/portrait，以及横屏中的 landscape-centered/landscape-left。
- width、height、fps、durationInFrames 可由 JSON 覆盖。调用方按音频/SRT提供场景时长，组件不推断配音时间。
- showTopBar/showInputBar 默认 false；启用后为原生微信栏位，不是视频标题或品牌条。
- image/video 使用 media.src；video 是静态缩略卡，不会播放素材音视频。
- 默认左侧为示例头像，右侧为曹义德律师专用微信头像。素材库位于 public/img/wechat-avatars。
- 私人脚本、照片、音频和生产输入放 private/、inputs/；生成结果放 out/，这些目录已忽略。

来源与边界见 MIGRATION.md。此前图片生成的卡片不是本组件依赖；本仓库直接用 SVG 绘制，金额、状态和左右位置均可调整。
