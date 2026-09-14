# WeChatScene

可独立运行和嵌入的 Remotion 微信聊天场景。支持文字、图片、视频缩略卡、500元转账、收款回执和完整聊天长图滚动。

## 本地运行

需要 Node.js 20+、npm。首次 Remotion 渲染可能下载 Chrome Headless Shell。

```sh
npm ci
npm run dev
npm run verify
npm run compositions
npm run render
```

通用示例默认导出1080×1440、30fps静音视频；每日生产链使用独立的1920×1080横屏规格。主生产系统负责配音和最终混流，本组件不请求任何 AI API。

```sh
npm run render -- --props=examples/consultation.json
npx remotion render src/remotion.tsx WeChatLandscape out/landscape.mp4
npm run cards
```

`cards` 可输出透明PNG转账卡。通用组件支持待收款、已被接收、已收款三种状态；每日短视频 V2 只显示一张咨询人右侧的“¥500 已被接收”卡。

## 在已有 Remotion 工程中调用

这是源码包；在工作区配置本地依赖或将 `src` 与 `public/img` 复制到目标工程，保持 React/Remotion 版本兼容。当前锁定 Remotion 4.0.438。

```tsx
import {
  WeChatScene,
  createConsultationTransfer,
} from "@heroyagami/wechat-scene";

const [sent, receipt] = createConsultationTransfer({ id: "consultation-001" });
const messages = [sent, receipt];
<WeChatScene messages={messages} />;
```

金额默认500元；通用组件的转账与回执共享 `transferId`。`accepted` 表示付款卡已被接收，`received` 表示收款方回执。

## 输入与时间轴

JSON 输入见 `examples/consultation.json`。CLI 入口使用 `sceneSchema` 检查尺寸、帧数、消息、交易关系和媒体字段。

- `mode=scroll`：完整聊天页面直接存在，只做滚动，不逐条弹出消息。
- `reveal/mixed`：保留给兼容场景。
- `layout` 支持 `full / portrait / landscape-centered / landscape-left`。
- `showTopBar/showInputBar` 默认关闭。
- `image/video` 使用 `media.src`，video 当前为静态缩略卡。
- 默认左侧为律师，右侧为咨询人。
- 私人输入放 `private/`、`inputs/`；生成结果放 `out/`。

## 每日 V2：对标式冷开场

每日律师短视频采用固定的“**问题堆叠 → 500 → 已被接收 → 专业答复**”结构：

1. 第1—4条：咨询人右侧连续提出4个短问题，第一屏直接交代冲突、关键事实、现实影响和“怎么办”。
2. 第5条：律师左侧只回复 `500`，不提前展开分析。
3. 第6条：咨询人右侧显示唯一一张 `¥500 已被接收` 转账卡；每日模板不追加左侧“已收款”回执卡。
4. 第7—12条：付款后进入实质咨询，以律师短句为主，可穿插1—2条追问，优先给证据、动作、法律判断和下一步。
5. 非转账消息每条最多28字；一句只讲一个意思，不写“您好、根据法律规定”等冗余开场，不增加标题条或品牌条。

首帧会尽量只保留“连续问题 + 左下角500”；画面短暂停留后匀速上滚，使付款卡快速进入视野，再自然切入正式咨询。

## 每日云端渲染

选题源位于 `content/topic-sources/`。ChatGPT 负责从3份选题源中选择近期未重复题目、生成12条 V2 对话并更新 `daily-input/latest.json`；GitHub Actions 只负责确定性的校验和 Remotion 渲染，不调用任何模型 API。

每日成片规格：

- 1920×1080
- 16:9 横屏
- 30fps
- 60秒
- H.264 / 无音轨

完整聊天先按1080像素宽生成长图；进入1920×1080视频时整体等比放大到画布约95%宽，最大约1.7倍，保持微信气泡、头像、文字的相对比例，同时让第一屏更接近对标视频的视觉密度。

GitHub Ubuntu Runner 会安装 Noto CJK 中文字体，避免云端渲染出现中文方框乱码。

`.github/workflows/render-daily.yml` 会在每日输入、核心渲染代码或工作流更新时自动执行，也支持手动触发。流程依次执行：

`verify → prepare → 长图 → 16:9视频 → 打包 → Artifact`

成功后上传4个文件并保留30天：

- `wechat-日期.mp4`：60秒横屏视频
- `wechat-日期.png`：完整微信聊天长图
- `wechat-日期.json`：当天消息数据
- `wechat-日期-manifest.json`：选题与渲染参数记录

本地检查完整链路：

```powershell
npm run daily:prepare
npm run daily:long-image
npm run daily:render
```

更多生产约束见 `AGENTS.md`。