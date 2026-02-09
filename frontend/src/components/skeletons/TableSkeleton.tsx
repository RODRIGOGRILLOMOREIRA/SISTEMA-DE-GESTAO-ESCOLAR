import { motion } from 'framer-motion';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 10, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <motion.div
              key={`header-${index}`}
              className="h-4 bg-gray-300 dark:bg-gray-600 rounded"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <motion.div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: (rowIndex * 0.05) + (colIndex * 0.1),
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
