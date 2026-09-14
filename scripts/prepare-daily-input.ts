import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { sceneSchema } from "../src/schema";
import { estimateLongImageHeight } from "../src/scenes/WeChatLongImage";
import { validateDailyMessages } from "./daily-lib";

const root = process.cwd();
const inputPath = path.join(
  root,
  process.env.DAILY_INPUT || "daily-input/latest.json",
);
const inputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  topic: z.string().min(1).max(160),
  source: z.string().min(1).max(200),
  messages: z.array(z.unknown()),
});

const input = inputSchema.parse(JSON.parse(await readFile(inputPath, "utf8")));
const parsedScene = sceneSchema.parse({
  messages: input.messages,
  mode: "scroll",
  showTopBar: false,
  showInputBar: false,
  width: 1080,
  height: 1440,
  durationInFrames: 360,
});
validateDailyMessages(parsedScene.messages);
const imageHeight = estimateLongImageHeight(parsedScene.messages);

await mkdir(path.join(root, "generated"), { recursive: true });
await mkdir(path.join(root, "public/generated"), { recursive: true });
await writeFile(
  path.join(root, "generated/daily-scene.json"),
  `${JSON.stringify(parsedScene, null, 2)}\n`,
);
await writeFile(
  path.join(root, "generated/scroll-props.json"),
  `${JSON.stringify({ imageSrc: "generated/daily-chat.png", imageWidth: 1080, imageHeight, holdFrames: 24 }, null, 2)}\n`,
);
await writeFile(
  path.join(root, "generated/daily-manifest.json"),
  `${JSON.stringify({ date: input.date, topic: input.topic, source: input.source, producer: "chatgpt-chat-mode", input: path.relative(root, inputPath).replaceAll("\\", "/") }, null, 2)}\n`,
);
console.log(
  `date=${input.date}\ntopic=${input.topic}\nmessages=${parsedScene.messages.length}\nimageHeight=${imageHeight}`,
);
