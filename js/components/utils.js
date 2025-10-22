export function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=\/]/g, m => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#039;';
        case '`': return '&#096;';
        case '=': return '&#x3D;';
        case '/': return '&#x2F;';
        default: return m;
      }
    });
  }

  const allowed_filters = new Set([
    'q', 'page', 'genres', 'min_score', 'max_score',
    'status', 'type', 'rating', 'order_by', 'sort', 'sfw'
  ]);
  
  const ENUMS = {
    status: new Set(['airing','complete','upcoming']),
    type: new Set(['tv','movie','ova','special']),
    rating: new Set(['g','pg','pg13','r','r17','rx']),
    order_by: new Set(['title','score','popularity','favorites']),
    sort: new Set(['asc','desc'])
  };
  
export function getSafeParams() {
  const raw = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const safe = new URLSearchParams();

  for (const [key, value] of raw.entries()) {
    if (!allowed_filters.has(key)) continue;
    if (key === 'q') {
      const cleanQ = value.replace(/[^\p{L}\p{N}\s\-_.:'";|#]/gu, '').slice(0, 100);
      safe.set('q', cleanQ);
    } else if (['min_score','max_score'].includes(key)) {
      const n = parseInt(value, 10);
      if (Number.isFinite(n) && n >= 0 && n <= 10) safe.set(key, String(n));
    } else if (key === 'page') {
      const n = parseInt(value, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 1000) safe.set(key, String(n));
    } else if (key === 'genres') {
      const ids = value.split(',')
        .map(v => parseInt(v, 10))
        .filter(n => Number.isFinite(n) && n > 0);
      if (ids.length) safe.set('genres', ids.join(','));
    } else if (key==='sfw') {
      safe.set('sfw', value);
    } else if (ENUMS[key]) {
      const norm = value.toLowerCase();
      if (ENUMS[key].has(norm)) safe.set(key, norm);
    }
  }
  return safe;
}