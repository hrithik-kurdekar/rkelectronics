import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { fetchDashboardMetrics } from '@/lib/dashboard-metrics';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const metrics = await fetchDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to load dashboard metrics' },
      { status: 500 }
    );
  }
}
