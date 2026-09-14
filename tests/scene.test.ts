import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createConsultationTransfer,
  validateTransfers,
} from "../src/components/chat/transfers";
import { getVisibleMessages } from "../src/components/chat/ChatEngine";
import { sceneSchema } from "../src/schema";
import { formatAmount } from "../src/components/chat/TransferCard";

test("consultation creates one 500-yuan transfer and its opposite-side receipt", () => {
  const pair = createConsultationTransfer({ id: "a" });
  assert.deepEqual(
    pair.map((m) => [m.role, m.transferAmount, m.transferState, m.transferId]),
    [
      ["right", "500.00", "accepted", "a"],
      ["left", "500.00", "received", "a"],
    ],
  );
  validateTransfers(pair);
});
test("rejects missing sender, duplicate receipt, incorrect amount and wrong side", () => {
  const [sent, receipt] = createConsultationTransfer({ id: "a" });
  for (const messages of [
    [receipt],
    [sent, receipt, { ...receipt, id: "extra" }],
    [sent, { ...receipt, transferAmount: "600" }],
    [sent, { ...receipt, role: "right" as const }],
    [{ ...sent, transferState: "pending" as const }, receipt],
  ])
    assert.throws(() => validateTransfers(messages));
});
test("enforces consultant on the right and lawyer receipt on the left", () => {
  const [sent, receipt] = createConsultationTransfer({ id: "a" });
  assert.throws(() => validateTransfers([{ ...sent, role: "left" }, receipt]));
  assert.throws(() => validateTransfers([sent, { ...receipt, role: "right" }]));
});
test("rejects duplicate message ids", () =>
  assert.throws(() =>
    validateTransfers([
      { id: "x", role: "left", text: "a" },
      { id: "x", role: "right", text: "b" },
    ]),
  ));
test("scroll shows the whole page from frame zero, even with later startFrame", () => {
  const messages = createConsultationTransfer({ id: "a" }).map((m) => ({
    ...m,
    startFrame: 200,
  }));
  assert.equal(
    getVisibleMessages({ messages, frame: 0, mode: "scroll" }).length,
    2,
  );
  assert.equal(
    getVisibleMessages({ messages, frame: 0, mode: "reveal" }).length,
    0,
  );
});
test("default scene is portrait with scroll and no added bars", () => {
  const props = sceneSchema.parse({ messages: [] });
  assert.equal(props.mode, "scroll");
  assert.equal(props.width, 1080);
  assert.equal(props.height, 1440);
  assert.equal(props.showTopBar, false);
  assert.equal(props.showInputBar, false);
});
test("runtime schema validates external JSON transactions and media", () => {
  const [sent, receipt] = createConsultationTransfer({ id: "a" });
  assert.equal(
    sceneSchema.safeParse({
      messages: [sent, { ...receipt, transferAmount: "1" }],
    }).success,
    false,
  );
  assert.equal(
    sceneSchema.safeParse({
      messages: [{ id: "x", role: "left", text: "", kind: "video" }],
    }).success,
    false,
  );
  assert.equal(
    sceneSchema.safeParse({ messages: [], durationInFrames: 0 }).success,
    false,
  );
});
test("amount is configurable and validated", () => {
  assert.equal(formatAmount("500"), "500.00");
  assert.equal(formatAmount(12.5), "12.50");
  for (const value of [0, -1, "NaN", Infinity])
    assert.throws(() => formatAmount(value));
});
