import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    Edit3,
    Github,
    Linkedin,
    Twitter,
    FileText,
    History,
    Hash,
    Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const Profile = () => {
    const dispatch = useDispatch();
    const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);
    const { notes } = useSelector((state) => state.notes);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        avatar: '',
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: ''
        }
    });

    const [isEditing, setIsEditing] = useState(false);

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
                    twitter: user.socialLinks?.twitter || ''
                }
            });
        }
    }, [user]);

    useEffect(() => {
        if (isSuccess && isEditing) {
            toast.success('Profile updated');
            setIsEditing(false);
            dispatch(reset());
        }
    }, [isSuccess, isEditing, dispatch]);

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(updateProfile(formData));
    };

    if (isLoading && !isEditing) return <Spinner />;

    // Real dynamic stats
    const userNotes = notes.length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start pb-8 border-b border-border">
                <div className="w-[128px] h-[128px] bg-primary rounded-[3px] flex items-center justify-center text-white text-[64px] font-bold overflow-hidden shadow-md">
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        user?.username?.charAt(0).toUpperCase()
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-[34px] font-normal text-foreground leading-tight">
                                {user?.username}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-[13px] text-muted-foreground mt-2">
                                <span className="flex items-center gap-1"><Calendar size={14} /> Registered {new Date(user?.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><History size={14} /> Active User</span>
                                <span className="flex items-center gap-1"><Mail size={14} /> {user?.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="so-btn border border-border hover:bg-muted/50 text-foreground px-4 py-2 transition-colors"
                        >
                            <Edit3 size={14} className="mr-1" /> {isEditing ? 'Cancel' : 'Edit profile'}
                        </button>
                    </div>

                    <p className="text-[15px] text-foreground max-w-2xl leading-relaxed">
                        {user?.bio || 'Professional developer and ScriptShelf contributor. Documentation is the key to scalability.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-[19px] font-normal text-foreground">Archive Stats</h3>
                    <div className="border border-border p-6 rounded-[3px] bg-card grid grid-cols-2 gap-y-6 gap-x-4 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-[21px] font-bold text-foreground">{userNotes}</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Total Records</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[21px] font-bold text-foreground">1</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Public Streak</p>
                        </div>
                        <div className="col-span-2 space-y-1 pt-2 border-t border-border">
                            <p className="text-[14px] font-medium text-foreground">Joined Archival System on</p>
                            <p className="text-[12px] text-muted-foreground">{new Date(user?.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <section className="space-y-3">
                        <h3 className="text-[19px] font-normal text-foreground">Connectivity</h3>
                        <div className="space-y-2">
                            {formData.socialLinks.github && (
                                <div className="flex items-center gap-2 text-[13px] text-link hover:underline cursor-pointer">
                                    <Github size={14} /> <span>{formData.socialLinks.github}</span>
                                </div>
                            )}
                            {formData.socialLinks.linkedin && (
                                <div className="flex items-center gap-2 text-[13px] text-link hover:underline cursor-pointer">
                                    <Linkedin size={14} /> <span>{formData.socialLinks.linkedin}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Editor or Content */}
                <div className="lg:col-span-8">
                    {isEditing ? (
                        <div className="border border-border p-8 rounded-[3px] bg-card shadow-sm">
                            <h3 className="text-[19px] font-bold mb-8 pb-4 border-b border-border text-foreground">System Configuration</h3>
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-foreground">Public Identifier</label>
                                    <input
                                        name="username"
                                        value={formData.username}
                                        onChange={onChange}
                                        className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-accent text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-bold text-foreground">Technical Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={onChange}
                                        className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] min-h-[150px] outline-none focus:border-primary focus:ring-4 focus:ring-accent text-foreground"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold flex items-center gap-2 text-foreground">GitHub Handle</label>
                                        <input name="socialLinks.github" value={formData.socialLinks.github} onChange={onChange} className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] text-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold flex items-center gap-2 text-foreground">LinkedIn Handle</label>
                                        <input name="socialLinks.linkedin" value={formData.socialLinks.linkedin} onChange={onChange} className="w-full border border-border bg-background rounded-[3px] py-1.5 px-3 text-[13px] text-foreground" />
                                    </div>
                                </div>
                                <div className="pt-6 flex gap-3">
                                    <button type="submit" disabled={isLoading} className="so-btn so-btn-primary px-8">Save Record</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="so-btn bg-transparent hover:bg-muted/50 px-6 text-foreground">Discard</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[19px] font-normal text-foreground uppercase tracking-tight">Recent Postings</h3>
                                    <Link to="/notes" className="text-[13px] text-link hover:underline">View archive</Link>
                                </div>
                                <div className="border border-border rounded-[3px] bg-card divide-y divide-border overflow-hidden">
                                    {notes.slice(0, 5).map(note => (
                                        <Link
                                            key={note._id}
                                            to={`/notes/${note._id}`}
                                            className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className={`text-[11px] font-bold px-1.5 rounded-[2px] shrink-0 ${note.isPublic ? 'bg-primary text-white' : 'border border-border text-muted-foreground'}`}>
                                                    {note.isPublic ? 'P' : 'V'}
                                                </span>
                                                <span className="text-[14px] text-link hover:underline truncate">{note.title}</span>
                                            </div>
                                            <span className="text-[12px] text-muted-foreground shrink-0">{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </Link>
                                    ))}
                                    {notes.length === 0 && (
                                        <div className="p-10 text-center text-muted-foreground italic">No postings recorded yet.</div>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4 pt-4">
                                <h3 className="text-[19px] font-normal text-foreground uppercase tracking-tight">System Tags Used</h3>
                                <div className="flex flex-wrap gap-1">
                                    {[...new Set(notes.map(n => n.category?.name).filter(Boolean))].map(name => (
                                        <span key={name} className="so-tag">{name}</span>
                                    ))}
                                    {notes.length === 0 && (
                                        <p className="text-[13px] text-muted-foreground">No tags mapped yet.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
