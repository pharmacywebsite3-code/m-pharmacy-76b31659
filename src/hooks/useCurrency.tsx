import { createContext, useContext, useState, type ReactNode } from "react";

export type Currency = "USD" | "ETB";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggle: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const toggle = () => setCurrency((c) => (c === "USD" ? "ETB" : "USD"));
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggle }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
