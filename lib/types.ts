export type OCDepartment = 'logistics' | 'sales' | 'marketing' | 'participant_xp_pr';

export type Department =
  | 'logistics'
  | 'sales'
  | 'pr_marketing'
  | 'admin'
  | 'marketing'
  | 'participant_xp_pr'
  | 'dim';

export type UserRole = 'oc_member' | 'ocvp' | 'ocvp_dim';

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
  role?: UserRole;
  oc_department?: OCDepartment;
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

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskPhase = 'pre_event' | 'event_day' | 'post_event';

export interface Task {
  id: string;
  title: string;
  description: string;
  department: OCDepartment;
  priority: TaskPriority;
  phase: TaskPhase;
  completed: boolean;
  assigned_to_name?: string;
  assigned_to_id?: string;
  due_date?: string;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface ResourceUpload {
  id: string;
  title: string;
  description: string;
  department: OCDepartment | 'all';
  category: 'brief' | 'template' | 'file' | 'link' | 'sop' | 'run_of_show';
  url: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  department: OCDepartment | 'all';
  priority: 'normal' | 'urgent';
  author_name: string;
  author_role: string;
  created_at: string;
}

export const OC_DEPARTMENTS: OCDepartment[] = [
  'logistics',
  'sales',
  'marketing',
  'participant_xp_pr'
];

export const DEPARTMENT_LABELS: Record<string, string> = {
  logistics: 'Logistics',
  sales: 'Sales',
  marketing: 'Marketing',
  participant_xp_pr: 'Participant XP & PR',
  pr_marketing: 'PR & Marketing',
  admin: 'Admin / Board',
  dim: 'OCVP Data & Info Mgmt'
};

export const OCVP_TITLES: Record<OCDepartment | 'dim', string> = {
  logistics: 'OCVP Logistics',
  sales: 'OCVP Sales & Partnerships',
  marketing: 'OCVP Marketing & Branding',
  participant_xp_pr: 'OCVP Participant XP & PR',
  dim: 'OCVP Data & Information Management'
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

export const CATEGORY_BY_DEPARTMENT: Record<string, ContactCategory[]> = {
  logistics: ['partner', 'vendor', 'supplier'],
  sales: ['lead', 'sponsor', 'client'],
  marketing: ['media', 'collaborator'],
  participant_xp_pr: ['guest', 'vip', 'media'],
  pr_marketing: ['guest', 'vip', 'media', 'collaborator'],
  admin: ['partner', 'vendor', 'supplier', 'lead', 'sponsor', 'client', 'guest', 'vip', 'media', 'collaborator'],
  dim: ['partner', 'vendor', 'supplier', 'lead', 'sponsor', 'client', 'guest', 'vip', 'media', 'collaborator']
};

