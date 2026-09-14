import type { ChatMessage } from "./types";
import { formatAmount } from "./TransferCard";

/** Both cards describe one transaction; the receipt is not another payment. */
export function createConsultationTransfer({
  id,
  amount = 500,
  senderAvatar,
  lawyerAvatar,
}: {
  id: string;
  amount?: number | string;
  senderAvatar?: string;
  lawyerAvatar?: string;
}): ChatMessage[] {
  return [
    {
      id: `${id}-sent`,
      role: "left",
      text: "咨询费",
      kind: "transfer",
      transferId: id,
      transferAmount: formatAmount(amount),
      transferState: "accepted",
      avatar: senderAvatar,
    },
    {
      id: `${id}-receipt`,
      role: "right",
      text: "",
      kind: "transfer",
      transferId: id,
      transferAmount: formatAmount(amount),
      transferState: "received",
      avatar: lawyerAvatar,
    },
  ];
}

export function validateTransfers(messages: ChatMessage[]) {
  const sent = new Map<string, ChatMessage>();
  const receipts = new Set<string>();
  const ids = new Set<string>();
  for (const message of messages) {
    if (ids.has(message.id)) throw new Error(`重复消息: ${message.id}`);
    ids.add(message.id);
    if (message.kind !== "transfer") continue;
    formatAmount(message.transferAmount ?? 500);
    if (!message.transferId) continue; // Legacy imported cards remain supported.
    const state =
      message.transferState ??
      (message.transferStatus === "已收款" ? "received" : "accepted");
    if (state === "received") {
      const original = sent.get(message.transferId);
      if (
        !original ||
        original.role === message.role ||
        original.transferState === "pending" ||
        formatAmount(original.transferAmount) !==
          formatAmount(message.transferAmount)
      )
        throw new Error(`收款回执与转账不匹配: ${message.transferId}`);
      if (receipts.has(message.transferId))
        throw new Error(`重复收款: ${message.transferId}`);
      receipts.add(message.transferId);
    } else {
      if (sent.has(message.transferId))
        throw new Error(`重复转账: ${message.transferId}`);
      sent.set(message.transferId, message);
    }
  }
}
