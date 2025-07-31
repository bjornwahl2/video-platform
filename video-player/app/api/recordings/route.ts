import { NextResponse } from 'next/server';
import { getAllRecordings } from '@/lib/db';

export async function GET() {
  const recordings = await getAllRecordings();
  return NextResponse.json(recordings);
}