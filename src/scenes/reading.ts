import type { ChatMessage } from "../components/chat/types";

// Use the same explicit line breaks and row metrics for layout and timing.
export const textLines = (text: string) =>
  text.split("\n").flatMap((line) => {
    const chars = Array.from(line);
    return Array.from(
      { length: Math.max(1, Math.ceil(chars.length / 20)) },
      (_, i) => chars.slice(i * 20, (i + 1) * 20).join(""),
    );
  });

export const messageRows = (messages: ChatMessage[]) => {
  let bottom = 36;
  return messages.map((m, i) => {
    const top = bottom + (i && messages[i - 1].role !== m.role ? 38 : 22);
    bottom =
      top +
      (m.timeLabel ? 122 : 0) +
      (m.kind === "transfer"
        ? 208
        : Math.max(88, textLines(m.text).length * 54 + 36));
    return { top, bottom };
  });
};

export const readingUnits = (text: string) =>
  Array.from(text.replace(/[\s\p{P}]/gu, "")).length;

export const buildReadingTimeline = (
  messages: ChatMessage[],
  cpm = 360,
  fps = 30,
) => {
  if (!Number.isFinite(cpm) || cpm <= 0) throw new Error("阅读速度必须为正数");

  const rows = messageRows(messages);
  const imageHeight = Math.max(1500, (rows.at(-1)?.bottom ?? 36) + 72);
  const feeCardIndex = messages.findIndex(
    (message) =>
      message.kind === "transfer" && message.transferState === "accepted",
  );
  const feePromptIndex = Math.max(0, feeCardIndex - 1);

  // Keep the opening question stack and the lawyer's "500" visible in frame 1.
  const scale = Math.min(
    1.7,
    1080 / ((rows[feePromptIndex]?.bottom ?? 600) + 18),
  );
  const overflow = Math.max(0, imageHeight * scale - 1080);

  // Reading speed determines the duration of the scrolling segment only.
  // The first two seconds are a fixed cover/title hold. After that the camera moves
  // continuously and linearly from the top of the long image to the bottom.
  const totalReadingUnits = messages.reduce(
    (sum, message) => sum + readingUnits(message.text),
    0,
  );
  const transferCount = messages.filter((message) => message.kind === "transfer").length;
  const textSeconds = (totalReadingUnits * 60) / cpm;
  const comprehensionSeconds = messages.length * 0.12 + transferCount * 0.8;
  const scrollSeconds = Math.max(8, textSeconds + comprehensionSeconds);
  const coverHoldFrames = Math.max(1, Math.round(fps * 2));
  const scrollFrames = Math.max(2, Math.ceil(scrollSeconds * fps));
  const durationInFrames = coverHoldFrames + scrollFrames;

  const points = [
    { frame: 0, y: 0 },
    { frame: coverHoldFrames, y: 0 },
    { frame: durationInFrames - 1, y: -overflow },
  ];

  return {
    points,
    imageHeight,
    scale,
    durationInFrames,
    cpm,
    fps,
    readingUnits: totalReadingUnits,
    coverHoldSeconds: 2,
    motion: "cover-hold-then-linear" as const,
  };
};
