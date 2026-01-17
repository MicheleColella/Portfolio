
import React from 'react';

interface SocialBtnProps {
    icon: React.ReactNode;
    label: string;
    href: string;
}

export const SocialBtn = ({ icon, label, href }: SocialBtnProps) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all text-sm font-bold text-white/90"
        aria-label={label}
    >
        {icon}
        <span>{label}</span>
    </a>
);
