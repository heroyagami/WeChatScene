# WeChatScene BGM 池

当前固定保留 3 个 BGM 方向，后续视频不再每条临时挑音乐。

## 最终选择

1. **Forest Friends** — 默认主 BGM
   - 来源分段：`17 - Frenzy Forest - Forest Friends - 森林.mp3`
   - 用途：绝大多数劳动、合同、婚姻家事、普通民事咨询
   - 原因：频谱重心较低、节奏稳定、长时间播放不容易抢文字

2. **Heartwarming** — 情绪敏感题材
   - 来源分段：`04 - Arctic Rim - Heartwarming - 冰河.mp3`
   - 用途：未成年人、家庭矛盾、侵权受害等更需要克制情绪的内容
   - 原因：速度更慢，氛围更柔和

3. **Tarki's Home** — 科技/互联网题材
   - 来源分段：`10 - Galaxy Express - Tarkis Home - 太空.mp3`
   - 用途：AI、平台、网络侵权、互联网纠纷
   - 原因：有轻微科技感，但仍保持稳定底层节奏

具体选择规则见 `playlist.json`。

## 播放规则

- 同一条视频只使用 1 首 BGM。
- 视频比音乐长时循环播放到视频结束。
- 默认音量约 8%—9%，以“不干扰读微信文字”为准。
- 开头淡入约 0.8 秒，结尾淡出约 1.2 秒。
- 普通题材默认使用 `forest-friends`。

## 音频文件位置

项目约定实际音频文件放在本地/私有目录：

```text
private/bgm/17-forest-friends.mp3
private/bgm/04-heartwarming.mp3
private/bgm/10-tarkis-home.mp3
```

`private/` 已被 `.gitignore` 忽略。

当前 `WeChatScene` 是公开仓库，因此这里只提交选曲与生产规则，不把《跑跑卡丁车》的版权音乐二进制文件公开提交到仓库。若后续改用已获授权、原创或可公开再分发的 BGM，可直接把音频接入渲染链。
