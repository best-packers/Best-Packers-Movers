import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProfileEditorUI from './ProfileEditorUI';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const res = await query('SELECT name FROM movers WHERE id = $1', [id]);
    if (res.rows.length > 0) {
      return { title: `Edit ${res.rows[0].name} | Admin Directory Manager` };
    }
  } catch (_) {}
  return { title: 'Edit Mover Profile | Admin' };
}

export default async function EditMoverPage({ params }) {
  const { id } = params;

  let mover = null;
  try {
    const res = await query(
      `SELECT m.*, c.name as city_name, c.slug as city_slug, s.name as state_name, s.slug as state_slug 
       FROM movers m 
       LEFT JOIN cities c ON m.city_id = c.id 
       LEFT JOIN states s ON c.state_id = s.id 
       WHERE m.id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      notFound();
    }

    mover = res.rows[0];
  } catch (err) {
    console.error('Error loading mover for editor:', err);
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ProfileEditorUI mover={mover} />
    </div>
  );
}
