/**
 * official-standards-search.ts
 *
 * Phase 1 External Knowledge: Search official standards domains only.
 *
 * Implementation: Google Programmable Search Engine / Custom Search JSON API.
 * Configure the CSE (cx) to restrict results to:
 *   - csrc.nist.gov
 *   - aicpa.org
 *   - iso.org
 *
 * Env vars (server-only):
 *   - OFFICIAL_STANDARDS_SEARCH_API_KEY
 *   - OFFICIAL_STANDARDS_SEARCH_CX
 */

export type OfficialStandardDomain = 'csrc.nist.gov' | 'aicpa.org' | 'iso.org';

export type OfficialSearchResult = {
  title: string;
  link: string;
  snippet?: string;
  displayLink?: string;
};

const ALLOWED_HOSTS: OfficialStandardDomain[] = ['csrc.nist.gov', 'aicpa.org', 'iso.org'];

function hostFromUrl(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isAllowedOfficialUrl(url: string): boolean {
  const host = hostFromUrl(url);
  return ALLOWED_HOSTS.includes(host as OfficialStandardDomain);
}

export function hasOfficialStandardsSearchConfigured(): boolean {
  return !!process.env.OFFICIAL_STANDARDS_SEARCH_API_KEY && !!process.env.OFFICIAL_STANDARDS_SEARCH_CX;
}

export async function searchOfficialStandards(query: string, maxResults = 5): Promise<OfficialSearchResult[]> {
  const key = process.env.OFFICIAL_STANDARDS_SEARCH_API_KEY;
  const cx = process.env.OFFICIAL_STANDARDS_SEARCH_CX;
  if (!key || !cx) return [];

  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', key);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', query);
  url.searchParams.set('num', String(Math.min(Math.max(maxResults, 1), 10)));

  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'accept': 'application/json' },
    // Keep it snappy; never hang the chat response.
    cache: 'no-store',
  });

  if (!resp.ok) return [];

  const data = (await resp.json()) as any;
  const items: any[] = Array.isArray(data?.items) ? data.items : [];

  // Filter defensively; domain restriction should already be enforced by the CSE,
  // but we double-check to prevent any leakage.
  const results: OfficialSearchResult[] = items
    .map((it) => ({
      title: String(it?.title || '').trim(),
      link: String(it?.link || '').trim(),
      snippet: it?.snippet ? String(it.snippet) : undefined,
      displayLink: it?.displayLink ? String(it.displayLink) : undefined,
    }))
    .filter((r) => r.title && r.link && isAllowedOfficialUrl(r.link));

  return results;
}
