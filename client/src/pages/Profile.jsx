import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserDetails } from '../features/auth/authSlice';
import { User, Mail, Github, Globe, Linkedin, Code, Link as LinkIcon, Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        avatar: user?.avatar || '',
        file: null,
        github: user?.socialLinks?.github || '',
        linkedin: user?.socialLinks?.linkedin || '',
        website: user?.socialLinks?.website || '',
        leetcode: user?.socialLinks?.leetcode || '',
    });

    // Custom Links State (array of {label, url})
    const [customLinks, setCustomLinks] = useState(user?.customLinks || []);

    const handleAddLink = () => {
        setCustomLinks([...customLinks, { label: '', url: '' }]);
    };

    const handleLinkChange = (index, field, value) => {
        const newLinks = [...customLinks];
        newLinks[index][field] = value;
        setCustomLinks(newLinks);
    };

    const handleRemoveLink = (index) => {
        const newLinks = customLinks.filter((_, i) => i !== index);
        setCustomLinks(newLinks);
    };

    const isSocialLinksEmpty = !user?.socialLinks || Object.keys(user.socialLinks).length === 0;

    const onChange = (e) => {
        if (e.target.name === 'file') {
            setFormData(prev => ({ ...prev, file: e.target.files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();

        // Use FormData for file upload
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('bio', formData.bio);

        // Pass social links as JSON string (backend will parse)
        const socialLinksData = {
            github: formData.github,
            linkedin: formData.linkedin,
            website: formData.website,
            leetcode: formData.leetcode
        };

        data.append('socialLinks', JSON.stringify(socialLinksData));
        data.append('customLinks', JSON.stringify(customLinks));

        if (formData.file) {
            data.append('file', formData.file);
        } else {
            // If no new file, keep existing avatar URL logic if needed, 
            // but backend handles "if req.file" separately.
            // If user wants to manually set URL (rare case now), we could append 'avatar' key.
            // But let's assume UI is primarily file upload.
            data.append('avatar', formData.avatar);
        }

        dispatch(updateUserDetails(data)).then((res) => {
            if (!res.error) {
                toast.success('Profile updated successfully');
                setIsEditing(false);
            } else {
                toast.error('Failed to update profile');
            }
        });
    };

    if (!isEditing) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <User className="text-primary" /> My Profile
                    </h1>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-premium-primary"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="px-6 pb-6 mt-[-50px]">
                        <div className="flex flex-col items-center">
                            {/* Avatar Display */}
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-background overflow-hidden mb-3 shadow-md">
                                {user?.avatar && user.avatar.startsWith('http') ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold">{user?.username}</h2>
                            <p className="text-muted-foreground">{user?.email}</p>

                            <p className="mt-4 text-center max-w-md text-sm leading-relaxed">
                                {user?.bio || "No bio yet. Click edit to add one!"}
                            </p>

                            {/* Social Links View */}
                            <div className="flex gap-4 mt-6">
                                {user?.socialLinks?.github && (
                                    <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                        <Github size={20} />
                                    </a>
                                )}
                                {user?.socialLinks?.linkedin && (
                                    <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-blue-500">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                {user?.socialLinks?.leetcode && (
                                    <a href={user.socialLinks.leetcode} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-orange-500">
                                        <Code size={20} />
                                    </a>
                                )}
                                {user?.socialLinks?.website && (
                                    <a href={user.socialLinks.website} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-green-500">
                                        <Globe size={20} />
                                    </a>
                                )}
                                {user?.customLinks && user.customLinks.map((link, idx) => (
                                    <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary" title={link.label}>
                                        <LinkIcon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="text-primary" /> My Profile
            </h1>

            <form onSubmit={onSubmit} className="bg-card border border-border p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                    <h2 className="text-lg font-semibold">Edit Profile</h2>
                    <button type="button" onClick={() => setIsEditing(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                </div>

                {/* Avatar Upload */}
                <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                        <LinkIcon size={14} /> Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                        {formData.avatar && !formData.file && (
                            <img src={formData.avatar.startsWith('http') ? formData.avatar : `/${formData.avatar}`} alt="Current" className="w-10 h-10 rounded-full object-cover border" />
                        )}
                        <input
                            type="file"
                            name="file"
                            onChange={onChange}
                            accept="image/*"
                            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Upload a new profile picture (JPG, PNG).</p>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase text-muted-foreground">Basic Info</h2>

                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={onChange}
                                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onChange}
                                className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={onChange}
                            rows="3"
                            placeholder="Tell us about yourself..."
                            className="w-full bg-muted border border-border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Social Connections</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">GitHub URL</label>
                            <div className="relative">
                                <Github className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    name="github"
                                    value={formData.github}
                                    onChange={onChange}
                                    placeholder="https://github.com/..."
                                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={onChange}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">LeetCode URL</label>
                            <div className="relative">
                                <Code className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    name="leetcode"
                                    value={formData.leetcode}
                                    onChange={onChange}
                                    placeholder="https://leetcode.com/..."
                                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Personal Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={onChange}
                                    placeholder="https://..."
                                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Custom Links Section */}
                    <div className="pt-4 border-t border-border mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Additional Links</h3>
                            <button
                                type="button"
                                onClick={handleAddLink}
                                className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                            >
                                <Plus size={14} /> Add Link
                            </button>
                        </div>

                        <div className="space-y-3">
                            {customLinks.map((link, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-muted/30 p-3 rounded-lg border border-border">
                                    <div className="flex-1 w-full">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Portfolio)"
                                            value={link.label}
                                            onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                                            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex-[2] w-full flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="URL (https://...)"
                                            value={link.url}
                                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLink(index)}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {customLinks.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">No additional links added.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-premium-primary"
                    >
                        {isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default Profile;
