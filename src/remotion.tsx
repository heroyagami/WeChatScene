import React from "react";
import { Composition, Still, registerRoot } from "remotion";
import { WeChatScene } from "./scenes/WeChatScene";
import { TransferCard } from "./components/chat/TransferCard";
import { exampleMessages } from "./example";
import { sceneSchema } from "./schema";

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
    <TransferCard side="left" state="accepted" width={604} />
  </div>
);
const Received = () => (
  <div style={{ padding: 16 }}>
    <TransferCard side="right" state="received" width={604} />
  </div>
);
const Pending = () => (
  <div style={{ padding: 16 }}>
    <TransferCard side="left" state="pending" width={604} />
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
  </>
);
registerRoot(Root);
