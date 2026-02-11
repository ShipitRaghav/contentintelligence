'use client';

import { motion } from 'framer-motion';
import { Plus, MoreVertical, Globe, BookOpen, PenTool, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAllProjects, createNewProject, deleteProject } from '@/lib/projectStorage';
import type { ProjectMetadata } from '@/types/project';

import { useProduct } from '@/lib/productContext';

import TopNavigation from '@/components/TopNavigation';

const featuredProjects = [
    {
        id: 1,
        title: "Trends in health, wealth and...",
        source: "Our World in Data",
        date: "15 Apr 2025",
        sources: "24 sources",
        gradient: "from-orange-500 to-pink-600",
        icon: Globe
    },
    {
        id: 2,
        title: "How to Build a Life, from The Atlantic",
        source: "The Atlantic",
        date: "23 Apr 2025",
        sources: "46 sources",
        gradient: "from-yellow-400 to-red-500",
        icon: BookOpen
    },
    {
        id: 3,
        title: "The science fan's guide to visiting...",
        source: "Travel",
        date: "12 May 2025",
        sources: "17 sources",
        gradient: "from-emerald-500 to-teal-700",
        icon: Globe
    },
    {
        id: 4,
        title: "William Shakespeare: The...",
        source: "Arts and culture",
        date: "26 Apr 2025",
        sources: "45 sources",
        gradient: "from-amber-700 to-yellow-600",
        icon: PenTool
    }
];

export default function DashboardPage() {
    const router = useRouter();
    const { currentProduct } = useProduct();
    const isFundBuzz = currentProduct === 'fundbuzz';

    const [projects, setProjects] = useState<ProjectMetadata[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const allProjects = await getAllProjects();
        setProjects(allProjects);
    };

    const handleNewProject = () => {
        router.push('/project/new');
    };

    const handleProjectClick = (id: number | string) => {
        router.push(`/project/${id}`);
    };

    const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(projectId);
            await loadProjects();
        }
        setOpenMenuId(null);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isFundBuzz ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
            {/* Header */}
            <TopNavigation />

            <div className="p-6">
                {/* Recent Section */}
                <section className="mb-12 pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-semibold ${isFundBuzz ? 'text-slate-900' : ''}`}>Recent <span className="text-gray-500 font-normal">Projects</span></h2>
                    </div>

                    {/* Project Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Create New Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`aspect-square border rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors group ${isFundBuzz ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            onClick={() => handleProjectClick('new')}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${isFundBuzz ? 'bg-blue-50' : 'bg-white/10'}`}>
                                <Plus className="w-5 h-5 text-primary" />
                            </div>
                            <span className={`text-lg font-medium ${isFundBuzz ? 'text-slate-900' : ''}`}>Create new <span className="text-gray-500">Project</span></span>
                        </motion.div>

                        {/* Recent Project Cards */}
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`aspect-square border rounded-2xl p-2 flex flex-col cursor-pointer transition-colors group relative ${isFundBuzz ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                onClick={() => handleProjectClick(project.id)}
                            >
                                <div className={`flex-1 rounded-xl mb-4 relative overflow-hidden ${isFundBuzz ? 'bg-slate-50' : 'bg-slate-800'}`}>
                                    <div className="absolute top-4 left-4 w-8 h-10 bg-yellow-500 rounded-sm shadow-sm" />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === project.id ? null : project.id);
                                            }}
                                            className={`p-1 rounded-full ${isFundBuzz ? 'hover:bg-slate-200' : 'hover:bg-white/10'}`}
                                        >
                                            <MoreVertical className={`w-4 h-4 ${isFundBuzz ? 'text-slate-400' : 'text-gray-400'}`} />
                                        </button>

                                        {/* Delete menu */}
                                        {openMenuId === project.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                                                />
                                                <div className={`absolute right-0 top-8 w-40 border rounded-lg shadow-xl overflow-hidden z-20 ${isFundBuzz ? 'bg-white border-slate-200' : 'bg-slate-800 border-white/10'}`}>
                                                    <button
                                                        onClick={(e) => handleDeleteProject(project.id, e)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-sm text-left text-red-500 hover:text-red-600`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className={`font-medium mb-1 line-clamp-1 ${isFundBuzz ? 'text-slate-900' : ''}`}>{project.title}</h3>
                                    <div className="text-xs text-gray-500">
                                        <span>{formatDate(project.updatedAt)}</span>
                                        <span className="mx-2">•</span>
                                        <span>{project.sourceCount} {project.sourceCount === 1 ? 'source' : 'sources'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Featured Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">Featured <span className="text-gray-500 font-normal">Projects</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
                                onClick={() => handleProjectClick(project.id)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-black/20 backdrop-blur-sm p-1.5 rounded-full">
                                            <project.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white/90">{project.source}</span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold mb-2 leading-tight">{project.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-white/80">
                                            <span>{project.date}</span>
                                            <span>•</span>
                                            <span>{project.sources}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
