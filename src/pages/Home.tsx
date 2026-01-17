import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import projectsData from "@/data/projects.json";
import { Github, Linkedin, Mail, MapPin, ChevronDown } from "lucide-react";

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
import { techLogos } from "@/data/constants";
import { usePortfolioData } from "@/hooks/usePortfolioData";

// i18n
import { useTranslation } from "@/i18n";

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

// Tech stack logo component (B/W only)








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
    const isAvailable = true;

    // Data hooks
    const { timelineData, techStackData, certificationsData } = usePortfolioData();

    // Cast projects data to typed array
    const projects = projectsData as BilingualProject[];

    // Helper to get localized text from bilingual object
    const getLocalizedText = (obj: { it: string; en: string }): string => obj[language as 'it' | 'en'];

    const categoryOptions = useMemo(() => Array.from(new Set(projects.flatMap(p => p.categories))), [projects]);
    const filteredProjects = useMemo(() => {
        let result = projects;
        if (selectedCategory !== null) {
            result = projects.filter(p => p.categories.includes(selectedCategory));
        }
        // Ordina dal più giovane (data alta) al più vecchio (data bassa)
        return [...result].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
    }, [selectedCategory, projects]);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

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
                                            texts={["iOS Developer", "XR Developer", "3D Modeler", "Unity Developer", "Full Stack Developer"]}
                                            className="text-white font-semibold inline-block"
                                            staggerDuration={0.025}
                                            rotationInterval={3000}
                                        />
                                    </div>
                                    <p className="text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed mb-10 mx-auto lg:mx-0">
                                        <TextShuffle
                                            text={t('heroDescription')}
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
                                        <a href="https://github.com/MicheleColella" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95">
                                            <Github size={20} /> GitHub
                                        </a>
                                        <a href="https://www.linkedin.com/in/michele-colella-68b468273/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95">
                                            <Linkedin size={20} /> LinkedIn
                                        </a>
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
                                                    src="profile.png"
                                                    alt="Michele Colella"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <h3 className="font-bold text-2xl">Michele Colella</h3>
                                            <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1">
                                                <MapPin size={14} /> <TextShuffle text={t('profileLocation')} trigger={isChanging} duration={300} />
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            <StatBox label={t('profileProjects')} trigger={isChanging} value={(() => {
                                                const count = projects.length;
                                                if (count < 5) return count.toString();
                                                return `${Math.floor(count / 5) * 5}+`;
                                            })()} />
                                            <StatBox label={t('profileExperience')} trigger={isChanging} value={(() => {
                                                const startYear = Math.min(...timelineData.map(item => parseInt(item.year)));
                                                const currentYear = new Date().getFullYear();
                                                const years = currentYear - startYear;
                                                if (years < 5) return `${years} ${t('profileYears')}`;
                                                return `${Math.floor(years / 5) * 5}+ ${t('profileYears')}`;
                                            })()} />
                                        </div>
                                    </div>
                                </TiltedCard>

                                {isAvailable && (
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
                                                href="mailto:michelecolella0@gmail.com"
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

                    {/* Narrative Text */}
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
                                text={language === 'it' ? 'Costruisco esperienze digitali che funzionano.' : 'I build digital experiences that work.'}
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
                                text={language === 'it'
                                    ? 'Sono uno sviluppatore guidato dalla passione per la creazione di meccaniche che funzionano alla perfezione. La mia competenza spazia dalla grafica 3D alla realtà virtuale, con una forte specializzazione nello sviluppo iOS nativo.'
                                    : 'I am a developer driven by the passion for creating mechanics that work flawlessly. My expertise spans from 3D graphics to virtual reality, with a strong specialization in native iOS development.'
                                }
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
                                text={language === 'it'
                                    ? 'Il mio approccio fonde rigore ingegneristico e visione artistica per trasformare concetti complessi in interfacce intuitive e coinvolgenti.'
                                    : 'My approach blends engineering rigor with artistic vision to transform complex concepts into intuitive and engaging interfaces.'
                                }
                                trigger={isChanging}
                                duration={500}
                            />
                        </motion.p>
                    </motion.div>

                    {/* Timeline - Single Column, Unified */}
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
                                        key={index}
                                        item={item}
                                        index={index}
                                        isExpanded={expandedTimeline === index}
                                        onToggle={() => setExpandedTimeline(expandedTimeline === index ? null : index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Tech Stack - Stacked Cards */}
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

                        <TechTabs categories={techStackData} />
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
                                items={certificationsData}
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
                            <SocialBtn icon={<Mail size={18} />} label="michelecolella0@gmail.com" href="mailto:michelecolella0@gmail.com" />
                            <SocialBtn icon={<Github size={18} />} label="GitHub" href="https://github.com/MicheleColella" />
                            <SocialBtn icon={<Linkedin size={18} />} label="LinkedIn" href="https://www.linkedin.com/in/michele-colella-68b468273/" />
                        </div>
                        <p className="text-zinc-600 mt-8 flex items-center justify-center gap-2 text-sm">
                            <MapPin size={14} /> <TextShuffle text={t('profileLocation')} trigger={isChanging} duration={300} />
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
