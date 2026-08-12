/**
 * Plugin side-effect imports.
 *
 * Importing this module runs each plugin's module-load registrations
 * (sidebar nav groups, webhook events, etc.). It's imported by:
 * - `$lib/components/admin/sidebar-nav.ts` — so plugin nav groups
 *   land in the CLIENT bundle before the sidebar renders
 * - `$lib/plugins/runtime.ts` — so the SERVER bundle also loads them
 *   (for `listEnabledPlugins()` + `initPlugins()`)
 *
 * A plugin's `index.ts` is expected to do its registrations at module
 * eval time (not inside `onInit`). This file is the single place where
 * the "which plugins are enabled" set is expressed — same import list
 * as `runtime.ts`'s `enabledPlugins`. Kept in a separate file so it
 * can be imported from a client-side module (`sidebar-nav.ts`) without
 * dragging the server-only runtime + its transitive `env` types into
 * the browser bundle.
 *
 * Adding a plugin: import its default export here AND add it to the
 * `enabledPlugins` array in `runtime.ts`.
 *
 * ─── codustry.com ───────────────────────────────────────────
 * This is a marketing/content site, so the commerce plugins stay off:
 * `shop` (and `reviews`, which registers into shop's nav group and
 * therefore requires it) are deliberately not enabled. Re-add both
 * here AND in runtime.ts if ecommerce is ever needed.
 *
 * `careers` IS enabled — it powers /{locale}/careers from the Tonbab
 * People feed. It registers nothing at module load and ships no
 * tables, so enabling it costs nothing when CAREERS_FEED_URL is unset.
 */
import careers from "$plugins/careers";

// Silence unused-import warnings — the import is the point (side effects).
export const _pluginModules = [careers];
