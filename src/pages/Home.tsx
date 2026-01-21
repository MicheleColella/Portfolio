import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Github, Linkedin, Mail, MapPin, ChevronDown, Globe, Award, Shield, Cpu, Box, Database } from "lucide-react";

// ReactBits Components
import Squares from "@/components/backgrounds/Squares";
import TargetCursor from "@/components/animations/TargetCursor";
import RotatingText from "@/components/animations/RotatingText";
import { LogoLoop } from "@/components/animations/LogoLoop";
import { TiltedCard } from "@/components/animations/TiltedCard";
import { TextShuffle } from "@/components/animations/TextShuffle";

// UI Components
import { FilterBar } from "@/components/ui/FilterBar";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import Carousel from "@/components/ui/Carousel";
import TechTabs from "@/components/ui/TechTabs";
import TimelineCard from "@/components/ui/TimelineCard";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SocialBtn } from "@/components/ui/SocialBtn";
import { StatBox } from "@/components/ui/StatBox";
import { TechLogo } from "@/components/ui/TechLogo";
import { usePortfolioData } from "@/hooks/usePortfolioData";

// i18n
import { useTranslation } from "@/i18n";
import { BilingualText } from "@/types/portfolio";

// Type for bilingual projects
interface BilingualProject {
    id: number;
    title: { it: string; en: string };
    description: { it: string; en: string };
    longDescription: { it: string; en: string };
    categories: string[];
    tags: string[];
    image: string;
    gitLink: string;
    liveLink: string;
    featured: boolean;
    sortDate: string;
    media: Array<{ type: string; src: string; duration: number; volume?: number }>;
}

// Icon mapper for certifications
const iconMap: Record<string, React.ReactNode> = {
    globe: <Globe size={20} className="carousel-icon" />,
    award: <Award size={20} className="carousel-icon" />,
    shield: <Shield size={20} className="carousel-icon" />,
    cpu: <Cpu size={20} className="carousel-icon" />,
    box: <Box size={20} className="carousel-icon" />
};

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

export default function Home() {
    const { t, language, isChanging } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<BilingualProject | null>(null);
    const [expandedTimeline, setExpandedTimeline] = useState<number | null>(null);

    // Data hooks - Firebase integration
    const { projects } = useProjects();
    const { profile, timelineData, techStackData, certificationsData, logoLoopData, loading } = usePortfolioData();

    // Dynamic tech logos from Firebase, fallback to hardcoded if empty
    const techLogos = useMemo(() => {
        if (logoLoopData.length > 0) {
            return logoLoopData.map(item => ({
                node: (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-contain filter brightness-0 invert opacity-70"
                    />
                )
            }));
        }
        // Fallback to common defaults if no data in Firebase
        return ['swift', 'unity', 'csharp', 'react', 'typescript', 'python', 'firebase', 'figma', 'git']
            .map(slug => ({ node: <TechLogo name={slug} className="w-12 h-12" /> }));
    }, [logoLoopData]);

    // Helper to get localized text from bilingual object
    const getLocalizedText = (obj: BilingualText | undefined | null): string => {
        if (!obj) return "";
        return obj[language as 'it' | 'en'];
    };

    const categoryOptions = useMemo(() => {
        if (!projects) return [];
        return Array.from(new Set(projects.flatMap(p => p.categories || [])));
    }, [projects]);

    const filteredProjects = useMemo(() => {
        let result = projects || [];
        if (selectedCategory !== null) {
            result = result.filter(p => p.categories && p.categories.includes(selectedCategory));
        }
        // Ordina dal più giovane (data alta) al più vecchio (data bassa)
        return [...result].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
    }, [selectedCategory, projects]);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
        );
    }

    if (!profile) {
        // ... (setup required UI)
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 z-50 relative">
                {/* ... setup required content ... */}
                <div className="relative z-10 text-center max-w-lg bg-zinc-900/80 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Database className="w-16 h-16 mx-auto mb-6 text-zinc-500" />
                    <h1 className="text-3xl font-bold mb-4">Setup Required</h1>
                    <p className="text-zinc-400 mb-8">
                        Portfolio data is missing. Please run the migration script in your terminal to populate the database:
                    </p>
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-blue-400 mb-6 select-text">
                        npx vite-node src/scripts/migrateDetails.ts
                    </div>
                    <a href="/admin" className="text-sm text-zinc-500 hover:text-white transition-colors underline">
                        Go to Admin Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">

            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <Squares
                    speed={0.3}
                    squareSize={50}
                    direction="diagonal"
                    borderColor="rgba(255,255,255,0.08)"
                    hoverFillColor="rgba(255,255,255,0.05)"
                />
            </div>
            <NoiseOverlay />

            {/* Custom Cursor */}
            <TargetCursor spinDuration={3} />

            {/* Language Toggle */}
            <LanguageToggle />

            {/* Content Layer */}
            <div className="relative z-10">

                {/* Project Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <ProjectModal
                            project={{
                                ...selectedProject,
                                title: getLocalizedText(selectedProject.title),
                                description: getLocalizedText(selectedProject.description),
                                longDescription: getLocalizedText(selectedProject.longDescription)
                            }}
                            onClose={() => setSelectedProject(null)}
                        />
                    )}
                </AnimatePresence>

                {/* ============ HERO SECTION ============ */}
                <section className="min-h-screen lg:h-screen flex flex-col justify-center relative py-20 lg:py-0">
                    <div className="container mx-auto px-6 md:px-12 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            {/* Left: Text Content */}
                            <div className="lg:w-2/3 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="inline-block mb-4 relative">
                                        <div className="h-1 w-12 bg-white mb-6" />
                                    </div>
                                    <h1 className="text-7xl md:text-[9rem] lg:text-[11rem] font-bold tracking-tighter leading-[0.85] mb-8 font-['Inter']">
                                        MICHELE <br />
                                        <span className="text-zinc-500">COLELLA</span>
                                    </h1>
                                    <div className="text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed mb-6 mx-auto lg:mx-0 h-8">
                                        <RotatingText
                                            texts={profile.roles || ["Developer"]}
                                            className="text-white font-semibold inline-block"
                                            staggerDuration={0.025}
                                            rotationInterval={3000}
                                        />
                                    </div>
                                    <p className="text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed mb-10 mx-auto lg:mx-0">
                                        <TextShuffle
                                            text={getLocalizedText(profile.bio?.long) || getLocalizedText(profile.bio?.short) || "Welcome to my portfolio."}
                                            trigger={isChanging}
                                            duration={400}
                                        />
                                    </p>

                                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                        <button
                                            onClick={() => scrollToSection('works')}
                                            className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <TextShuffle text={t('heroCTA')} trigger={isChanging} duration={300} /> <ChevronDown size={20} />
                                        </button>
                                        {profile.socials?.github && (
                                            <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95">
                                                <Github size={20} /> GitHub
                                            </a>
                                        )}
                                        {profile.socials?.linkedin && (
                                            <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95">
                                                <Linkedin size={20} /> LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right: Column */}
                            <div className="lg:w-1/3 flex flex-col gap-6">
                                {/* Profile Card */}
                                <TiltedCard
                                    containerHeight="auto"
                                    containerWidth="100%"
                                    imageHeight="auto"
                                    imageWidth="100%"
                                    scaleOnHover={1.03}
                                    rotateAmplitude={8}
                                    showMobileWarning={false}
                                    showTooltip={false}
                                >
                                    <div className="bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden p-8">
                                        <div className="flex flex-col items-center text-center">
                                            {/* Profile Photo */}
                                            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/10 mb-8 shadow-2xl">
                                                <img
                                                    src={profile.image}
                                                    alt="Michele Colella"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <h3 className="font-bold text-2xl">Michele Colella</h3>
                                            <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1">
                                                <MapPin size={14} /> <TextShuffle text={getLocalizedText(profile.location)} trigger={isChanging} duration={300} />
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            <StatBox label={t('profileProjects')} trigger={isChanging} value={(() => {
                                                const count = projects.length;
                                                if (count < 5) return count.toString();
                                                return `${Math.floor(count / 5) * 5}+`;
                                            })()} />
                                            <StatBox label={t('profileExperience')} trigger={isChanging} value={(() => {
                                                const startYear = Math.min(...timelineData.map(item => parseInt(item.year) || 2026));
                                                const currentYear = new Date().getFullYear();
                                                const years = currentYear - startYear;
                                                if (years < 1) return `1 ${t('profileYears')}`;
                                                return `${years}+ ${t('profileYears')}`;
                                            })()} />
                                        </div>
                                    </div>
                                </TiltedCard>

                                {profile.available && (
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-emerald-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                        <motion.div
                                            className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h3 className="text-white font-medium tracking-wide text-sm">
                                                <TextShuffle text={t('availableTitle')} trigger={isChanging} duration={300} />
                                            </h3>

                                            <a
                                                href={`mailto:${profile.socials.email}`}
                                                className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 text-black text-sm font-bold rounded-xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
                                            >
                                                <Mail size={16} strokeWidth={2.5} />
                                                <span><TextShuffle text={t('availableCTA')} trigger={isChanging} duration={300} /></span>
                                            </a>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack Loop */}
                    <div className="mt-12 lg:absolute lg:bottom-0 lg:left-0 lg:w-full py-6 border-t border-white/5 bg-black/40 backdrop-blur-sm lg:translate-y-4">
                        <LogoLoop
                            logos={techLogos}
                            speed={50}
                            gap={80}
                            logoHeight={48}
                            pauseOnHover
                            fadeOut
                            fadeOutColor="#050505"
                        />
                    </div>
                </section>

                {/* ============ ABOUT SECTION ============ */}
                <section className="py-32 px-6 md:px-20 max-w-5xl mx-auto">

                    {/* Section Title */}
                    <motion.div
                        className="mb-24"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold mb-6">
                            <TextShuffle text={language === 'it' ? 'CHI SONO' : 'ABOUT ME'} trigger={isChanging} duration={400} />
                        </h2>
                        <div className="w-24 h-[2px] bg-white/20"></div>
                    </motion.div>

                    {/* Narrative Text - Using Bio Data */}
                    <motion.div
                        className="mb-32 max-w-3xl"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                    >
                        <motion.p
                            className="text-2xl md:text-3xl font-light text-zinc-300 leading-relaxed mb-8"
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                        >
                            <TextShuffle
                                text={getLocalizedText(profile.bio.title)}
                                trigger={isChanging}
                                duration={400}
                            />
                        </motion.p>
                        <motion.p
                            className="text-lg text-zinc-500 leading-relaxed mb-6"
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                        >
                            <TextShuffle
                                text={getLocalizedText(profile.bio.short)}
                                trigger={isChanging}
                                duration={500}
                            />
                        </motion.p>
                        <motion.p
                            className="text-lg text-zinc-500 leading-relaxed"
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                        >
                            <TextShuffle
                                text={getLocalizedText(profile.bio.long)}
                                trigger={isChanging}
                                duration={500}
                            />
                        </motion.p>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        className="mb-32"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                    >
                        <motion.h3
                            className="text-2xl font-bold mb-16 text-zinc-400"
                            variants={fadeInUp}
                            transition={{ duration: 0.5 }}
                        >
                            <TextShuffle text={t('sectionTimeline')} trigger={isChanging} duration={300} as="span" />
                        </motion.h3>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -translate-x-1/2 hidden md:block" />
                            <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-white/10 md:hidden" />

                            {/* Timeline Items */}
                            <div className="space-y-32">
                                {timelineData.map((item, index) => (
                                    <TimelineCard
                                        key={item.id}
                                        item={{
                                            year: item.year,
                                            type: item.type,
                                            title: getLocalizedText(item.title),
                                            subtitle: getLocalizedText(item.subtitle),
                                            note: getLocalizedText(item.note),
                                            details: getLocalizedText(item.details)
                                        }}
                                        index={index}
                                        isExpanded={expandedTimeline === index}
                                        onToggle={() => setExpandedTimeline(expandedTimeline === index ? null : index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Tech Stack */}
                    <motion.div
                        className="mb-24"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={fadeInUp}
                    >
                        <motion.h3
                            className="text-2xl font-bold mb-12 text-zinc-400"
                            variants={fadeInUp}
                            transition={{ duration: 0.5 }}
                        >
                            <TextShuffle text={t('sectionTechStack')} trigger={isChanging} duration={300} as="span" />
                        </motion.h3>

                        <TechTabs categories={techStackData.map(c => ({
                            category: getLocalizedText(c.title),
                            skills: c.skills
                        }))} />
                    </motion.div>

                    {/* Certifications - Carousel */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                    >
                        <motion.h3
                            className="text-sm font-mono text-zinc-600 mb-8"
                            variants={fadeInUp}
                        >
                            <TextShuffle text={language === 'it' ? 'CERTIFICAZIONI' : 'CERTIFICATIONS'} trigger={isChanging} duration={300} as="span" />
                        </motion.h3>
                        <motion.div
                            className="flex justify-center"
                            variants={fadeInUp}
                        >
                            <Carousel
                                items={certificationsData.map((c, idx) => ({
                                    id: idx, // or c.id if number
                                    title: getLocalizedText(c.title),
                                    description: getLocalizedText(c.description),
                                    icon: iconMap[c.icon] || <Globe size={20} className="carousel-icon" />
                                }))}
                                baseWidth={320}
                                autoplay={true}
                                autoplayDelay={4000}
                                pauseOnHover={true}
                                loop={true}
                            />
                        </motion.div>
                    </motion.div>

                </section>

                {/* ============ PROJECTS SECTION ============ */}
                <section id="works" className="px-6 md:px-20 py-32 max-w-[1920px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-white/10 pb-8 gap-6">
                        <h2 className="text-6xl md:text-8xl font-bold">
                            <TextShuffle text={t('sectionProjects')} trigger={isChanging} duration={400} as="span" />
                        </h2>
                        <FilterBar
                            categories={categoryOptions}
                            activeCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                            allLabel={t('projectsFilterAll')}
                        />
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TiltedCard
                                        containerHeight="auto"
                                        containerWidth="100%"
                                        imageHeight="auto"
                                        imageWidth="100%"
                                        scaleOnHover={1.02}
                                        rotateAmplitude={6}
                                        showMobileWarning={false}
                                        showTooltip={false}
                                    >
                                        <ProjectCard
                                            project={{
                                                ...project,
                                                title: getLocalizedText(project.title),
                                                description: getLocalizedText(project.description),
                                                longDescription: getLocalizedText(project.longDescription)
                                            }}
                                            onClick={() => setSelectedProject(project)}
                                        />
                                    </TiltedCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                {/* ============ FOOTER ============ */}
                <footer className="min-h-[60vh] flex flex-col justify-center items-center relative border-t border-white/5 bg-gradient-to-b from-transparent to-zinc-950">
                    <div className="text-center px-6">
                        <p className="text-zinc-500 font-mono mb-4 text-sm">
                            <TextShuffle text={language === 'it' ? 'HAI UN PROGETTO IN MENTE?' : 'HAVE A PROJECT IN MIND?'} trigger={isChanging} duration={300} />
                        </p>
                        <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold mb-12 hover:tracking-widest transition-all duration-700">
                            <TextShuffle text={language === 'it' ? 'COLLABORIAMO' : "LET'S COLLABORATE"} trigger={isChanging} duration={400} />
                        </h2>
                        <div className="flex gap-6 justify-center flex-wrap">
                            <SocialBtn icon={<Mail size={18} />} label={profile.socials.email} href={`mailto:${profile.socials.email}`} />
                            <SocialBtn icon={<Github size={18} />} label="GitHub" href={profile.socials.github} />
                            <SocialBtn icon={<Linkedin size={18} />} label="LinkedIn" href={profile.socials.linkedin} />
                        </div>
                        <p className="text-zinc-600 mt-8 flex items-center justify-center gap-2 text-sm">
                            <MapPin size={14} /> <TextShuffle text={getLocalizedText(profile.location)} trigger={isChanging} duration={300} />
                        </p>
                    </div>
                    <p className="absolute bottom-8 text-zinc-700 font-mono text-xs">
                        © {new Date().getFullYear()} MICHELE COLELLA
                    </p>
                </footer>
            </div>
        </div>
    );
}
