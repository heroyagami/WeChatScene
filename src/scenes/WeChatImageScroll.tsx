import React from "react";
import {
  AbsoluteFill,
  Easing,
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
}> = ({
  imageSrc = "generated/daily-chat.png",
  imageWidth = LONG_IMAGE_WIDTH,
  imageHeight = LONG_IMAGE_HEIGHT,
  holdFrames = 45,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const renderedWidth = Math.min(width, imageWidth);
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
      easing: Easing.inOut(Easing.cubic),
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
