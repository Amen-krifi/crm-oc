'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Eye, EyeOff, Mail, MessageCircle, Phone, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/profile-context';
import type { Contact, PipelineStatus } from '@/lib/types';
import { CATEGORY_LABELS, DEPARTMENT_LABELS, STATUS_LABELS } from '@/lib/types';
import { buildOutreachMessage, mailtoUrl, whatsappUrl } from '@/lib/outreach';

export default function ContactDetailHeader({ contact }: { contact: Contact }) {
  const router = useRouter();
  const supabase = createClient();
  const profile = useProfile();
  const isAdmin = profile.department === 'admin';

  const [status, setStatus] = useState<PipelineStatus>(contact.status);
  const [saving, setSaving] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const { subject, body } = buildOutreachMessage(contact);

  async function updateStatus(next: PipelineStatus) {
    setStatus(next);
    setSaving(true);
    await supabase.from('contacts').update({ status: next }).eq('id', contact.id);
    setSaving(false);
    router.refresh();
  }

  async function hideContact() {
    if (!reason.trim()) return;
    setBusy(true);
    await supabase
      .from('contacts')
      .update({ hidden_at: new Date().toISOString(), hidden_by: profile.id, hidden_reason: reason })
      .eq('id', contact.id);
    setBusy(false);
    router.push('/contacts');
  }

  async function restoreContact() {
    setBusy(true);
    await supabase.from('contacts').update({ hidden_at: null, hidden_by: null, hidden_reason: null }).eq('id', contact.id);
    setBusy(false);
    router.refresh();
  }

  async function deleteForever() {
    if (!window.confirm('Permanently delete this contact and all its activity logs? This cannot be undone.')) return;
    setBusy(true);
    await supabase.from('contacts').delete().eq('id', contact.id);
    setBusy(false);
    router.push('/directory');
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {contact.hidden_at && (
        <div className="panel mb-3 border-amber-500/30 bg-amber-100 p-3 text-sm text-amber-700">
          Hidden by {contact.hiddenBy?.name ?? 'someone'} on {new Date(contact.hidden_at).toLocaleDateString()}
          {contact.hidden_reason && <> — reason: <span className="font-medium">{contact.hidden_reason}</span></>}
        </div>
      )}

      <div className="panel flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <h1 className="text-lg font-semibold text-ink">{contact.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {contact.organization && (
              <span className="flex items-center gap-1.5"><Building2 size={14} /> {contact.organization}</span>
            )}
            {contact.email && (
              <span className="flex items-center gap-1.5"><Mail size={14} /> {contact.email}</span>
            )}
            {contact.phone && (
              <span className="flex items-center gap-1.5"><Phone size={14} /> {contact.phone}</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full bg-paper px-2.5 py-1">{CATEGORY_LABELS[contact.category]}</span>
            <span className="rounded-full bg-paper px-2.5 py-1">{DEPARTMENT_LABELS[contact.department]}</span>
            <span className="rounded-full bg-paper px-2.5 py-1">Owner: {contact.owner?.name ?? '—'}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {contact.email && (
              <a href={mailtoUrl(contact.email, subject, body)} className="btn-secondary">
                <Mail size={14} /> Email
              </a>
            )}
            {contact.phone && (
              <a href={whatsappUrl(contact.phone, body)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
            {!isAdmin && !contact.hidden_at && !hiding && (
              <button className="btn-secondary" onClick={() => setHiding(true)}>
                <EyeOff size={14} /> Delete contact
              </button>
            )}
            {isAdmin && contact.hidden_at && (
              <button className="btn-secondary" onClick={restoreContact} disabled={busy}>
                <Eye size={14} /> Restore
              </button>
            )}
            {isAdmin && (
              <button className="btn-secondary text-clay-500" onClick={deleteForever} disabled={busy}>
                <Trash2 size={14} /> Delete permanently
              </button>
            )}
          </div>

          {hiding && (
            <div className="mt-3 rounded-md border border-border bg-paper p-3">
              <label className="mb-1 block text-xs font-medium text-muted">Why are you hiding this contact?</label>
              <textarea
                className="input min-h-[60px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. duplicate, no longer relevant…"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => { setHiding(false); setReason(''); }}>Cancel</button>
                <button className="btn-primary" onClick={hideContact} disabled={busy || !reason.trim()}>
                  {busy ? 'Hiding…' : 'Confirm hide'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
            Pipeline status
          </label>
          <select
            className="input w-48"
            value={status}
            disabled={saving}
            onChange={(e) => updateStatus(e.target.value as PipelineStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}