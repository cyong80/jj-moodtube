"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 저장된 기분 기록 목록 로딩 스켈레톤 - 라이너 노트 스타일 (트랙 번호 + 아이콘)에 맞춤
 */
export function SavedMoodListSkeleton() {
  return (
    <div className="w-full space-y-5">
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-4 w-4 shrink-0 rounded" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="w-full space-y-4">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="overflow-hidden w-full border-l-[3px] border-l-primary/20 rounded-xl"
          >
            <div className="p-4 sm:p-5 pl-5 sm:pl-6 -ml-[3px] border-l-[3px] border-l-transparent space-y-4">
              <Skeleton className="h-6 w-40" />
              <ul className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                  <li key={j} className="flex items-center gap-3 py-1.5">
                    <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                    <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <Skeleton className="h-4 w-20 shrink-0" />
                      <Skeleton className="h-4 flex-1 max-w-[50%]" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
