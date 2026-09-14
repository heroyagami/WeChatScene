import { createConsultationTransfer } from "./components/chat/transfers";
import type { ChatMessage } from "./components/chat/types";

const [sent, receipt] = createConsultationTransfer({ id: "consultation-001" });
export const exampleMessages: ChatMessage[] = [
  {
    id: "1",
    role: "right",
    text: "律师，老板微信通知我明天不用来了",
    timeLabel: "昨天 22:42",
  },
  { id: "2", role: "left", text: "先保留聊天记录，不要急着签离职申请" },
  {
    id: "3",
    role: "right",
    text: "这是公司的通知",
    kind: "image",
    media: {
      src: "img/wechat-avatars/wechat-avatar-scenery-03-mountain.png",
      alt: "示例图片占位",
      width: 380,
      height: 240,
    },
  },
  { ...sent, timeLabel: "昨天 23:33" },
  { id: "4", role: "right", text: "咨询费" },
  { id: "5", role: "left", text: "收到" },
  receipt,
  {
    id: "6",
    role: "right",
    text: "现场视频",
    kind: "video",
    media: {
      src: "img/wechat-avatars/wechat-avatar-scenery-04-grassland.png",
      alt: "示例视频封面",
      width: 430,
      height: 260,
      durationLabel: "00:18",
    },
  },
  { id: "7", role: "left", text: "我先帮你梳理证据" },
  { id: "8", role: "right", text: "那我明天还去公司吗？" },
  { id: "9", role: "left", text: "先确认公司是否明确解除劳动关系" },
];
