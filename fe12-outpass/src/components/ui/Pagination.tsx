import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show around current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`d-flex justify-content-center align-items-center ${className}`}>
      <nav aria-label="Page navigation">
        <ul className="pagination mb-0" style={{
          gap: '2px',
          padding: '6px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Previous Button */}
          <li className="page-item">
            <button
              className={`page-link border-0 ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: currentPage === 1 ? 'transparent' : '#ffffff',
                color: currentPage === 1 ? '#6c757d' : '#495057',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                border: 'none',
                minWidth: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span aria-hidden="true">‹</span>
            </button>
          </li>

          {/* Page Numbers */}
          {visiblePages.map((page, index) => (
            <li key={index} className="page-item">
              {typeof page === 'string' ? (
                <span 
                  className="page-link border-0" 
                  style={{
                    padding: '6px 2px',
                    backgroundColor: 'transparent',
                    color: '#6c757d',
                    fontWeight: '500',
                    minWidth: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    fontSize: '12px'
                  }}
                >
                  ⋯
                </span>
              ) : (
                <button
                  className="page-link border-0"
                  onClick={() => onPageChange(page)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: page === currentPage ? '#007bff' : '#ffffff',
                    color: page === currentPage ? '#ffffff' : '#495057',
                    fontWeight: page === currentPage ? '600' : '500',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    minWidth: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: page === currentPage ? '0 2px 8px rgba(0,123,255,0.3)' : 'none',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    if (page !== currentPage) {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== currentPage) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Next Button */}
          <li className="page-item">
            <button
              className={`page-link border-0 ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: currentPage === totalPages ? 'transparent' : '#ffffff',
                color: currentPage === totalPages ? '#6c757d' : '#495057',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                border: 'none',
                minWidth: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
