import Link from "next/link";

type PaginationNavProps = {
  currentPage: number;
  totalPages: number;
  firstPageHref?: string;
};

export function PaginationNav({ currentPage, totalPages, firstPageHref = "/page/1" }: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  function pageHref(pageNumber: number) {
    return pageNumber === 1 ? firstPageHref : `/page/${pageNumber}`;
  }

  // Calculate which page numbers to show
  // Show: first, last, current, and pages around current
  function getPageNumbers() {
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range if we're near the start or end
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages - 1);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 4, 2);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('ellipsis-start');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav className="pagination" aria-label="Pagination">
      <div className="pill-row">
        {currentPage > 1 ? (
          <Link href={pageHref(currentPage - 1)} className="pill pill--nav" aria-label="Previous page">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <span className="pill pill--nav pagination__disabled" aria-label="Previous page (disabled)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}

        {pageNumbers.map((pageNumber, index) => {
          if (typeof pageNumber === 'string') {
            // Render ellipsis - hide some on mobile
            const isStart = pageNumber === 'ellipsis-start';
            const hideOnMobile = isStart && currentPage > 3;
            
            return (
              <span 
                key={pageNumber} 
                className={`pill pagination__ellipsis ${hideOnMobile ? 'pagination__ellipsis--hide-mobile' : ''}`}
                aria-hidden="true"
              >
                …
              </span>
            );
          }
          
          // Hide non-essential page numbers on mobile
          const isFirstOrLast = pageNumber === 1 || pageNumber === totalPages;
          const isCurrent = pageNumber === currentPage;
          const isAdjacent = Math.abs(pageNumber - currentPage) === 1;
          const hideOnMobile = !isFirstOrLast && !isCurrent && !isAdjacent;
          
          return (
            <Link
              key={pageNumber}
              href={pageHref(pageNumber)}
              className={`pill ${pageNumber === currentPage ? 'pill--active' : ''} ${hideOnMobile ? 'pagination__page--hide-mobile' : ''}`}
              aria-current={pageNumber === currentPage ? "page" : undefined}
            >
              {pageNumber}
            </Link>
          );
        })}

        {currentPage < totalPages ? (
          <Link href={pageHref(currentPage + 1)} className="pill pill--nav" aria-label="Next page">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <span className="pill pill--nav pagination__disabled" aria-label="Next page (disabled)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>
    </nav>
  );
}
