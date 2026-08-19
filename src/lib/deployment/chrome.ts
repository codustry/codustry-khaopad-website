/**
 * Codustry chrome registration — the deployment's side of the theme
 * contract (docs/THEME-CONTRACT.md, v1.0.0).
 *
 * Imported (side effect) from `$lib/plugins/registrations.ts`, which is
 * the one module loaded by BOTH the server and the storefront client
 * bundle. Registering anywhere only the server loads produces
 * SSR-paints-then-hydration-snaps-back — see
 * `$lib/components/www/chrome.ts` for the incident history.
 */
import { setChrome } from "$lib/components/www/chrome";
import CodustryHeader from "./CodustryHeader.svelte";
import CodustryFooter from "./CodustryFooter.svelte";
import CodustryHome from "./CodustryHome.svelte";

setChrome({
  header: CodustryHeader,
  footer: CodustryFooter,
  home: CodustryHome,
});
