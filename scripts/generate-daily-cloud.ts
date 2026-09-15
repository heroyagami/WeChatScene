import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { sceneSchema } from "../src/schema";
import { extractTopics, validateDailyMessages } from "./daily-lib";

const root = process.cwd();
const token = process.env.GH_MODELS_TOKEN;
if (!token) throw new Error("缺少 GH_MODELS_TOKEN");

const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const sourceDirectory = path.join(root, "content/topic-sources");
const sourceFiles = (await readdir(sourceDirectory))
  .filter((name) => name.endsWith(".md"))
  .sort();
const topics: Array<{ topic: string; source: string }> = [];
for (const file of sourceFiles) {
  const markdown = await readFile(path.join(sourceDirectory, file), "utf8");
  for (const topic of extractTopics(markdown))
    topics.push({ topic, source: `content/topic-sources/${file}` });
}
if (!topics.length) throw new Error("选题源中没有可用题目");

const previous = JSON.parse(
  await readFile(path.join(root, "daily-input/latest.json"), "utf8"),
) as { topic?: string };
const dayNumber = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
let selected = topics[dayNumber % topics.length];
if (selected.topic === previous.topic)
  selected = topics[(dayNumber + 1) % topics.length];

const responseSchema = z.object({
  readingCpm: z.number().min(300).max(500).default(420),
  bgm: z
    .enum(["auto", "forest-friends", "heartwarming", "tarkis-home", "none"])
    .default("auto"),
  bgmVolume: z.number().min(0).max(0.2).default(0.08),
  messages: z.array(z.unknown()),
});

const prompt = `你是曹义德律师微信咨询视频的编剧。请围绕以下选题重新创作一段完整、真实、可执行的法律咨询：\n${selected.topic}\n\n只输出一个JSON对象，字段为 readingCpm、bgm、bgmVolume、messages，不要Markdown代码块。规则：\n- 开场由咨询人role=right连续发3至5条短问题，交代冲突、关键事实、现实影响和怎么办\n- 随后曹义德role=left只回复500\n- 下一条为咨询人右侧转账卡：id=fee-sent，text为空，kind=transfer，transferId=consultation-fee，transferAmount=500.00，transferState=accepted\n- 接着进入完整咨询，根据本题具体事实覆盖核实问题、证据、法律判断条件、止损、行动顺序和风险边界\n- 最后一条必须是曹义德左侧收款回执：id=fee-receipt，text为空，kind=transfer，transferId=consultation-fee，transferAmount=500.00，transferState=received\n- 所有id唯一；普通消息每条不超过28个汉字；不设置avatar\n- 一条只讲一个意思，像真实微信，普通陈述句通常不加句末句号\n- 不堆法条，不承诺必然胜诉、固定赔偿或必然拘留\n- 消息总数按话题需要确定，建议35至65条，确保问题得到可执行解决\n- readingCpm取360至450；bgm按题材从auto、forest-friends、heartwarming、tarkis-home、none中选择；bgmVolume取0.06至0.1`;

let lastError: unknown;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const response = await fetch(
      "https://models.github.ai/inference/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GH_MODELS_MODEL || "openai/gpt-4.1",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 7000,
        }),
      },
    );
    if (!response.ok)
      throw new Error(
        `GitHub Models请求失败: ${response.status} ${await response.text()}`,
      );
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("模型没有返回内容");
    const parsed = responseSchema.parse(JSON.parse(content));
    const scene = sceneSchema.parse({ messages: parsed.messages });
    validateDailyMessages(scene.messages);
    await writeFile(
      path.join(root, "daily-input/latest.json"),
      `${JSON.stringify({ date, topic: selected.topic, source: selected.source, ...parsed }, null, 2)}\n`,
    );
    console.log(
      `date=${date}\ntopic=${selected.topic}\nmessages=${scene.messages.length}`,
    );
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.error(`第${attempt}次生成或校验失败:`, error);
  }
}
throw lastError;
