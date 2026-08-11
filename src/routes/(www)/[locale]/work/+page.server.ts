import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { SUPPORTED_LOCALES } from "$lib/i18n";
import type { Locale } from "$lib/server/content/types";
import { canonicalUrl, resolveOrigin, type PageSeo } from "$lib/seo";
import { trackView } from "$lib/server/analytics";
import { CONSENT_COOKIE, parseConsent } from "$lib/consent";

/**
 * /work — the case-study index, Ogilvy-style.
 *
 * CMS-driven like the blog: articles in the category with slug `work`
 * are treated as case studies (create the category once in /admin,
 * then every published article in it appears here; detail pages are
 * the normal /blog/[slug] article routes). Until such articles exist,
 * the page falls back to the static works from $lib/marketing/content.
 */
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

  const categories = await locals.content.listCategories().catch(() => []);
  const workCategory = categories.find((c) => c.slug === "work") ?? null;

  let caseStudies: Awaited<
    ReturnType<typeof locals.content.listArticles>
  >["items"] = [];
  if (workCategory) {
    const result = await locals.content
      .listArticles({
        status: "published",
        onlyPublished: true,
        locale,
        page: 1,
        limit: 50,
        categoryId: workCategory.id,
      })
      .catch(() => null);
    caseStudies = result?.items ?? [];
  }

  const settings = await locals.content.getSettings().catch(() => null);
  const origin = resolveOrigin(url, settings?.cdnBaseUrl);
  const canonical = canonicalUrl(origin, `/${locale}/work`);
  const alternates: Partial<Record<Locale, string>> = {};
  for (const l of SUPPORTED_LOCALES) {
    alternates[l] = canonicalUrl(origin, `/${l}/work`);
  }

  const siteName = settings?.siteName ?? "Codustry";
  const seo: PageSeo = {
    title: `Work — ${siteName}`,
    description:
      locale === "th"
        ? "ผลงานของโคดัสทรี — แบรนด์และระบบที่เราสร้างและดูแล"
        : "Selected work by Codustry — the brands and systems we build and run.",
    canonical,
    locale,
    alternates,
    ogType: "website",
  };

  if (platform?.env?.DB) {
    const consent = parseConsent(cookies.get(CONSENT_COOKIE));
    void trackView(
      platform.env.DB,
      { path: url.pathname, kind: "page" },
      consent,
    );
  }

  return { locale, seo, caseStudies };
};
