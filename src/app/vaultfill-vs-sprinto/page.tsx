import { redirect } from "next/navigation";

/**
 * /vaultfill-vs-sprinto → canonical comparison page at /compare/sprinto
 * Server component redirect for SEO cleanliness.
 */
export default function VaultFillVsSprintoRedirect() {
  redirect("/compare/sprinto");
}
