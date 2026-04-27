import Link from "next/link";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  basePath: string;
}

export default function Pagination({ currentPage, hasNextPage, basePath }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-4 py-8">
      {currentPage > 1 ? (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white border border-white/20 flex items-center gap-2 transition-colors"
        >
          <BsChevronLeft /> Previous
        </Link>
      ) : (
        <div className="px-4 py-2 bg-white/5 rounded-md text-gray-500 border border-white/10 flex items-center gap-2 cursor-not-allowed">
          <BsChevronLeft /> Previous
        </div>
      )}

      <span className="text-white font-medium">Page {currentPage}</span>

      {hasNextPage ? (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white border border-white/20 flex items-center gap-2 transition-colors"
        >
          Next <BsChevronRight />
        </Link>
      ) : (
        <div className="px-4 py-2 bg-white/5 rounded-md text-gray-500 border border-white/10 flex items-center gap-2 cursor-not-allowed">
          Next <BsChevronRight />
        </div>
      )}
    </div>
  );
}
