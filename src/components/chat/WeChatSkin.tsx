import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { getMessageStartFrame } from "./ChatEngine";
import { TransferCard } from "./TransferCard";
import type { ChatMessage } from "./types";

const resolveAsset = (src: string) => {
  if (/^(?:https?:|data:|blob:)/.test(src)) return src;
  return staticFile(src.replace(/^public\//, ""));
};

const Avatar: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <Img
    src={resolveAsset(
      message.avatar ??
        (message.role === "left"
          ? "img/wechat-avatars/caoyide-wechat-avatar.png"
          : "img/wechat-right-avatar.jpg"),
    )}
    style={{
      width: 88,
      height: 88,
      borderRadius: 7,
      objectFit: "cover",
      flex: "0 0 auto",
    }}
  />
);

const VideoMessageCard: React.FC<{ message: ChatMessage }> = ({ message }) => {
  if (!message.media) return null;
  const width = Math.max(260, Math.min(520, message.media.width ?? 420));
  const height = Math.max(180, Math.min(520, message.media.height ?? 280));

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        borderRadius: 8,
        background: "#111",
        boxShadow: message.highlight
          ? "0 0 0 4px rgba(245,190,45,.6)"
          : "0 1px 1px rgba(0,0,0,.08)",
      }}
    >
      <Img
        src={resolveAsset(message.media.src)}
        alt={message.media.alt ?? message.text}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "34%",
          background: "linear-gradient(transparent,rgba(0,0,0,.42))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 64,
          height: 64,
          border: "3px solid rgba(255,255,255,.96)",
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          boxShadow: "0 2px 8px rgba(0,0,0,.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 17,
            width: 0,
            height: 0,
            borderTop: "13px solid transparent",
            borderBottom: "13px solid transparent",
            borderLeft: "20px solid #fff",
          }}
        />
      </div>
      {message.media.durationLabel ? (
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 10,
            color: "#fff",
            fontSize: 23,
            fontWeight: 500,
            textShadow: "0 1px 3px rgba(0,0,0,.7)",
          }}
        >
          {message.media.durationLabel}
        </div>
      ) : null}
    </div>
  );
};

export const WeChatMessage: React.FC<{
  message: ChatMessage;
  previous?: ChatMessage;
  index: number;
  animated?: boolean;
}> = ({ message, previous, index, animated = true }) => {
  const frame = useCurrentFrame();
  const entryFrame = getMessageStartFrame(message, index);
  const opacity = animated
    ? interpolate(frame, [entryFrame, entryFrame + 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const translateY = animated
    ? interpolate(frame, [entryFrame, entryFrame + 10], [10, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const switched = previous && previous.role !== message.role;
  const marginTop = switched ? 38 : 22;
  const isRight = message.role === "right";
  const bubbleColor =
    message.kind === "transfer"
      ? message.transferState === "pending"
        ? "#f5a447"
        : "#fbd0a0"
      : isRight
        ? "#95ec69"
        : "#fff";

  return (
    <div
      style={{ marginTop, opacity, transform: `translateY(${translateY}px)` }}
    >
      {message.timeLabel ? (
        <div
          style={{
            textAlign: "center",
            color: "#a3a3a3",
            fontSize: 29,
            margin: "48px 0 34px",
          }}
        >
          {message.timeLabel}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: isRight ? "row-reverse" : "row",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <Avatar message={message} />
        <div style={{ position: "relative", maxWidth: "calc(100% - 112px)" }}>
          {message.kind !== "transfer" ? (
            <span
              style={{
                position: "absolute",
                top:
                  message.kind === "image" || message.kind === "video"
                    ? 34
                    : 25,
                [isRight ? "right" : "left"]: -12,
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                ...(isRight
                  ? { borderLeft: `13px solid ${bubbleColor}` }
                  : { borderRight: `13px solid ${bubbleColor}` }),
              }}
            />
          ) : null}
          {message.kind === "transfer" ? (
            <TransferCard
              amount={message.transferAmount}
              state={
                message.transferState ??
                (message.transferStatus === "已收款"
                  ? "received"
                  : message.transferStatus === "待收款"
                    ? "pending"
                    : "accepted")
              }
              side={message.role}
            />
          ) : message.kind === "video" && message.media ? (
            <VideoMessageCard message={message} />
          ) : message.kind === "image" && message.media ? (
            <div
              style={{
                padding: 7,
                borderRadius: 8,
                background: bubbleColor,
                boxShadow: message.highlight
                  ? "0 0 0 4px rgba(245,190,45,.6)"
                  : "0 1px 1px rgba(0,0,0,.04)",
              }}
            >
              <Img
                src={resolveAsset(message.media.src)}
                alt={message.media.alt ?? message.text}
                style={{
                  display: "block",
                  width: message.media.width ?? 420,
                  height: message.media.height ?? 280,
                  maxWidth: "100%",
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                padding: "18px 24px",
                borderRadius: 8,
                background: bubbleColor,
                color: "#111",
                fontSize: 38,
                lineHeight: 1.4,
                boxShadow: message.highlight
                  ? "0 0 0 4px rgba(245,190,45,.6)"
                  : "0 1px 1px rgba(0,0,0,.04)",
              }}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
