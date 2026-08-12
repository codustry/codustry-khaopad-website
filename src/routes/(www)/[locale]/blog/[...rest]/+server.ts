import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * The blog moved to /updates (2026-08). Permanent redirect for every
 * old URL — /{locale}/blog, /{locale}/blog/{slug}, and filtered
 * variants (?category= / ?tag= / ?q=) all keep working.
 */
export const GET: RequestHandler = ({ params, url }) => {
  const rest = params.rest ? `/${params.rest}` : "";
  redirect(301, `/${params.locale}/updates${rest}${url.search}`);
};
