import React from "react";
import { Composition, Still, registerRoot } from "remotion";
import { WeChatScene } from "./scenes/WeChatScene";
import { TransferCard } from "./components/chat/TransferCard";
import { exampleMessages } from "./example";
import { sceneSchema } from "./schema";
import {
  LONG_IMAGE_HEIGHT,
  LONG_IMAGE_WIDTH,
  WeChatLongImage,
  estimateLongImageHeight,
} from "./scenes/WeChatLongImage";
import { WeChatImageScroll } from "./scenes/WeChatImageScroll";

const Portrait = sceneSchema.parse({ messages: exampleMessages });
const Landscape = {
  ...Portrait,
  width: 1920,
  height: 1080,
  layout: "landscape-centered" as const,
};
// Space around the SVG preserves its tail; the page background remains transparent.
const Sent = () => (
  <div style={{ padding: 16 }}>
    <TransferCard side="right" state="accepted" width={604} />
  </div>
);
const Received = () => (
  <div style={{ padding: 16 }}>
    <TransferCard side="left" state="received" width={604} />
  </div>
);
const Pending = () => (
  <div style={{ padding: 16 }}>
    <TransferCard side="right" state="pending" width={604} />
  </div>
);
const Root = () => (
  <>
    {[
      ["WeChatPortrait", Portrait],
      ["WeChatLandscape", Landscape],
    ].map(([id, defaults]) => {
      const props = defaults as typeof Portrait;
      return (
        <Composition
          key={String(id)}
          id={String(id)}
          component={WeChatScene}
          defaultProps={props}
          width={props.width}
          height={props.height}
          fps={props.fps}
          durationInFrames={props.durationInFrames}
          calculateMetadata={({ props: input }) => {
            const p = sceneSchema.parse(input);
            return {
              props: p,
              width: p.width,
              height: p.height,
              fps: p.fps,
              durationInFrames: p.durationInFrames,
            };
          }}
        />
      );
    })}
    <Still id="TransferSent" component={Sent} width={636} height={240} />
    <Still
      id="TransferReceived"
      component={Received}
      width={636}
      height={240}
    />
    <Still id="TransferPending" component={Pending} width={636} height={240} />
    <Still
      id="WeChatLongImage"
      component={WeChatLongImage}
      defaultProps={{ messages: exampleMessages }}
      width={LONG_IMAGE_WIDTH}
      height={LONG_IMAGE_HEIGHT}
      calculateMetadata={({ props }) => ({
        height: estimateLongImageHeight(props.messages),
      })}
    />
    <Composition
      id="WeChatImageScroll"
      component={WeChatImageScroll}
      defaultProps={{
        imageSrc: "generated/daily-chat.png",
        imageWidth: LONG_IMAGE_WIDTH,
        imageHeight: LONG_IMAGE_HEIGHT,
        holdFrames: 45,
        durationInFrames: 1800,
      }}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1800}
      calculateMetadata={({props}) => ({durationInFrames: Number(props.durationInFrames ?? 1800)})}
    />
  </>
);
registerRoot(Root);
