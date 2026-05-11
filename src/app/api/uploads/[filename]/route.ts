import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { filename: string } }) {
  const filePath = path.join(process.cwd(), 'public', 'uploads', params.filename);
  if (!existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 });
  }
  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(params.filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    return new NextResponse(buffer, {
      headers: { 'Content-Type': mimeTypes[ext] || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000' },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
