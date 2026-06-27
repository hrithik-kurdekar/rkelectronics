// app/components/ServiceDoctor.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function ServiceDoctor() {
  const [status, setStatus] = useState('checking'); // checking | healthy | degraded
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      setStatus('healthy');
      return;
    }

    async function runDiagnostics() {
      const discoveredIssues = [];

      // Test 1: Check Environment Variables Matrix
      const requiredEnvKeys = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_SITE_URL',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
      ];
      
      requiredEnvKeys.forEach(key => {
        if (!process.env[key]) {
          discoveredIssues.push(`Environment Variable Missing: ${key}`);
        }
      });

      // Test 2: Verify live database ping read accessibility
      try {
        const { error } = await supabase.from('categories').select('id').limit(1);
        if (error) {
          discoveredIssues.push(`Database connection issue: ${error.message}`);
        }
      } catch (err) {
        discoveredIssues.push(`Supabase initialization failed completely: ${err.message}`);
      }

      if (discoveredIssues.length > 0) {
        setIssues(discoveredIssues);
        setStatus('degraded');
      } else {
        setStatus('healthy');
      }
    }

    runDiagnostics();
  }, []);

  if (status === 'healthy') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
      <div className="flex items-start gap-3">
        {status === 'checking' ? (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="space-y-2 flex-1">
          <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-200">
            {status === 'checking' ? 'Analyzing Active Microservices...' : 'System Integrity Check Failed'}
          </h4>
          
          {status === 'checking' ? (
            <p className="text-xs text-zinc-400">Verifying keys, database links, and Cloudinary keys.</p>
          ) : (
            <ul className="text-[11px] font-mono text-amber-400/90 list-disc list-inside space-y-1 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60 max-h-40 overflow-y-auto">
              {issues.map((issue, idx) => (
                <li key={idx} className="leading-relaxed">{issue}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}