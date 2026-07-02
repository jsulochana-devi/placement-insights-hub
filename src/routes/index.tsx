import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, memo } from "react";
import {
  MapPin,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import { getAllCompanySummaries, type CompanySummary } from "@/lib/companyData";
import { COLLEGE_NAME, COLLEGE_SHORT } from "@/data/seedCompanies";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany } from "@/contexts/CompanyContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COLLEGE_SHORT} Placement Intelligence Hub` },
      {
        name: "description",
        content:
          "Research top recruiters and analyze skill readiness for campus placements at Sri Venkateswara College of Engineering.",
      },
    ],
  }),
  component: Index,
});

const CATEGORY_COLORS: Record<string, string> = {
  "Super Dream": "bg-[#7c3aed] text-white",
  Dream: "bg-[#2563eb] text-white",
  Standard: "bg-[#16a34a] text-white",
  Regular: "bg-[#d97706] text-white",
};

const FILTERS = ["All", "Super Dream", "Dream", "Standard", "Regular"] as const;
type Filter = (typeof FILTERS)[number];

const NULLISH = new Set(["na", "n/a", "none", "-", "null", "undefined", ""]);
function isNullish(v: any) {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return NULLISH.has(v.trim().toLowerCase());
  return false;
}
function fieldOrPlaceholder(v: any) {
  if (isNullish(v))
    return (
      <span className="italic text-slate-400">not publicly available</span>
    );
  return v;
}

interface CardProps {
  company: CompanySummary & { company_id: number };
  onSelect: (c: CompanySummary & { company_id: number }) => void;
}

const CompanyCard = memo(function CompanyCard({ company, onSelect }: CardProps) {
  const growthNegative = company.yoy_growth_rate.trim().startsWith("-");
  const TrendIcon = growthNegative ? TrendingDown : TrendingUp;
  const typeCls =
    CATEGORY_COLORS[company.company_type] || "bg-slate-500 text-white";

  return (
    <button
      onClick={() => onSelect(company)}
      className="group relative flex flex-col items-start rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex w-full items-start justify-between">
        <CompanyLogo
          name={company.name}
          websiteUrl={company.website_url}
          logoUrl={company.logo_url}
          size={48}
        />
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeCls}`}
        >
          {company.company_type || "—"}
        </span>
      </div>

      <h3 className="mt-4 font-heading text-lg font-semibold text-slate-900">
        {fieldOrPlaceholder(company.name)}
      </h3>
      <p className="text-sm text-slate-500">
        {fieldOrPlaceholder(company.short_name)}
      </p>

      <div className="mt-4 flex flex-col gap-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span>{fieldOrPlaceholder(company.headquarters_address)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span>{fieldOrPlaceholder(company.employee_size)}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon
            className={`h-4 w-4 ${growthNegative ? "text-red-500" : "text-emerald-500"}`}
          />
          <span className={growthNegative ? "text-red-600" : "text-emerald-600"}>
            {fieldOrPlaceholder(company.yoy_growth_rate)}
          </span>
        </div>
      </div>

      <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
    </button>
  );
});

function Index() {
  const navigate = useNavigate();
  const { setSelected } = useCompany();
  const companies = useMemo(() => getAllCompanySummaries(), []);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: companies.length };
    for (const f of FILTERS) if (f !== "All") c[f] = 0;
    companies.forEach((co) => {
      if (co.company_type in c) c[co.company_type]++;
    });
    return c;
  }, [companies]);

  const filtered = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    return companies.filter((c) => {
      if (filter !== "All" && c.company_type !== filter) return false;
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        c.short_name.toLowerCase().includes(term) ||
        c.headquarters_address.toLowerCase().includes(term)
      );
    });
  }, [companies, debounced, filter]);

  const handleSelect = (c: CompanySummary & { company_id: number }) => {
    setSelected({
      companyId: c.company_id,
      companyName: c.name,
      logoUrl: c.logo_url,
    });
    navigate({ to: "/company/intelligence" });
  };

  const reset = () => {
    setQ("");
    setFilter("All");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            {COLLEGE_SHORT} · Intelligence Platform
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {COLLEGE_NAME} Companies Research & Placement Analytics Portal
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Your strategic edge for campus placements
          </p>

          <div className="mt-6 flex max-w-2xl items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies, HQ, industry…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span>{f}</span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {counts[f] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-600">No companies match your filters.</p>
            <button
              onClick={reset}
              className="mt-3 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((c) => (
              <CompanyCard
                key={c.company_id}
                company={c}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
