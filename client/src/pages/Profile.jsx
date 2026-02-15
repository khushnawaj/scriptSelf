import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import {
    Edit3,
    Github,
    Linkedin,
    Twitter,
    FileText,
    Mail,
    Globe,
    ExternalLink,
    Plus,
    Trash2,
    Terminal,
    ShieldCheck,
    Flame,
    Trophy,
    Zap,
    X,
    ChevronRight,
    Activity,
    Layers,
    MoreVertical,
    CheckCircle,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useFeature } from '../hooks/useFeature';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import ContributionGraph from '../components/profile/ContributionGraph';
import UserListModal from '../components/UserListModal';

const Profile = () => {
    const dispatch = useDispatch();
    const { designSystem, saveDesignSystem, allThemes } = useTheme();

    const isExperimentB = useFeature('v2_bars', { abTest: 'B' });

    const { user, isLoading, isSuccess } = useSelector((state) => state.auth);
    const { notes } = useSelector((state) => state.notes);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        avatar: '',
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            website: '',
            leetcode: ''
        },
        customLinks: []
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showKebab, setShowKebab] = useState(false);
    const [modalData, setModalData] = useState({ isOpen: false, type: '', title: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                socialLinks: {
                    github: user.socialLinks?.github || '',
                    linkedin: user.socialLinks?.linkedin || '',
                    twitter: user.socialLinks?.twitter || '',
                    website: user.website || '',
                    leetcode: user.socialLinks?.leetcode || ''
                },
                customLinks: user.customLinks || []
            });
        }
    }, [user]);

    useEffect(() => {
        if (isSuccess && isEditing) {
            setIsEditing(false);
            dispatch(reset());
        }
    }, [isSuccess, isEditing, dispatch]);

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('socialLinks.')) {
            const child = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addCustomLink = () => {
        setFormData(prev => ({
            ...prev,
            customLinks: [...prev.customLinks, { label: '', url: '' }]
        }));
    };

    const removeCustomLink = (index) => {
        setFormData(prev => ({
            ...prev,
            customLinks: prev.customLinks.filter((_, i) => i !== index)
        }));
    };

    const onCustomLinkChange = (index, field, value) => {
        const updated = [...formData.customLinks];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, customLinks: updated }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const updateData = new FormData();
        updateData.append('username', formData.username);
        updateData.append('email', formData.email);
        updateData.append('bio', formData.bio);
        updateData.append('socialLinks', JSON.stringify(formData.socialLinks));
        updateData.append('customLinks', JSON.stringify(formData.customLinks));
        if (formData.avatarFile) updateData.append('avatar', formData.avatarFile);
        dispatch(updateProfile(updateData));
    };

    if (isLoading && !isEditing) return <Spinner fullPage message="Synching Profile..." />;

    const currentUserNotes = notes.filter(n => (n.user?._id || n.user) === user?._id);
    const userNotesCount = currentUserNotes.length;

    // Derived Data
    const topSkills = Object.entries(
        currentUserNotes.flatMap(n => n.tags || []).reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const pinnedNotes = currentUserNotes.slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-10">

                {/* --- SIDEBAR: Profile Identity --- */}
                <aside className="lg:w-72 space-y-6 shrink-0">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative group">
                        {/* Kebab Menu */}
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setShowKebab(!showKebab)}
                                className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground"
                            >
                                <MoreVertical size={18} />
                            </button>
                            {showKebab && (
                                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-10 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => { setIsEditing(true); setShowKebab(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                    >
                                        <Edit3 size={14} /> Edit Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success('Link copied');
                                            setShowKebab(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                    >
                                        <ExternalLink size={14} /> Copy Link
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative group/avatar mb-4">
                                <div className="w-20 h-20 bg-secondary border border-border rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-muted-foreground">{user?.username?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                        <Plus className="text-white" size={20} />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    avatarFile: e.target.files[0],
                                                    avatar: URL.createObjectURL(e.target.files[0])
                                                }));
                                            }
                                        }} />
                                    </label>
                                )}
                            </div>

                            <div className="text-center space-y-1 mb-6">
                                <h1 className="text-xl font-bold text-foreground truncate max-w-[200px] flex items-center justify-center gap-2">
                                    {user?.username}
                                    {user?.role === 'admin' && <ShieldCheck size={18} className="text-primary" />}
                                </h1>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                                        {user?.reputation >= 1000 ? 'Grandmaster Architect' :
                                            user?.reputation >= 500 ? 'Lead Architect' :
                                                user?.reputation >= 250 ? 'Senior Architect' :
                                                    user?.reputation >= 100 ? 'Associate Architect' : 'Junior Architect'}
                                    </p>

                                    {/* XP Progress Bar */}
                                    <div className="w-full max-w-[140px] mx-auto space-y-1">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">
                                            <span>LVL {Math.floor((user?.reputation || 0) / 100) + 1}</span>
                                            <span>{user?.reputation % 100}/100 XP</span>
                                        </div>
                                        <div className={`h-1 w-full bg-secondary rounded-full overflow-hidden border border-border/50 relative ${isExperimentB ? 'h-1.5' : ''}`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${user?.reputation % 100}%` }}
                                                className={`h-full relative shadow-[0_0_8px_rgba(var(--primary),0.5)] ${isExperimentB
                                                    ? 'bg-gradient-to-r from-primary to-blue-400'
                                                    : 'bg-primary'
                                                    }`}
                                            >
                                                {isExperimentB && (
                                                    <motion.div
                                                        animate={{ x: ['-100%', '100%'] }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2"
                                                    />
                                                )}
                                            </motion.div>
                                        </div>
                                        {isExperimentB && (
                                            <p className="text-[7px] text-primary/60 font-black uppercase tracking-[0.2em] text-center pt-1 animate-pulse">Neural Sync Active</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 border-t border-border pt-6 w-full justify-center">
                                <button
                                    onClick={() => setModalData({ isOpen: true, type: 'followers', title: 'Followers' })}
                                    className="text-center group"
                                >
                                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{user?.followers?.length || 0}</p>
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Followers</p>
                                </button>
                                <div className="w-[1px] h-8 bg-border opacity-50" />
                                <button
                                    onClick={() => setModalData({ isOpen: true, type: 'following', title: 'Following' })}
                                    className="text-center group"
                                >
                                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{user?.following?.length || 0}</p>
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Following</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers size={14} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">About</h3>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                            "{user?.bio || 'Documenting tech, one script at a time.'}"
                        </p>
                        <div className="flex flex-col gap-2.5 text-[11px] text-muted-foreground pt-2">
                            <span className="flex items-center gap-2 px-1"><Mail size={13} className="opacity-50" /> {user?.email}</span>
                            <span className="flex items-center gap-2 px-1"><Globe size={13} className="opacity-50" /> Member since {new Date(user?.createdAt).getFullYear()}</span>
                        </div>

                        {/* External Presence */}
                        {(user?.socialLinks?.github || user?.socialLinks?.linkedin || user?.socialLinks?.twitter) && (
                            <div className="flex items-center gap-3 pt-4 border-t border-border">
                                {user?.socialLinks?.github && (
                                    <a href={`https://github.com/${user.socialLinks.github}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                        <Github size={16} />
                                    </a>
                                )}
                                {user?.socialLinks?.linkedin && (
                                    <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                        <Linkedin size={16} />
                                    </a>
                                )}
                                {user?.socialLinks?.twitter && (
                                    <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                        <Twitter size={16} />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Custom Links */}
                        {user?.customLinks?.length > 0 && (
                            <div className="flex flex-col gap-2 pt-3">
                                {user.customLinks.filter(l => l.url).map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-2 truncate"
                                    >
                                        <ExternalLink size={10} className="shrink-0" /> {link.label || 'Other Link'}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Arcade Progress */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <Trophy size={14} /> Skills & Rank
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-center hover:bg-muted transition-colors">
                                <p className="text-sm font-black text-primary">{user?.arcade?.points || 0}</p>
                                <p className="text-[9px] uppercase font-bold text-muted-foreground">Total XP</p>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-center hover:bg-muted transition-colors">
                                <p className="text-sm font-black text-orange-500">{user?.arcade?.streak || 0}d</p>
                                <p className="text-[9px] uppercase font-bold text-muted-foreground">Streak</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="space-y-2">
                                {[
                                    { min: 1, label: "Initiator", icon: Zap, color: "text-blue-500" },
                                    { min: 5, label: "Technician", icon: Terminal, color: "text-emerald-500" },
                                    { min: 20, label: "Legend", icon: Flame, color: "text-orange-500" }
                                ].map((badge, idx) => {
                                    const isEarned = (user?.arcade?.gamesPlayed || 0) >= badge.min;
                                    return (
                                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${isEarned ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-border/30 opacity-40 grayscale'}`}>
                                            <badge.icon size={13} className={isEarned ? badge.color : ''} />
                                            <span className="text-[11px] font-bold">{badge.label}</span>
                                            {isEarned && <CheckCircle size={10} className="ml-auto text-primary" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Design System Picker - Minimal & Calm */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Layers size={14} className="text-primary" /> Visual Identity
                            </h3>
                        </div>

                        <div className="space-y-2">
                            {allThemes.map((t) => {
                                const isActive = designSystem === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => saveDesignSystem(t.id)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-primary/[0.03] border-primary/40 shadow-sm'
                                                : 'bg-transparent border-transparent hover:bg-secondary/40'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className={`w-8 h-8 rounded-lg shadow-inner transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                                                style={{ backgroundColor: t.color, opacity: isActive ? 1 : 0.6 }}
                                            />
                                            {isActive && (
                                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-white rounded-full flex items-center justify-center ring-2 ring-card">
                                                    <CheckCircle size={8} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 text-left">
                                            <p className={`text-[12px] font-bold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'}`}>
                                                {t.name}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-tighter">
                                                {t.id === 'v1' ? 'Classic Protocol' :
                                                    t.id === 'v2' ? 'Modern Interface' :
                                                        t.id === 'v3' ? 'Technical Logic' :
                                                            t.id === 'v4' ? 'Guided Learning' : 'Tech Noir Mode'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="pt-2">
                            <p className="text-[10px] text-muted-foreground/50 italic text-center leading-relaxed">System design preferences are synchronized across your cloud profile.</p>
                        </div>
                    </div>

                </aside>



                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 space-y-8">
                    {isEditing ? (
                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <Edit3 size={20} className="text-primary" /> Edit Identity
                                </h2>
                                <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Username</label>
                                        <input name="username" value={formData.username} onChange={onChange} className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Email</label>
                                        <input name="email" value={formData.email} onChange={onChange} className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Account Bio</label>
                                    <textarea name="bio" value={formData.bio} onChange={onChange} className="w-full bg-background border border-border rounded-md p-4 text-sm min-h-[140px] outline-none focus:ring-1 focus:ring-primary" placeholder="Describe your technical journey..." />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">External Handles</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">GitHub Username</label>
                                            <input name="socialLinks.github" value={formData.socialLinks.github} onChange={onChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. khushnawaj" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">LinkedIn URL</label>
                                            <input name="socialLinks.linkedin" value={formData.socialLinks.linkedin} onChange={onChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="LinkedIn Profile Link" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Twitter Handle</label>
                                            <input name="socialLinks.twitter" value={formData.socialLinks.twitter} onChange={onChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="Twitter Username" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Custom Connections</h3>
                                        <button type="button" onClick={addCustomLink} className="text-[9px] font-bold uppercase text-primary hover:underline flex items-center gap-1">
                                            <Plus size={12} /> Add Portfolio/Blog
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.customLinks.map((link, idx) => (
                                            <div key={idx} className="flex gap-2 items-end group animate-in slide-in-from-left-2 duration-200">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-muted-foreground ml-1 tracking-tighter">Label</label>
                                                    <input value={link.label} onChange={(e) => onCustomLinkChange(idx, 'label', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Portfolio" />
                                                </div>
                                                <div className="flex-[2] space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-muted-foreground ml-1 tracking-tighter">URL</label>
                                                    <input value={link.url} onChange={(e) => onCustomLinkChange(idx, 'url', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="https://..." />
                                                </div>
                                                <button type="button" onClick={() => removeCustomLink(idx)} className="p-2 mb-0.5 text-muted-foreground hover:text-rose-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button type="submit" className="px-8 py-2.5 bg-primary text-white rounded-md font-bold text-sm shadow-sm hover:translate-y-[-1px] transition-all">Save Profile</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-secondary border border-border rounded-md text-sm font-bold">Discard</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all group">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">Script Vault</p>
                                    <h4 className="text-2xl font-bold flex items-center gap-2"><FileText size={20} className="text-primary/70" /> {userNotesCount}</h4>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all group">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">Reputation</p>
                                    <h4 className="text-2xl font-bold flex items-center gap-2"><Activity size={20} className="text-primary/70" /> {user?.reputation || 0}</h4>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all group">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">Simulations</p>
                                    <h4 className="text-2xl font-bold flex items-center gap-2"><Terminal size={20} className="text-primary/70" /> {user?.arcade?.gamesPlayed || 0}</h4>
                                </div>
                            </div>

                            <ContributionGraph logs={user?.activityLogs} />

                            <section className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Layers size={14} className="text-primary" /> Curated Repository
                                    </h3>
                                    <Link to="/notes" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">Complete Archive <ChevronRight size={12} /></Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pinnedNotes.map(note => (
                                        <Link key={note._id} to={`/notes/${note._id}`} className="group p-5 bg-card border border-border rounded-xl hover:border-primary/40 transition-all shadow-sm">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-sm group-hover:text-primary transition-colors truncate pr-4">{note.title}</h4>
                                                <div className={`w-1.5 h-1.5 rounded-full ${note.isPublic ? 'bg-emerald-500' : 'bg-rose-500'} mt-1.5`} />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                                {note.content?.replace(/[#*`]/g, '').slice(0, 90)}...
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                {note.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[8px] font-bold text-primary border border-primary/10 bg-primary/5 px-2 py-0.5 rounded uppercase">{tag}</span>
                                                ))}
                                                {note.tags?.length > 2 && <span className="text-[8px] text-muted-foreground">+{note.tags.length - 2}</span>}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </main>
            </div>

            <UserListModal
                isOpen={modalData.isOpen}
                onClose={() => setModalData({ ...modalData, isOpen: false })}
                userId={user?._id}
                type={modalData.type}
                title={modalData.title}
            />
        </div>
    );
};

export default Profile;
