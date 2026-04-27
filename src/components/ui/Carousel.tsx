"use client";
import { useRef } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface CarouselProps {
  title: string;
  children: React.ReactNode;
}

export default function Carousel({ title, children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      if (direction === "left") {
        current.scrollBy({ left: -300, behavior: "smooth" });
      } else {
        current.scrollBy({ left: 300, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="carousel-section my-8 relative">
      <h2 className="text-2xl font-bold mb-4 px-4 text-white">{title}</h2>
      
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <BsChevronLeft size={24} />
        </button>

        <div
          ref={scrollRef}
          className="horizontal-carousel flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory"
        >
          {children}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <BsChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
