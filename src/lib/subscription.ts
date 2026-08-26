// Paystack-backed subscription tiers (KES, monthly recurring)
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: "KES 0",
    period: "/month",
    description: "Get started with basic access",
    features: [
      "Browse 5 job listings per day",
      "1 basic CV template",
      "3 academy lessons",
      "Job alerts (weekly)",
    ],
    limits: {
      jobViewsPerDay: 5,
      cvTemplates: 1,
      academyLessons: 3,
      canApply: true,
      atsScore: false,
      cvReview: false,
      prioritySupport: false,
    },
  },
  basic: {
    name: "Basic",
    price: "KES 999",
    period: "/month",
    description: "Full access for active job seekers",
    features: [
      "Unlimited job listings",
      "All CV templates",
      "10 academy lessons/month",
      "Job alerts (daily)",
      "Apply to unlimited jobs",
    ],
    limits: {
      jobViewsPerDay: Infinity,
      cvTemplates: Infinity,
      academyLessons: 10,
      canApply: true,
      atsScore: false,
      cvReview: false,
      prioritySupport: false,
    },
  },
  premium: {
    name: "Premium",
    price: "KES 1,999",
    period: "/month",
    description: "Full power for serious job seekers",
    features: [
      "Everything in Basic",
      "ATS score reports",
      "Full academy access",
      "CV review & feedback",
      "LinkedIn profile optimization",
      "Mock interview practice",
      "Career coaching sessions",
      "Priority support",
      "Featured applicant badge",
    ],
    limits: {
      jobViewsPerDay: Infinity,
      cvTemplates: Infinity,
      academyLessons: Infinity,
      canApply: true,
      atsScore: true,
      cvReview: true,
      prioritySupport: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
