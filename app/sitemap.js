import { query } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bestpackermovers.com';
  const now = new Date();

  // Root Homepage
  const urls = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    // 1. States & UTs
    const statesRes = await query('SELECT slug FROM states ORDER BY name ASC');
    for (const st of statesRes.rows || []) {
      urls.push({
        url: `${baseUrl}/${st.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

    // 2. Cities
    const citiesRes = await query('SELECT slug FROM cities ORDER BY tier ASC, name ASC');
    for (const c of citiesRes.rows || []) {
      urls.push({
        url: `${baseUrl}/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }

    // 3. Programmatic Intent Routes
    const intentRes = await query('SELECT slug_pattern FROM intent_routes WHERE is_active = true LIMIT 5000');
    for (const rt of intentRes.rows || []) {
      urls.push({
        url: `${baseUrl}/${rt.slug_pattern}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // 4. Mover Profile Pages
    const moversRes = await query('SELECT slug FROM movers WHERE is_verified = true LIMIT 5000');
    for (const m of moversRes.rows || []) {
      urls.push({
        url: `${baseUrl}/mover/${m.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
  }

  return urls;
}
