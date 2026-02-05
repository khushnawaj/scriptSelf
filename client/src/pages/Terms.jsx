import { Shield, Lock, FileText, Scale, Info, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 md:py-20 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center mb-12 md:mb-20 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-2xl mb-2 md:mb-4">
                    <Scale size={28} md:size={32} />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">Terms of Service</h1>
                <p className="text-base md:text-lg text-muted-foreground font-light">Last Updated: February 5, 2026</p>
            </div>

            <div className="space-y-10 md:space-y-16">
                {/* Introduction */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Info className="text-primary shrink-0" size={20} md:size={24} />
                        <h2 className="text-xl md:text-2xl font-bold">1. Agreement to Terms</h2>
                    </div>
                    <p className="text-[14px] md:text-base text-muted-foreground leading-relaxed">
                        By accessing or using ScriptShelf, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. This platform is designed for technical record-keeping and knowledge sharing.
                    </p>
                </section>

                {/* Account Responsibility */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Shield className="text-primary shrink-0" size={20} md:size={24} />
                        <h2 className="text-xl md:text-2xl font-bold">2. User Accounts & Security</h2>
                    </div>
                    <p className="text-[14px] md:text-base text-muted-foreground leading-relaxed">
                        When you create an account, you must provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4">
                        <li className="flex items-start gap-2 p-3 md:p-4 bg-muted/30 rounded-xl border border-border/50">
                            <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={16} md:size={18} />
                            <span className="text-[13px] md:text-[14px]">You are responsible for safeguarding your password.</span>
                        </li>
                        <li className="flex items-start gap-2 p-3 md:p-4 bg-muted/30 rounded-xl border border-border/50">
                            <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={16} md:size={18} />
                            <span className="text-[13px] md:text-[14px]">Notify us immediately upon any security breach.</span>
                        </li>
                    </ul>
                </section>

                {/* Content Usage */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <FileText className="text-primary shrink-0" size={20} md:size={24} />
                        <h2 className="text-xl md:text-2xl font-bold">3. Intellectual Property</h2>
                    </div>
                    <p className="text-[14px] md:text-base text-muted-foreground leading-relaxed">
                        Original service content and features remain the property of ScriptShelf. User-contributed notes remain the property of the creator, but public notes grant a view/clone license to the community.
                    </p>
                </section>

                {/* Privacy & Data */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Lock className="text-primary shrink-0" size={20} md:size={24} />
                        <h2 className="text-2xl font-bold">4. Privacy Policy</h2>
                    </div>
                    <p className="text-[14px] md:text-base text-muted-foreground leading-relaxed">
                        Your privacy is critical. We do not sell personal data. Information is only used to facilitate your library experience and technical reputation tracking.
                    </p>
                </section>

                {/* Termination */}
                <section className="p-6 md:p-8 bg-destructive/5 border border-destructive/20 rounded-2xl space-y-4">
                    <h2 className="text-xl md:text-2xl font-bold text-destructive">5. Termination</h2>
                    <p className="text-[14px] md:text-base text-muted-foreground leading-relaxed">
                        We reserve the right to terminate or suspend access for any breach of these Terms, without prior notice or liability.
                    </p>
                </section>
            </div>

            {/* Footer */}
            <div className="mt-16 md:mt-24 pt-8 border-t border-border flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
                <p className="text-muted-foreground text-[13px] md:text-[14px]">© 2026 ScriptShelf Protocols. All rights reserved.</p>
                <div className="flex gap-8">
                    <Link to="/register" className="text-primary font-bold hover:underline transition-all text-[14px]">Join the Vault</Link>
                    <Link to="/" className="text-muted-foreground hover:text-foreground transition-all text-[14px]">Back to Terminal</Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;
