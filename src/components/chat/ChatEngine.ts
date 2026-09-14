import type { ChatMessage, ChatMode } from "./types";

export const CHAT_TIMING = {
  revealGapFrames: 33,
  revealDurationFrames: 10,
  highlightHoldFrames: 54,
  sameSpeakerGapPx: 14,
  speakerSwitchGapPx: 30,
  timeGapPx: 42,
} as const;

export const getMessageStartFrame = (message: ChatMessage, index: number) =>
  Math.max(
    0,
    Math.floor(message.startFrame ?? index * CHAT_TIMING.revealGapFrames),
  );

export const buildChatTimeline = (messages: ChatMessage[]) =>
  messages.map((message, index) => ({
    id: message.id,
    startFrame: getMessageStartFrame(message, index),
  }));

export const getVisibleMessages = ({
  frame,
  messages,
  mode,
}: {
  frame: number;
  messages: ChatMessage[];
  mode: ChatMode;
}) =>
  mode === "scroll"
    ? messages
    : messages.filter(
        (message, index) => frame >= getMessageStartFrame(message, index),
      );

export const getVisibleCount = ({
  frame,
  messages,
  mode,
}: {
  frame: number;
  messages: ChatMessage[];
  mode: ChatMode;
}) => {
  return getVisibleMessages({ frame, messages, mode }).length;
};

export const getAutoScrollY = ({
  frame,
  visibleCount,
  messages,
  estimatedRowHeight = 138,
  viewportHeight = 760,
}: {
  frame: number;
  visibleCount: number;
  messages?: ChatMessage[];
  estimatedRowHeight?: number;
  viewportHeight?: number;
}) => {
  const estimatedContentHeight = visibleCount * estimatedRowHeight + 80;
  const overflow = Math.max(0, estimatedContentHeight - viewportHeight);
  if (overflow === 0) return 0;
  const latestIndex = Math.max(0, visibleCount - 1);
  const latestRevealFrame = messages?.[latestIndex]
    ? getMessageStartFrame(messages[latestIndex], latestIndex)
    : latestIndex * CHAT_TIMING.revealGapFrames;
  const settle = Math.min(1, Math.max(0, (frame - latestRevealFrame) / 24));
  return -overflow * settle;
};
