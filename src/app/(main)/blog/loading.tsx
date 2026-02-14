import { SkeletonBox, SkeletonText } from '@/components/home/Skeletons';

export default function BlogLoading() {
    return (
        <main className="min-h-screen bg-dark-1 pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <SkeletonBox className="h-8 w-24 mb-2" />
                    <SkeletonBox className="h-4 w-80" />
                </div>

                <div className="space-y-8">
                    {/* Featured article */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-dark-2 rounded-xl overflow-hidden">
                        <SkeletonBox className="aspect-video lg:aspect-auto lg:h-72 rounded-none" />
                        <div className="p-6 flex flex-col justify-center space-y-4">
                            <SkeletonBox className="h-3 w-20" />
                            <SkeletonBox className="h-7 w-3/4" />
                            <SkeletonText lines={3} />
                            <div className="flex items-center gap-4">
                                <SkeletonBox className="h-3 w-24" />
                                <SkeletonBox className="h-3 w-16" />
                                <SkeletonBox className="h-3 w-12" />
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-dark-2 rounded-xl overflow-hidden">
                                <SkeletonBox className="aspect-video rounded-none" />
                                <div className="p-4 space-y-3">
                                    <SkeletonBox className="h-3 w-16" />
                                    <SkeletonBox className="h-5 w-3/4" />
                                    <SkeletonText lines={2} />
                                    <div className="flex items-center gap-3">
                                        <SkeletonBox className="h-3 w-24" />
                                        <SkeletonBox className="h-3 w-12" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
