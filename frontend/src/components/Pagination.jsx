import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border-t border-gray-100">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page Size</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-gray-100 border-none text-gray-900 text-xs font-black rounded-xl focus:ring-2 focus:ring-black block p-2 px-4 transition-all appearance-none cursor-pointer hover:bg-gray-200"
          >
            {[5, 10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          ({startItem} to {endItem} of {totalItems}) 
          <span className="text-gray-300 mx-2">|</span>
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-xl border border-gray-100 text-gray-900 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all shadow-sm bg-white"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1.5 mx-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - currentPage) <= 1) return true;
                return false;
            })
            .map((p, i, arr) => {
              const showDots = i > 0 && p !== arr[i-1] + 1;
              return (
                <React.Fragment key={p}>
                  {showDots && <span className="text-gray-300 font-black text-xs px-1">•••</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all shadow-sm ${
                      currentPage === p 
                        ? 'bg-black text-white scale-110' 
                        : 'bg-white border border-gray-100 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })
          }
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2.5 rounded-xl border border-gray-100 text-gray-900 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all shadow-sm bg-white"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
