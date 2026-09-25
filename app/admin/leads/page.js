import { query } from '@/lib/db';
import LeadsManagerUI from './LeadsManagerUI';

export default async function AdminLeadsPage() {
  let initialLeads = [];
  try {
    const res = await query(`
      SELECT l.*, m.name as mover_name 
      FROM directory_leads l 
      LEFT JOIN movers m ON l.mover_id = m.id 
      ORDER BY l.created_at DESC LIMIT 100
    `);
    initialLeads = res.rows || [];
  } catch (err) {
    console.error('Error fetching leads:', err);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Inbound Directory Leads (CRM)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-margin customer relocation leads captured across BestPackerMovers.com. Real-time phone dispatch and WhatsApp follow-up.
        </p>
      </div>

      <LeadsManagerUI initialLeads={initialLeads} />
    </div>
  );
}
