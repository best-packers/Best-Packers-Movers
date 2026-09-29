import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export async function GET(request, { params }) {
  try {
    const { filename } = params;
    if (!filename) {
      return new NextResponse('Bad request', { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    
    // Check public/uploads
    let filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);
    
    if (!fs.existsSync(filePath)) {
      // Check public root
      const rootPath = path.join(process.cwd(), 'public', safeFilename);
      if (fs.existsSync(rootPath)) {
        filePath = rootPath;
      } else {
        return new NextResponse('File not found', { status: 404 });
      }
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const buffer = fs.readFileSync(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Error serving upload:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
