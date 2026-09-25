import { query } from '@/lib/db';
import MoversManagerUI from './MoversManagerUI';

export default async function AdminMoversPage() {
  let cities = [];
  try {
    const res = await query('SELECT c.id, c.name, c.slug, s.name as state_name FROM cities c JOIN states s ON c.state_id = s.id ORDER BY c.name ASC');
    cities = res.rows || [];
  } catch (err) {
    console.error('Error loading cities for movers manager:', err);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Absolute Ranking & Badge Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Admin is God: Reorder ranks, pin National Packers & Movers as #1 Platinum Verified everywhere, assign IBA approved badges, and edit company profiles.
        </p>
      </div>

      <MoversManagerUI cities={cities} />
    </div>
  );
}
