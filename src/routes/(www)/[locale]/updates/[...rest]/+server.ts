import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * /updates existed briefly (2026-08) before we settled on /blog.
 * Permanent redirect so nothing that linked to it breaks.
 */
export const GET: RequestHandler = ({ params, url }) => {
  const rest = params.rest ? `/${params.rest}` : "";
  redirect(301, `/${params.locale}/blog${rest}${url.search}`);
};
