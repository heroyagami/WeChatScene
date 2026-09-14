import { z } from "zod";
import { validateTransfers } from "./components/chat/transfers";

export const messageSchema = z
  .object({
    id: z.string().min(1),
    role: z.enum(["left", "right"]),
    text: z.string(),
    kind: z.enum(["text", "transfer", "image", "video"]).optional(),
    transferId: z.string().min(1).optional(),
    transferAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .optional(),
    transferState: z.enum(["pending", "accepted", "received"]).optional(),
    transferStatus: z.enum(["待收款", "已被接收", "已收款"]).optional(),
    avatar: z.string().min(1).optional(),
    timeLabel: z.string().optional(),
    highlight: z.boolean().optional(),
    startFrame: z.number().int().nonnegative().optional(),
    media: z
      .object({
        src: z.string().min(1),
        alt: z.string().optional(),
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        durationLabel: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((message, ctx) => {
    if (
      (message.kind === "image" || message.kind === "video") &&
      !message.media
    )
      ctx.addIssue({ code: "custom", message: "图片和视频缩略卡需要 media" });
  });

export const sceneSchema = z
  .object({
    messages: z.array(messageSchema),
    mode: z.enum(["scroll", "reveal", "mixed"]).default("scroll"),
    layout: z
      .enum(["full", "portrait", "landscape-centered", "landscape-left"])
      .default("full"),
    showTopBar: z.boolean().default(false),
    showInputBar: z.boolean().default(false),
    showTimeDivider: z.boolean().default(true),
    autoScroll: z.boolean().default(true),
    chatTitle: z.string().default("律师咨询"),
    statusTime: z.string().default("08:05"),
    highlightIndexes: z.array(z.number().int().nonnegative()).default([]),
    width: z.number().int().min(600).default(1080),
    height: z.number().int().min(400).default(1440),
    fps: z.number().int().min(1).max(120).default(30),
    durationInFrames: z.number().int().min(1).default(450),
  })
  .superRefine((props, ctx) => {
    try {
      validateTransfers(props.messages);
    } catch (error) {
      ctx.addIssue({ code: "custom", message: String(error) });
    }
  });
