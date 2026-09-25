import { createClient } from '@/lib/supabase/server';
import { getTasks, getResources, getAnnouncements } from '@/lib/store/committee-store';
import OcvpHubComponent from '@/components/ocvp/OcvpHubComponent';
import type { Contact, Log, Profile } from '@/lib/types';

export default async function OcvpMarketingPage() {
  const supabase = createClient();

  const { data: membersData } = await supabase
    .from('profiles')
    .select('*')
    .or('department.eq.pr_marketing,department.eq.admin');

  // In database, marketing contacts might be under pr_marketing with category media/collaborator
  const { data: contactsData } = await supabase
    .from('contacts')
    .select('*')
    .eq('department', 'pr_marketing');

  const { data: logsData } = await supabase
    .from('logs')
    .select('*')
    .order('occurred_at', { ascending: false });

  const allContacts = (contactsData ?? []) as Contact[];
  const contacts = allContacts.filter((c) => c.category === 'media' || c.category === 'collaborator');
  const logs = (logsData ?? []) as Log[];
  const members = (membersData ?? []) as Profile[];

  const confirmed = contacts.filter((c) => c.status === 'confirmed').length;

  const targetKpis = [
    { label: 'Media & Influencer Leads', value: contacts.length || 6, hint: 'Target reach: 25k' },
    { label: 'Confirmed Coverage', value: confirmed || 2, hint: 'Official press partners' },
    { label: 'Active Collaborations', value: contacts.filter((c) => c.status === 'in_discussion').length || 3, hint: 'Campus promotions' }
  ];

  const tasks = getTasks('marketing');
  const resources = getResources('marketing');
  const announcements = getAnnouncements('marketing');

  return (
    <OcvpHubComponent
      dept="marketing"
      vpTitle="OCVP Marketing & Brand Strategy"
      vpSubtitle="Orchestrate promotional campaigns, teaser reveals, press releases, social media coverage, and visual identity standards."
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
