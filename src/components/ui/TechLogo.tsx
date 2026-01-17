
import { useState } from 'react';

interface TechLogoProps {
    name: string;
    className?: string;
}

export const TechLogo = ({ name, className = "w-6 h-6" }: TechLogoProps) => {
    const [src, setSrc] = useState(`logos/${name}.png`);
    const [triedSvg, setTriedSvg] = useState(false);

    return (
        <img
            src={src}
            alt={name}
            className={`${className} object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity`}
            onError={(e) => {
                if (!triedSvg) {
                    setTriedSvg(true);
                    setSrc(`logos/${name}.svg`);
                } else {
                    e.currentTarget.style.display = 'none';
                }
            }}
        />
    );
};
