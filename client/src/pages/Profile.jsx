import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    Target,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeature } from '../hooks/useFeature';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import ContributionGraph from '../components/profile/ContributionGraph';
import UserListModal from '../components/UserListModal';

import { getNotes, resetNotes } from '../features/notes/noteSlice';
import Pagination from '../components/Pagination';

const Profile = () => {
    const dispatch = useDispatch();
    const { designSystem, saveDesignSystem, allThemes } = useTheme();

    const isExperimentB = useFeature('v2_bars', { abTest: 'B' });

    const { user, isLoading, isSuccess } = useSelector((state) => state.auth);
    const { notes, total, pagination } = useSelector((state) => state.notes);

    const [page, setPage] = useState(1);
    const limit = 6;
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        headline: '',
        experience: [],
        skills: [],
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

    // UI State for array inputs
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                headline: user.headline || '',
                experience: user.experience || [],
                skills: user.skills || [],
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
            dispatch(getNotes({ page, limit }));
        }
    }, [user, page, dispatch]);

    useEffect(() => {
        if (isSuccess && isEditing) {
            setIsEditing(false);
            dispatch(reset());
        }
    }, [isSuccess, isEditing, dispatch]);

    const handleAddSkill = (e) => {
        e.preventDefault(); // Prevent form submission
        if (!newSkill.trim()) return;
        if (formData.skills.some(s => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
            toast.error('Skill already exists');
            return;
        }
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, { name: newSkill.trim(), endorsements: [] }]
        }));
        setNewSkill('');
    };

    const handleRemoveSkill = (skillName) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s.name !== skillName)
        }));
    };

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
        updateData.append('headline', formData.headline);
        updateData.append('skills', JSON.stringify(formData.skills));
        updateData.append('socialLinks', JSON.stringify(formData.socialLinks));
        updateData.append('customLinks', JSON.stringify(formData.customLinks));
        if (formData.avatarFile) updateData.append('avatar', formData.avatarFile);
        dispatch(updateProfile(updateData));
    };
    if (isLoading && !isEditing) return <Spinner fullPage message="Synching Profile..." />;

    const userNotesCount = total || 0;
    const currentUserNotes = notes || [];

    // Derived Data
    const topSkills = Object.entries(
        currentUserNotes.flatMap(n => n.tags || []).reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const pinnedNotes = currentUserNotes.slice(0, 4);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-16 animate-in fade-in duration-700">
            {/* Immersive Header / Identity */}
            <div className="mb-10 relative group">
            <header className="relative bg-card/40 border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl group/header">
                {/* Premium Profile Banner */}
                <div className="relative h-40 lg:h-52 bg-muted/20 border-b border-border/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                    {/* Dynamic Decorative Elements */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />
                    
                    {/* Glass Overlay for depth */}
                    <div className="absolute inset-0 backdrop-blur-[1px]" />
                </div>
                
                <div className="relative px-8 lg:px-12 -mt-16 lg:-mt-20 pb-10 flex flex-col lg:flex-row items-center lg:items-end gap-8">
                    {/* Avatar Section */}
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 lg:w-40 lg:h-40 bg-card border-4 border-background rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-muted-foreground/30">{user?.username?.charAt(0).toUpperCase()}</span>
                            )}
                            
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                    <Plus className="text-white mb-1" size={24} />
                                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">Update Photo</span>
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
                        {/* Online Status Indicator */}
                        <div className="absolute bottom-4 right-4 w-5 h-5 bg-emerald-500 border-4 border-background rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    </div>

                        <div className="flex-1 space-y-3 relative z-10">
                            <div className="space-y-1">
                                <div className="flex items-center justify-center lg:justify-start gap-4">
                                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{user?.username}</h1>
                                    {user?.role === 'admin' && (
                                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shadow-lg shadow-primary/5" title="System Administrator">
                                            <ShieldCheck size={22} />
                                        </div>
                                    )}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowKebab(!showKebab)}
                                            className="p-2.5 hover:bg-secondary/80 rounded-xl transition-all text-muted-foreground hover:text-primary active:scale-95"
                                        >
                                            <MoreVertical size={22} />
                                        </button>
                                        <AnimatePresence>
                                            {showKebab && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 mt-3 w-52 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => { setIsEditing(true); setShowKebab(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-primary/10 hover:text-primary transition-colors"
                                                    >
                                                        <Edit3 size={16} /> Edit Profile
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(window.location.href);
                                                            toast.success('Profile link copied');
                                                            setShowKebab(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-primary/10 hover:text-primary transition-colors border-t border-border/50"
                                                    >
                                                        <ExternalLink size={16} /> Share Profile
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <p className="text-[10px] lg:text-xs font-bold text-primary tracking-[0.4em] uppercase opacity-70">
                                    {user?.reputation >= 1000 ? 'Master Developer' :
                                        user?.reputation >= 500 ? 'Lead Developer' :
                                            user?.reputation >= 250 ? 'Senior Developer' :
                                                user?.reputation >= 100 ? 'Associate Developer' : 'Junior Developer'}
                                </p>
                            </div>
    
                            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl font-medium">
                                {user?.bio || 'Initializing architect profile info...'}
                            </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-background/40 border border-border/50 rounded-xl">
                                <Activity size={14} className="text-emerald-500 " />
                                <span className="text-[10px] font-bold  tracking-widest text-muted-foreground">Reputation:</span>
                                <span className="text-[13px] font-bold text-foreground">{user?.reputation || 0}</span>
                            </div>
                            <div className="flex items-center gap-6 pl-4 border-l border-border/20">
                                <button onClick={() => setModalData({ isOpen: true, type: 'followers', title: 'Followers' })} className="group text-center">
                                    <p className="text-lg font-bold group-hover:text-primary transition-colors">{user?.followers?.length || 0}</p>
                                    <p className="text-[9px]  font-bold text-muted-foreground/40 tracking-widest">Followers</p>
                                </button>
                                <button onClick={() => setModalData({ isOpen: true, type: 'following', title: 'Following' })} className="group text-center">
                                    <p className="text-lg font-bold group-hover:text-primary transition-colors">{user?.following?.length || 0}</p>
                                    <p className="text-[9px]  font-bold text-muted-foreground/40 tracking-widest">Following</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-72 space-y-4">
                        {/* XP Progress Card */}
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden group/xp">
                            
                            <div className="flex justify-between items-end mb-2 relative z-10">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-primary  tracking-widest">Experience Points</p>
                                    <p className="text-lg font-bold">Level {Math.floor((user?.reputation || 0) / 100) + 1}</p>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground  opacity-40">{user?.reputation % 100}/100 XP</span>
                            </div>
                            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50 relative z-10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${user?.reputation % 100}%` }}
                                    className="h-full bg-primary relative shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                                />
                            </div>
                            <p className="text-[8px] text-primary/60 font-bold  tracking-[0.2em] text-center pt-2  relative z-10">Optimization in progress...</p>
                        </div>
                    </div>
                </div>
            </header>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_3fr] gap-10">
                {/* Left Sidebar: Detailed Info */}
                <div className="space-y-8 order-2 lg:order-1">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card/40 border border-border/50 rounded-2xl p-5 hover:border-primary/40 transition-all group">
                            <FileText size={16} className="text-primary mb-3 group-hover:scale-125 transition-transform" />
                            <p className="text-[9px] font-bold  text-muted-foreground/60 tracking-widest mb-1">Notes Saved</p>
                            <h4 className="text-2xl font-bold">{userNotesCount}</h4>
                        </div>
                        <div className="bg-card/40 border border-border/50 rounded-2xl p-5 hover:border-orange-500/40 transition-all group">
                            <Terminal size={16} className="text-orange-500 mb-3 group-hover:scale-125 transition-transform" />
                            <p className="text-[9px] font-bold  text-muted-foreground/60 tracking-widest mb-1">Games Played</p>
                            <h4 className="text-2xl font-bold">{user?.arcade?.gamesPlayed || 0}</h4>
                        </div>
                    </div>

                    {/* Technical Proficiency */}
                    <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[1.5rem] p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Layers size={18} className="text-primary" />
                            </div>
                            <h3 className="text-[11px] font-bold  tracking-[0.2em] text-foreground">Top Skills</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {user?.skills?.length > 0 ? (
                                user.skills.map((skill, idx) => (
                                    <div key={idx} className="group flex items-center gap-3 bg-background/50 border border-border/50 px-4 py-2 rounded-xl hover:border-primary/30 transition-all cursor-default">
                                        <span className="text-[12px] font-bold text-foreground/80">{skill.name}</span>
                                        {skill.endorsements?.length > 0 && (
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                                                <CheckCircle size={10} strokeWidth={3} /> {skill.endorsements.length}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[11px] text-muted-foreground/40 italic">Waiting for skill data...</p>
                            )}
                        </div>
                    </div>

                    {/* Visual Interface Settings */}
                    <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[1.5rem] p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Zap size={18} className="text-primary" />
                            </div>
                            <h3 className="text-[11px] font-bold  tracking-[0.2em] text-foreground">Theme Settings</h3>
                        </div>

                        <div className="space-y-2">
                            {allThemes.map((t) => {
                                const isActive = designSystem === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => saveDesignSystem(t.id)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 group
                                            ${isActive
                                                ? 'bg-primary/5 border-primary/40 shadow-xl shadow-primary/5'
                                                : 'bg-transparent border-transparent hover:bg-secondary/40'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className={`w-10 h-10 rounded-xl transition-all duration-500 border-2 ${isActive ? 'border-primary' : 'border-transparent'}`}
                                                style={{ backgroundColor: t.color, opacity: isActive ? 1 : 0.4 }}
                                            />
                                        </div>

                                        <div className="flex-1 text-left">
                                            <p className={`text-[12px] font-bold transition-colors  tracking-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {t.name}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground/40 font-bold  tracking-[0.1em]">
                                                {t.id === 'v7' ? 'Neo-Citrus Protocol' : 'Legacy Interface'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area: Repository & Activity */}
                <div className="space-y-8 order-1 lg:order-2">
                    {isEditing ? (
                        <div className="bg-card/40 backdrop-blur-3xl border border-border/50 rounded-[2rem] p-8 lg:p-10 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative">
                            
                            
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold  tracking-tighter flex items-center gap-3">
                                        <Edit3 size={24} className="text-primary" /> Edit Profile
                                    </h2>
                                    <p className="text-[10px] font-bold text-muted-foreground  tracking-[0.3em]">Update your information</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-all"><X size={24} /></button>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-10 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold  text-muted-foreground/60 ml-1 tracking-[0.2em]">Username</label>
                                        <input name="username" value={formData.username} onChange={onChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold  text-muted-foreground/60 ml-1 tracking-[0.2em]">Email Address</label>
                                        <input name="email" value={formData.email} onChange={onChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold  text-muted-foreground/60 ml-1 tracking-[0.2em]">About Me</label>
                                    <textarea name="bio" value={formData.bio} onChange={onChange} className="w-full bg-background/50 border border-border/50 rounded-xl p-5 text-sm font-medium min-h-[160px] outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="Tell us about yourself..." />
                                </div>

                                <div className="space-y-6 pt-8 border-t border-border/20">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[11px] font-bold  tracking-[0.3em] text-primary">Technical Stacks</h3>
                                        <div className="flex gap-2">
                                            <input
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                                className="bg-background/50 border border-border/50 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all w-60"
                                                placeholder="Add technology..."
                                            />
                                            <button type="button" onClick={handleAddSkill} className="p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all"><Plus size={18} /></button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5 p-4 bg-background/30 rounded-2xl border border-border/30 min-h-[100px]">
                                        {formData.skills.map((skill, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-card border border-border/50 px-4 py-2 rounded-xl text-[11px] font-bold  tracking-tight shadow-sm animate-in zoom-in duration-300">
                                                {skill.name}
                                                <button type="button" onClick={() => handleRemoveSkill(skill.name)} className="text-muted-foreground/40 hover:text-rose-500 transition-colors"><X size={14} /></button>
                                            </div>
                                        ))}
                                        {formData.skills.length === 0 && <span className="text-[11px] text-muted-foreground/30  font-bold italic self-center">Waiting for input...</span>}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold  tracking-[0.3em] text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-10 bg-secondary/50 border border-border/50 py-4 rounded-2xl font-bold  tracking-[0.3em] text-[11px] hover:bg-secondary transition-all">Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Activity Matrix */}
                            <div className="bg-card/30 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group">
                                
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <h3 className="text-[11px] font-bold  tracking-[0.3em] text-foreground">Activity History</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary " />
                                        <span className="text-[9px] font-bold text-muted-foreground ">Live Updates</span>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <ContributionGraph logs={user?.activityLogs} />
                                </div>
                            </div>

                            {/* Pinned Repository */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                            <Target size={18} />
                                        </div>
                                        <h3 className="text-[11px] font-bold  tracking-[0.3em] text-foreground">Featured Notes</h3>
                                    </div>
                                    <Link to="/notes" className="text-[10px] font-bold text-primary  tracking-[0.2em] hover:underline flex items-center gap-2">View All <ArrowRight size={14} /></Link>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {pinnedNotes.length > 0 ? pinnedNotes.map(note => (
                                        <Link key={note._id} to={`/notes/${note._id}`} className="group relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-[1.5rem] p-6 hover:border-primary/40 transition-all overflow-hidden">
                                            
                                            
                                            <div className="relative z-10 flex items-start justify-between mb-3">
                                                <h4 className="font-bold text-lg group-hover:text-primary transition-colors truncate pr-6  tracking-tighter">{note.title}</h4>
                                                <div className={`w-2 h-2 rounded-full ${note.isPublic ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'} mt-1.5 shrink-0`} />
                                            </div>
                                            
                                            <p className="relative z-10 text-[12px] text-muted-foreground/80 line-clamp-2 mb-6 font-medium leading-relaxed">
                                                {note.content?.replace(/[#*`]/g, '').slice(0, 100)}...
                                            </p>
                                            
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    {note.tags?.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[8px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 ">{tag}</span>
                                                    ))}
                                                    {note.tags?.length > 2 && <span className="text-[9px] font-bold text-muted-foreground/40">+{note.tags.length - 2}</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-bold  text-primary">Open</span>
                                                    <ChevronRight size={12} className="text-primary" />
                                                </div>
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="col-span-full py-16 text-center bg-card/20 border border-dashed border-border/50 rounded-[2rem] space-y-3 opacity-30">
                                            <Zap size={32} className="mx-auto" />
                                            <p className="text-[11px] font-bold  tracking-[0.3em]">No featured notes found</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-4 flex justify-center">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={Math.ceil(userNotesCount / limit)}
                                        onPageChange={setPage}
                                    />
                                </div>
                            </section>
                        </div>
                    )}
                </div>
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
