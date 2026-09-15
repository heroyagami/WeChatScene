import { buildReadingTimeline } from "../src/scenes/reading";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { sceneSchema } from "../src/schema";
import { validateDailyMessages } from "./daily-lib";
import { selectConsultantAvatar } from "../src/components/chat/consultantAvatars";

const root = process.cwd();
const inputPath = path.join(
  root,
  process.env.DAILY_INPUT || "daily-input/latest.json",
);
const inputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  topic: z.string().min(1).max(160),
  source: z.string().min(1).max(200),
  readingCpm: z.number().positive().optional(),
  bgm: z.string().min(1).optional(),
  bgmVolume: z.number().min(0).max(1).optional(),
  messages: z.array(z.unknown()),
});

type BgmTrack = {
  title: string;
  role: string;
  publicPath: string;
  recommendedVolume: number;
};
type BgmPlaylist = {
  default: string;
  tracks: Record<string, BgmTrack>;
  productionRule: {
    fadeInSeconds: number;
    fadeOutSeconds: number;
  };
};

const input = inputSchema.parse(JSON.parse(await readFile(inputPath, "utf8")));
const playlist = JSON.parse(
  await readFile(path.join(root, "content/bgm/playlist.json"), "utf8"),
) as BgmPlaylist;

const autoSelectBgm = (_topic: string) => playlist.default;

const requestedBgm = input.bgm ?? "auto";
const bgmKey =
  requestedBgm === "none"
    ? null
    : requestedBgm === "auto"
      ? autoSelectBgm(input.topic)
      : requestedBgm;
const configuredBgmTrack = bgmKey ? playlist.tracks[bgmKey] : undefined;
if (bgmKey && !configuredBgmTrack) throw new Error(`未知BGM: ${bgmKey}`);

let bgmTrack = configuredBgmTrack;
if (bgmTrack) {
  try {
    await access(path.join(root, "public", bgmTrack.publicPath));
  } catch {
    throw new Error(`BGM文件缺失，停止生产渲染: ${bgmTrack.publicPath}`);
  }
}
const bgmVolume = bgmTrack
  ? (input.bgmVolume ?? bgmTrack.recommendedVolume)
  : 0;

const parsedScene = sceneSchema.parse({
  messages: input.messages,
  mode: "scroll",
  layout: "landscape-centered",
  showTopBar: false,
  showInputBar: false,
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 1800,
});
validateDailyMessages(parsedScene.messages);
const timeline = buildReadingTimeline(
  parsedScene.messages,
  input.readingCpm ?? 360,
);
parsedScene.durationInFrames = timeline.durationInFrames;
const imageHeight = timeline.imageHeight;
const consultantAvatar = selectConsultantAvatar(input.date);

await mkdir(path.join(root, "generated"), { recursive: true });
await mkdir(path.join(root, "public/generated"), { recursive: true });
await writeFile(
  path.join(root, "generated/daily-scene.json"),
  `${JSON.stringify({ ...parsedScene, consultantAvatar }, null, 2)}\n`,
);
await writeFile(
  path.join(root, "generated/scroll-props.json"),
  `${JSON.stringify(
    {
      imageSrc: "generated/daily-chat.png",
      imageWidth: 1080,
      imageHeight,
      points: timeline.points,
      scale: timeline.scale,
      durationInFrames: timeline.durationInFrames,
      bgmSrc: bgmTrack?.publicPath,
      bgmVolume,
      bgmFadeInSeconds: playlist.productionRule.fadeInSeconds,
      bgmFadeOutSeconds: playlist.productionRule.fadeOutSeconds,
    },
    null,
    2,
  )}\n`,
);
await writeFile(
  path.join(root, "generated/daily-manifest.json"),
  `${JSON.stringify(
    {
      date: input.date,
      topic: input.topic,
      source: input.source,
      producer: "chatgpt-chat-mode",
      input: path.relative(root, inputPath).replaceAll("\\", "/"),
      render: {
        width: 1920,
        height: 1080,
        aspectRatio: "16:9",
        fps: 30,
        durationSeconds: timeline.durationInFrames / 30,
        reading: timeline,
        consultantAvatar,
        audio: bgmTrack
          ? {
              enabled: true,
              key: bgmKey,
              title: bgmTrack.title,
              src: bgmTrack.publicPath,
              volume: bgmVolume,
              loop: true,
              fadeInSeconds: playlist.productionRule.fadeInSeconds,
              fadeOutSeconds: playlist.productionRule.fadeOutSeconds,
            }
          : {
              enabled: false,
              requestedKey: bgmKey,
              reason: configuredBgmTrack ? "asset-missing" : "disabled",
            },
      },
    },
    null,
    2,
  )}\n`,
);
console.log(
  `date=${input.date}\ntopic=${input.topic}\nmessages=${parsedScene.messages.length}\nimageHeight=${imageHeight}\nbgm=${bgmTrack ? bgmKey : "none"}\nrender=1920x1080@30fps/${timeline.durationInFrames / 30}s`,
);
