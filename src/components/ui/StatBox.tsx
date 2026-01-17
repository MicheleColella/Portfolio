
import { TextShuffle } from "@/components/animations/TextShuffle";

interface StatBoxProps {
    label: string;
    value: string;
    trigger: boolean;
}

export const StatBox = ({ label, value, trigger }: StatBoxProps) => (
    <div className="w-full">
        <div className="text-3xl font-bold text-white mb-1"><TextShuffle text={value} trigger={trigger} /></div>
        <div className="text-zinc-500 text-xs font-mono uppercase"><TextShuffle text={label} trigger={trigger} /></div>
    </div>
);
