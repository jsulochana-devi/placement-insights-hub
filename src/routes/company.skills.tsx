import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { getCompanyById } from "@/lib/companyData";
import { CompanyLogo } from "@/components/CompanyLogo";
import { SKILL_TOPICS } from "@/data/skillTopics";

export const Route = createFileRoute("/company/skills")({
  component: SkillIntelligence,
});

const BLOOM_META = {
  CU: { label: "Understand", color: "#3b82f6", tint: "bg-blue-50 text-blue-700 border-blue-200" },
  AP: { label: "Apply", color: "#22c55e", tint: "bg-green-50 text-green-700 border-green-200" },
  AS: { label: "Analyze", color: "#eab308", tint: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  EV: { label: "Evaluate", color: "#ef4444", tint: "bg-red-50 text-red-700 border-red-200" },
  CR: { label: "Create", color: "#a855f7", tint: "bg-purple-50 text-purple-700 border-purple-200" },
} as const;

const CRIT_META = {
  Critical: { label: "Critical", desc: "Must-have for interviews", color: "text-red-700 bg-red-50 border-red-200" },
  Important: { label: "Important", desc: "Boosts strong candidacy", color: "text-amber-700 bg-amber-50 border-amber-200" },
  Baseline: { label: "Baseline", desc: "Foundational awareness", color: "text-slate-700 bg-slate-50 border-slate-200" },
} as const;

function SkillIntelligence() {
  const { selected } = useCompany();
  const data = useMemo(
    () => (selected ? getCompanyById(selected.companyId) : null),
    [selected],
  );
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!data || !selected) return null;

  const skills = [...data.skills].sort((a, b) => b.required_level - a.required_level);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <header className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <CompanyLogo
          name={data.summary.name}
          websiteUrl={data.summary.website_url}
          logoUrl={data.summary.logo_url}
          size={44}
        />
        <h1 className="font-heading text-xl font-bold text-slate-900">
          {data.summary.short_name || data.summary.name} Skill Intelligence
        </h1>
      </header>

      {/* Bloom legend */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-heading text-sm font-semibold text-slate-900">
          Bloom's Taxonomy
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(BLOOM_META) as Array<keyof typeof BLOOM_META>).map((k) => {
            const m = BLOOM_META[k];
            return (
              <div
                key={k}
                className={`rounded-md border px-3 py-2 text-xs ${m.tint}`}
              >
                <div className="font-semibold">{k}</div>
                <div>{m.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Criticality legend */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(CRIT_META) as Array<keyof typeof CRIT_META>).map((k) => {
          const m = CRIT_META[k];
          return (
            <div key={k} className={`rounded-xl border p-4 ${m.color}`}>
              <div className="font-heading text-sm font-semibold">{m.label}</div>
              <div className="text-xs opacity-80">{m.desc}</div>
            </div>
          );
        })}
      </section>

      {/* Skill cards */}
      <section className="space-y-3">
        {skills.map((s) => {
          const bloom = BLOOM_META[s.bloom];
          const critCls = CRIT_META[s.criticality].color;
          const topics = SKILL_TOPICS[s.skill_set_id] || [];
          const isOpen = expanded === s.skill_set_id;
          return (
            <div
              key={s.skill_set_id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() =>
                  setExpanded((prev) => (prev === s.skill_set_id ? null : s.skill_set_id))
                }
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-sm font-semibold text-slate-900">
                      {s.skill_set_name}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${bloom.tint}`}
                    >
                      {s.bloom} · {bloom.label}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${critCls}`}
                    >
                      {s.criticality}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.required_level * 10}%`,
                          backgroundColor: bloom.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {s.required_level}/10
                    </span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 p-4">
                  <ol className="space-y-2">
                    {topics.map((topic, i) => {
                      const level = i + 1;
                      const beyond = level > s.required_level;
                      return (
                        <li
                          key={level}
                          className={`flex items-start gap-3 rounded-md p-2 ${
                            beyond ? "bg-slate-50 text-slate-400" : "bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                              beyond
                                ? "bg-slate-200 text-slate-500"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {level}
                          </span>
                          <span className="flex-1 text-sm">{topic}</span>
                          {beyond && (
                            <span className="flex items-center gap-1 text-[10px] font-medium">
                              <Lock className="h-3 w-3" /> Beyond scope
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
