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
- 默认左侧为曹义德律师，右侧为咨询人。
- 每日视频从两张通讯录截图中的70个完整头像按日期轮换；同一条视频内咨询者头像保持一致，截图昵称和界面不会显示。
- 私人输入放 `private/`、`inputs/`；生成结果放 `out/`。

## 每日 V2：对标式冷开场

每日律师短视频采用固定的“**问题堆叠 → 500 → 已被接收 → 专业答复**”结构：

固定的是角色顺序和付费节点，不是对话原文。四条开场问题、付款后的追问与律师答复都必须围绕当天选题重新组织，事实重点、法律关系、证据和行动建议随话题变化，不能复用一套通用话术替换关键词。

1. 第1—4条：咨询人右侧连续提出4个短问题，第一屏直接交代冲突、关键事实、现实影响和“怎么办”。
2. 第5条：律师左侧只回复 `500`，不提前展开分析。
3. 第6条：咨询人右侧显示唯一一张 `¥500 已被接收` 转账卡；每日模板不追加左侧“已收款”回执卡。
4. 第7条起：付款后进入实质咨询，以律师短句为主，可穿插1—2条追问，优先给证据、动作、法律判断和下一步。
5. 非转账消息每条最多28字；一句只讲一个意思，不写“您好、根据法律规定”等冗余开场，不增加标题条或品牌条。

首帧会尽量只保留“连续问题 + 左下角500”；首屏停留按四连问的阅读量计算，后续采用短距离滚动加阅读停留，使每条内容有时间读完。

## 每日云端渲染

选题源位于 `content/topic-sources/`。ChatGPT 负责从3份选题源中选择近期未重复题目、生成不限条数的完整咨询对话并更新 `daily-input/latest.json`；GitHub Actions 只负责确定性的校验和 Remotion 渲染，不调用任何模型 API。

每日成片规格：

- 1920×1080
- 16:9 横屏
- 30fps
- 时长按文字阅读量自动计算，无固定60秒限制
- H.264 / 无音轨

完整聊天先按1080像素宽生成长图；进入1920×1080视频时整体等比放大到画布约95%宽，最大约1.7倍，保持微信气泡、头像、文字的相对比例，同时让第一屏更接近对标视频的视觉密度。

GitHub Ubuntu Runner 会安装 Noto CJK 中文字体，避免云端渲染出现中文方框乱码。

`.github/workflows/render-daily.yml` 会在每日输入、核心渲染代码或工作流更新时自动执行，也支持手动触发。流程依次执行：

`verify → prepare → 长图 → 16:9视频 → 打包 → Artifact`

成功后上传4个文件并保留30天：

- `wechat-日期.mp4`：自适应时长横屏视频
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

## V3 阅读节奏与头像

曹律师固定使用 `public/img/wechat-avatars/caoyide-wechat-avatar.png`。咨询人头像从两张通讯录截图中的70个完整头像按日期稳定轮换，同一条视频全部右侧消息使用同一个头像；截图中的昵称和通讯录界面不会显示。归档生成后的 scene JSON 即可复现头像选择。

`daily-input/latest.json` 可设置 `readingCpm`，默认360字/分钟（6字/秒），是可调制作假设，并非经过人群测试的平均速度。忽略空白和标点，其余字符各计一个阅读单位；每条至少0.8秒，附加0.25秒理解停顿，滚动0.35秒，付款卡停留1.2秒。首屏按前五条合计阅读量停留。长句换行与行高在布局和时间轴共用，长图不再受3200像素截断。特别长脚本仍受浏览器最大画布及云端资源约束，必要时应分段渲染。

消息总数不设上限，普通单条仍不超过28字。正式咨询应涵盖事实追问、证据、法律判断、止损路径、赔偿条件和行动清单，不能承诺固定赔偿或必然拘留。当前AI换脸样例共94条，默认计算约273.6秒；本轮只验证生成框架，尚未渲染验收。

当前云端工作流仍只归档原有4个文件；后续出片时需补充归档 generated/daily-scene.json 与 generated/scroll-props.json，以完整复现随机头像及阅读时间轴。
