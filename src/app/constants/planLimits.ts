export type UserPlan = 'free' | 'pro';

export const PLAN_LIMITS = {
  free: {
    activeEvents: 3,
    invitesPerEvent: 10,
  },
  pro: {
    activeEvents: 20,
    invitesPerEvent: 100,
  },
} as const;

export const getSafePlan = (plan?: string | null): UserPlan => {
  return plan === 'pro' ? 'pro' : 'free';
};

export const getPlanLimits = (plan?: string | null) => {
  const safePlan = getSafePlan(plan);
  return PLAN_LIMITS[safePlan];
};

export const hasUnlimitedAccess = (value?: boolean | null) => {
  return value === true;
};