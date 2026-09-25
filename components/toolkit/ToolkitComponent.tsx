'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  ExternalLink,
  PhoneCall,
  Clock,
  Sparkles,
  Download,
  Copy,
  Check,
  Megaphone,
  ShieldAlert,
  Plus,
  Trash2,
  Package,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';
import type { ResourceUpload, Announcement, OCDepartment } from '@/lib/types';
import { DEPARTMENT_LABELS } from '@/lib/types';
import { useProfile } from '@/lib/profile-context';
import { isOCVP, isDIM } from '@/lib/auth';

const CALL_SCRIPTS = [
  {
    id: 'script-sales-1',
    department: 'sales',
    title: 'Sponsorship Cold Outreach Email',
    target: 'Corporate Heads of Marketing / Talent Acquisition',
    content: `Subject: Partnership Proposal: Connecting [Company Name] with 500+ Top Tech Delegates

Dear [Decision Maker Name],

I hope this email finds you well.

I am writing on behalf of the Organizing Committee for this year's premier Annual Summit, gathering over 500+ future engineers, entrepreneurs, and industry leaders on [Event Date] in [City].

We have closely followed [Company Name]'s leadership in [Industry/Domain], and we believe your vision strongly aligns with our flagship panel: "[Panel Topic]". 

We have reserved exclusive high-visibility partnership tiers (including keynote address, exclusive booth space, and direct talent resume access) and would love to share our 2026 Sponsorship Deck.

Would you be open for a brief 10-minute introductory call this Thursday or Friday at 2:00 PM?

Best regards,
[Your Name]
Organizing Committee - Sales & Partnerships
[Your Phone Number]`
  },
  {
    id: 'script-sales-2',
    department: 'sales',
    title: 'Sponsor Objection Handling: "We have no budget"',
    target: 'Phone / Video Follow-up Response',
    content: `OC: "I completely understand and appreciate your transparency regarding Q3/Q4 budget constraints, [Name]. Many of our current Gold partners actually began our conversation in the exact same position.

May I ask: if budget were completely flexible, would engaging with 500+ pre-vetted senior software & business graduates be a strategic priority for [Company Name] this year?

[Wait for response]

Great. In that case, instead of our premier tier, we can customize a tailored 'Talent & Innovation Showcase' package at a fractional commitment, or explore a value-in-kind partnership. Let's review the 2-page brief together for 5 minutes."`
  },
  {
    id: 'script-pxp-1',
    department: 'participant_xp_pr',
    title: 'VIP Speaker & Keynote Invitation Letter',
    target: 'Industry Executives, Dignitaries, Founders',
    content: `Subject: Formal Keynote Speaker Invitation: [Event Name] 2026

Dear [Speaker Title and Name],

On behalf of the Organizing Committee, it is our distinct honor to invite you as an Esteemed Keynote Speaker for [Event Name] 2026, taking place on [Event Date] at [Venue Name].

Our summit convenes 500+ passionate delegates, young innovators, and founders. Given your groundbreaking contributions to [Speaker Field/Accomplishment], we would be thrilled to host you for a 25-minute keynote address on "[Suggested Topic]".

Our Participant Experience & Protocol team will coordinate all logistics, including personal VIP escort, private green room accommodations, and chauffeur transport.

We would deeply appreciate the opportunity to discuss your availability. Please let us know if our liaison officer may connect with your office.

With highest regards,
[Your Name]
OCVP Participant Experience & Public Relations`
  },
  {
    id: 'script-log-1',
    department: 'logistics',
    title: 'Vendor Quotation & Non-Profit Discount Request',
    target: 'Catering, AV Equipment & Printing Vendors',
    content: `Subject: Quotation & Partnership Inquiry: [Event Name] (500 Delegates)

Dear [Vendor Name / Sales Team],

We are currently procuring services for [Event Name] taking place on [Event Date] at [Venue Name].

We are requesting a formal itemized quotation for the following scope:
- [Item 1: e.g. Dual 4K laser projectors with HDMI switchers]
- [Item 2: e.g. 4 Wireless handheld UHF microphones + 2 lapels]
- [Item 3: e.g. Setup, on-site sound engineer for 8 hours, and teardown]

As an educational non-profit organizing committee, we actively feature our key technical suppliers on our event collateral and digital screens. We kindly ask for your best non-profit competitive pricing.

Please provide your formal quotation before [Date].

Warm regards,
[Your Name]
Logistics & Procurement Team`
  },
  {
    id: 'script-mkt-1',
    department: 'marketing',
    title: 'Media Partner & University Press Pitch',
    target: 'Student Newspapers, Tech Blogs, Community Newsletters',
    content: `Subject: Media Partnership: Exclusive Press Pass & Coverage for [Event Name]

Hello [Journalist / Editor Name],

We are excited to announce that [Event Name] will officially take place on [Date] at [Venue], spotlighting the next generation of leadership and tech breakthroughs.

We would love to welcome [Publication Name] as our Official Media Partner. In exchange for newsletter and editorial coverage, we are offering:
- 2 Complimentary All-Access Press & VIP Passes
- Exclusive 1-on-1 interview slots with our headline keynote speakers
- Publication logo featured on press backdrops and event website

Our press kit and embargoed press release are attached. We would love to collaborate!

Sincerely,
[Your Name]
Public Relations & Marketing Director`
  }
];

export default function ToolkitComponent({
  initialResources,
  initialAnnouncements
}: {
  initialResources: ResourceUpload[];
  initialAnnouncements: Announcement[];
}) {
  const profile = useProfile();
  const canManage = isOCVP(profile) || isDIM(profile);

  const [activeTab, setActiveTab] = useState<'scripts' | 'resources' | 'emergency' | 'announcements'>('scripts');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [resources, setResources] = useState<ResourceUpload[]>(initialResources);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New resource modal
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resDept, setResDept] = useState<OCDepartment | 'all'>('all');
  const [resCategory, setResCategory] = useState<ResourceUpload['category']>('file');

  // New announcement modal
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annDept, setAnnDept] = useState<OCDepartment | 'all'>('all');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Countdown timer to Event Day (Default: 20 days from today)
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 7, minutes: 42, seconds: 15 });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 19);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!resTitle || !resUrl) return;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resTitle,
          description: resDesc,
          department: resDept,
          category: resCategory,
          url: resUrl,
          uploaded_by: profile.id,
          uploaded_by_name: profile.name
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [data.resource, ...prev]);
        setResTitle('');
        setResDesc('');
        setResUrl('');
        setIsAddingResource(false);
      }
    } catch (err) {
      console.error('Failed to add resource', err);
    }
  }

  async function handleDeleteResource(id: string) {
    if (!confirm('Delete this resource?')) return;
    setResources((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/resources?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          department: annDept,
          priority: annPriority,
          author_name: profile.name,
          author_role: isDIM(profile) ? 'OCVP Data & Info Mgmt' : 'OCVP Desk'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setAnnTitle('');
        setAnnContent('');
        setIsAddingAnnouncement(false);
      }
    } catch (err) {
      console.error('Failed to post announcement', err);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Delete this announcement?')) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  const filteredResources = resources.filter((r) => {
    if (selectedDeptFilter === 'all') return true;
    return r.department === selectedDeptFilter || r.department === 'all';
  });

  const filteredAnnouncements = announcements.filter((a) => {
    if (selectedDeptFilter === 'all') return true;
    return a.department === selectedDeptFilter || a.department === 'all';
  });

  return (
    <div className="space-y-6">
      {/* Header and Countdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2.5">
            <BookOpen className="text-cobalt-500" size={26} />
            OC Toolkit &amp; Resource Hub
          </h1>
          <p className="mt-1 text-sm text-muted">
            Field-tested outreach scripts, standard operating procedures, vendor contracts, and emergency coordination.
          </p>
        </div>

        {/* Live Event Day Countdown Widget */}
        <div className="panel p-4 bg-gradient-to-br from-cobalt-500/10 via-surface to-paper border-cobalt-500/20">
          <div className="flex items-center justify-between pb-1 text-xs">
            <span className="font-semibold text-cobalt-600 dark:text-cobalt-400 flex items-center gap-1.5">
              <Clock size={14} /> Event Day Countdown
            </span>
            <span className="rounded bg-cobalt-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cobalt-600 dark:text-cobalt-300">
              TARGET: OCT 15
            </span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center">
            <div className="rounded bg-surface p-1.5 border border-border shadow-xs">
              <span className="block font-mono text-lg font-bold text-ink">{timeLeft.days}</span>
              <span className="text-[10px] text-muted uppercase">Days</span>
            </div>
            <div className="rounded bg-surface p-1.5 border border-border shadow-xs">
              <span className="block font-mono text-lg font-bold text-ink">{timeLeft.hours}</span>
              <span className="text-[10px] text-muted uppercase">Hours</span>
            </div>
            <div className="rounded bg-surface p-1.5 border border-border shadow-xs">
              <span className="block font-mono text-lg font-bold text-ink">{timeLeft.minutes}</span>
              <span className="text-[10px] text-muted uppercase">Mins</span>
            </div>
            <div className="rounded bg-surface p-1.5 border border-border shadow-xs">
              <span className="block font-mono text-lg font-bold text-ink">{timeLeft.seconds}</span>
              <span className="text-[10px] text-muted uppercase">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'scripts'
                ? 'bg-cobalt-500 text-white'
                : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            <PhoneCall size={14} /> Outreach Scripts &amp; Pitch Playbooks
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'resources'
                ? 'bg-cobalt-500 text-white'
                : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            <FileText size={14} /> Documents &amp; Resource Files ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'announcements'
                ? 'bg-cobalt-500 text-white'
                : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            <Megaphone size={14} /> OC Bulletins &amp; Directives ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'emergency'
                ? 'bg-cobalt-500 text-white'
                : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            <ShieldAlert size={14} /> Emergency Protocol &amp; Contacts
          </button>
        </div>

        {/* Department Filter */}
        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-ink focus:outline-none"
        >
          <option value="all">All Departments</option>
          <option value="logistics">Logistics</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="participant_xp_pr">Participant XP &amp; PR</option>
        </select>
      </div>

      {/* TAB 1: OUTREACH SCRIPTS */}
      {activeTab === 'scripts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <p>Ready-to-use email templates and battle-tested objection handling scripts for every OC.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CALL_SCRIPTS.filter(
              (s) => selectedDeptFilter === 'all' || s.department === selectedDeptFilter
            ).map((script) => {
              const isCopied = copiedId === script.id;

              return (
                <div key={script.id} className="panel p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="rounded bg-cobalt-500/15 px-2 py-0.5 text-[10px] font-semibold text-cobalt-600 dark:text-cobalt-400 uppercase tracking-wider">
                        {DEPARTMENT_LABELS[script.department] || script.department}
                      </span>
                      <span className="text-[11px] text-muted">{script.target}</span>
                    </div>

                    <h3 className="text-sm font-bold text-ink">{script.title}</h3>

                    <pre className="mt-3 p-3 rounded-md bg-paper border border-border text-xs text-ink font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {script.content}
                    </pre>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-border">
                    <button
                      onClick={() => copyToClipboard(script.content, script.id)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} className="text-emerald-500" /> Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Script
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RESOURCES & UPLOADS */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              SOPs, floor plans, sponsorship decks, and handbooks shared by OCVPs.
            </p>
            {canManage && (
              <button
                onClick={() => setIsAddingResource(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Plus size={14} /> Upload Resource
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((res) => (
              <div key={res.id} className="panel p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted border border-border uppercase">
                      {res.department === 'all' ? 'All Committee' : DEPARTMENT_LABELS[res.department] || res.department}
                    </span>
                    <span className="text-[10px] text-muted uppercase font-mono">{res.category}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-ink line-clamp-1">{res.title}</h3>
                  <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-[11px] text-muted">By {res.uploaded_by_name}</span>
                  <div className="flex items-center gap-2">
                    {canManage && (
                      <button
                        onClick={() => handleDeleteResource(res.id)}
                        className="text-muted hover:text-red-500 p-1"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Open Asset
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">Directives and time-sensitive bulletins from OCVPs and DIM.</p>
            {canManage && (
              <button
                onClick={() => setIsAddingAnnouncement(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Plus size={14} /> Post Announcement
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`panel p-4 ${
                  ann.priority === 'urgent'
                    ? 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10'
                    : 'bg-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {ann.priority === 'urgent' && (
                        <span className="rounded bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase px-2 py-0.5">
                          ⚠️ URGENT
                        </span>
                      )}
                      <span className="rounded bg-paper px-2 py-0.5 text-[10px] text-muted border border-border">
                        {ann.department === 'all' ? 'All Committee' : DEPARTMENT_LABELS[ann.department]}
                      </span>
                      <span className="text-[11px] text-muted">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink">{ann.title}</h3>
                    <p className="mt-1 text-xs text-ink leading-relaxed">{ann.content}</p>

                    <p className="mt-2 text-[11px] text-muted">
                      Posted by <strong>{ann.author_name}</strong> ({ann.author_role})
                    </p>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-muted hover:text-red-500 p-1 shrink-0"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EMERGENCY PROTOCOL */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="panel p-5 border-amber-500/30 bg-amber-500/5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert size={18} /> Event Day Rapid Response Protocol
            </h3>
            <p className="mt-1 text-xs text-ink leading-relaxed">
              In case of medical emergencies, power or AV failure, speaker flight delays, or press incidents, follow the chain of command:
            </p>
            <ol className="mt-3 list-decimal list-inside space-y-1.5 text-xs text-ink">
              <li>Notify the respective OCVP immediately on Walkie-Talkie Channel 1 (Emergency).</li>
              <li>For medical incidents, dispatch the certified First Aid Volunteer station at Registration Room B.</li>
              <li>For AV blackouts, switch instantly to the backup HDMI feed in the control booth.</li>
              <li>Do not make public or press statements without OCVP DIM / PR clearance.</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="panel p-4 space-y-2">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Venue Facility Manager</h4>
              <p className="text-sm font-semibold text-ink">Mr. Marcus Vance</p>
              <p className="text-xs text-muted">Direct: +1 (555) 234-8891</p>
              <p className="text-xs text-muted">Walkie Channel: 4 (Facilities)</p>
            </div>
            <div className="panel p-4 space-y-2">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Audio &amp; Stage Master</h4>
              <p className="text-sm font-semibold text-ink">Apex AV Engineering</p>
              <p className="text-xs text-muted">Control Desk: +1 (555) 891-2300</p>
              <p className="text-xs text-muted">Walkie Channel: 2 (Sound &amp; Stage)</p>
            </div>
            <div className="panel p-4 space-y-2">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Paramedic / First Aid</h4>
              <p className="text-sm font-semibold text-ink">Red Cross Field Post</p>
              <p className="text-xs text-muted">Emergency Dispatch: 911 / Speed Dial 1</p>
              <p className="text-xs text-muted">Location: Hall B Medical Tent</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Resource */}
      {isAddingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-ink">Upload Resource / Asset Link</h3>
              <button onClick={() => setIsAddingResource(false)} className="text-muted hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Asset Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Run of Show Spreadsheet"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">URL / Document Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Target Department</label>
                <select
                  value={resDept}
                  onChange={(e) => setResDept(e.target.value as any)}
                  className="input text-xs"
                >
                  <option value="all">All Committee</option>
                  <option value="logistics">Logistics</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="participant_xp_pr">Participant XP &amp; PR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Category</label>
                <select
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value as any)}
                  className="input text-xs"
                >
                  <option value="file">File / Graphic</option>
                  <option value="sop">SOP &amp; Protocol</option>
                  <option value="brief">Deck / Brief</option>
                  <option value="template">Template</option>
                  <option value="run_of_show">Run of Show</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief note on how to use this document..."
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingResource(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Announcement */}
      {isAddingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-ink">Post Announcement Directive</h3>
              <button onClick={() => setIsAddingAnnouncement(false)} className="text-muted hover:text-ink text-sm">✕</button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical: Final Badge Printing Cut-Off"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Audience</label>
                  <select
                    value={annDept}
                    onChange={(e) => setAnnDept(e.target.value as any)}
                    className="input text-xs"
                  >
                    <option value="all">All Committee</option>
                    <option value="logistics">Logistics</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="participant_xp_pr">Participant XP &amp; PR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="input text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">⚠️ Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Announcement Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details, times, instructions..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingAnnouncement(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Post Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
