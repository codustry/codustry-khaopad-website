/**
 * Careers feed — Tonbab People (the HR/ATS app inside codustry/workflow)
 * is the source of truth for job openings. This site never stores them.
 *
 *   GET {CAREERS_API_URL}   e.g.
 *   https://dev.app.tonbab.com/v1/public/careers/codustry/jobs
 *
 * The endpoint returns a company envelope:
 *   { company, profile: {logo_url, tagline_en, tagline_th, benefits, …},
 *     jobs: [ … ] }
 *
 * Responses are cached in KV so a Tonbab outage (or a slow cold start)
 * can never take the careers page down: we serve the last good payload
 * for STALE_TTL even after the fresh window expires.
 */

/**
 * A single opening, mirroring the v1 contract exactly (Zod schema in
 * codustry/workflow `src/lib/server/api/v1.ts`). Note `category` and
 * `salary` are whole-object nullable — `salary` is null unless the
 * posting opted in to showing a range.
 */
export interface JobOpening {
  id: string;
  number: string;
  title: string;
  department: string | null;
  employment_type: string | null;
  location: string | null;
  category: { slug: string; name_en: string; name_th: string } | null;
  salary: {
    min: number | null;
    max: number | null;
    currency: string | null;
  } | null;
  published_at: string;
  /** Hosted application wizard on Tonbab — link to it, never rebuild it. */
  apply_url: string;
}

export interface CareersProfile {
  /**
   * Storage object path inside Tonbab's PRIVATE `attachments` bucket
   * (e.g. `{tenantId}/logo.svg`), not a resolvable URL — the v1 feed
   * returns it unsigned. We deliberately don't render it; the site
   * already ships the Codustry logo.
   */
  logo_url: string | null;
  tagline_en: string | null;
  tagline_th: string | null;
  benefits: Array<{ key: string; label_en: string; label_th: string }>;
  custom_benefits_en: string | null;
  custom_benefits_th: string | null;
}

export interface CareersFeed {
  company?: string | null;
  profile?: CareersProfile | null;
  jobs: JobOpening[];
}

/** Fresh window: how long a cached payload is served without refetching. */
const FRESH_TTL_SECONDS = 300;
/** How long a payload survives in KV so it can be served if Tonbab is down. */
const STALE_TTL_SECONDS = 60 * 60 * 24 * 7;
const CACHE_KEY = "careers:feed:v3";
const FETCH_TIMEOUT_MS = 5_000;

interface CachedEnvelope {
  fetchedAt: number;
  feed: CareersFeed;
}

function normalize(raw: unknown): CareersFeed {
  if (!raw || typeof raw !== "object") return { jobs: [] };
  const obj = raw as Record<string, unknown>;
  // Accept either the company envelope or a bare array of jobs, so a
  // future shape change on the Tonbab side degrades instead of breaking.
  const jobs = Array.isArray(obj.jobs)
    ? (obj.jobs as JobOpening[])
    : Array.isArray(raw)
      ? (raw as JobOpening[])
      : [];
  return {
    company: typeof obj.company === "string" ? obj.company : null,
    profile: (obj.profile as CareersProfile | null) ?? null,
    jobs: jobs.filter((j) => j && typeof j === "object"),
  };
}

/**
 * Fetch the feed, preferring KV. Never throws: on any failure the
 * caller gets the last good payload, or an empty feed.
 */
export async function getCareersFeed(env: {
  CAREERS_API_URL?: string;
  CONTENT_CACHE?: KVNamespace;
}): Promise<{ feed: CareersFeed; stale: boolean; configured: boolean }> {
  const url = env.CAREERS_API_URL;
  if (!url) return { feed: { jobs: [] }, stale: false, configured: false };

  const kv = env.CONTENT_CACHE;
  let cached: CachedEnvelope | null = null;
  if (kv) {
    cached = await kv
      .get<CachedEnvelope>(CACHE_KEY, "json")
      .catch(() => null);
    if (cached && Date.now() - cached.fetchedAt < FRESH_TTL_SECONDS * 1000) {
      return { feed: cached.feed, stale: false, configured: true };
    }
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`careers feed ${res.status}`);
    const feed = normalize(await res.json());
    if (kv) {
      await kv
        .put(
          CACHE_KEY,
          JSON.stringify({ fetchedAt: Date.now(), feed } satisfies CachedEnvelope),
          { expirationTtl: STALE_TTL_SECONDS },
        )
        .catch(() => {});
    }
    return { feed, stale: false, configured: true };
  } catch {
    // Serve stale rather than an error page — a hiring page that says
    // "no openings" because of a network blip is worse than a day-old list.
    if (cached) return { feed: cached.feed, stale: true, configured: true };
    return { feed: { jobs: [] }, stale: true, configured: true };
  }
}

/**
 * Localized category label. The feed returns both languages and leaves
 * the choice to the client (the Tonbab-side convention is
 * preferred-locale first, other locale as fallback).
 */
export function jobCategory(job: JobOpening, locale: string): string | null {
  const cat = job.category;
  if (!cat) return null;
  const th = cat.name_th?.trim() || null;
  const en = cat.name_en?.trim() || null;
  return (locale === "th" ? (th ?? en) : (en ?? th)) ?? null;
}

/** Salary line. `salary` is null unless the posting opted in to showing it. */
export function jobSalary(job: JobOpening, locale: string): string | null {
  const salary = job.salary;
  if (!salary) return null;
  const { min, max, currency } = salary;
  const symbol = !currency || currency === "THB" ? "฿" : `${currency} `;
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US").format(n);
  if (typeof min === "number" && typeof max === "number") {
    return `${symbol}${fmt(min)}–${fmt(max)}`;
  }
  if (typeof min === "number") return `${symbol}${fmt(min)}+`;
  if (typeof max === "number") return `≤ ${symbol}${fmt(max)}`;
  return null;
}

/**
 * schema.org JobPosting for each opening — this is what puts the roles
 * into Google Jobs, which is most of the point of a careers page.
 */
export function jobPostingJsonLd(args: {
  job: JobOpening;
  origin: string;
  siteName: string;
  locale: string;
  address: string;
}): Record<string, unknown> {
  const { job, origin, siteName, address } = args;
  // The list feed carries no description (that's detail-only), so the
  // title doubles as the description — Google requires the field.
  const description = [job.title, job.department, job.location]
    .filter(Boolean)
    .join(" — ");
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.published_at || undefined,
    // schema.org expects FULL_TIME / PART_TIME / CONTRACTOR / INTERN;
    // Tonbab stores full_time-style values.
    employmentType: job.employment_type
      ? job.employment_type.toUpperCase()
      : undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: siteName,
      sameAs: origin,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.location ?? address,
        addressCountry: "TH",
      },
    },
    directApply: false,
    url: job.apply_url || undefined,
  };
}
