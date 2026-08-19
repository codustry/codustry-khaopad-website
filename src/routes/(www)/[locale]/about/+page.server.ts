import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { SUPPORTED_LOCALES } from "$lib/i18n";
import type { Locale } from "$lib/server/content/types";
import { canonicalUrl, resolveOrigin, type PageSeo } from "$lib/seo";
import { trackView } from "$lib/server/analytics";
import { CONSENT_COOKIE, parseConsent } from "$lib/consent";

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

  const settings = await locals.content.getSettings().catch(() => null);
  const origin = resolveOrigin(url, settings?.cdnBaseUrl);
  const canonical = canonicalUrl(origin, `/${locale}/about`);
  const alternates: Partial<Record<Locale, string>> = {};
  for (const l of SUPPORTED_LOCALES) {
    alternates[l] = canonicalUrl(origin, `/${l}/about`);
  }

  const siteName = settings?.siteName ?? "Codustry";
  const seo: PageSeo = {
    title:
      locale === "th" ? `เกี่ยวกับเรา — ${siteName}` : `About — ${siteName}`,
    description:
      locale === "th"
        ? "เรื่องราวของโคดัสทรี — จากสิงคโปร์ CubeSat และคลินิกจริง สู่โรงงานไทย"
        : "The Codustry story — from Singapore, a CubeSat, and a real clinic, to the Thai factory floor.",
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

  return { locale, seo };
};
