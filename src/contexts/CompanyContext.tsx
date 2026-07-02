import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface SelectedCompany {
  companyId: number;
  companyName: string;
  logoUrl: string;
}

interface Ctx {
  selected: SelectedCompany | null;
  setSelected: (c: SelectedCompany | null) => void;
}

const CompanyContext = createContext<Ctx | undefined>(undefined);
const STORAGE_KEY = "selected-company";

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelectedState] = useState<SelectedCompany | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSelectedState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const setSelected = (c: SelectedCompany | null) => {
    setSelectedState(c);
    if (typeof window !== "undefined") {
      if (c) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <CompanyContext.Provider value={{ selected, setSelected }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be inside CompanyProvider");
  return ctx;
}

export function readSelectedCompanyFromStorage(): SelectedCompany | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SelectedCompany) : null;
  } catch {
    return null;
  }
}
