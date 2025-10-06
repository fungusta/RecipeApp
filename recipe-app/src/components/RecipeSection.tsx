'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';

interface RecipeItem {
  id: string;
  image: string;
  title?: string;
}

interface RecipeSectionProps {
  header: string;
  items: RecipeItem[];
}

export default function RecipeSection({ header, items }: RecipeSectionProps) {
  const router = useRouter();

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  return (
    <Card 
      backgroundColor="bg-lime-300" 
      className="mb-4 shadow-lg"
    >
      <div className="text-lg text-center mb-4">
        {header}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleRecipeClick(item.id)}
            className="bg-white rounded-lg p-1 cursor-pointer hover:shadow-md transition-shadow duration-200 w-36 h-36 flex items-center justify-center overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.title || `Recipe ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
