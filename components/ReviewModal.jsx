'use client';

import { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, moverId, moverName }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !reviewText.trim()) {
      setErrorMsg('Please provide your name and review details.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mover_id: moverId,
          user_name: userName,
          user_phone: userPhone,
          rating,
          review_text: reviewText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 relative">
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/10 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold">Write a Customer Review</h3>
          <p className="text-xs text-slate-400 mt-1">Reviewing: {moverName}</p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Thank You For Your Feedback!</h4>
              <p className="text-xs text-slate-600">
                Your review has been submitted and will appear on the directory profile.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Your Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review / Shifting Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Describe the packing quality, vehicle delivery, punctuality, and staff behavior..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
