import { NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mover_id, user_name, user_phone, rating, review_text } = body;

    if (!mover_id || !user_name || !review_text) {
      return NextResponse.json(
        { success: false, error: 'Mover ID, customer name, and review text are required.' },
        { status: 400 }
      );
    }

    const reviewId = generateId();
    await query(
      `INSERT INTO mover_reviews (
        id, mover_id, user_name, user_phone, rating, review_text, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'approved')`,
      [
        reviewId,
        mover_id,
        user_name.trim(),
        (user_phone || '').trim(),
        Math.min(Math.max(Number(rating) || 5, 1), 5),
        review_text.trim()
      ]
    );

    // Update mover review count and average rating
    const avgRes = await query(
      `SELECT AVG(rating) as avg_rating, COUNT(id) as count FROM mover_reviews WHERE mover_id = $1 AND status = 'approved'`,
      [mover_id]
    );

    if (avgRes.rows.length > 0) {
      const avg = Number(avgRes.rows[0].avg_rating || 4.5).toFixed(1);
      const count = Number(avgRes.rows[0].count || 1);
      await query(
        `UPDATE movers SET rating = $1, review_count = review_count + 1 WHERE id = $2`,
        [avg, mover_id]
      );
    }

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      message: 'Review posted successfully'
    });
  } catch (err) {
    console.error('API /reviews error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to post customer review.' },
      { status: 500 }
    );
  }
}
