export type ChatRole = "left" | "right";

export type ChatMedia = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  durationLabel?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  kind?: "text" | "transfer" | "image" | "video";
  transferAmount?: string;
  /** Legacy text is accepted for migrated scenes. Prefer transferState. */
  transferStatus?: string;
  transferState?: "pending" | "accepted" | "received";
  transferId?: string;
  avatar?: string;
  timeLabel?: string;
  highlight?: boolean;
  media?: ChatMedia;
  /** Optional deterministic reveal time. Falls back to the index-based cadence. */
  startFrame?: number;
};

export type ChatMode = "reveal" | "scroll" | "mixed";
export type ChatLayout =
  | "landscape-centered"
  | "landscape-left"
  | "portrait"
  | "full";
