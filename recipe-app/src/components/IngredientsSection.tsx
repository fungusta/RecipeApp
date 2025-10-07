'use client';

import React, { useState } from 'react';
import Card from './Card';
import { Ingredient } from '@/data/recipes';

interface IngredientsSectionProps {
  ingredients: Ingredient[];
}

export default function IngredientsSection({ ingredients }: IngredientsSectionProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleCheckboxChange = (ingredientName: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  return (
    <Card className="w-full max-w-4xl bg-gray-100">
      <h2 className="text-xl font-bold text-center mb-6">Ingredients</h2>
      
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div key={ingredient.name}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{ingredient.icon}</span>
                <span className="text-gray-800 font-medium">
                  {ingredient.amount} {ingredient.name}
                </span>
              </div>
              <input
                type="checkbox"
                checked={checkedItems.has(ingredient.name)}
                onChange={() => handleCheckboxChange(ingredient.name)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            {index < ingredients.length - 1 && (
              <hr className="border-blue-200" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
