import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LONG_IMAGE_HEIGHT, LONG_IMAGE_WIDTH } from "./WeChatLongImage";

export const WeChatImageScroll: React.FC<{
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  holdFrames?: number;
  frameFill?: number;
  maxScale?: number;
}> = ({
  imageSrc = "generated/daily-chat.png",
  imageWidth = LONG_IMAGE_WIDTH,
  imageHeight = LONG_IMAGE_HEIGHT,
  holdFrames = 45,
  frameFill = 0.95,
  maxScale = 1.7,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const renderedWidth =
    width <= imageWidth
      ? width
      : Math.min(width * frameFill, imageWidth * maxScale);
  const renderedHeight = (imageHeight / imageWidth) * renderedWidth;
  const overflow = Math.max(0, renderedHeight - height);
  const left = (width - renderedWidth) / 2;
  const y = interpolate(
    frame,
    [holdFrames, Math.max(holdFrames + 1, durationInFrames - holdFrames - 1)],
    [0, -overflow],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#ededed", overflow: "hidden" }}>
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
