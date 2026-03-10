'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Layers, FileText, User, Loader2, ArrowLeft } from 'lucide-react';
import { searchService, type SearchResult } from '@/services/supabase/search';

const TYPE_TABS = [
    { id: 'all' as const, label: 'Todos', Icon: Search },
    { id: 'project' as const, label: 'Proyectos', Icon: Layers },
    { id: 'article' as const, label: 'Artículos', Icon: FileText },
    { id: 'user' as const, label: 'Usuarios', Icon: User },
];

function ResultCard({ result }: { result: SearchResult }) {
    const href = result.type === 'user'
        ? `/user/${result.username || result.id}`
        : result.type === 'project'
            ? `/portfolio/${result.slug || result.id}`
            : `/blog/${result.slug || result.id}`;

    return (
        <Link href={href} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#0f0f11] hover:border-white/[0.12] hover:bg-white/[0.02] transition-all group">
            {result.image ? (
                <Image src={result.image} alt="" width={56} height={56} className="rounded-xl object-cover flex-shrink-0" unoptimized />
            ) : (
                <div className="w-14 h-14 rounded-xl bg-accent-500/15 flex items-center justify-center flex-shrink-0">
                    {result.type === 'user' ? <User className="w-6 h-6 text-accent-400" /> : result.type === 'project' ? <Layers className="w-6 h-6 text-accent-400" /> : <FileText className="w-6 h-6 text-accent-400" />}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-white/90 truncate group-hover:text-accent-400 transition-colors">{result.title}</p>
                {result.subtitle && <p className="text-[12px] text-white/40 mt-0.5 truncate">{result.subtitle}</p>}
                <span className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${result.type === 'project' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                        result.type === 'article' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                            'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                    }`}>
                    {result.type === 'project' ? 'Proyecto' : result.type === 'article' ? 'Artículo' : 'Usuario'}
                </span>
            </div>
        </Link>
    );
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeType, setActiveType] = useState<'all' | 'project' | 'article' | 'user'>('all');

    const doSearch = useCallback(async (q: string, type: typeof activeType) => {
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            const res = await searchService.search(q.trim(), { type, maxResults: 20 });
            setResults(res);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        doSearch(initialQuery, activeType);
    }, [initialQuery, activeType, doSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const filteredResults = activeType === 'all' ? results : results.filter(r => r.type === activeType);

    return (
        <div className="min-h-screen bg-dark-0">
            <div className="max-w-3xl mx-auto px-4 pt-6 pb-16">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => router.back()} className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-light text-white/90">Búsqueda</h1>
                </div>

                {/* Search input */}
                <form onSubmit={handleSubmit} className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar proyectos, artículos, usuarios..."
                        className="w-full h-12 pl-12 pr-4 bg-[#0f0f11] border border-white/[0.08] rounded-2xl text-[14px] text-white/80 placeholder-white/20 outline-none focus:border-accent-500/40 transition-colors"
                        autoFocus
                    />
                </form>

                {/* Type tabs */}
                <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-[#0f0f11] border border-white/[0.06]">
                    {TYPE_TABS.map(t => (
                        <button key={t.id} onClick={() => setActiveType(t.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all
                            ${activeType === t.id
                                    ? 'bg-accent-500/15 text-accent-400 border border-accent-500/20'
                                    : 'text-white/25 hover:text-white/50 hover:bg-white/[0.03]'}`}>
                            <t.Icon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
                    </div>
                ) : filteredResults.length > 0 ? (
                    <div className="space-y-2">
                        <p className="text-[12px] text-white/25 mb-3">{filteredResults.length} resultados para &quot;{initialQuery}&quot;</p>
                        {filteredResults.map(r => <ResultCard key={`${r.type}-${r.id}`} result={r} />)}
                    </div>
                ) : initialQuery ? (
                    <div className="text-center py-16">
                        <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-[14px] text-white/40">No se encontraron resultados para &quot;{initialQuery}&quot;</p>
                        <p className="text-[12px] text-white/20 mt-1">Intenta con otras palabras o categorías</p>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-[14px] text-white/40">Escribe algo para buscar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
