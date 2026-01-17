import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    categories: string[];
    activeCategory: string | null;
    onSelect: (category: string | null) => void;
    allLabel?: string;
}

export const FilterBar = ({ categories, activeCategory, onSelect, allLabel = "All" }: FilterBarProps) => {
    // Build full list: "All" label + actual categories
    const allCategories = [null, ...categories];

    return (
        <div className="flex flex-wrap gap-2 md:gap-4 mb-12">
            {allCategories.map((category) => {
                const isActive = activeCategory === category;
                const displayLabel = category === null ? allLabel : category;

                return (
                    <button
                        key={category ?? "__all__"}
                        onClick={() => onSelect(category)}
                        className={cn(
                            "relative px-4 py-2 text-sm font-mono tracking-wider transition-colors duration-300",
                            isActive ? "text-black" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-white rounded-full z-0"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{displayLabel}</span>
                    </button>
                );
            })}
        </div>
    );
};
