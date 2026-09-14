import React from "react";
import { AbsoluteFill } from "remotion";
import { WeChatMessage } from "../components/chat/WeChatSkin";
import type { ChatMessage } from "../components/chat/types";

export const LONG_IMAGE_WIDTH = 1080;
export const LONG_IMAGE_HEIGHT = 2160;

export const estimateLongImageHeight = (messages: ChatMessage[]) => {
  const content = messages.reduce((height, message, index) => {
    const previous = messages[index - 1];
    const gap = index === 0 ? 0 : previous?.role === message.role ? 22 : 38;
    const time = message.timeLabel ? 122 : 0;
    const row =
      message.kind === "transfer"
        ? 208
        : Math.max(88, Math.ceil(message.text.length / 20) * 54 + 36);
    return height + gap + time + row;
  }, 0);
  return Math.max(1500, Math.min(3200, content + 144));
};

export const WeChatLongImage: React.FC<{ messages: ChatMessage[] }> = ({
  messages,
}) => (
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
        />
      ))}
    </div>
  </AbsoluteFill>
);
