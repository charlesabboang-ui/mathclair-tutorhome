import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from "react";
import type { SeoContext } from "@/components/Seo";

interface Store {
  seo: SeoContext;
  setSeo: (c: SeoContext) => void;
}

const Ctx = createContext<Store>({ seo: {}, setSeo: () => {} });

export function SeoContextProvider({ children }: { children: ReactNode }) {
  const [seo, setSeoState] = useState<SeoContext>({});
  const setSeo = useCallback((c: SeoContext) => {
    setSeoState((prev) =>
      prev.subject === c.subject && prev.level === c.level && prev.exam === c.exam ? prev : c,
    );
  }, []);
  const value = useMemo(() => ({ seo, setSeo }), [seo, setSeo]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSeoContext() {
  return useContext(Ctx);
}
