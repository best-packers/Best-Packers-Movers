import Link from 'next/link';
import { Truck, ArrowLeft, PhoneCall } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-950">404 - Page Not Found</h1>
          <p className="text-sm text-slate-600">
            The city, intent route, or mover profile you are looking for has moved or does not exist.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <a
            href="tel:+919835168368"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Directory Helpline</span>
          </a>
        </div>
      </div>
    </div>
  );
}
