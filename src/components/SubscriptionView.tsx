import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Building, 
  CreditCard, 
  Calendar, 
  ArrowRight, 
  HelpCircle,
  FileText,
  Users,
  Briefcase,
  Layers
} from 'lucide-react';
import { AuthUser, PlanTier, SystemStats } from '../types';

interface SubscriptionViewProps {
  currentUser: AuthUser | null;
  stats: SystemStats | null;
  onUpdateSubscription: (plan: PlanTier, billing: 'monthly' | 'annually') => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  currentUser,
  stats,
  onUpdateSubscription,
  showToast
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>(currentUser?.planBilling || 'monthly');
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  const currentPlan = currentUser?.plan || 'Professional';

  const plans = [
    {
      id: 'starter',
      tier: 'Starter' as PlanTier,
      name: 'Starter Workspace',
      tagline: 'Ideal for fast-moving startups and agile pilot teams.',
      monthlyPrice: 29,
      annualPrice: 290,
      monthlyPriceDisplay: '$29',
      annualPriceDisplay: '$24',
      badge: 'Startups & Pods',
      features: [
        'Up to 15 team staff profiles',
        'Up to 10 active project initiatives',
        'Full Agile Sprint Kanban Board',
        'Basic Hardware & Asset Inventory',
        'Standard ERD Visualizer (PostgreSQL)',
        'Community & email support',
        'Standard 30-day telemetry retention'
      ],
      limits: {
        employees: 15,
        projects: 10,
        copilotQueries: 50
      }
    },
    {
      id: 'professional',
      tier: 'Professional' as PlanTier,
      name: 'Professional / Growth',
      tagline: 'Complete intelligence & telemetry for scaling enterprises.',
      monthlyPrice: 79,
      annualPrice: 790,
      monthlyPriceDisplay: '$79',
      annualPriceDisplay: '$65',
      popular: true,
      badge: 'Most Popular',
      features: [
        'Up to 100 employee directories',
        'Up to 50 projects & milestones',
        'Dual-axis Recharts telemetry & velocity analytics',
        'Custom Database Schema & Multi-Dialect DDL Export',
        'AI Executive Copilot (Gemini-powered briefings)',
        'Immutable Audit Log Stream (90 days)',
        'Automated inventory restock triggers',
        'Priority email & ticket support'
      ],
      limits: {
        employees: 100,
        projects: 50,
        copilotQueries: 500
      }
    },
    {
      id: 'enterprise',
      tier: 'Enterprise' as PlanTier,
      name: 'Enterprise Strategic Suite',
      tagline: 'Maximum security, custom SLA, bespoke models & white-label control.',
      monthlyPrice: 199,
      annualPrice: 1990,
      monthlyPriceDisplay: '$199',
      annualPriceDisplay: '$165',
      badge: 'Uncapped Scale',
      features: [
        'Unlimited employee directories',
        'Unlimited projects & milestones',
        'Dedicated Cloud database connector & VPC peering',
        'Unlimited Gemini AI Copilot queries',
        '365-day audit history & SOC-2 compliance stream',
        'Role-based access control (Admin, Client, Exec, Lead)',
        '24/7 dedicated account manager & SLA guarantee',
        'Custom schema migrations & automated snapshots'
      ],
      limits: {
        employees: 9999,
        projects: 9999,
        copilotQueries: 9999
      }
    }
  ];

  const handleSelectPlan = async (tier: PlanTier) => {
    if (tier === currentPlan && billingCycle === (currentUser?.planBilling || 'monthly')) {
      showToast(`You are already on the ${tier} (${billingCycle}) plan.`);
      return;
    }

    setProcessingTier(tier);
    try {
      await onUpdateSubscription(tier, billingCycle);
      showToast(`Successfully switched to the ${tier} plan!`);
    } catch {
      showToast('Error updating subscription plan.', 'error');
    } finally {
      setProcessingTier(null);
    }
  };

  const getCapacityPercent = (current: number, max: number) => {
    if (max >= 9999) return 5;
    return Math.min(100, Math.round((current / max) * 100));
  };

  const currentPlanConfig = plans.find(p => p.tier === currentPlan) || plans[1];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Active Plan: {currentPlan} Tier
            </span>
            <span className="text-xs text-slate-400">
              Billed {currentUser?.planBilling || 'monthly'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-2 tracking-tight">
            Subscription & Enterprise License Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Scale your operational capacity, unlock deeper AI Copilot telemetry, and manage enterprise client seats.
          </p>
        </div>

        {/* Current Plan Badge Card */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 shrink-0 text-right space-y-1">
          <div className="text-[11px] text-slate-400">Organization</div>
          <div className="text-sm font-bold text-slate-200">{currentUser?.company || 'Enterprise Client'}</div>
          <div className="text-xs font-mono text-emerald-400 flex items-center justify-end gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> License Active & Verified
          </div>
        </div>
      </div>

      {/* Quota & Capacity Usage Overview */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Current Tier Resource Allocation ({currentPlan})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Employee Quota */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" /> Staff Profiles
              </span>
              <span className="font-mono font-bold">
                {stats?.totalEmployees || 12} / {currentPlanConfig.limits.employees >= 9999 ? '∞' : currentPlanConfig.limits.employees}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${getCapacityPercent(stats?.totalEmployees || 12, currentPlanConfig.limits.employees)}%` }}
              />
            </div>
          </div>

          {/* Project Initiatives Quota */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Active Initiatives
              </span>
              <span className="font-mono font-bold">
                {stats?.totalProjects || 8} / {currentPlanConfig.limits.projects >= 9999 ? '∞' : currentPlanConfig.limits.projects}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${getCapacityPercent(stats?.totalProjects || 8, currentPlanConfig.limits.projects)}%` }}
              />
            </div>
          </div>

          {/* AI Copilot Credits */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Executive Queries
              </span>
              <span className="font-mono font-bold">
                24 / {currentPlanConfig.limits.copilotQueries >= 9999 ? '∞' : currentPlanConfig.limits.copilotQueries}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${getCapacityPercent(24, currentPlanConfig.limits.copilotQueries)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs text-slate-400">Choose billing cadence:</span>
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annually')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'annually'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.tier;
          const displayPrice = billingCycle === 'annually' ? plan.annualPriceDisplay : plan.monthlyPriceDisplay;
          const isProcessing = processingTier === plan.tier;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 transition-all relative flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-900/90 border-2 border-indigo-500 shadow-2xl shadow-indigo-950/40'
                  : plan.popular
                  ? 'bg-slate-900/80 border border-purple-500/40 shadow-xl'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top pill badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  plan.popular 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {plan.badge}
                </span>

                {isCurrent && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Current Plan
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-100">{plan.name}</h3>
                <p className="text-xs text-slate-400 min-h-[32px]">{plan.tagline}</p>
                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                    {displayPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / month {billingCycle === 'annually' ? '(billed yearly)' : ''}
                  </span>
                </div>
              </div>

              {/* Feature List */}
              <div className="my-6 space-y-2.5 border-t border-slate-800 pt-5 text-xs">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <div className="p-0.5 rounded bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isCurrent || isProcessing}
                onClick={() => handleSelectPlan(plan.tier)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                    : plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isCurrent ? (
                  <span>Currently Subscribed</span>
                ) : (
                  <>
                    <span>Upgrade to {plan.tier}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoice & Billing History Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Billing History & Invoices</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Auto-renews next cycle</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Billing Date</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              <tr>
                <td className="py-2.5 font-mono text-slate-400">INV-2026-0891</td>
                <td className="py-2.5 font-mono">Oct 01, 2026</td>
                <td className="py-2.5 font-semibold text-slate-200">{currentPlan} Tier</td>
                <td className="py-2.5 font-mono font-semibold">${currentPlan === 'Enterprise' ? '199.00' : currentPlan === 'Starter' ? '29.00' : '79.00'}</td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    Paid
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono">
                  <button 
                    onClick={() => showToast('Receipt downloaded: INV-2026-0891.pdf')}
                    className="text-indigo-400 hover:underline cursor-pointer"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono text-slate-400">INV-2026-0742</td>
                <td className="py-2.5 font-mono">Sep 01, 2026</td>
                <td className="py-2.5 font-semibold text-slate-200">{currentPlan} Tier</td>
                <td className="py-2.5 font-mono font-semibold">${currentPlan === 'Enterprise' ? '199.00' : currentPlan === 'Starter' ? '29.00' : '79.00'}</td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    Paid
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono">
                  <button 
                    onClick={() => showToast('Receipt downloaded: INV-2026-0742.pdf')}
                    className="text-indigo-400 hover:underline cursor-pointer"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
