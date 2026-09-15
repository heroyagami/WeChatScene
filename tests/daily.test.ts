import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractTopics,
  selectDailyTopic,
  validateDailyMessages,
} from "../scripts/daily-lib";
import { estimateLongImageHeight } from "../src/scenes/WeChatLongImage";
import type { ChatMessage } from "../src/components/chat/types";
import {
  CONSULTANT_AVATARS,
  selectConsultantAvatar,
} from "../src/components/chat/consultantAvatars";

const validDailyMessages = (): ChatMessage[] => [
  { id: "01", role: "right", text: "曹律，我遇到一个麻烦" },
  { id: "02", role: "right", text: "相关内容已经传播出去" },
  { id: "03", role: "right", text: "现在还有人在继续转发" },
  { id: "04", role: "right", text: "这种情况应该怎么办" },
  { id: "05", role: "left", text: "500" },
  {
    id: "fee-sent",
    role: "right",
    text: "",
    kind: "transfer",
    transferId: "consultation-fee",
    transferAmount: "500.00",
    transferState: "accepted",
  },
  { id: "07", role: "left", text: "先固定现有证据" },
  { id: "08", role: "right", text: "具体要留哪些" },
  { id: "09", role: "left", text: "原始内容和转发记录都保存" },
  { id: "10", role: "left", text: "再判断对应的法律关系" },
  { id: "11", role: "right", text: "已经影响正常生活了" },
  { id: "12", role: "left", text: "整理后再确定下一步方案" },
  {
    id: "fee-receipt",
    role: "left",
    text: "",
    kind: "transfer",
    transferId: "consultation-fee",
    transferAmount: "500.00",
    transferState: "received",
  },
];

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

test("daily V2 accepts 3—5 opening questions, starts with accepted card and ends with receipt", () => {
  const valid = validDailyMessages();
  assert.doesNotThrow(() => validateDailyMessages(valid));

  const threeQuestions = validDailyMessages();
  threeQuestions.splice(3, 1);
  assert.doesNotThrow(() => validateDailyMessages(threeQuestions));

  const fiveQuestions = validDailyMessages();
  fiveQuestions.splice(4, 0, {
    id: "04b",
    role: "right",
    text: "我现在应该先做什么",
  });
  assert.doesNotThrow(() => validateDailyMessages(fiveQuestions));

  const wrongOpening = validDailyMessages();
  wrongOpening[0] = { ...wrongOpening[0], role: "left" };
  assert.throws(() => validateDailyMessages(wrongOpening));

  const wrongFee = validDailyMessages();
  wrongFee[4] = { ...wrongFee[4], text: "收到" };
  assert.throws(() => validateDailyMessages(wrongFee));

  const receiptTooEarly = validDailyMessages();
  const receipt = receiptTooEarly.pop()!;
  receiptTooEarly.splice(6, 0, receipt);
  assert.throws(() => validateDailyMessages(receiptTooEarly));

  const missingReceipt = validDailyMessages();
  missingReceipt.pop();
  assert.throws(() => validateDailyMessages(missingReceipt));
});

test("calculates a bounded long-image height from the complete message list", () => {
  assert.equal(estimateLongImageHeight([]), 1500);
  assert.ok(
    estimateLongImageHeight([
      { id: "1", role: "right", text: "这是一条需要换行的较长微信消息" },
    ]) >= 1500,
  );
});

import {
  buildReadingTimeline,
  messageRows,
  readingUnits,
} from "../src/scenes/reading";

test("long consultations are accepted and are never cropped to 3200 pixels", () => {
  const messages = validDailyMessages();
  const receipt = messages.pop()!;
  for (let i = 0; i < 80; i++)
    messages.push({
      id: `extra-${i}`,
      role: "left",
      text: "保存原始证据，再按实际情况推进维权",
    });
  messages.push(receipt);
  assert.doesNotThrow(() => validateDailyMessages(messages));
  assert.ok(estimateLongImageHeight(messages) > 3200);
  assert.ok(
    estimateLongImageHeight(messages) > messageRows(messages).at(-1)!.bottom,
  );
});

test("reading timeline holds cover for two seconds then scrolls linearly to the bottom", () => {
  const messages = validDailyMessages();
  const t = buildReadingTimeline(messages);
  const rows = messageRows(messages);
  assert.ok(rows[4].bottom * t.scale < 1080);
  assert.ok(rows[5].top * t.scale >= 1080);
  assert.equal(t.points.length, 3);
  assert.deepEqual(t.points[0], { frame: 0, y: 0 });
  assert.deepEqual(t.points[1], { frame: 60, y: 0 });
  assert.equal(t.points[2].frame, t.durationInFrames - 1);
  assert.ok(t.points[2].y < 0);
  assert.equal(t.coverHoldSeconds, 2);
  assert.equal(t.motion, "cover-hold-then-linear");
  assert.ok(rows.at(-1)!.bottom * t.scale + t.points[2].y <= 1080);
  assert.ok(
    buildReadingTimeline(messages, 180).durationInFrames > t.durationInFrames,
  );
  assert.throws(() => buildReadingTimeline(messages, 0));
  assert.equal(readingUnits("你好，世界！"), 4);
});

test("rotates through all captured consultant avatars deterministically", () => {
  assert.equal(CONSULTANT_AVATARS.length, 70);
  assert.deepEqual(
    selectConsultantAvatar("2026-09-14"),
    selectConsultantAvatar("2026-09-14"),
  );
  assert.notDeepEqual(
    selectConsultantAvatar("2026-09-14"),
    selectConsultantAvatar("2026-09-15"),
  );
});
