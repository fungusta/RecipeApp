import Card from './Card';

interface RecipeSkeletonProps {
  count?: number;
}

export default function RecipeSkeleton({ count = 4 }: RecipeSkeletonProps) {
  return (
    <div className="w-full max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <Card
            key={index}
            backgroundColor="bg-lime-300"
            className="flex flex-col items-center gap-3 animate-pulse"
          >
            {/* Image skeleton */}
            <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
            {/* Title skeleton */}
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

