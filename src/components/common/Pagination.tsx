import React, { memo, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
}

const PaginationComponent: React.FC<PaginationProps> = ({ currentPage, onPageChange, totalPages = 8 }) => {
  const pageNumbers = useMemo(() => {
    const getPageNumbers = (): (number | string)[] => {
      const pages: (number | string)[] = [];

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push('...');
        if (!pages.includes(totalPages)) pages.push(totalPages);
      }
      return pages;
    };
    return getPageNumbers();
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => onPageChange(currentPage - 1), [onPageChange, currentPage]);
  const handleNext = useCallback(() => onPageChange(currentPage + 1), [onPageChange, currentPage]);
  const handlePage = useCallback((page: number) => onPageChange(page), [onPageChange]);

  return (
    <nav aria-label="Paginación" className="flex justify-center items-center gap-2">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-lg text-content-3 hover:bg-dark-3/50 hover:text-content-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={currentPage === 1}
        onClick={handlePrev}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pageNumbers.map((page, index) => (
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => handlePage(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${currentPage === page
                ? 'bg-accent-500 text-white'
                : 'text-content-3 hover:bg-dark-3/50 hover:text-content-1'
              }`}
            aria-label={`Ir a página ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="w-10 h-10 text-content-3 flex items-center justify-center" aria-hidden="true">
            ...
          </span>
        )
      ))}

      <button
        className="flex items-center justify-center w-10 h-10 rounded-lg text-content-3 hover:bg-dark-3/50 hover:text-content-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={currentPage === totalPages}
        onClick={handleNext}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
};

export const Pagination = memo(PaginationComponent);
