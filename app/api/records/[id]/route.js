import { updateRecord, deleteRecord } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function requireSession() {
  return getSession() ? null : Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function PATCH(request, { params }) {
  const denied = requireSession();
  if (denied) return denied;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const record = {
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
    await updateRecord(id, record);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const denied = requireSession();
  if (denied) return denied;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await deleteRecord(id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
