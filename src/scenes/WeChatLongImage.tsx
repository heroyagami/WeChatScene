import React from "react";
import { AbsoluteFill } from "remotion";
import { WeChatMessage } from "../components/chat/WeChatSkin";
import type { ChatMessage } from "../components/chat/types";
import type { ConsultantAvatarCrop } from "../components/chat/consultantAvatars";

import { messageRows } from "./reading";
export const estimateLongImageHeight = (messages: ChatMessage[]) =>
  Math.max(1500, (messageRows(messages).at(-1)?.bottom ?? 36) + 72);
export const LONG_IMAGE_WIDTH = 1080;
export const LONG_IMAGE_HEIGHT = 2160;

export const WeChatLongImage: React.FC<{
  messages: ChatMessage[];
  consultantAvatar?: ConsultantAvatarCrop;
}> = ({ messages, consultantAvatar }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#ededed",
      fontFamily:
        "'Noto Sans CJK SC', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif",
      padding: "36px 42px 72px",
    }}
  >
    <div style={{ display: "flow-root" }}>
      {messages.map((message, index) => (
        <WeChatMessage
          key={message.id}
          message={message}
          previous={messages[index - 1]}
          index={index}
          animated={false}
          preciseLayout
          consultantAvatar={consultantAvatar}
        />
      ))}
    </div>
  </AbsoluteFill>
);
