// app/backend-portal-gateway-rk/page.js
'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Lock, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminLoginPortal() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const turnstileRef = useRef(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    // Extract Turnstile security verification token natively from layout script state
    const captchaToken = window.turnstile?.getResponse();

    if (!captchaToken) {
      setStatus({ type: 'error', message: 'Cryptographic anti-bot challenge failed. Try again.' });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken }
      });

      if (error) throw error;

      if (data.user?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access Authorization Signature Verification Failed.');
      }

      setStatus({ type: 'success', message: 'Access Cleared. Opening Dashboard Panel...' });
      setTimeout(() => router.push('/admin/dashboard'), 1000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Authentication error.' });
      window.turnstile?.reset();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl mb-4 text-blue-500">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Control Engine Core</h1>
          <p className="text-sm text-zinc-500 mt-1">Authorized Administration Clearance Required</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Secure Endpoint Access Identity</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm tracking-wide transition-all text-zinc-200"
              placeholder="admin@rkelectronics.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Cryptographic Core Passphrase</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm tracking-wide transition-all text-zinc-200"
            />
          </div>

          {/* Cloudflare Turnstile Invisible Integration */}
          <div className="flex justify-center py-2">
            <div 
              ref={turnstileRef}
              className="cf-turnstile" 
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-theme="dark"
            />
          </div>

          {status.type && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${status.type === 'error' ? 'bg-red-950/20 border-red-900/50 text-red-400' : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400'}`}>
              {status.type === 'error' ? <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-medium text-sm rounded-xl tracking-wide transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center"
          >
            {loading ? 'Decrypting Signatures...' : 'Request Credentials Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}