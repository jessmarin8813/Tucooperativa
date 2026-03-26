import React from 'react';

const PremiumCard = ({ title, icon: Icon, children, subtitle }) => {
    return (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-visible group transition-all hover:bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-500/10" />
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                            <Icon size={18} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{title}</h3>
                        {subtitle && <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">{subtitle}</p>}
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default PremiumCard;
