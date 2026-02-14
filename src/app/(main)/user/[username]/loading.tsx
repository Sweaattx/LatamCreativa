import { SkeletonBox, SkeletonText } from '@/components/home/Skeletons';

export default function UserProfileLoading() {
    return (
        <main className="min-h-screen bg-dark-950">
            {/* Cover */}
            <SkeletonBox className="h-48 sm:h-64 w-full rounded-none" />

            <div className="max-w-5xl mx-auto px-4">
                {/* Avatar + name */}
                <div className="relative -mt-16 sm:-mt-20 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <SkeletonBox className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl ring-4 ring-dark-950" />
                        <div className="flex-1 sm:pb-2 space-y-2">
                            <SkeletonBox className="h-8 w-48" />
                            <SkeletonBox className="h-4 w-24" />
                            <SkeletonBox className="h-4 w-32" />
                        </div>
                        <SkeletonBox className="h-10 w-32 rounded-lg" />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6">
                    <SkeletonBox className="h-4 w-28" />
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="h-4 w-28" />
                </div>

                {/* Bio & skills */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 space-y-4">
                        <SkeletonText lines={3} />
                        <div className="flex gap-4">
                            <SkeletonBox className="h-4 w-24" />
                            <SkeletonBox className="h-4 w-32" />
                        </div>
                    </div>
                    <div>
                        <SkeletonBox className="h-4 w-20 mb-3" />
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonBox key={i} className="h-7 w-16 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-neutral-800 mb-6">
                    <div className="flex gap-1">
                        <SkeletonBox className="h-10 w-32" />
                        <SkeletonBox className="h-10 w-32" />
                    </div>
                </div>

                {/* Project grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            <SkeletonBox className="aspect-[4/3] rounded-lg" />
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
