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
  holdFrames = 45,
  frameFill = 0.95,
  maxScale = 1.7,
  bgmSrc,
  bgmVolume = 0.09,
  bgmFadeInSeconds = 0.8,
  bgmFadeOutSeconds = 1.2,
  coverTag,
  coverTitle,
  coverHoldSeconds = 1,
  coverFadeOutSeconds = 0.2,
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
            top: "56%",
            transform: "translate(-50%, -50%)",
            width: Math.min(1040, width * 0.64),
            padding: "64px 62px 50px",
            borderRadius: 34,
            background: "rgba(24, 29, 27, 0.74)",
            boxShadow: "0 18px 44px rgba(0,0,0,0.24)",
            opacity: coverOpacity,
            textAlign: "center",
            zIndex: 5,
          }}
        >
          {coverTag ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 180,
                height: 58,
                padding: "0 30px",
                borderRadius: 999,
                background: "#07c160",
                color: "white",
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: 26,
              }}
            >
              {coverTag}
            </div>
          ) : null}
          {coverTitle ? (
            <div
              style={{
                color: "white",
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.18,
                letterSpacing: -1.5,
                whiteSpace: "pre-line",
                textShadow: "0 3px 10px rgba(0,0,0,0.34)",
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
