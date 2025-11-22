'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';
import CircularButton from './CircularButton';

import { Recipe } from '@/data/recipes';

interface RecipeItem extends Recipe {}

interface RecipeSectionProps {
  header: string;
  items: RecipeItem[];
  viewMoreLink?: string;
}

export default function RecipeSection({ header, items, viewMoreLink }: RecipeSectionProps) {
  const router = useRouter();
  const visibleItems = items.slice(0, 9);

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
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg">{header}</div>
        {viewMoreLink && (
          <CircularButton
            onClick={handleViewMore}
            variant="primary"
            size="md"
            title="View more recipes"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </CircularButton>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {visibleItems.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleRecipeClick(item.id)}
            className="bg-white rounded-lg p-1 cursor-pointer hover:shadow-md transition-shadow duration-200 aspect-square flex items-center justify-center overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-40 h-40 object-cover rounded"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
