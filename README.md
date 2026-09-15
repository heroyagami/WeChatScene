# WeChatScene

基于 Remotion 的微信律师咨询视频生成项目。支持文字消息、图片、视频缩略卡、500 元咨询费转账、收款回执、完整聊天长图和按阅读量驱动的横屏滚动视频。

当前项目的重点不是“固定时长短片”，而是：**先把咨询问题讲清楚、尽量解决完整，再由文字阅读量自动决定视频时长。**

## 本地运行

需要 Node.js 20+、npm。首次 Remotion 渲染可能下载 Chrome Headless Shell。

```sh
npm ci
npm run dev
npm run verify
npm run compositions
npm run render
```

通用示例默认导出 1080×1440、30fps 静音视频；每日生产链使用独立的 1920×1080 横屏规格。项目本身不调用 AI API。

```sh
npm run render -- --props=examples/consultation.json
npx remotion render src/remotion.tsx WeChatLandscape out/landscape.mp4
npm run cards
```

`cards` 可输出透明 PNG 转账卡。通用组件支持待收款、已被接收、已收款三种状态。

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

金额默认 500 元；转账与回执共享 `transferId`。`accepted` 表示付款卡已被接收，`received` 表示收款方回执。

## 输入与时间轴

JSON 输入见 `examples/consultation.json`。CLI 入口使用 `sceneSchema` 检查尺寸、帧数、消息、交易关系和媒体字段。

- `mode=scroll`：完整聊天页面从首帧就已存在，只做镜头滚动，不逐条弹消息。
- `reveal/mixed`：保留给兼容场景。
- `layout` 支持 `full / portrait / landscape-centered / landscape-left`。
- `showTopBar/showInputBar` 默认关闭。
- `image/video` 使用 `media.src`，video 当前为静态缩略卡。
- 默认左侧为曹义德律师，右侧为咨询人。
- 私人输入放 `private/`、`inputs/`；生成结果放 `out/`。

## 当前视频内容规则

每日律师视频采用对标式冷开场：

**问题堆叠 → 500 → 付款确认 → 正式咨询**

固定的是节奏和角色关系，不固定对话原文、消息总数和视频长度。

1. 开场由咨询人右侧连续提出 3—5 条问题，第一屏直接交代冲突、关键事实、现实影响和“怎么办”。
2. 随后曹律师左侧只回复 `500`，不提前展开法律分析。
3. 当前实现紧接两张关联交易卡：咨询人右侧 `¥500 已被接收`，曹律师左侧 `¥500 已收款`。
4. 付款完成后进入正式咨询。律师不能只给几句结论，应通过持续聊天尽量把问题解决清楚。
5. 正式咨询应按题目需要覆盖：事实追问、法律关系、证据固定、止损动作、处理顺序、赔偿或责任条件、风险边界和下一步行动清单。
6. 可以穿插咨询人继续追问，让内容像真实咨询，而不是单向法律讲稿。
7. 普通文字消息每条最多 28 字，一句只讲一个意思；不写“您好、根据法律规定”等冗余套话。
8. 不设置固定 12 条、不设置固定 60 秒，也不为了压缩时长牺牲解决问题所需的信息。

核心目标是：**观众可以一边看聊天，一边真正获得可执行的法律处理方案。**

## 阅读速度与自动时长

`daily-input/latest.json` 可设置 `readingCpm`。当前默认值为 **360 字/分钟，即约 6 字/秒**，这是视频制作基线，可根据实际成片继续调整，并不宣称是经过人群测试得到的唯一“平均阅读速度”。

时间轴规则由 `src/scenes/reading.ts` 统一计算：

- 空白和标点不计入阅读字数。
- 普通消息阅读时间约为：`有效字符数 ÷ 6字/秒 + 0.25秒理解停顿`。
- 单条普通消息最少保留 0.8 秒。
- 每次滚动转场约 0.35 秒。
- 每张转账卡停留约 1.2 秒。
- 开场 3—5 条问题与律师的 `500` 合并计算首屏阅读时间。
- 视频总时长完全由消息内容和阅读时间轴自动得出，不再写死为 60 秒。

因此，对话越完整，视频可以自然增长到 1 分钟、2 分钟、3 分钟甚至更长。项目优先保证“读得完、看得懂、问题讲得清楚”。超长脚本仍受浏览器最大画布、GitHub Runner 资源和工作流超时限制，必要时再拆分上下集。

## 头像规则

曹律师固定使用：

`public/img/wechat-avatars/caoyide-wechat-avatar.png`

咨询人头像来自两张微信通讯录截图构成的头像池：

`public/img/wechat-consultants/contacts-01.png`

`public/img/wechat-consultants/contacts-02.png`

当前按 5 列 × 7 行 × 2 张截图建立 **70 个头像位**，通过日期稳定轮换；同一条视频内所有咨询人消息保持同一个头像，避免一条视频中人物变化，同时降低连续视频头像重复概率。截图昵称和通讯录界面不会进入成片。

生成后的 `daily-scene.json` 会记录实际选择的咨询人头像参数，用于复现。

## 每日视频生产流程

选题源位于 `content/topic-sources/`。默认生产任务每天北京时间08:00由 GitHub Actions 在云端调用 GPT，生成、校验并提交当天输入，随后在同一次云端运行中完成渲染。电脑无需开机。

云端任务负责完整视频流程：

1. 从 1—3 号选题 Markdown 中选择近期未重复、适合聊天表达的话题。
2. 围绕题目生成完整咨询剧情，不受固定消息数限制。
3. 保持“3—5 条问题 → 500 → 付款 → 正式咨询”的结构。
4. 根据问题复杂度继续追问和答复，直到主要问题已经得到可执行解决方案。
5. 写入 `daily-input/latest.json`，必要时设置 `readingCpm`。
6. 提交后触发 GitHub Actions 云端渲染。
7. 检查首帧、付款节点、中段和结尾关键帧，以及最终 MP4。
8. 如果内容、阅读速度或滚动节奏有问题，只调整视频内容或生产参数后重新渲染。

ChatGPT 聊天模式仍可随时人工指定题目或改稿；提交 `daily-input/latest.json` 后走同一渲染链。Work 模式主要留给 Remotion 组件、CI、头像库等底层维护。

## 每日云端渲染

`daily-input/latest.json` 提交后，`.github/workflows/render-daily.yml` 会自动运行，也支持 `workflow_dispatch` 手动触发。

当前成片规格：

- 1920×1080
- 16:9 横屏
- 30fps
- H.264
- 无音轨
- 时长按阅读量自动计算

完整聊天先生成 1080 像素宽长图，再进入 1920×1080 视频画布。画面等比显示，不把微信聊天横向拉胖；缩放会根据首屏问题堆叠自动控制，最大约 1.7 倍。

GitHub Ubuntu Runner 会安装 Noto CJK 中文字体，避免云端渲染出现中文方框乱码。

工作流执行顺序：

`verify → prepare → 长图 → 16:9 视频 → 打包 → Artifact`

当前成功运行会上传 4 个 Artifact 文件并保留 30 天：

- `wechat-日期.mp4`：自适应时长横屏视频
- `wechat-日期.png`：完整微信聊天长图
- `wechat-日期.json`：当天原始消息数据
- `wechat-日期-manifest.json`：选题、阅读时间轴、实际时长、头像和渲染参数记录

目前工作流未单独归档 `generated/daily-scene.json` 与 `generated/scroll-props.json`；如需对某条历史成片进行像素级复现，可后续将它们加入 Artifact。

本地检查完整链路：

```powershell
npm run daily:prepare
npm run daily:long-image
npm run daily:render
```

更多工程约束见 `AGENTS.md`。
