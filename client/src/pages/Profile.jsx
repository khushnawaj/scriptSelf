import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import {
    Edit3, ExternalLink, Plus, X, ChevronRight, Activity, Layers, MoreVertical,
    CheckCircle, Target, ArrowRight, FileText, Terminal, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeature } from '../hooks/useFeature';
import { useTheme } from '../context/ThemeContext';
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
        socialLinks: { github: '', linkedin: '', twitter: '', website: '', leetcode: '' },
        customLinks: []
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showKebab, setShowKebab] = useState(false);
    const [modalData, setModalData] = useState({ isOpen: false, type: '', title: '' });

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
        e.preventDefault();
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
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.name !== skillName) }));
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('socialLinks.')) {
            const child = name.split('.')[1];
            setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const pinnedNotes = currentUserNotes.slice(0, 4);

    const level = Math.floor((user?.reputation || 0) / 100) + 1;
    const repPct = (user?.reputation || 0) % 100;

    const rankTitle = user?.reputation >= 1000 ? 'Master Developer' :
        user?.reputation >= 500 ? 'Lead Developer' :
            user?.reputation >= 250 ? 'Senior Developer' :
                user?.reputation >= 100 ? 'Associate Developer' : 'Software Developer';

    const card = 'bg-card border border-border/40 rounded-3xl shadow-sm p-6';

    return (
        <div className="w-full max-w-[1300px] mx-auto px-6 pb-16 pt-8 animate-in fade-in duration-700">
            
            {/* Header / Identity */}
            <div className={`${card} mb-6 p-0 overflow-hidden relative`}>
                {/* Clean Banner */}
                <div className="h-40 bg-muted/30 border-b border-border/40 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                </div>
                
                <div className="px-8 pb-8 relative -mt-16 flex flex-col lg:flex-row items-center lg:items-end gap-8">
                    {/* Avatar Section */}
                    <div className="relative group shrink-0">
                        <div className="w-32 h-32 bg-card border-4 border-background rounded-3xl shadow-md flex items-center justify-center overflow-hidden transition-transform duration-500">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-light text-primary bg-primary/10 w-full h-full flex items-center justify-center">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            )}
                            
                            {isEditing && (
                                <label className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Plus className="text-foreground mb-1" size={24} strokeWidth={1.5} />
                                    <span className="text-[10px] font-medium text-foreground tracking-wide uppercase">Update</span>
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
                        {/* Online Indicator */}
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 space-y-2 text-center lg:text-left z-10 w-full">
                        <div className="flex flex-col lg:flex-row items-center gap-3">
                            <h1 className="text-3xl font-medium tracking-tight text-foreground flex items-center gap-2">
                                {user?.username}
                                {user?.role === 'admin' && (
                                    <ShieldCheck size={20} className="text-primary" />
                                )}
                            </h1>
                            
                            <div className="relative ml-auto">
                                <button
                                    onClick={() => setShowKebab(!showKebab)}
                                    className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
                                >
                                    <MoreVertical size={20} />
                                </button>
                                <AnimatePresence>
                                    {showKebab && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute right-0 mt-2 w-48 bg-card border border-border/40 rounded-2xl shadow-xl z-50 py-1 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => { setIsEditing(true); setShowKebab(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                            >
                                                <Edit3 size={15} strokeWidth={1.5} /> Edit Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    toast.success('Profile link copied');
                                                    setShowKebab(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-t border-border/40"
                                            >
                                                <ExternalLink size={15} strokeWidth={1.5} /> Share Profile
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <p className="text-sm font-medium text-primary tracking-wide">{rankTitle}</p>
                        
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl">
                                <Activity size={14} className="text-emerald-500" strokeWidth={1.5} />
                                <span className="text-xs font-medium text-muted-foreground">Reputation:</span>
                                <span className="text-sm font-medium text-foreground">{user?.reputation || 0}</span>
                            </div>
                            <div className="flex items-center gap-6 pl-4 border-l border-border/40">
                                <button onClick={() => setModalData({ isOpen: true, type: 'followers', title: 'Followers' })} className="group text-center">
                                    <p className="text-lg font-light group-hover:text-primary transition-colors">{user?.followers?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Followers</p>
                                </button>
                                <button onClick={() => setModalData({ isOpen: true, type: 'following', title: 'Following' })} className="group text-center">
                                    <p className="text-lg font-light group-hover:text-primary transition-colors">{user?.following?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Following</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* XP Card */}
                    <div className="w-full lg:w-72 bg-muted/20 border border-border/40 rounded-2xl p-5 shrink-0">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-0.5">Experience</p>
                                <p className="text-xl font-light">Level {level}</p>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{repPct}/100 XP</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${repPct}%` }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium mt-3 text-center">Optimization in progress...</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`${card} p-5 flex flex-col items-start gap-2 hover:border-primary/40 transition-colors`}>
                            <FileText size={18} className="text-primary" strokeWidth={1.5} />
                            <p className="text-xs font-medium text-muted-foreground">Notes Saved</p>
                            <h4 className="text-3xl font-light">{userNotesCount}</h4>
                        </div>
                        <div className={`${card} p-5 flex flex-col items-start gap-2 hover:border-orange-500/40 transition-colors`}>
                            <Terminal size={18} className="text-orange-500" strokeWidth={1.5} />
                            <p className="text-xs font-medium text-muted-foreground">Games Played</p>
                            <h4 className="text-3xl font-light">{user?.arcade?.gamesPlayed || 0}</h4>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className={card}>
                        <div className="flex items-center gap-2 mb-5">
                            <Layers size={16} className="text-primary" strokeWidth={1.5} />
                            <h3 className="text-sm font-medium text-foreground">Top Skills</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {user?.skills?.length > 0 ? (
                                user.skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-muted/40 border border-border/50 px-3 py-1.5 rounded-xl cursor-default">
                                        <span className="text-xs font-medium text-foreground/80">{skill.name}</span>
                                        {skill.endorsements?.length > 0 && (
                                            <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                                                {skill.endorsements.length}
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground font-light italic">Waiting for skill data...</p>
                            )}
                        </div>
                    </div>

                    {/* Theme Settings */}
                    <div className={card}>
                        <div className="flex items-center gap-2 mb-5">
                            <Zap size={16} className="text-primary" strokeWidth={1.5} />
                            <h3 className="text-sm font-medium text-foreground">Theme Settings</h3>
                        </div>

                        <div className="space-y-2">
                            {allThemes.map((t) => {
                                const isActive = designSystem === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => saveDesignSystem(t.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300
                                            ${isActive ? 'bg-primary/5 border-primary/30' : 'bg-transparent border-transparent hover:bg-muted/50'}`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-xl transition-all duration-300 border-2 shrink-0 ${isActive ? 'border-primary' : 'border-transparent'}`}
                                            style={{ backgroundColor: t.color, opacity: isActive ? 1 : 0.5 }}
                                        />
                                        <div className="flex-1 text-left">
                                            <p className={`text-sm font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {t.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-light">
                                                {t.id === 'v7' ? 'Neo-Citrus Protocol' : 'Legacy Interface'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 space-y-6">
                    {isEditing ? (
                        <div className={card}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-medium flex items-center gap-2">
                                        <Edit3 size={20} className="text-primary" strokeWidth={1.5} /> Edit Profile
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-1 font-light">Update your information</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-muted text-muted-foreground rounded-xl transition-all">
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
                                        <input name="username" value={formData.username} onChange={onChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-light" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground ml-1">Email Address</label>
                                        <input name="email" value={formData.email} onChange={onChange} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all font-light" />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">About Me</label>
                                    <textarea name="bio" value={formData.bio} onChange={onChange} className="w-full bg-muted/30 border border-border/50 rounded-xl p-4 text-sm min-h-[120px] outline-none focus:border-primary/50 transition-all resize-none font-light" placeholder="Tell us about yourself..." />
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border/40">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-foreground">Technical Skills</h3>
                                        <div className="flex gap-2">
                                            <input
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                                className="bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 transition-all w-48 font-light"
                                                placeholder="Add a skill..."
                                            />
                                            <button type="button" onClick={handleAddSkill} className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all text-xs font-medium">Add</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-2xl border border-border/30 min-h-[80px]">
                                        {formData.skills.map((skill, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-card border border-border/50 px-3 py-1.5 rounded-xl text-xs font-medium text-foreground/80">
                                                {skill.name}
                                                <button type="button" onClick={() => handleRemoveSkill(skill.name)} className="text-muted-foreground hover:text-rose-500 transition-colors">
                                                    <X size={14} strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.skills.length === 0 && <span className="text-xs text-muted-foreground font-light italic self-center">No skills added yet.</span>}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium hover:opacity-90 transition-all">Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-muted text-foreground rounded-xl text-xs font-medium hover:bg-muted/80 transition-all">Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Activity Matrix */}
                            <div className={`${card} p-8`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-medium text-foreground">Activity History</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-medium text-muted-foreground">Live Updates</span>
                                    </div>
                                </div>
                                <div>
                                    <ContributionGraph logs={user?.activityLogs} />
                                </div>
                            </div>

                            {/* Pinned Repository */}
                            <div className={`${card} p-8`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Target size={18} className="text-primary" strokeWidth={1.5} />
                                        <h3 className="text-sm font-medium text-foreground">Featured Notes</h3>
                                    </div>
                                    <Link to="/notes" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                        View All <ArrowRight size={14} strokeWidth={1.5} />
                                    </Link>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pinnedNotes.length > 0 ? pinnedNotes.map(note => (
                                        <Link key={note._id} to={`/notes/${note._id}`} className="group relative bg-muted/20 border border-border/40 rounded-2xl p-5 hover:border-primary/40 transition-all overflow-hidden">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate pr-4">{note.title}</h4>
                                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${note.isPublic ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            </div>
                                            
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 font-light leading-relaxed">
                                                {note.content?.replace(/[#*`]/g, '').slice(0, 100)}...
                                            </p>
                                            
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-1.5">
                                                    {note.tags?.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">{tag}</span>
                                                    ))}
                                                    {note.tags?.length > 2 && <span className="text-[10px] font-medium text-muted-foreground/60">+{note.tags.length - 2}</span>}
                                                </div>
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="col-span-full py-12 text-center bg-muted/20 border border-dashed border-border/40 rounded-2xl">
                                            <Zap size={24} className="mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
                                            <p className="text-xs font-medium text-muted-foreground">No featured notes found</p>
                                        </div>
                                    )}
                                </div>
                                
                                {userNotesCount > 0 && (
                                    <div className="pt-6 flex justify-center">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={Math.ceil(userNotesCount / limit)}
                                            onPageChange={setPage}
                                        />
                                    </div>
                                )}
                            </div>
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
