import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Github,
    Twitter,
    Linkedin,
    Globe,
    FileText,
    Trophy,
    Flame,
    ExternalLink,
    Calendar,
    ChevronRight,
    Zap,
    Cpu,
    ArrowLeft
} from 'lucide-react';
import ContributionGraph from '../components/profile/ContributionGraph';
import Spinner from '../components/Spinner';

const PublicProfile = () => {
    const { username } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/v1/users/profile/${username}`);
                setData(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Profile not found');
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return <Spinner />;
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h2 className="text-2xl font-bold text-foreground">{error}</h2>
            <Link to="/" className="text-primary hover:underline">Return Home</Link>
        </div>
    );

    const { profile, recentNotes } = data;

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-[13px] font-bold mb-8 transition-colors">
                <ArrowLeft size={16} /> BACK TO SCRIPTSHELF
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Sidebar: Bio & Socials */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4">
                        <div className="w-32 h-32 bg-primary rounded-[12px] flex items-center justify-center text-white text-[48px] font-bold overflow-hidden shadow-2xl shadow-primary/20">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                profile.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-[32px] font-bold text-foreground">{profile.username}</h1>
                            <p className="text-primary font-bold text-[13px] uppercase tracking-widest">Logic Architect</p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-[15px]">
                            {profile.bio || "Professional contributor at ScriptShelf."}
                        </p>

                        <div className="flex gap-4 pt-2">
                            {profile.socialLinks?.github && (
                                <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" className="p-2 bg-muted/50 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                    <Github size={20} />
                                </a>
                            )}
                            {profile.socialLinks?.linkedin && (
                                <a href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} target="_blank" className="p-2 bg-muted/50 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {profile.socialLinks?.twitter && (
                                <a href={`https://twitter.com/${profile.socialLinks.twitter}`} target="_blank" className="p-2 bg-muted/50 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                    <Twitter size={20} />
                                </a>
                            )}
                            {profile.website && (
                                <a href={profile.website} target="_blank" className="p-2 bg-muted/50 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                    <Globe size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-card border border-border/50 p-6 rounded-[12px] space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[14px]">Member Since</span>
                            <span className="text-foreground font-bold text-[14px] flex items-center gap-1">
                                <Calendar size={14} className="text-primary" /> {new Date(profile.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="border-t border-border/50 pt-4 space-y-4">
                            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Arcade Performance</h4>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Trophy size={16} className="text-primary" />
                                    <span className="text-[14px]">Global XP</span>
                                </div>
                                <span className="font-bold">{profile.arcade?.points || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Flame size={16} className="text-orange-500 fill-orange-500" />
                                    <span className="text-[14px]">Best Streak</span>
                                </div>
                                <span className="font-bold">{profile.arcade?.streak || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content: Stats & Feed */}
                <div className="lg:col-span-8 space-y-12">
                    <section className="bg-card border border-border p-8 rounded-[12px]">
                        <ContributionGraph logs={profile.activityLogs} createdAt={profile.createdAt} />
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h3 className="text-[21px] font-bold">Recent Technical Records</h3>
                            <span className="text-[12px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-bold uppercase tracking-widest">Public Domain</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {recentNotes.length > 0 ? recentNotes.map(note => (
                                <div key={note._id} className="group p-5 bg-card border border-border rounded-[8px] hover:border-primary transition-all cursor-pointer">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">
                                                    {note.category?.name || 'GENERIC'}
                                                </span>
                                                <h4 className="font-bold text-[17px] group-hover:text-primary transition-colors">{note.title}</h4>
                                            </div>
                                            <p className="text-[13px] text-muted-foreground line-clamp-2">
                                                {note.content.substring(0, 150)}...
                                            </p>
                                        </div>
                                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center border-2 border-dashed border-border rounded-[12px] text-muted-foreground italic">
                                    No public records shared yet.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
