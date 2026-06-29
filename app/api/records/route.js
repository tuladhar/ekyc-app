import { listRecords, createRecord } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function requireSession() {
  return getSession() ? null : Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET() {
  const denied = requireSession();
  if (denied) return denied;
  try {
    return Response.json({ records: await listRecords() });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const denied = requireSession();
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const record = {
    // CKYC number is system-assigned, not user-editable.
    ckyc_number: `CKYC-${Date.now().toString().slice(-8)}`,
    full_name: (body.full_name || '').trim(),
    document_type: (body.document_type || '').trim(),
    document_number: (body.document_number || '').trim(),
    email: (body.email || '').trim(),
    phone: (body.phone || '').trim(),
    status: (body.status || 'pending').trim(),
  };

  if (!record.full_name) {
    return Response.json({ error: 'Full name is required' }, { status: 400 });
  }

  try {
    await createRecord(record);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
