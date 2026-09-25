import { query } from '@/lib/db';
import CrawlerUI from './CrawlerUI';

export default async function AdminCrawlerPage() {
  let states = [];
  let cities = [];

  try {
    const statesRes = await query('SELECT id, name, slug FROM states ORDER BY name ASC');
    states = statesRes.rows || [];

    const citiesRes = await query('SELECT id, state_id, name, slug FROM cities ORDER BY name ASC');
    cities = citiesRes.rows || [];
  } catch (err) {
    console.error('Error loading crawler dependencies:', err);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Live Google Maps & Places Crawler
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select any state and city across India to automatically query search and places databases, extract local moving companies, phone numbers, ratings, and import them directly into BestPackerMovers.com.
        </p>
      </div>

      <CrawlerUI states={states} cities={cities} />
    </div>
  );
}
