import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FILE_BUCKET } from '@/lib/workspace';

// A normal HTTP download does not leave React's server-action queue pending.
export async function GET(request: NextRequest) {
  const client = await createClient();
  const { data: identity, error: authError } = await client.auth.getUser();
  if (authError || !identity.user) return NextResponse.redirect(new URL('/auth/login', request.url));
  const path = request.nextUrl.searchParams.get('path');
  if (!path || !path.startsWith(`${identity.user.id}/`)) {
    return new NextResponse('File not found', { status: 404 });
  }
  const { data, error } = await client.storage.from(FILE_BUCKET).createSignedUrl(path, 60, { download: true });
  if (error || !data) return new NextResponse('File not found', { status: 404 });
  return NextResponse.redirect(data.signedUrl, { headers: { 'Cache-Control': 'private, no-store' } });
}
