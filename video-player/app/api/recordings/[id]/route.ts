import { NextResponse } from 'next/server';
import { getRecordingById } from '@/lib/db';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const recording = await getRecordingById(params.id);
  if (!recording) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(recording);
}