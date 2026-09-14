import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractTopics,
  selectDailyTopic,
  validateDailyMessages,
} from "../scripts/daily-lib";
import { estimateLongImageHeight } from "../src/scenes/WeChatLongImage";
import type { ChatMessage } from "../src/components/chat/types";

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

test("daily V2 enforces cold opening, 500 reply and one accepted transfer card", () => {
  const valid = validDailyMessages();
  assert.doesNotThrow(() => validateDailyMessages(valid));

  const wrongOpening = validDailyMessages();
  wrongOpening[0] = { ...wrongOpening[0], role: "left" };
  assert.throws(() => validateDailyMessages(wrongOpening));

  const wrongFee = validDailyMessages();
  wrongFee[4] = { ...wrongFee[4], text: "收到" };
  assert.throws(() => validateDailyMessages(wrongFee));

  const extraReceipt = validDailyMessages();
  extraReceipt[11] = {
    id: "fee-receipt",
    role: "left",
    text: "",
    kind: "transfer",
    transferId: "consultation-fee",
    transferAmount: "500.00",
    transferState: "received",
  };
  assert.throws(() => validateDailyMessages(extraReceipt));
});

test("calculates a bounded long-image height from the complete message list", () => {
  assert.equal(estimateLongImageHeight([]), 1500);
  assert.ok(
    estimateLongImageHeight([
      { id: "1", role: "right", text: "这是一条需要换行的较长微信消息" },
    ]) >= 1500,
  );
});

import { buildReadingTimeline, messageRows, readingUnits } from '../src/scenes/reading';

test('long consultations are accepted and are never cropped to 3200 pixels', () => {
  const messages = validDailyMessages();
  for (let i=0; i<80; i++) messages.push({id:`extra-${i}`,role:'left',text:'保存原始证据，再按实际情况推进维权'});
  assert.doesNotThrow(() => validateDailyMessages(messages));
  assert.ok(estimateLongImageHeight(messages)>3200);
  assert.ok(estimateLongImageHeight(messages)>messageRows(messages).at(-1)!.bottom);
});

test('reading timeline preserves opening, fits payment and reaches the final message', () => {
  const messages=validDailyMessages();
  const t=buildReadingTimeline(messages);
  const rows=messageRows(messages);
  assert.ok(rows[4].bottom*t.scale<1080);
  assert.ok(rows[5].top*t.scale>=1080);
  assert.equal(t.points[0].y,0);
  assert.equal(t.points[1].y,0);
  assert.ok(t.points[1].frame>45);
  for(let i=1;i<t.points.length;i++) {
    assert.ok(t.points[i].frame>t.points[i-1].frame);
    assert.ok(t.points[i].y<=t.points[i-1].y);
  }
  assert.ok(rows.at(-1)!.bottom*t.scale+t.points.at(-1)!.y<=1080);
  assert.ok(buildReadingTimeline(messages,180).durationInFrames>t.durationInFrames);
  assert.throws(()=>buildReadingTimeline(messages,0));
  assert.equal(readingUnits('你好，世界！'),4);
});
