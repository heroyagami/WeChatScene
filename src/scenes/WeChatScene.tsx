import React, { useLayoutEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getVisibleMessages } from "../components/chat/ChatEngine";
import { WeChatMessage } from "../components/chat/WeChatSkin";
import type {
  ChatLayout,
  ChatMessage,
  ChatMode,
} from "../components/chat/types";

const WifiIcon = () => (
  <svg width="34" height="28" viewBox="0 0 34 28" fill="none">
    <path
      d="M2 8C10.5 1.5 23.5 1.5 32 8"
      stroke="#111"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M7.5 14.5C13 10.5 21 10.5 26.5 14.5"
      stroke="#111"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="17" cy="23" r="3.5" fill="#111" />
  </svg>
);

const VoiceIcon = () => (
  <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
    <circle cx="27" cy="27" r="24" stroke="#111" strokeWidth="4" />
    <path
      d="M21 20C15 25 15 29 21 34M27 16C17 24 17 31 27 39M33 13C46 23 46 32 33 42"
      stroke="#111"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const FaceIcon = () => (
  <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
    <circle cx="27" cy="27" r="24" stroke="#111" strokeWidth="4" />
    <circle cx="19" cy="22" r="2.8" fill="#111" />
    <circle cx="35" cy="22" r="2.8" fill="#111" />
    <path
      d="M16 32C21 39 33 39 38 32"
      stroke="#111"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
    <circle cx="27" cy="27" r="24" stroke="#111" strokeWidth="4" />
    <path
      d="M27 16V38M16 27H38"
      stroke="#111"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

export type WeChatSceneProps = {
  mode?: ChatMode;
  layout?: ChatLayout;
  messages: ChatMessage[];
  showTopBar?: boolean;
  showInputBar?: boolean;
  showTimeDivider?: boolean;
  highlightIndexes?: number[];
  autoScroll?: boolean;
  chatTitle?: string;
  statusTime?: string;
};

export const WeChatScene: React.FC<WeChatSceneProps> = ({
  mode = "scroll",
  layout = "full",
  messages,
  showTopBar = false,
  showInputBar = false,
  showTimeDivider = true,
  highlightIndexes = [],
  autoScroll = true,
  chatTitle = "律师咨询",
  statusTime = "08:58",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const panelWidth =
    layout === "landscape-centered" || layout === "landscape-left"
      ? Math.min(width, 1080)
      : width;
  const panelLeft = layout === "landscape-left" ? 0 : (width - panelWidth) / 2;
  useLayoutEffect(() => {
    setContentHeight(contentRef.current?.offsetHeight ?? 0);
  });
  const visible = getVisibleMessages({ frame, messages, mode }).map(
    (message) => {
      const timelineIndex = messages.indexOf(message);
      return {
        ...message,
        timelineIndex,
        timeLabel: showTimeDivider ? message.timeLabel : undefined,
        highlight:
          message.highlight || highlightIndexes.includes(timelineIndex),
      };
    },
  );
  const contentTop = showTopBar ? 174 : 28;
  const contentBottom = showInputBar ? 116 : 28;
  const viewportHeight = height - contentTop - contentBottom;
  const overflow = Math.max(0, contentHeight - viewportHeight);
  const scrollY =
    autoScroll && mode !== "reveal"
      ? mode === "scroll"
        ? interpolate(
            frame,
            [15, Math.max(16, durationInFrames - 30)],
            [0, -overflow],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        : -overflow
      : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ededed",
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif",
      }}
    >
      <div
        style={{
          width: panelWidth,
          height: "100%",
          position: "absolute",
          left: panelLeft,
          top: 0,
          background: "#ededed",
          overflow: "hidden",
        }}
      >
        {showTopBar ? (
          <>
            <div
              style={{
                height: 72,
                display: "flex",
                alignItems: "center",
                padding: "0 42px",
                background: "#f7f7f7",
                fontSize: 32,
                fontWeight: 650,
              }}
            >
              <span>{statusTime}</span>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 4,
                    height: 25,
                  }}
                >
                  {[10, 15, 20, 25].map((height) => (
                    <span
                      key={height}
                      style={{
                        display: "block",
                        width: 6,
                        height,
                        borderRadius: 3,
                        background: "#111",
                      }}
                    />
                  ))}
                </div>
                <WifiIcon />
                <div
                  style={{
                    width: 48,
                    height: 23,
                    border: "3px solid #111",
                    borderRadius: 6,
                    padding: 3,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "84%",
                      borderRadius: 2,
                      background: "#111",
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                height: 102,
                display: "flex",
                alignItems: "center",
                padding: "0 42px",
                background: "#f7f7f7",
                borderBottom: "1px solid #d8d8d8",
              }}
            >
              <div
                style={{
                  fontSize: 62,
                  fontWeight: 300,
                  lineHeight: 1,
                  transform: "translateY(-3px)",
                }}
              >
                ‹
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 40,
                  fontWeight: 600,
                }}
              >
                {chatTitle}
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 46,
                  letterSpacing: 8,
                  transform: "translateY(-8px)",
                }}
              >
                •••
              </div>
            </div>
          </>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 42,
            right: 42,
            top: contentTop,
            bottom: contentBottom,
            overflow: "hidden",
          }}
        >
          <div
            ref={contentRef}
            style={{
              display: "flow-root",
              paddingBottom: 28,
              transform: `translateY(${scrollY}px)`,
            }}
          >
            {visible.map((message, index) => (
              <WeChatMessage
                key={message.id}
                message={message}
                previous={visible[index - 1]}
                index={message.timelineIndex}
                animated={mode !== "scroll"}
              />
            ))}
          </div>
        </div>
        {showInputBar ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 116,
              display: "flex",
              alignItems: "center",
              padding: "0 38px",
              gap: 22,
              background: "#f7f7f7",
              borderTop: "1px solid #d8d8d8",
            }}
          >
            <VoiceIcon />
            <div
              style={{
                height: 74,
                flex: 1,
                background: "#fff",
                borderRadius: 10,
              }}
            />
            <FaceIcon />
            <PlusIcon />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
