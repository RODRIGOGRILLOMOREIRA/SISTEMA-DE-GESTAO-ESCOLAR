import { motion } from 'framer-motion';

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={`card-${index}`}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Icon Skeleton */}
          <motion.div
            className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-4"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />

          {/* Title Skeleton */}
          <motion.div
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2 + 0.1,
            }}
          />

          {/* Value Skeleton */}
          <motion.div
            className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2 + 0.2,
            }}
          />

          {/* Subtitle Skeleton */}
          <motion.div
            className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2 + 0.3,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
