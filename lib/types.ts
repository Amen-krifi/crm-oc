export type Department = 'logistics' | 'sales' | 'pr_marketing' | 'admin';

export type ContactCategory =
  | 'partner' | 'vendor' | 'supplier'
  | 'lead' | 'sponsor' | 'client'
  | 'guest' | 'vip' | 'media' | 'collaborator';

export type PipelineStatus =
  | 'new' | 'contacted' | 'in_discussion' | 'confirmed' | 'declined' | 'on_hold';

export type InteractionType = 'call' | 'email' | 'meeting' | 'note';

export interface Profile {
  id: string;
  name: string;
  email: string;
  department: Department;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  organization: string | null;
  category: ContactCategory;
  email: string | null;
  phone: string | null;
  status: PipelineStatus;
  department: Department;
  owner_id: string | null;
  created_at: string;
  owner?: Pick<Profile, 'id' | 'name'> | null;
  hidden_at: string | null;
  hidden_by: string | null;
  hidden_reason: string | null;
  hiddenBy?: Pick<Profile, 'id' | 'name'> | null;
}

export interface Log {
  id: string;
  contact_id: string;
  user_id: string | null;
  interaction_type: InteractionType;
  notes: string | null;
  occurred_at: string;
  created_at: string;
  user?: Pick<Profile, 'id' | 'name'> | null;
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  logistics: 'Logistics',
  sales: 'Sales',
  pr_marketing: 'PR / Marketing',
  admin: 'Admin / Board'
};

export const CATEGORY_LABELS: Record<ContactCategory, string> = {
  partner: 'Partner',
  vendor: 'Vendor',
  supplier: 'Supplier',
  lead: 'Lead',
  sponsor: 'Sponsor',
  client: 'Client',
  guest: 'Guest',
  vip: 'VIP Guest',
  media: 'Media Contact',
  collaborator: 'Marketing Collaborator'
};

export const STATUS_LABELS: Record<PipelineStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_discussion: 'In Discussion',
  confirmed: 'Confirmed',
  declined: 'Declined',
  on_hold: 'On Hold'
};

export const CATEGORY_BY_DEPARTMENT: Record<Department, ContactCategory[]> = {
  logistics: ['partner', 'vendor', 'supplier'],
  sales: ['lead', 'sponsor', 'client'],
  pr_marketing: ['guest', 'vip', 'media', 'collaborator'],
  admin: ['partner', 'vendor', 'supplier', 'lead', 'sponsor', 'client', 'guest', 'vip', 'media', 'collaborator']
};
