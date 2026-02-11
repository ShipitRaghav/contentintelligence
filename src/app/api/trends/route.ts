import { NextResponse } from 'next/server';
import { trendsService } from '@/services/trendsService';

export async function GET() {
  try {
    const trends = await trendsService.fetchTrends();
    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error in trends API:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
