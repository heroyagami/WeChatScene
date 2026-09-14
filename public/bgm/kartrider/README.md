# Kartrider BGM runtime assets

此目录用于 WeChatScene 每日法律咨询视频的背景音乐素材。

当前主力曲目：

- `17-forest-friends.mp3`：默认，适合劳动、合同、婚姻家事、普通民事咨询。
- `04-heartwarming.mp3`：适合未成年人、家庭、侵权受害、情绪较重的话题。
- `10-tarkis-home.mp3`：适合 AI、互联网、平台、网络侵权、科技法律题材。

选曲配置位于 `content/bgm/playlist.json`。

聊天模式生成 `daily-input/latest.json` 时可选：

```json
{
  "bgm": "auto"
}
```

支持：

- `auto`：按题材自动选择，默认行为；字段省略时等同 `auto`。
- `forest-friends`
- `heartwarming`
- `tarkis-home`
- `none`：关闭背景音乐。

还可使用 `bgmVolume` 覆盖默认音量，例如 `0.08`。

渲染时音乐会自动循环至视频结束，并按 `playlist.json` 中配置淡入淡出。若指定的 MP3 尚未放入本目录，生产脚本会自动退回静音渲染，不阻断 GitHub Actions。
