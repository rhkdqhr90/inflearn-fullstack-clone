"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { useState } from "react";

// useState로 싱글톤 보장!
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5분
          gcTime: 10 * 60 * 1000, // 10분 (구 cacheTime)
          retry: 1, // 재시도 1번만
          refetchOnWindowFocus: false, // 포커스 시 재요청 안 함
        },
      },
    })
);

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
  );
}
