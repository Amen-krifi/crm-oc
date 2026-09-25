import type { Contact } from './types';

/** One template used for both Email and WhatsApp. Edit the strings below to change the wording everywhere. */
export function buildOutreachMessage(contact: Pick<Contact, 'name' | 'organization'>) {
  const orgSuffix = contact.organization ? ` for ${contact.organization}` : '';
  const subject = `Following up${contact.organization ? ` — ${contact.organization}` : ''}`;
  const body =
    `Hi ${contact.name},\n\n` +
    `I wanted to follow up and see if you had any questions or next steps in mind${orgSuffix}.\n\n` +
    `Looking forward to hearing from you.\n\nBest regards,`;
  return { subject, body };
}

export function mailtoUrl(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function whatsappUrl(phone: string, text: string) {
  const digits = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}