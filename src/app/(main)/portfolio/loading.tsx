import { SkeletonBox } from '@/components/home/Skeletons';

export default function PortfolioLoading() {
    return (
        <main className="min-h-screen bg-dark-1 pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <SkeletonBox className="h-8 w-40 mb-2" />
                    <SkeletonBox className="h-4 w-72" />
                </div>

                {/* Filter bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <SkeletonBox key={i} className="h-10 w-20 rounded-lg" />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <SkeletonBox className="h-10 w-32 rounded-lg" />
                        <SkeletonBox className="h-10 w-20 rounded-lg" />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-xl overflow-hidden">
                            <SkeletonBox className="aspect-[4/3] rounded-xl" />
                            <div className="mt-3 space-y-1.5">
                                <SkeletonBox className="h-4 w-3/4" />
                                <SkeletonBox className="h-3 w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
