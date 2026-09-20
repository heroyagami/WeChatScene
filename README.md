# WeChatScene

基于 Remotion 的微信律师咨询视频生成项目。支持文字消息、图片、视频缩略卡、500 元咨询费转账、收款回执、完整聊天长图、标题首屏和按阅读量驱动的横屏滚动视频。

当前项目重点不是固定时长，而是：**先把咨询问题讲清楚，再由内容量决定视频长度。**

## 本地运行

需要 Node.js 20+、npm。

```sh
npm ci
npm run dev
npm run verify
npm run compositions
npm run render
```

每日生产链使用 1920×1080、30fps 横屏规格。GitHub Actions 只做确定性校验与渲染，不在仓库里调用模型。

## 当前咨询结构

每日律师视频固定采用：

**3—5 条连续提问 → 500 → ¥500 已被接收 → 完整咨询 → ¥500 已收款**

其中：

1. 咨询人右侧连续 3—5 条问题/事实消息。
2. 曹义德律师左侧只回复 `500`。
3. 紧接咨询人右侧 `accepted` 转账卡：`transferId:"consultation-fee"`、`transferAmount:"500.00"`。
4. 之后进入完整法律咨询。
5. 整个 `messages` 数组最后一条必须是曹义德左侧 `received` 收款回执，且与前面的 accepted 卡共享同一 `consultation-fee`。

两张卡只代表同一笔 500 元咨询费。不得新增第二笔付款或第二组转账卡。

普通消息每条最多 28 字；消息总数和视频总时长不固定。内容应根据当天选题重新创作，像真实微信问答，不写成长篇法律意见书。

## 首屏标题规则

`daily-input/latest.json` 现在支持：

- `coverTag`：领域标签，建议 4—6 字，最多 8 字。
- `coverTitle`：本期主标题，建议 10—20 字，最多两行，可使用 `\n` 换行。

示例：

```json
{
  "coverTag": "婚姻家事",
  "coverTitle": "恋爱转账\n怎么防止被追回？"
}
```

视觉固定为：

- 微信绿圆角标签 + 白字；
- 白色粗体主标题，最多两行；
- 深灰/黑灰半透明圆角底板；
- 不显示“曹义德律师答疑”等副标题；
- 不使用大面积黄字、粗黑描边或花哨艺术字。

标题必须是用户视角的口语化问题，不写成法条标题、论文标题或解释型长标题。

## 运动逻辑

视频时间轴固定为：

1. **前 1.0 秒画面完全静止**，用于展示标签和标题；
2. 首秒末尾标题快速淡出，默认约 0.2 秒；
3. **1.0 秒后开始滚动**；
4. 从开始滚动到最后一帧，聊天长图持续、线性、匀速上移；
5. 中间不再按单条消息、转账卡或问答节点停顿；
6. `readingCpm` 只决定滚动阶段的总时长，不改变运动方式。

因此当前运动原则是：**1 秒定帧 + 后续全程匀速滚动。**

## 阅读速度与自动时长

`daily-input/latest.json` 可设置 `readingCpm`。阅读速度用于估算滚动阶段需要的总时长；视频总时长还会额外包含 1 秒首屏标题时间。

内容越完整，视频可以自然增长到 1 分钟、2 分钟、3 分钟甚至更长。项目优先保证问题讲得清楚、读得完、看得懂。

## 头像规则

曹律师固定使用：

`public/img/wechat-avatars/caoyide-wechat-avatar.png`

咨询人头像从头像池中选择，同一条视频内保持不变，降低连续视频头像重复概率。

## BGM

每日输入支持 `bgm` 和 `bgmVolume`。只使用仓库内已经存在并配置好的音频，不在每日任务中下载、生成或上传外部音频。

## 每日云端生产流程

选题源位于 `content/topic-sources/`。每日任务完全可在 ChatGPT 云端执行，不依赖本机 Codex、本地路径或 heartbeat。

每日流程：

1. 先读取当前 `main` 的 `AGENTS.md`、校验器和 `daily-input/latest.json`。
2. 读取 3 份选题 Markdown，并结合近期提交历史选择近期未重复的话题。
3. 根据当天题目从零创作完整咨询。
4. 同时生成 `coverTag`、`coverTitle`、`publishTitles` 和 `publishTags`。
5. 写入 `daily-input/latest.json` 并提交 `main`。
6. 提交后回读验证。
7. 等待 `.github/workflows/render-daily.yml` 完成。
8. 核验 verify、prepare、长图、MP4、音频与 Artifact。
9. 成功后报告：选题、完整 commit SHA、实际时长、Actions 链接、Artifact；失败时明确报告失败环节。

不得提交 `out/`、`generated/`、`public/generated/`、日志、长图或视频。

## 发布标题与标签

每条每日视频同时生成便于发布时直接复制的标题与标签：

- `publishTitles`：3—5 个候选标题，第 1 个为首选；
- `publishTags`：5—10 个标签，JSON 中不带 `#`、不含空格。

标题应准确、口语化、有冲突或行动价值，但不得标题党、夸大法律结论或承诺必然结果。标签优先采用“具体问题标签 + 法律领域标签 + 泛法律标签”的组合。

`daily:prepare` 会生成 `generated/publish-copy.txt`；GitHub Actions 会把它随视频一起打包为：

`wechat-YYYY-MM-DD-publish.txt`

其中包含首选标题、备选标题、带 `#` 的标签，以及“首选标题 + 标签”的一键复制块。GitHub Actions 只负责确定性格式化和打包，标题与标签由每日 ChatGPT 云任务生成。

## 云端渲染

`daily-input/latest.json` 提交后，`.github/workflows/render-daily.yml` 自动运行，也支持 `workflow_dispatch`。

当前成片规格：

- 1920×1080
- 16:9 横屏
- 30fps
- H.264
- 1 秒标题首屏
- 后续全程匀速滚动
- 时长按内容量自动计算

工作流顺序：

`verify → prepare → 长图 → 16:9 视频 → 打包 → Artifact`

Artifact 通常包含：

- `wechat-日期.mp4`
- `wechat-日期.png`
- `wechat-日期.json`
- `wechat-日期-manifest.json`
- `wechat-日期-publish.txt`：首选标题、备选标题、标签和一键复制文本

更多约束见 `AGENTS.md`。
