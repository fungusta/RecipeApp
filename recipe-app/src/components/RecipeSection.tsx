'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';

import { Recipe } from '@/data/recipes';

interface RecipeItem extends Recipe {}

interface RecipeSectionProps {
  header: string;
  items: RecipeItem[];
  viewMoreLink?: string;
}

export default function RecipeSection({ header, items, viewMoreLink }: RecipeSectionProps) {
  const router = useRouter();

  const handleRecipeClick = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleViewMore = () => {
    if (viewMoreLink) {
      router.push(viewMoreLink);
    }
  };

  return (
    <Card 
      backgroundColor="bg-lime-300" 
      className="mb-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg">{header}</div>
        {viewMoreLink && (
          <button
            onClick={handleViewMore}
            className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleRecipeClick(item.id)}
            className="bg-white rounded-lg p-1 cursor-pointer hover:shadow-md transition-shadow duration-200 aspect-square flex items-center justify-center overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
