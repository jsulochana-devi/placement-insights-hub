import { useState } from "react";

interface Props {
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}

function initial(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function domainFromUrl(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function CompanyLogo({
  name,
  websiteUrl,
  logoUrl,
  size = 40,
  className = "",
}: Props) {
  const key = (import.meta as any).env?.VITE_LOGO_DEV_PUBLISHABLE_KEY;
  const domain = domainFromUrl(websiteUrl);
  const logoDev =
    key && domain
      ? `https://img.logo.dev/${domain}?token=${key}&size=${size * 2}`
      : null;

  const sources = [logoDev, logoUrl].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  const src = sources[idx];

  if (src) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        onError={() => setIdx((i) => i + 1)}
        className={`rounded-md bg-white object-contain ring-1 ring-slate-200 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-md bg-slate-100 text-slate-600 font-heading font-semibold ring-1 ring-slate-200 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial(name)}
    </div>
  );
}
