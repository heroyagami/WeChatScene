import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LONG_IMAGE_HEIGHT, LONG_IMAGE_WIDTH } from "./WeChatLongImage";

export const WeChatImageScroll: React.FC<{
  durationInFrames?: number;
  points?: { frame: number; y: number }[];
  scale?: number;
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  holdFrames?: number;
  frameFill?: number;
  maxScale?: number;
  bgmSrc?: string;
  bgmVolume?: number;
  bgmFadeInSeconds?: number;
  bgmFadeOutSeconds?: number;
  coverTag?: string;
  coverTitle?: string;
  coverHoldSeconds?: number;
  coverFadeOutSeconds?: number;
}> = ({
  points,
  scale,
  imageSrc = "generated/daily-chat.png",
  imageWidth = LONG_IMAGE_WIDTH,
  imageHeight = LONG_IMAGE_HEIGHT,
  holdFrames = 60,
  frameFill = 0.95,
  maxScale = 1.7,
  bgmSrc,
  bgmVolume = 0.09,
  bgmFadeInSeconds = 0.8,
  bgmFadeOutSeconds = 1.2,
  coverTag,
  coverTitle,
  coverHoldSeconds = 2,
  coverFadeOutSeconds = 0.25,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height, fps } = useVideoConfig();
  const renderedWidth = scale
    ? imageWidth * scale
    : width <= imageWidth
      ? width
      : Math.min(width * frameFill, imageWidth * maxScale);
  const renderedHeight = (imageHeight / imageWidth) * renderedWidth;
  const overflow = Math.max(0, renderedHeight - height);
  const left = (width - renderedWidth) / 2;
  const y = points?.length
    ? interpolate(
        frame,
        points.map((p) => p.frame),
        points.map((p) => p.y),
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : interpolate(
        frame,
        [
          holdFrames,
          Math.max(holdFrames + 1, durationInFrames - holdFrames - 1),
        ],
        [0, -overflow],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );

  const fadeInFrames = Math.max(1, Math.round(bgmFadeInSeconds * fps));
  const fadeOutFrames = Math.max(1, Math.round(bgmFadeOutSeconds * fps));
  const fadeIn = interpolate(frame, [0, fadeInFrames], [0, bgmVolume], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [Math.max(0, durationInFrames - fadeOutFrames), durationInFrames - 1],
    [bgmVolume, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const currentBgmVolume = Math.min(bgmVolume, fadeIn, fadeOut);

  const titleLines = (coverTitle ?? "").split("\n").filter(Boolean);
  const longestTitleLine = Math.max(
    1,
    ...titleLines.map((line) => Array.from(line).length),
  );
  const coverFontSize =
    longestTitleLine <= 7 ? 68 : longestTitleLine <= 9 ? 60 : 52;

  const coverHoldFrames = Math.max(1, Math.round(coverHoldSeconds * fps));
  const coverFadeFrames = Math.max(1, Math.round(coverFadeOutSeconds * fps));
  const coverOpacity = interpolate(
    frame,
    [Math.max(0, coverHoldFrames - coverFadeFrames), coverHoldFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#ededed", overflow: "hidden" }}>
      {bgmSrc ? (
        <Audio
          src={/^(?:https?:|data:|blob:)/.test(bgmSrc) ? bgmSrc : staticFile(bgmSrc)}
          loop
          volume={currentBgmVolume}
        />
      ) : null}
      <Img
        src={
          /^(?:https?:|data:|blob:)/.test(imageSrc)
            ? imageSrc
            : staticFile(imageSrc)
        }
        style={{
          position: "absolute",
          left,
          top: 0,
          width: renderedWidth,
          height: renderedHeight,
          transform: `translateY(${y}px)`,
        }}
      />
      {(coverTag || coverTitle) && coverOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "51%",
            transform: "translate(-50%, -50%)",
            width: Math.min(560, width * 0.292),
            boxSizing: "border-box",
            padding: "76px 38px 42px",
            borderRadius: 30,
            background: "rgba(24, 29, 27, 0.84)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 22px 52px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            opacity: coverOpacity,
            textAlign: "center",
            zIndex: 5,
          }}
        >
          {coverTag ? (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -34,
                transform: "translateX(-50%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 168,
                height: 62,
                padding: "0 28px",
                boxSizing: "border-box",
                borderRadius: 999,
                background: "linear-gradient(180deg, #13c66a 0%, #079e4e 100%)",
                border: "3px solid rgba(151, 242, 187, 0.72)",
                boxShadow: "0 8px 20px rgba(0, 126, 62, 0.36)",
                color: "white",
                fontFamily:
                  "'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
                fontSize: 31,
                fontWeight: 800,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {coverTag}
            </div>
          ) : null}
          {coverTitle ? (
            <div
              style={{
                color: "white",
                fontFamily:
                  "'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
                fontSize: coverFontSize,
                fontWeight: 900,
                lineHeight: 1.16,
                letterSpacing: 0,
                whiteSpace: "pre-line",
                wordBreak: "keep-all",
                textShadow:
                  "0 3px 0 rgba(0,0,0,0.42), 0 7px 16px rgba(0,0,0,0.5)",
                WebkitTextStroke: "1px rgba(0,0,0,0.2)",
              }}
            >
              {coverTitle}
            </div>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
