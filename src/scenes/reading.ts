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
  // Fit the variable-length question stack and the lawyer's 500 reply into the opening.
  const scale = Math.min(
    1.7,
    1080 / ((rows[feePromptIndex]?.bottom ?? 600) + 18),
  );
  const overflow = Math.max(0, imageHeight * scale - 1080);
  let frame = 0;
  const points = [{ frame: 0, y: 0 }];
  const readFrames = (text: string) =>
    Math.ceil(Math.max(0.8, (readingUnits(text) * 60) / cpm + 0.25) * fps);
  frame += readFrames(
    messages
      .slice(0, feePromptIndex + 1)
      .map((message) => message.text)
      .join(""),
  );
  points.push({ frame, y: 0 });
  for (let i = Math.max(0, feeCardIndex); i < messages.length; i++) {
    const y = -Math.min(
      overflow,
      Math.max(0, rows[i].bottom * scale - 1080 + 72),
    );
    frame += Math.ceil(0.35 * fps);
    points.push({ frame, y });
    frame +=
      messages[i].kind === "transfer"
        ? Math.ceil(1.2 * fps)
        : readFrames(messages[i].text);
    points.push({ frame, y });
  }
  return {
    points,
    imageHeight,
    scale,
    durationInFrames: frame + 1,
    cpm,
    fps,
    readingUnits: messages.reduce((n, m) => n + readingUnits(m.text), 0),
  };
};
