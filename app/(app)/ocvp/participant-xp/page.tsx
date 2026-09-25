import { createClient } from '@/lib/supabase/server';
import { getTasks, getResources, getAnnouncements } from '@/lib/store/committee-store';
import OcvpHubComponent from '@/components/ocvp/OcvpHubComponent';
import type { Contact, Log, Profile } from '@/lib/types';

export default async function OcvpParticipantXpPage() {
  const supabase = createClient();

  const { data: membersData } = await supabase
    .from('profiles')
    .select('*')
    .or('department.eq.pr_marketing,department.eq.admin');

  // In database, participant xp & pr contacts are under pr_marketing with category guest/vip
  const { data: contactsData } = await supabase
    .from('contacts')
    .select('*')
    .eq('department', 'pr_marketing');

  const { data: logsData } = await supabase
    .from('logs')
    .select('*')
    .order('occurred_at', { ascending: false });

  const allContacts = (contactsData ?? []) as Contact[];
  const contacts = allContacts.filter((c) => c.category === 'guest' || c.category === 'vip');
  const logs = (logsData ?? []) as Log[];
  const members = (membersData ?? []) as Profile[];

  const confirmedSpeakers = contacts.filter((c) => c.status === 'confirmed').length;
  const inDiscussion = contacts.filter((c) => c.status === 'in_discussion' || c.status === 'contacted').length;

  const targetKpis = [
    { label: 'VIP Guests & Speakers', value: contacts.length || 8, hint: 'Keynotes & panelists' },
    { label: 'Confirmed VIPs', value: confirmedSpeakers || 4, hint: 'Flight/hotel arranged' },
    { label: 'In Hospitality Protocol', value: inDiscussion || 3, hint: 'Liaisons assigned' }
  ];

  const tasks = getTasks('participant_xp_pr');
  const resources = getResources('participant_xp_pr');
  const announcements = getAnnouncements('participant_xp_pr');

  return (
    <OcvpHubComponent
      dept="participant_xp_pr"
      vpTitle="OCVP Participant Experience & PR"
      vpSubtitle="Deliver an unforgettable attendee experience: welcome kits, fast-track check-in, keynote speaker liaison, and delegate feedback."
      targetKpis={targetKpis}
      teamMembers={members.filter((m) => m.department === 'pr_marketing')}
      contacts={contacts}
      logs={logs}
      initialTasks={tasks}
      initialResources={resources}
      initialAnnouncements={announcements}
    />
  );
}
