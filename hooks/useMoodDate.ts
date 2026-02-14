"use client";

import { useEffect, useState } from "react";

/**
 * 서버/클라이언트 시각 차이로 인한 하이드레이션 에러를 방지하며
 * 날짜 상태를 관리하는 훅 (SRP: 날짜 상태 단일 책임)
 */
export function useMoodDate() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setDate(new Date());
  }, []);

  return { date, setDate };
}
