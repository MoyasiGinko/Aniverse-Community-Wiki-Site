import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface CardProps {
  title: string;
  image: string;
  link: string;
  rating?: string | number;
  category?: string;
}

export default function Card({ title, image, link, rating, category }: CardProps) {
  return (
    <Link href={link}>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="domain-card glass-panel flex flex-col w-48 h-72 cursor-pointer relative"
      >
        <div className="relative w-full h-full">
          <Image
            src={image || "/placeholder.jpg"}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
          {rating && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-yellow-400">
              ★ {rating}
            </div>
          )}
        </div>
        <div className="p-3 absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent">
          <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
          {category && <p className="text-gray-300 text-xs">{category}</p>}
        </div>
      </motion.div>
    </Link>
  );
}
