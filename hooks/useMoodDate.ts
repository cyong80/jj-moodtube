"use client";

import { useState } from "react";

/**
 * 날짜 상태를 관리하는 훅 (SRP: 날짜 상태 단일 책임)
 * 초기값은 오늘 날짜로 설정하여 당일 저장 데이터를 즉시 조회
 */
export function useMoodDate() {
  const [date, setDate] = useState<Date>(() => new Date());

  return { date, setDate };
}
