import type { ChatMessage } from "../src/components/chat/types";
import { validateTransfers } from "../src/components/chat/transfers";

export const extractTopics = (markdown: string) =>
  markdown
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*\d+\.\s+(.+?)\s*$/)?.[1])
    .filter((line): line is string => Boolean(line))
    .filter((line) => !line.startsWith("〔"));

export const selectDailyTopic = (topics: string[], date: string) => {
  if (topics.length === 0) throw new Error("选题文档中没有可用条目");
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  if (!Number.isFinite(day)) throw new Error(`日期格式无效: ${date}`);
  return topics[((day % topics.length) + topics.length) % topics.length];
};

export const validateDailyMessages = (messages: ChatMessage[]) => {
  if (messages.length !== 12) throw new Error("每日聊天必须包含12条消息");
  for (const message of messages) {
    if (message.text.length > 52) throw new Error(`消息过长: ${message.id}`);
    if (message.role === "left" && message.avatar)
      throw new Error("曹义德律师使用默认专用微信头像，无需由GPT指定头像");
    if (message.role === "right" && message.avatar)
      throw new Error("咨询人使用默认头像，无需由GPT指定头像");
  }
  const transfers = messages.filter((message) => message.kind === "transfer");
  if (
    transfers.length !== 2 ||
    transfers.some(
      (message) =>
        message.transferId !== "consultation-fee" ||
        message.transferAmount !== "500.00",
    )
  )
    throw new Error("必须且只能包含一笔500元咨询费及其收款回执");
  validateTransfers(messages);
};
