import { SEED_COMPANIES } from "@/data/seedCompanies";

export interface CompanySummary {
  company_id: number;
  name: string;
  short_name: string;
  logo_url: string;
  category: string;
  company_type: string;
  incorporation_year: number | string;
  employee_size: string;
  headquarters_address: string;
  operating_countries: string;
  office_locations: string;
  yoy_growth_rate: string;
  website_url: string;
}

export type CompanyProfile = CompanySummary & Record<string, any>;

export interface DashboardSkill {
  skill_set_id: number;
  skill_set_name: string;
  required_level: number;
  required_proficiency: string;
  bloom: "CU" | "AP" | "AS" | "EV" | "CR";
  criticality: "Critical" | "Important" | "Baseline";
  difficulty: "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";
}

export const NULLISH = new Set(["na", "n/a", "none", "-", "null", "undefined", ""]);

export function isNullish(v: any): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return NULLISH.has(v.trim().toLowerCase());
  return false;
}

export function asString(v: any): string {
  if (isNullish(v)) return "";
  return String(v);
}

export function asRecord(v: any): Record<string, any> {
  return v && typeof v === "object" ? (v as Record<string, any>) : {};
}

export function splitItems(v: any): string[] {
  const s = asString(v);
  if (!s) return [];
  return s
    .split(/\n|;|•|\u2022/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function titleCaseFromCode(code: string): string {
  return code
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function scoreToDifficulty(
  score: number,
): DashboardSkill["difficulty"] {
  if (score >= 8) return "EXPERT";
  if (score >= 6) return "ADVANCED";
  if (score >= 4) return "PRO";
  return "BEGINNER";
}

export function proficiencyToBloom(level: number): DashboardSkill["bloom"] {
  if (level <= 2) return "CU";
  if (level <= 4) return "AP";
  if (level <= 6) return "AS";
  if (level <= 8) return "EV";
  return "CR";
}

export function scoreToCriticality(
  score: number,
): DashboardSkill["criticality"] {
  if (score >= 7) return "Critical";
  if (score >= 5) return "Important";
  return "Baseline";
}

export function normalizeCompanySummary(short_json: any): CompanySummary {
  const s = asRecord(short_json);
  return {
    company_id: s.company_id ?? 0,
    name: asString(s.name),
    short_name: asString(s.short_name) || asString(s.name),
    logo_url: asString(s.logo_url),
    category: asString(s.category),
    company_type: asString(s.company_type),
    incorporation_year: s.incorporation_year ?? "",
    employee_size: asString(s.employee_size),
    headquarters_address: asString(s.headquarters_address),
    operating_countries: asString(s.operating_countries),
    office_locations: asString(s.office_locations),
    yoy_growth_rate: asString(s.yoy_growth_rate),
    website_url: asString(s.website_url),
  };
}

export function normalizeCompanyProfile(
  full_json: any,
  short_json: any,
): CompanyProfile {
  const summary = normalizeCompanySummary(short_json);
  const full = asRecord(full_json);
  return { ...summary, ...full } as CompanyProfile;
}

export function normalizeDashboardSkills(
  skillLevels: any[] = [],
): DashboardSkill[] {
  return skillLevels.map((s) => {
    const level = Number(s.required_level) || 0;
    return {
      skill_set_id: s.skill_set_id,
      skill_set_name: asString(s.skill_set_name),
      required_level: level,
      required_proficiency: asString(s.required_proficiency),
      bloom: proficiencyToBloom(level),
      criticality: scoreToCriticality(level),
      difficulty: scoreToDifficulty(level),
    };
  });
}

export function getAllCompanySummaries(): (CompanySummary & { company_id: number })[] {
  return SEED_COMPANIES.map((c) => ({
    ...normalizeCompanySummary(c.short_json),
    company_id: c.company_id,
  }));
}

export function getCompanyById(id: number) {
  const c = SEED_COMPANIES.find((x) => x.company_id === id);
  if (!c) return null;
  return {
    company_id: c.company_id,
    summary: normalizeCompanySummary(c.short_json),
    profile: normalizeCompanyProfile(c.full_json, c.short_json),
    skills: normalizeDashboardSkills(c.skill_levels),
  };
}
