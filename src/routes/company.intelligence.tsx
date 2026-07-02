import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Linkedin } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { getCompanyById } from "@/lib/companyData";
import { CompanyLogo } from "@/components/CompanyLogo";
import { buildIntelligenceSections } from "@/data/intelligenceData";

export const Route = createFileRoute("/company/intelligence")({
  component: CompanyIntelligence,
});

const NULLISH = new Set(["na", "n/a", "none", "-", "null", "undefined", ""]);
function isNullish(v: any) {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return NULLISH.has(v.trim().toLowerCase());
  return false;
}

function splitList(s: string): string[] {
  return s.split(/[;,\n]/).map((x) => x.trim()).filter(Boolean);
}

function isUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

function renderValue(value: any, type?: string) {
  if (isNullish(value)) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
        Not Available
      </span>
    );
  }
  const s = String(value);

  if (type === "url" || isUrl(s)) {
    return (
      <a
        href={s}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
      >
        {s} <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  if (type === "video") {
    return (
      <a href={s} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
        Watch video ↗
      </a>
    );
  }

  if (type === "rating") {
    return (
      <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-700">
        ★ {s}
      </span>
    );
  }

  if (type === "list") {
    const items = splitList(s);
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span
            key={i}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {it}
          </span>
        ))}
      </div>
    );
  }

  if (type === "paragraph") {
    return <p className="text-sm leading-relaxed text-slate-700">{s}</p>;
  }

  // auto-detect pills for values with ; or ,
  if (/[;,]/.test(s) && s.length < 400) {
    const items = splitList(s);
    if (items.length > 1) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <span
              key={i}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
            >
              {it}
            </span>
          ))}
        </div>
      );
    }
  }

  return <span className="text-sm text-slate-700">{s}</span>;
}

function FieldRow({ label, value, type }: { label: string; value: any; type?: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-1/3">
        {label}
      </div>
      <div className="sm:w-2/3">{renderValue(value, type)}</div>
    </div>
  );
}

function CompanyIntelligence() {
  const { selected } = useCompany();
  const data = useMemo(
    () => (selected ? getCompanyById(selected.companyId) : null),
    [selected],
  );
  const sections = useMemo(
    () => (data ? buildIntelligenceSections(data.profile) : []),
    [data],
  );

  const [active, setActive] = useState(0);
  const isScrollingRef = useRef(false);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (isScrollingRef.current) return;
      const y = window.scrollY + 220;
      let idx = 0;
      sectionRefs.current.forEach((el, i) => {
        if (el && el.offsetTop <= y) idx = i;
      });
      setActive(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections.length]);

  useEffect(() => {
    const tab = tabsRef.current?.querySelector<HTMLElement>(
      `[data-tab-idx="${active}"]`,
    );
    tab?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const scrollToSection = (i: number) => {
    const el = sectionRefs.current[i];
    if (!el) return;
    isScrollingRef.current = true;
    window.scrollTo({ top: el.offsetTop - 180, behavior: "smooth" });
    setActive(i);
    window.setTimeout(() => (isScrollingRef.current = false), 800);
  };

  if (!data || !selected) return null;

  return (
    <div className="bg-white">
      {/* Sticky info bar */}
      <div className="sticky top-14 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <CompanyLogo
              name={data.summary.name}
              websiteUrl={data.summary.website_url}
              logoUrl={data.summary.logo_url}
              size={44}
            />
            <div>
              <h1 className="font-heading text-lg font-semibold text-slate-900">
                {data.summary.name}
              </h1>
              <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {data.summary.category || "—"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.summary.website_url && (
              <a
                href={data.summary.website_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Website
              </a>
            )}
            {data.profile.linkedin_url && !isNullish(data.profile.linkedin_url) && (
              <a
                href={data.profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Sticky tab bar */}
        <div
          ref={tabsRef}
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6"
        >
          {sections.map((s, i) => (
            <button
              key={s.id}
              data-tab-idx={i}
              onClick={() => scrollToSection(i)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
                active === i
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">
        {sections.map((section, i) => {
          const populated = section.fields.filter(
            (f: any) => !isNullish(f.value),
          ).length;
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-heading text-base font-semibold text-slate-900">
                  {section.title}
                </h2>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {populated}/{section.fields.length}
                </span>
              </div>
              <div>
                {section.fields.map((f: any) => (
                  <FieldRow
                    key={f.key}
                    label={f.label}
                    value={f.value}
                    type={f.type}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
