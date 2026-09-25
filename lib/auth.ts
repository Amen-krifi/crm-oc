import type { Department, Profile } from './types';

/** Admin or higher check. Admin includes OCVP DIM and Executive Board. */
export function isAdmin(department: Department) {
  return department === 'admin' || department === 'dim';
}

export function isDIM(profile?: Partial<Profile> | null) {
  if (!profile) return false;
  return (
    profile.department === 'admin' ||
    profile.department === 'dim' ||
    profile.role === 'ocvp_dim' ||
    profile.email === 'bsabt76@gmail.com'
  );
}

export function isOCVP(profile?: Partial<Profile> | null) {
  if (!profile) return false;
  return (
    profile.department === 'admin' ||
    profile.department === 'dim' ||
    profile.role === 'ocvp' ||
    profile.role === 'ocvp_dim' ||
    isDIM(profile)
  );
}

/** Nav items each role is allowed to see, in display order. */
export function navForRole(department: Department) {
  const isAdm = isAdmin(department);

  const items = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tasks', label: 'To-Do Lists' },
    { href: '/contacts', label: 'My Contacts' },
    { href: '/toolkit', label: 'OC Toolkit & Hub' }
  ];

  if (isAdm) {
    items.push({ href: '/directory', label: 'All Directory' });
  }

  items.push({ href: '/settings', label: 'Settings' });
  return items;
}

/** Route guard used by middleware: is this department allowed on this path? */
export function canAccessPath(department: Department, pathname: string) {
  // Public or general OC paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/contacts') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/toolkit') ||
    pathname.startsWith('/settings')
  ) {
    return true;
  }

  // Directory and OCVP/DIM routes require admin/DIM
  if (
    pathname.startsWith('/directory') ||
    pathname.startsWith('/ocvp') ||
    pathname.startsWith('/dim')
  ) {
    return isAdmin(department);
  }

  return true;
}

export function friendlyRoleName(department: Department) {
  switch (department) {
    case 'logistics': return 'OC Logistics';
    case 'sales': return 'OC Sales';
    case 'marketing': return 'OC Marketing';
    case 'participant_xp_pr': return 'OC Participant XP & PR';
    case 'pr_marketing': return 'OC Marketing & PR';
    case 'dim': return 'OCVP Data & Info Mgmt';
    case 'admin': return 'OCVP / Admin Board';
    default: return 'Organizing Committee';
  }
}

