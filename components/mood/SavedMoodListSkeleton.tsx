"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 저장된 기분 기록 목록 로딩 스켈레톤
 */
export function SavedMoodListSkeleton() {
  return (
    <div className="w-full space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="w-full space-y-6">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="overflow-hidden w-full rounded-xl sm:rounded-2xl"
          >
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-md flex-shrink-0" />
                  <Skeleton className="h-8 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[75%]" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div
                      key={j}
                      className="flex gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <Skeleton className="w-20 h-14 sm:w-24 sm:h-16 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
