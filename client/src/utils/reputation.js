
export const REPUTATION_TIERS = [
    { name: 'New Contributor', min: 0, max: 100, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
    { name: 'Skilled Developer', min: 101, max: 500, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { name: 'Senior Pro', min: 501, max: 1500, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { name: 'Expert Architect', min: 1501, max: 5000, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { name: 'Legendary Master', min: 5001, max: Infinity, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', animate: true }
];

export const getReputationTier = (rep = 0) => {
    return REPUTATION_TIERS.find(t => rep >= t.min && rep <= t.max) || REPUTATION_TIERS[0];
};

export const getProgressToNextTier = (rep = 0) => {
    const current = getReputationTier(rep);
    const nextIndex = REPUTATION_TIERS.indexOf(current) + 1;
    if (nextIndex >= REPUTATION_TIERS.length) return 100;

    const next = REPUTATION_TIERS[nextIndex];
    const totalNeeded = next.min - current.min;
    const currentEarned = rep - current.min;
    return Math.floor((currentEarned / totalNeeded) * 100);
};
