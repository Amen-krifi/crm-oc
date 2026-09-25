import type { Department } from './types';

/** Only Admin/Board sees every department's contacts and system settings. */
export function isAdmin(department: Department) {
  return department === 'admin';
}

/** Nav items each role is allowed to see, in display order. */
export function navForRole(department: Department) {
  const base = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contacts', label: 'My Contacts' }
  ];
  if (isAdmin(department)) {
    base.push({ href: '/directory', label: 'All Directory' });
  }
  base.push({ href: '/settings', label: 'Settings' });
  return base;
}

/** Route guard used by middleware: is this department allowed on this path? */
export function canAccessPath(department: Department, pathname: string) {
  if (pathname.startsWith('/directory') && !isAdmin(department)) return false;
  return true;
}

export function friendlyRoleName(department: Department) {
  switch (department) {
    case 'logistics': return 'Logistics';
    case 'sales': return 'Sales';
    case 'pr_marketing': return 'PR / Marketing';
    case 'admin': return 'Admin / Board';
  }
}
