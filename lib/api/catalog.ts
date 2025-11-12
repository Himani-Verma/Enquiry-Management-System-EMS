/**
 * API helpers for catalog operations
 */

export async function getCatalogGroups(service: string) {
  const r = await fetch(`/api/catalog/groups?service=${encodeURIComponent(service)}`);
  if (!r.ok) throw new Error('groups error');
  return r.json() as Promise<{ groups: string[] }>;
}

export async function searchCatalogParameters(
  opts: { service: string; q?: string; group?: string; page?: number; limit?: number }
) {
  const p = new URLSearchParams();
  p.set('service', opts.service);
  if (opts.q) p.set('q', opts.q);
  if (opts.group) p.set('group', opts.group);
  p.set('page', String(opts.page ?? 1));
  p.set('limit', String(opts.limit ?? 20));
  
  const r = await fetch(`/api/catalog/parameters?${p.toString()}`);
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({ message: 'Unknown error' }));
    console.error('API error:', r.status, errorData);
    throw new Error(errorData.message || `HTTP ${r.status}: Failed to search parameters`);
  }
  const data = await r.json();
  if (!data.success) {
    console.error('API returned success=false:', data);
    throw new Error(data.message || 'Search failed');
  }
  return data as { items: any[]; total: number; page: number; pages: number };
}

