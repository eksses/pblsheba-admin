import {
  ChartBarHorizontal,
  Users,
  IdentificationCard,
  ShieldCheck,
  Gear,
  Trophy,
  Briefcase,
  HandHeart,
  ClipboardText
} from '@phosphor-icons/react';

export const OWNER_PRIMARY = [
  { to: '/', icon: ChartBarHorizontal, key: 'dashboard' },
  { to: '/approvals', icon: ShieldCheck, key: 'approvals' },
];

export const OWNER_MORE = [
  { to: '/members', icon: Users, key: 'members' },
  { to: '/employees', icon: IdentificationCard, key: 'employees' },
  { to: '/survey-results', icon: ClipboardText, key: 'survey_dashboard' },
  { to: '/leaderboard', icon: Trophy, key: 'leaderboard' },
  { to: '/career', icon: Briefcase, key: 'job_applications' },
  { to: '/settings', icon: Gear, key: 'settings' },
  { to: '/requests', icon: HandHeart, key: 'edit_requests' },
  { to: '/profile', icon: IdentificationCard, key: 'my_profile' },
];

export const EMPLOYEE_PRIMARY = [
  { to: '/survey', icon: ClipboardText, key: 'collect_data' },
  { to: '/survey-results', icon: ClipboardText, key: 'survey_dashboard' },
];

export const EMPLOYEE_MORE = [
  { to: '/members', icon: Users, key: 'members' },
  { to: '/profile', icon: IdentificationCard, key: 'my_profile' },
];

export const ALL_SIDEBAR_NAV = [...OWNER_PRIMARY, ...OWNER_MORE];
