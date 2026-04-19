import React from 'react';
import { SparklesIcon, AcademicCapIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const MarketingBanner = () => {
    return (
        <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32 rounded-3xl mx-4 my-8 shadow-2xl">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-600 blur-[120px] rounded-full animate-pulse delay-700"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <div className="flex justify-center mb-8">
                        <img src="/logos/Logo_IP.png" alt="ILM Possible Logo" style={{ height: '8rem' }} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    </div>
                    <h2 className="text-base font-semibold leading-7 text-primary-400 uppercase tracking-widest">
                        The Future of Education
                    </h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl bg-gradient-to-r from-white via-primary-100 to-primary-300 bg-clip-text text-transparent">
                        ILM POSSIBLE
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        Empower your institution with an AI-driven management system. Intelligent exam generation, real-time analytics, and seamless communication—all in one place.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col items-center text-center group">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/20 group-hover:bg-primary-500 transition-all duration-300 group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                                <SparklesIcon className="h-8 w-8" aria-hidden="true" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-white">AI Content Generation</dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                                <p className="flex-auto text-sm">Generate complete exam papers and professional communications in seconds using Google Gemini AI.</p>
                            </dd>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-500/10 text-secondary-400 ring-1 ring-secondary-500/20 group-hover:bg-secondary-500 transition-all duration-300 group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                                <ChartBarIcon className="h-8 w-8" aria-hidden="true" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-white">Smart Analytics</dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                                <p className="flex-auto text-sm">Predict student performance and identify learning gaps with data-driven insights and interactive charts.</p>
                            </dd>
                        </div>

                        <div className="flex flex-col items-center text-center group">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-400 ring-1 ring-green-500/20 group-hover:bg-green-500 transition-all duration-300 group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                <BoltIcon className="h-8 w-8" aria-hidden="true" />
                            </div>
                            <dt className="text-xl font-bold leading-7 text-white">Rapid Communication</dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                                <p className="flex-auto text-sm">Reach students, parents, and teachers instantly via automated notifications, SMS, and professional emails.</p>
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-16 flex justify-center gap-6">
                    <button className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1">
                        Get Started Free
                    </button>
                    <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm">
                        Watch Demo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketingBanner;
