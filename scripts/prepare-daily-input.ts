import { buildReadingTimeline } from "../src/scenes/reading";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
  messages: z.array(z.unknown()),
});

const input = inputSchema.parse(JSON.parse(await readFile(inputPath, "utf8")));
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
  `${JSON.stringify({ imageSrc: "generated/daily-chat.png", imageWidth: 1080, imageHeight, points: timeline.points, scale: timeline.scale, durationInFrames: timeline.durationInFrames }, null, 2)}\n`,
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
        audio: false,
      },
    },
    null,
    2,
  )}\n`,
);
console.log(
  `date=${input.date}\ntopic=${input.topic}\nmessages=${parsedScene.messages.length}\nimageHeight=${imageHeight}\nrender=1920x1080@30fps/${timeline.durationInFrames / 30}s`,
);
