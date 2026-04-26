import {
  ChartBarHorizontal,
  Users,
  IdentificationCard,
  ShieldCheck,
  Gear,
  Trophy,
  Briefcase,
  HandHeart,
  ClipboardText,
  Megaphone,
  Receipt,
  Bug,
  Robot,
  UserCircle
} from '@phosphor-icons/react';

export const OWNER_NAVIGATION = [
  {
    category: 'nav_cat_main',
    items: [
      { to: '/', icon: ChartBarHorizontal, key: 'dashboard' },
      { to: '/approvals', icon: ShieldCheck, key: 'approvals' },
    ]
  },
  {
    category: 'nav_cat_operations',
    items: [
      { to: '/members', icon: Users, key: 'members' },
      { to: '/employees', icon: IdentificationCard, key: 'employees' },
      { to: '/requests', icon: HandHeart, key: 'edit_requests' },
      { to: '/career', icon: Briefcase, key: 'job_applications' },
    ]
  },
  {
    category: 'nav_cat_data',
    items: [
      { to: '/survey-results', icon: ClipboardText, key: 'survey_dashboard' },
      { to: '/leaderboard', icon: Trophy, key: 'leaderboard' },
    ]
  },
  {
    category: 'nav_cat_system',
    items: [
      { to: '/payment-api', icon: Robot, key: 'payment_api' },
      { to: '/payment-logs', icon: Receipt, key: 'payment_logs' },
      { to: '/notifications', icon: Megaphone, key: 'notification_center' },
      { to: '/settings', icon: Gear, key: 'settings' },
    ]
  },
  {
    category: 'nav_cat_account',
    items: [
      { to: '/profile', icon: UserCircle, key: 'my_profile' },
      { to: '/logs', icon: Bug, key: 'system_debug' },
    ]
  }
];

// Legacy exports for BottomNav
export const OWNER_PRIMARY = OWNER_NAVIGATION[0].items;
export const OWNER_MORE = OWNER_NAVIGATION.slice(1).flatMap(s => s.items);

export const EMPLOYEE_NAVIGATION = [
  {
    category: 'nav_cat_main',
    items: [
      { to: '/survey', icon: ClipboardText, key: 'collect_data' },
      { to: '/survey-results', icon: ClipboardText, key: 'survey_dashboard' },
    ]
  },
  {
    category: 'nav_cat_operations',
    items: [
      { to: '/members', icon: Users, key: 'members' },
    ]
  },
  {
    category: 'nav_cat_account',
    items: [
      { to: '/profile', icon: UserCircle, key: 'my_profile' },
    ]
  }
];

export const EMPLOYEE_PRIMARY = EMPLOYEE_NAVIGATION[0].items;
export const EMPLOYEE_MORE = EMPLOYEE_NAVIGATION.slice(1).flatMap(s => s.items);

export const ALL_SIDEBAR_NAV = OWNER_NAVIGATION.flatMap(s => s.items);
