import React from "react";
import type { ChatRole } from "./types";

export type TransferState = "pending" | "accepted" | "received";
export const TRANSFER_LABELS = {
  pending: "待收款",
  accepted: "已被接收",
  received: "已收款",
} as const;
export const formatAmount = (amount: string | number = 500) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0)
    throw new Error("转账金额必须大于0");
  return value.toFixed(2);
};

/** A screenshot-style transfer bubble. The tail belongs to this component. */
export const TransferCard: React.FC<{
  amount?: string | number;
  state?: TransferState;
  side?: ChatRole;
  width?: number;
}> = ({ amount = 500, state = "accepted", side = "left", width = 588 }) => {
  const color = state === "pending" ? "#f5a447" : "#fbd0a0";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      viewBox="0 0 604 208"
      style={{ display: "block", maxWidth: "100%", overflow: "visible" }}
      role="img"
      aria-label={`转账 ${formatAmount(amount)}元 ${TRANSFER_LABELS[state]}`}
    >
      <rect x="8" width="588" height="208" rx="10" fill={color} />
      <path
        d={
          side === "left" ? "M9 35 L-5 48 L9 61 Z" : "M595 35 L609 48 L595 61 Z"
        }
        fill={color}
      />
      <circle
        cx="84"
        cy="79"
        r="49"
        fill="none"
        stroke="white"
        strokeWidth="5"
      />
      {state === "pending" ? (
        <path
          d="M56 68 H108 L96 56 M108 90 H56 L68 102"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M61 79 L78 96 L109 65"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <g
        fill="white"
        fontFamily="'Noto Sans CJK SC', 'Noto Sans SC', Arial, 'Microsoft YaHei', sans-serif"
      >
        <text x="157" y="72" fontSize="40">
          ¥{formatAmount(amount)}
        </text>
        <text x="157" y="119" fontSize="32">
          {TRANSFER_LABELS[state]}
        </text>
        <text x="32" y="179" fontSize="27">
          转账
        </text>
      </g>
    </svg>
  );
};
