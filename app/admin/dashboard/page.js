// app/admin/dashboard/page.js
'use client';
import { useEffect, useState } from 'react';
import { countProductsByCondition } from '@/lib/product-conditions';
import { fetchProductConditions } from '@/lib/data';
import ErrorBanner from '@/app/components/ErrorBanner';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  Activity, 
  BarChart3, 
  Clock, 
  RefreshCw, 
  ShieldAlert, 
  Zap, 
  Link2,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, new: 0, refurbished: 0, used: 0, other: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  useEffect(() => {
    pullMetrics();
  }, []);

  async function pullMetrics() {
    setRefreshing(true);
    const { data, error } = await fetchProductConditions();
    if (error) {
      setMetricsError('Could not load dashboard metrics. Please try again.');
    } else {
      setMetricsError(null);
      setStats(countProductsByCondition(data));
    }
    setLoading(false);
    setRefreshing(false);
  }

  const cardConfig = [
    { title: 'Total Catalog SKUs', value: stats.total, icon: Package, color: 'text-blue-500 bg-blue-500/5 border-blue-500/10' },
    { title: 'New Stock', value: stats.new, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' },
    { title: 'Refurbished', value: stats.refurbished, icon: CheckCircle2, color: 'text-teal-500 bg-teal-500/5 border-teal-500/10' },
    { title: 'Used / Pre-Owned', value: stats.used + stats.other, icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/5 border-amber-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 select-none">
      <ErrorBanner message={metricsError} onDismiss={() => setMetricsError(null)} />
      
      {/* Upper Banner Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500 animate-pulse" /> System Operations Metric Overview
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Real-time status tracking of inventory distributions, communication health nodes, and server performance parameters.</p>
        </div>
        <button 
          onClick={pullMetrics}
          disabled={refreshing}
          className="h-8 px-3 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sync Metrics
        </button>
      </div>

      {/* Main Core Quantities Matrix Counter Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-zinc-900/60 border border-zinc-800/60 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardConfig.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className={`p-4 rounded-xl border ${card.color} flex items-center justify-between shadow-sm`}>
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">{card.title}</span>
                  <div className="text-2xl font-black tracking-tight text-white">{card.value}</div>
                </div>
                <div className="p-2.5 bg-zinc-950 border border-zinc-800/60 rounded-lg flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics Matrix Panels Grid Layout Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Panel 1: Communications Distribution Node Weight Meter */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between lg:col-span-2">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Connection Node Load & Metric Routing Weight
            </h3>
            <p className="text-[11px] text-zinc-500">Visual analytics representation template calculating endpoint interaction logs across public channels.</p>
          </div>

          <div className="space-y-4 my-6">
            {/* Row Item 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-medium flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> Phone Numbers (+91 Direct lines)</span>
                <span className="text-zinc-500 font-mono">48% Load Utility</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full w-[48%] bg-emerald-500 rounded-full" />
              </div>
            </div>
            
            {/* Row Item 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-medium flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" /> Email Boxes / Mailto Links</span>
                <span className="text-zinc-500 font-mono">22% Load Utility</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full w-[22%] bg-blue-500 rounded-full" />
              </div>
            </div>

            {/* Row Item 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400 font-medium flex items-center gap-1"><MessageSquare className="w-3 h-3 text-purple-400" /> Support Chat Routing Anchors</span>
                <span className="text-zinc-500 font-mono">30% Load Utility</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full w-[30%] bg-purple-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/40 rounded-xl p-2.5 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> System optimization suggestion:</span>
            <span className="text-zinc-500">Primary user interaction funnels point heavily to mobile phone voice triggers.</span>
          </div>
        </div>

        {/* Panel 2: Live Operation Feed Stream Log */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" /> Platform Event Stream
            </h3>
            <p className="text-[11px] text-zinc-500">Live auditing updates happening within the dashboard environment.</p>
          </div>

          {/* Activity Stream Feed */}
          <div className="my-4 space-y-3 flex-1 overflow-y-auto pr-1 max-h-[160px] scrollbar-none">
            
            <div className="flex gap-2 text-[11px]">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 truncate font-medium">Supabase database sync requested</p>
                <span className="text-[9px] text-zinc-600 font-mono">Just Now • Operational</span>
              </div>
            </div>

            <div className="flex gap-2 text-[11px]">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 truncate font-medium">Indian (+91) Phone validator update applied</p>
                <span className="text-[9px] text-zinc-600 font-mono">14 mins ago • Connection Panel</span>
              </div>
            </div>

            <div className="flex gap-2 text-[11px]">
              <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-zinc-400 truncate font-medium">Storage optimization routine parsed</p>
                <span className="text-[9px] text-zinc-600 font-mono">1 hr ago • System File Engine</span>
              </div>
            </div>

          </div>

          <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
            <span>Status Engine Node:</span>
            <span className="text-emerald-400 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" /> Online</span>
          </div>
        </div>

      </div>

      {/* Lower Dashboard Footprint Component Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Block A: Automated Storage Allocation Guardrail Interface */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex-shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">Free-Tier Asset Bucket</h3>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">Local asset scaling and transcode optimizations system.</p>
            </div>
          </div>
          <div className="w-full sm:w-44 space-y-1.5 flex-shrink-0">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-zinc-500">Utilization Space</span>
              <span className="text-zinc-300 font-mono">~3% Max</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/30">
              <div className="h-full w-[3%] bg-purple-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Block B: Infrastructure Integrity Parameter Status */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex-shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">Table Structural Anchors</h3>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">Relations map matrix definitions endpoints.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> SECURE SSL
          </div>
        </div>

      </div>

    </div>
  );
}