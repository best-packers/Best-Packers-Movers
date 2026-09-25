import { query } from '@/lib/db';
import RoutesManagerUI from './RoutesManagerUI';

export default async function AdminRoutesPage() {
  let cities = [];
  try {
    const res = await query('SELECT c.id, c.name, c.slug, s.name as state_name FROM cities c JOIN states s ON c.state_id = s.id ORDER BY c.name ASC');
    cities = res.rows || [];
  } catch (err) {
    console.error('Error loading cities for routes manager:', err);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Dynamic Route & Meta Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Add custom search-intent routes on the fly, edit &lt;title&gt;, &lt;meta description&gt;, and H1 tags for any city page, dynamically injected into Googlebot HTML and sitemap.xml.
        </p>
      </div>

      <RoutesManagerUI cities={cities} />
    </div>
  );
}
