import { SkeletonBox } from '@/components/home/Skeletons';

export default function ForumLoading() {
    return (
        <div className="min-h-screen bg-dark-1">
            <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <SkeletonBox className="h-8 w-24 mb-2" />
                        <SkeletonBox className="h-4 w-64" />
                    </div>
                    <SkeletonBox className="h-10 w-36 rounded-xl" />
                </div>

                {/* Search + filters */}
                <div className="flex items-center gap-3 mb-6">
                    <SkeletonBox className="h-10 flex-1 rounded-xl" />
                    <SkeletonBox className="h-10 w-28 rounded-xl" />
                </div>

                {/* Sort tabs */}
                <div className="flex items-center gap-2 mb-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonBox key={i} className="h-9 w-24 rounded-lg" />
                    ))}
                </div>

                {/* Category pills */}
                <div className="flex items-center gap-2 mb-6 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonBox key={i} className="h-8 w-28 rounded-full flex-shrink-0" />
                    ))}
                </div>

                {/* Thread cards */}
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-dark-2/60 border border-dark-5/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <SkeletonBox className="h-5 w-16 rounded-full" />
                                <SkeletonBox className="h-5 w-20 rounded-full" />
                            </div>
                            <SkeletonBox className="h-5 w-3/4" />
                            <SkeletonBox className="h-3 w-full" />
                            <div className="flex items-center justify-between pt-3 border-t border-dark-5/50">
                                <div className="flex items-center gap-2">
                                    <SkeletonBox className="h-6 w-6 rounded-full" />
                                    <SkeletonBox className="h-3 w-20" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <SkeletonBox className="h-3 w-10" />
                                    <SkeletonBox className="h-3 w-10" />
                                    <SkeletonBox className="h-3 w-10" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
