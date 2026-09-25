import fs from 'fs';
import path from 'path';
import type { Task, ResourceUpload, Announcement, OCDepartment } from '../types';
import { isTaskOverdue, getTaskDueStatus } from '../task-utils';

interface StoreData {
  tasks: Task[];
  resources: ResourceUpload[];
  announcements: Announcement[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'committee-data.json');

const INITIAL_TASKS: Task[] = [
  // LOGISTICS TASKS
  {
    id: 'task-log-1',
    title: 'Venue Technical Walkthrough & Stage AV Setup',
    description: 'Inspect main auditorium, test dual projectors, wireless microphones, soundboard balance, and stage podium lighting.',
    department: 'logistics',
    priority: 'urgent',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Logistics Lead',
    due_date: '2026-09-22',
    created_by: 'OCVP Logistics',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'task-log-2',
    title: 'Finalize Catering & Dietary Restrictions List',
    description: 'Lock in vegetarian, vegan, and gluten-free meal counts with caterer. Set replenish intervals for coffee breaks.',
    department: 'logistics',
    priority: 'high',
    phase: 'pre_event',
    completed: true,
    completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    assigned_to_name: 'Catering Officer',
    due_date: '2026-09-24',
    created_by: 'OCVP Logistics',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'task-log-3',
    title: 'Print Directional Signage & Room Maps',
    description: 'Print 24 foam-board signs for registration, plenary halls, workshops, restrooms, and emergency exits.',
    department: 'logistics',
    priority: 'medium',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Print Liaison',
    due_date: '2026-09-25',
    created_by: 'OCVP Logistics',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'task-log-4',
    title: 'Airport Shuttles & Speaker Chauffeur Schedule',
    description: 'Confirm flight arrivals, driver contact details, and pickup terminal coordination for international speakers.',
    department: 'logistics',
    priority: 'high',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Transport Officer',
    due_date: '2026-10-14',
    created_by: 'OCVP Logistics',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'task-log-5',
    title: 'Live Shift Rotation & Walkie-Talkie Channels',
    description: 'Distribute radio frequency assignments and manage volunteer relief rotations for morning and afternoon shifts.',
    department: 'logistics',
    priority: 'high',
    phase: 'event_day',
    completed: false,
    assigned_to_name: 'Volunteer Coordinator',
    due_date: '2026-10-15',
    created_by: 'OCVP Logistics',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-log-6',
    title: 'Post-Event Venue Tear Down & Deposit Release',
    description: 'Audit rented AV equipment, clean plenary halls, conduct inventory check with facility manager, and release security deposit.',
    department: 'logistics',
    priority: 'medium',
    phase: 'post_event',
    completed: false,
    assigned_to_name: 'Logistics Lead',
    due_date: '2026-10-17',
    created_by: 'OCVP Logistics',
    created_at: new Date().toISOString()
  },

  // SALES TASKS
  {
    id: 'task-sales-1',
    title: 'Target 50 Tech & Corporate Sponsor Prospects',
    description: 'Build targeted pipeline of potential enterprise partners, identify VP of Talent/Brand decision-makers on LinkedIn.',
    department: 'sales',
    priority: 'urgent',
    phase: 'pre_event',
    completed: true,
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    assigned_to_name: 'Sales Executive',
    due_date: '2026-10-02',
    created_by: 'OCVP Sales',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'task-sales-2',
    title: 'Deliver Pitch Proposals for Title & Gold Tier Deals',
    description: 'Send customized sponsorship packages with tailored recruitment and brand exposure deliverables to top 10 prospects.',
    department: 'sales',
    priority: 'urgent',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Corporate Accounts',
    due_date: '2026-09-23',
    created_by: 'OCVP Sales',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'task-sales-3',
    title: 'Contract Negotiation & Deliverable Alignment',
    description: 'Clarify sponsor speaking slots, keynote introductions, and booth square footage specifications in signed MOUs.',
    department: 'sales',
    priority: 'high',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Legal & Partnerships',
    due_date: '2026-09-25',
    created_by: 'OCVP Sales',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'task-sales-4',
    title: 'Invoicing & Wire Transfer Tracking',
    description: 'Ensure finance team generates pro-forma invoices and follow up with sponsor procurement teams for clearance before event day.',
    department: 'sales',
    priority: 'high',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Finance Liaison',
    due_date: '2026-10-13',
    created_by: 'OCVP Sales',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'task-sales-5',
    title: 'Sponsor Booth Setup & Concierge Onboarding',
    description: 'Accompany sponsor delegates to designated exhibition booths, confirm high-speed Wi-Fi, banners, and lead scanners.',
    department: 'sales',
    priority: 'high',
    phase: 'event_day',
    completed: false,
    assigned_to_name: 'Expo Liaison',
    due_date: '2026-10-15',
    created_by: 'OCVP Sales',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-sales-6',
    title: 'Sponsor ROI Wrap-Up Report & Testimonial Request',
    description: 'Compile event attendance metrics, booth footfall tallies, social media reach figures, and photos into post-event partner dossier.',
    department: 'sales',
    priority: 'medium',
    phase: 'post_event',
    completed: false,
    assigned_to_name: 'Account Manager',
    due_date: '2026-10-22',
    created_by: 'OCVP Sales',
    created_at: new Date().toISOString()
  },

  // MARKETING TASKS
  {
    id: 'task-mkt-1',
    title: 'Launch Visual Identity & Brand Kit',
    description: 'Finalize official color palette, typography guidelines, vector logo badges, and social media template Figma library.',
    department: 'marketing',
    priority: 'urgent',
    phase: 'pre_event',
    completed: true,
    completed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    assigned_to_name: 'Design Lead',
    due_date: '2026-09-30',
    created_by: 'OCVP Marketing',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'task-mkt-2',
    title: 'Speaker Reveal Video Series (Instagram Reels / LinkedIn)',
    description: 'Edit and publish 30-second teaser reels for keynote speakers and industry panelists with registration call-to-action.',
    department: 'marketing',
    priority: 'high',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Content Creator',
    due_date: '2026-09-24',
    created_by: 'OCVP Marketing',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'task-mkt-3',
    title: 'Ticket Sales Countdown & Early-Bird Push',
    description: 'Publish 7-day, 3-day, and 24-hour countdown banners across all digital channels; run target ads for student/professional delegates.',
    department: 'marketing',
    priority: 'high',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Growth Marketer',
    due_date: '2026-09-25',
    created_by: 'OCVP Marketing',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'task-mkt-4',
    title: 'Photographer & Videographer Shot List Briefing',
    description: 'Distribute moment-by-moment shot list including stage keynotes, candid networking, sponsor booths, and group pictures.',
    department: 'marketing',
    priority: 'medium',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Media Director',
    due_date: '2026-10-14',
    created_by: 'OCVP Marketing',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-mkt-5',
    title: 'Live Story Coverage & Real-Time Twitter/X Updates',
    description: 'Publish live quotes, speaker takeaways, and atmosphere stories during key sessions using official event hashtags.',
    department: 'marketing',
    priority: 'urgent',
    phase: 'event_day',
    completed: false,
    assigned_to_name: 'Social Media Officer',
    due_date: '2026-10-15',
    created_by: 'OCVP Marketing',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-mkt-6',
    title: 'After-Movie Teaser & Press Release Distribution',
    description: 'Produce a 90-second high-energy after-movie teaser and distribute official post-event press release to news outlets.',
    department: 'marketing',
    priority: 'medium',
    phase: 'post_event',
    completed: false,
    assigned_to_name: 'Video Editor',
    due_date: '2026-10-20',
    created_by: 'OCVP Marketing',
    created_at: new Date().toISOString()
  },

  // PARTICIPANT XP & PR TASKS
  {
    id: 'task-pxp-1',
    title: 'Assemble 300 Delegate Welcome Swag Kits',
    description: 'Package custom event tote bags with branded lanyards, personalized NFC/QR delegate badges, printed schedule, and notebook.',
    department: 'participant_xp_pr',
    priority: 'urgent',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Swag & Merch Lead',
    due_date: '2026-09-21',
    created_by: 'OCVP Participant XP & PR',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'task-pxp-2',
    title: 'QR Fast-Track Check-In Lanes & Scanner Training',
    description: 'Test badge barcode scanners, verify attendee offline database backup, and train desk volunteers to achieve <15s check-in per delegate.',
    department: 'participant_xp_pr',
    priority: 'urgent',
    phase: 'pre_event',
    completed: true,
    completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    assigned_to_name: 'Registration Officer',
    due_date: '2026-09-24',
    created_by: 'OCVP Participant XP & PR',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'task-pxp-3',
    title: 'VIP & Speaker Personal Liaison Officers Briefing',
    description: 'Assign dedicated 1-on-1 OC liaisons to each guest speaker, confirm green room hospitality, water, and slide upload desk.',
    department: 'participant_xp_pr',
    priority: 'high',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'VIP Protocol Officer',
    due_date: '2026-09-25',
    created_by: 'OCVP Participant XP & PR',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'task-pxp-4',
    title: 'Delegate Icebreakers & Networking Lounge Activities',
    description: 'Coordinate interactive trivia, icebreaker bingo cards, and peer matching boards to maximize delegate satisfaction and bonding.',
    department: 'participant_xp_pr',
    priority: 'medium',
    phase: 'pre_event',
    completed: false,
    assigned_to_name: 'Experience Lead',
    due_date: '2026-10-14',
    created_by: 'OCVP Participant XP & PR',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-pxp-5',
    title: 'Live Info Helpdesk & Special Needs Assistance',
    description: 'Operate central info counter for lost badges, schedule questions, dietary accommodations, and lost-and-found items.',
    department: 'participant_xp_pr',
    priority: 'high',
    phase: 'event_day',
    completed: false,
    assigned_to_name: 'Helpdesk Team',
    due_date: '2026-10-15',
    created_by: 'OCVP Participant XP & PR',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-pxp-6',
    title: 'Deploy Digital Delegate NPS Survey & Certificate Delivery',
    description: 'Trigger email/WhatsApp post-event feedback survey, compute Net Promoter Score (NPS), and auto-issue verified attendance certificates.',
    department: 'participant_xp_pr',
    priority: 'high',
    phase: 'post_event',
    completed: false,
    assigned_to_name: 'Survey Coordinator',
    due_date: '2026-10-18',
    created_by: 'OCVP Participant XP & PR',
    created_at: new Date().toISOString()
  }
];

const INITIAL_RESOURCES: ResourceUpload[] = [
  {
    id: 'res-log-1',
    title: 'Auditorium & Floor Plan Layout (CAD / PDF)',
    description: 'Master venue schematic with booth dimensions, electrical power socket locations, and fire exit clearance zones.',
    department: 'logistics',
    category: 'run_of_show',
    url: 'https://docs.google.com/presentation/d/demo-floorplan',
    uploaded_by: 'ocvp-logistics',
    uploaded_by_name: 'OCVP Logistics',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'res-log-2',
    title: 'Logistics Standard Operating Procedure (SOP) & Emergency Guide',
    description: 'Protocol for medical emergencies, power outage contingency, and vendor delivery gate clearances.',
    department: 'logistics',
    category: 'sop',
    url: 'https://notion.so/oc-logistics-sop',
    uploaded_by: 'ocvp-logistics',
    uploaded_by_name: 'OCVP Logistics',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'res-sales-1',
    title: '2026 Corporate Partnership Deck & Tier Pricing Matrix',
    description: 'Official slide deck detailing Title ($10k), Gold ($5k), Silver ($2.5k), and Booth ($1k) benefits, reach, and logo clearances.',
    department: 'sales',
    category: 'brief',
    url: 'https://docs.google.com/presentation/d/demo-sponsorship-deck',
    uploaded_by: 'ocvp-sales',
    uploaded_by_name: 'OCVP Sales',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'res-sales-2',
    title: 'Cold Outreach Email & Objection Handling Playbook',
    description: 'Field-tested email templates, follow-up cadences, and scripts for turning "no budget right now" into a speaking sponsorship.',
    department: 'sales',
    category: 'template',
    url: 'https://docs.google.com/document/d/demo-sales-playbook',
    uploaded_by: 'ocvp-sales',
    uploaded_by_name: 'OCVP Sales',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'res-mkt-1',
    title: 'Brand Identity Guidelines & Vector Logo Package',
    description: 'Official typography rules (IBM Plex), color hex codes, dark/light logo variants, and social avatar safe zones.',
    department: 'marketing',
    category: 'file',
    url: 'https://figma.com/@oc-crm/brand-assets',
    uploaded_by: 'ocvp-mkt',
    uploaded_by_name: 'OCVP Marketing',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'res-mkt-2',
    title: 'Press Release Template & Media Kit 2026',
    description: 'Ready-to-use boilerplate announcement with quotes, statistics, and high-res media download links for journalists.',
    department: 'marketing',
    category: 'template',
    url: 'https://docs.google.com/document/d/demo-press-release',
    uploaded_by: 'ocvp-mkt',
    uploaded_by_name: 'OCVP Marketing',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'res-pxp-1',
    title: 'Delegate Handbook & Survival Guide',
    description: 'Complete attendee guide with session agendas, speaker bios, dress code, Wi-Fi login info, and local hotel/food recommendations.',
    department: 'participant_xp_pr',
    category: 'brief',
    url: 'https://drive.google.com/file/d/demo-delegate-handbook',
    uploaded_by: 'ocvp-pxp',
    uploaded_by_name: 'OCVP Participant XP & PR',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'res-pxp-2',
    title: 'VIP Guest Speaker Protocol & Green Room Checklist',
    description: 'Hospitality guidelines, dietary preferences, honorarium receipt flow, and personal liaison etiquette.',
    department: 'participant_xp_pr',
    category: 'sop',
    url: 'https://notion.so/vip-hospitality-protocol',
    uploaded_by: 'ocvp-pxp',
    uploaded_by_name: 'OCVP Participant XP & PR',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'res-dim-1',
    title: 'Committee Data Governance & CRM Entry Standard',
    description: 'Master guidelines by OCVP DIM: mandatory contact phone/email validation, daily interaction logging SLA, and deduplication rules.',
    department: 'all',
    category: 'sop',
    url: 'https://docs.google.com/document/d/dim-data-governance-sop',
    uploaded_by: 'ocvp-dim',
    uploaded_by_name: 'OCVP Data & Information Management',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Mandatory Committee Alignment & Master Dry Run This Sunday',
    content: 'All OCs across Logistics, Sales, Marketing, and Participant XP & PR must attend the full auditorium walkthrough at 10:00 AM. Wear comfortable shoes and bring your department task checklists.',
    department: 'all',
    priority: 'urgent',
    author_name: 'OCVP DIM & Executive Board',
    author_role: 'Data & Information Management',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'ann-2',
    title: 'CRM Data Entry Deadline for Sponsor Logos',
    content: 'All sales contracts confirmed this week must have high-res SVG or PNG logos attached by Friday 6 PM for the marketing printing batch.',
    department: 'sales',
    priority: 'normal',
    author_name: 'OCVP Sales',
    author_role: 'Sales & Partnerships',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'ann-3',
    title: 'Speaker Green Room Passes Ready for Pickup',
    content: 'Participant XP liaisons can collect their security badges and hospitality packets from the registration storage room.',
    department: 'participant_xp_pr',
    priority: 'normal',
    author_name: 'OCVP Participant XP & PR',
    author_role: 'Participant Experience',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

// In-memory cache
let inMemoryStore: StoreData | null = null;

function loadStore(): StoreData {
  if (inMemoryStore) return inMemoryStore;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(content);
      return inMemoryStore!;
    }
  } catch (err) {
    console.error('Failed to read data file, using initial store:', err);
  }

  inMemoryStore = {
    tasks: INITIAL_TASKS,
    resources: INITIAL_RESOURCES,
    announcements: INITIAL_ANNOUNCEMENTS
  };
  saveStore(inMemoryStore);
  return inMemoryStore;
}

function saveStore(data: StoreData) {
  inMemoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist committee data:', err);
  }
}

// Public API
export function getTasks(dept?: OCDepartment): Task[] {
  const store = loadStore();
  if (!dept) return store.tasks;
  return store.tasks.filter((t) => t.department === dept);
}

export function getOverdueTasks(dept?: OCDepartment): Task[] {
  const tasks = getTasks(dept);
  return tasks.filter((t) => isTaskOverdue(t));
}

export function addTask(taskData: Omit<Task, 'id' | 'created_at'>): Task {
  const store = loadStore();
  // Ensure default due date if omitted (7 days from now)
  const defaultDueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const newTask: Task = {
    ...taskData,
    due_date: taskData.due_date && taskData.due_date.trim() ? taskData.due_date : defaultDueDate,
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString()
  };
  store.tasks.unshift(newTask);
  saveStore(store);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const store = loadStore();
  const index = store.tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  store.tasks[index] = {
    ...store.tasks[index],
    ...updates
  };
  saveStore(store);
  return store.tasks[index];
}

export function deleteTask(id: string): boolean {
  const store = loadStore();
  const initialLen = store.tasks.length;
  store.tasks = store.tasks.filter((t) => t.id !== id);
  if (store.tasks.length !== initialLen) {
    saveStore(store);
    return true;
  }
  return false;
}

export function getResources(dept?: OCDepartment | 'all'): ResourceUpload[] {
  const store = loadStore();
  if (!dept || dept === 'all') return store.resources;
  return store.resources.filter((r) => r.department === dept || r.department === 'all');
}

export function addResource(resData: Omit<ResourceUpload, 'id' | 'created_at'>): ResourceUpload {
  const store = loadStore();
  const newRes: ResourceUpload = {
    ...resData,
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString()
  };
  store.resources.unshift(newRes);
  saveStore(store);
  return newRes;
}

export function deleteResource(id: string): boolean {
  const store = loadStore();
  const initialLen = store.resources.length;
  store.resources = store.resources.filter((r) => r.id !== id);
  if (store.resources.length !== initialLen) {
    saveStore(store);
    return true;
  }
  return false;
}

export function getAnnouncements(dept?: OCDepartment | 'all'): Announcement[] {
  const store = loadStore();
  if (!dept || dept === 'all') return store.announcements;
  return store.announcements.filter((a) => a.department === dept || a.department === 'all');
}

export function addAnnouncement(annData: Omit<Announcement, 'id' | 'created_at'>): Announcement {
  const store = loadStore();
  const newAnn: Announcement = {
    ...annData,
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString()
  };
  store.announcements.unshift(newAnn);
  saveStore(store);
  return newAnn;
}

export function deleteAnnouncement(id: string): boolean {
  const store = loadStore();
  const initialLen = store.announcements.length;
  store.announcements = store.announcements.filter((a) => a.id !== id);
  if (store.announcements.length !== initialLen) {
    saveStore(store);
    return true;
  }
  return false;
}

export { isTaskOverdue, getTaskDueStatus } from '../task-utils';
