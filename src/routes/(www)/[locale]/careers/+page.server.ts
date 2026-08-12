import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { SUPPORTED_LOCALES } from "$lib/i18n";
import type { Locale } from "$lib/server/content/types";
import { canonicalUrl, resolveOrigin, type PageSeo } from "$lib/seo";
import { trackView } from "$lib/server/analytics";
import { CONSENT_COOKIE, parseConsent } from "$lib/consent";
import {
  getCareersFeed,
  jobCategory,
  jobSalary,
  jobPostingJsonLd,
} from "$lib/server/careers";
import { homeContent } from "$lib/marketing/content";

export const load: PageServerLoad = async ({
  params,
  url,
  locals,
  cookies,
  platform,
}) => {
  if (!SUPPORTED_LOCALES.includes(params.locale as Locale)) {
    error(404, "Not found");
  }
  const locale = params.locale as Locale;

  const [settings, careers] = await Promise.all([
    locals.content.getSettings().catch(() => null),
    getCareersFeed(platform?.env ?? {}),
  ]);

  const origin = resolveOrigin(url, settings?.cdnBaseUrl);
  const canonical = canonicalUrl(origin, `/${locale}/careers`);
  const alternates: Partial<Record<Locale, string>> = {};
  for (const l of SUPPORTED_LOCALES) {
    alternates[l] = canonicalUrl(origin, `/${l}/careers`);
  }

  const siteName = settings?.siteName ?? "Codustry";
  const address = homeContent(locale).contact.address;

  const seo: PageSeo = {
    title: `Careers — ${siteName}`,
    description:
      locale === "th"
        ? "ร่วมงานกับโคดัสทรี — ตำแหน่งงานที่เปิดรับ"
        : "Join Codustry — current openings for engineers, developers and sales.",
    canonical,
    locale,
    alternates,
    ogType: "website",
    // One JobPosting per opening so the roles are eligible for Google Jobs.
    jsonLd: careers.feed.jobs.map((job) =>
      jobPostingJsonLd({ job, origin, siteName, locale, address }),
    ),
  };

  if (platform?.env?.DB) {
    const consent = parseConsent(cookies.get(CONSENT_COOKIE));
    void trackView(
      platform.env.DB,
      { path: url.pathname, kind: "page" },
      consent,
    );
  }

  // Flatten to exactly what the page renders — the localized category
  // and salary helpers are server-only, so resolve them here.
  const jobs = careers.feed.jobs.map((job) => {
    const category = jobCategory(job, locale);
    return {
      id: String(job.id ?? job.number ?? job.title),
      title: job.title,
      // Category often restates the department ("Sales · Sales"); drop
      // the duplicate rather than printing it twice.
      department:
        job.department && job.department !== category ? job.department : null,
      // Stored as `full_time`; humanize for display.
      employmentType: job.employment_type
        ? job.employment_type.replaceAll("_", " ")
        : null,
      location: job.location ?? null,
      publishedAt: job.published_at ?? null,
      applyUrl: job.apply_url ?? null,
      category,
      salary: jobSalary(job, locale),
    };
  });

  return { locale, seo, jobs, stale: careers.stale };
};
