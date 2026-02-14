/**
 * Virtual List Component
 * 
 * Renders large lists efficiently using windowing/virtualization.
 * Only renders items that are visible in the viewport.
 * 
 * Uses @tanstack/react-virtual under the hood.
 * 
 * @module components/common/VirtualList
 */
import React, { useRef, useCallback } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Estimated height of each item in pixels */
  estimateSize: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional height of the container */
  height?: number | string;
  /** Optional className for the container */
  className?: string;
  /** Optional overscan count (items to render outside viewport) */
  overscan?: number;
  /** Optional gap between items in pixels */
  gap?: number;
  /** Optional callback when scroll reaches near the end */
  onEndReached?: () => void;
  /** Threshold (in items) before end to trigger onEndReached */
  endReachedThreshold?: number;
  /** Unique key extractor for items */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Empty state component */
  emptyComponent?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Loading component */
  loadingComponent?: React.ReactNode;
}

export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  height = '100%',
  className = '',
  overscan = 5,
  gap = 0,
  onEndReached,
  endReachedThreshold = 5,
  keyExtractor,
  emptyComponent,
  isLoading,
  loadingComponent,
}: VirtualListProps<T>): React.ReactElement {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Check if we're near the end
  const lastItem = virtualItems[virtualItems.length - 1];
  const isNearEnd = lastItem 
    ? lastItem.index >= items.length - endReachedThreshold 
    : false;

  // Call onEndReached when near end
  React.useEffect(() => {
    if (isNearEnd && onEndReached && !isLoading) {
      onEndReached();
    }
  }, [isNearEnd, onEndReached, isLoading]);

  // Get item key
  const getKey = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      // Try to use common id properties
      const itemWithId = item as { id?: string | number; key?: string | number };
      return itemWithId.id ?? itemWithId.key ?? index;
    },
    [keyExtractor]
  );

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        {emptyComponent ?? (
          <p className="text-neutral-500 text-center py-12">
            No hay elementos para mostrar
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem: VirtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;

          return (
            <div
              key={getKey(item, virtualItem.index)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size - gap}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {isLoading && loadingComponent && (
        <div className="py-4 flex justify-center">
          {loadingComponent}
        </div>
      )}
    </div>
  );
}

/**
 * Virtual Grid Component
 * 
 * Renders items in a grid layout with virtualization.
 */
interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Number of columns */
  columns: number;
  /** Estimated height of each row */
  estimateRowHeight: number;
  height?: number | string;
  className?: string;
  gap?: number;
  overscan?: number;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyComponent?: React.ReactNode;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  columns,
  estimateRowHeight,
  height = '100%',
  className = '',
  gap = 16,
  overscan = 3,
  keyExtractor,
  emptyComponent,
}: VirtualGridProps<T>): React.ReactElement {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate number of rows
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight + gap,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // Get item key
  const getKey = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      const itemWithId = item as { id?: string | number; key?: string | number };
      return itemWithId.id ?? itemWithId.key ?? index;
    },
    [keyExtractor]
  );

  // Empty state
  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        {emptyComponent ?? (
          <p className="text-neutral-500 text-center py-12">
            No hay elementos para mostrar
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow: VirtualItem) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                paddingBottom: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const actualIndex = startIndex + colIndex;
                return (
                  <div key={getKey(item, actualIndex)}>
                    {renderItem(item, actualIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualList;
