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
    </AbsoluteFill>
  );
};
