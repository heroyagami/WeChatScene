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

const isTransfer = (message: ChatMessage) => message.kind === "transfer";

export const validateDailyMessages = (messages: ChatMessage[]) => {
  if (messages.length < 7) throw new Error("每日聊天至少包含7条消息");

  for (const message of messages) {
    if (!isTransfer(message) && message.text.length > 28)
      throw new Error(`每日短句不得超过28字: ${message.id}`);
    if (message.role === "left" && message.avatar)
      throw new Error("曹义德律师使用默认专用微信头像，无需由GPT指定头像");
    if (message.role === "right" && message.avatar)
      throw new Error("咨询人使用默认头像，无需由GPT指定头像");
  }

  const opening = messages.slice(0, 4);
  if (opening.some((message) => message.role !== "right" || isTransfer(message)))
    throw new Error("第1—4条必须是咨询人右侧连续提问");

  const feePrompt = messages[4];
  if (
    feePrompt.role !== "left" ||
    isTransfer(feePrompt) ||
    feePrompt.text.trim() !== "500"
  )
    throw new Error("第5条必须是曹义德律师左侧单独回复500");

  const feeCard = messages[5];
  if (
    !isTransfer(feeCard) ||
    feeCard.role !== "right" ||
    feeCard.transferId !== "consultation-fee" ||
    feeCard.transferAmount !== "500.00" ||
    feeCard.transferState !== "accepted"
  )
    throw new Error("第6条必须是咨询人右侧500元已被接收转账卡");

  const transfers = messages.filter(isTransfer);
  if (transfers.length !== 1)
    throw new Error("每日V2只显示一张500元已被接收转账卡");

  if (!messages.slice(6).some((message) => message.role === "left"))
    throw new Error("付款后必须进入律师正式答复");

  validateTransfers(messages);
};
