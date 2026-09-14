import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractTopics,
  selectDailyTopic,
  validateDailyMessages,
} from "../scripts/daily-lib";
import { createConsultationTransfer } from "../src/components/chat/transfers";
import { estimateLongImageHeight } from "../src/scenes/WeChatLongImage";

test("extracts source entries without changing their order", () => {
  assert.deepEqual(extractTopics("# 标题\n1. 第一条\n2. 第二条\n"), [
    "第一条",
    "第二条",
  ]);
});

test("selects the same topic for the same production date", () => {
  const topics = ["甲", "乙", "丙"];
  assert.equal(
    selectDailyTopic(topics, "2026-09-14"),
    selectDailyTopic(topics, "2026-09-14"),
  );
});

test("daily scene requires exactly one right-to-left 500-yuan transaction", () => {
  const [sent, receipt] = createConsultationTransfer({
    id: "consultation-fee",
  });
  const texts = Array.from({ length: 10 }, (_, index) => ({
    id: `text-${index}`,
    role: (index % 2 === 0 ? "right" : "left") as "right" | "left",
    text: `消息${index}`,
  }));
  assert.doesNotThrow(() => validateDailyMessages([...texts, sent, receipt]));
  assert.throws(() =>
    validateDailyMessages([...texts.slice(1), sent, receipt]),
  );
});

test("calculates a bounded long-image height from the complete message list", () => {
  assert.equal(estimateLongImageHeight([]), 1500);
  assert.ok(
    estimateLongImageHeight([
      { id: "1", role: "right", text: "这是一条需要换行的较长微信消息" },
    ]) >= 1500,
  );
});
