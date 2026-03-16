import { NextResponse } from "next/server";

import {
  findMemoById,
  updateMemo,
} from "@/src/server/memos/in-memory-memos";

type RouteContext = {
  params: Promise<{
    memoId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { memoId } = await context.params;
  const memo = await findMemoById(memoId);

  if (!memo) {
    return NextResponse.json({ error: "Memo not found" }, { status: 404 });
  }

  const factCheck = {
    claims: [memo.thesisText],
    verifiable_claims: [
      `${memo.symbol} 최근 실적 성장률과 가이던스 변화를 확인할 수 있는 주장입니다.`,
    ],
    opinion_claims: [
      "하방이 제한적이다.",
    ],
    supporting_evidence: [
      { title: "기업 공시 요약", source: "Investor Relations" },
      { title: "업종 밸류에이션 비교", source: "Market Data" },
    ],
    contradicting_evidence: [
      { title: "수요 둔화 가능성 리포트", source: "Financial Media" },
    ],
    related_news: [
      { title: `${memo.symbol} 관련 최신 뉴스`, source: "News Feed" },
    ],
    confidence: 0.68,
    citationCount: 2,
    disclaimer: "금융 정보 제공 목적이며 투자 자문이 아닙니다.",
  };

  const updated = await updateMemo(memoId, {
    factCheckStatus: "COMPLETED",
    citationCount: factCheck.citationCount,
  });

  if (!updated) {
    return NextResponse.json({ error: "Memo not found" }, { status: 404 });
  }

  return NextResponse.json({
    memo: updated,
    factCheck,
  });
}
