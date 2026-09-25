'use client';

import { useState } from 'react';
import { Phone, Mail, Users as MeetingIcon, StickyNote } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/profile-context';
import type { InteractionType, Log } from '@/lib/types';

const TYPE_ICON: Record<InteractionType, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: MeetingIcon,
  note: StickyNote
};

const TYPE_LABEL: Record<InteractionType, string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note'
};

export default function ActivityLog({ contactId, logs }: { contactId: string; logs: Log[] }) {
  const profile = useProfile();
  const supabase = createClient();
  const [items, setItems] = useState(logs);
  const [type, setType] = useState<InteractionType>('call');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('logs')
      .insert({ contact_id: contactId, user_id: profile.id, interaction_type: type, notes })
      .select('*, user:profiles(id, name)')
      .single();

    if (!error && data) {
      setItems([data as unknown as Log, ...items]);
      setNotes('');
    }
    setSaving(false);
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="panel mb-4 p-4">
        <div className="mb-2 flex items-center gap-2">
          {(Object.keys(TYPE_LABEL) as InteractionType[]).map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  type === t ? 'border-cobalt-500 bg-cobalt-50 text-cobalt-600' : 'border-border text-muted hover:bg-paper'
                }`}
              >
                <Icon size={13} /> {TYPE_LABEL[t]}
              </button>
            );
          })}
        </div>
        <textarea
          className="input min-h-[70px]"
          placeholder={`Log a ${TYPE_LABEL[type].toLowerCase()}…`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add to log'}</button>
        </div>
      </form>

      <ol className="space-y-3">
        {items.map((log) => {
          const Icon = TYPE_ICON[log.interaction_type];
          return (
            <li key={log.id} className="panel flex gap-3 p-4">
              <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-cobalt-50 text-cobalt-500">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{TYPE_LABEL[log.interaction_type]}</span>
                  <span className="font-mono text-xs text-muted">
                    {new Date(log.occurred_at).toLocaleString()}
                  </span>
                </div>
                {log.notes && <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{log.notes}</p>}
                <p className="mt-1 text-xs text-muted">Logged by {log.user?.name ?? 'Unknown'}</p>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No activity logged yet for this contact.</p>
        )}
      </ol>
    </div>
  );
}
