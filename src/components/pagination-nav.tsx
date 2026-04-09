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

        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <Link
              key={pageNumber}
              href={pageHref(pageNumber)}
              className={pageNumber === currentPage ? "pill pill--active" : "pill"}
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
