'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SearchBar from '@/components/SearchBar';
import RecipeSection from '@/components/RecipeSection';
import { myRecipes, discoverRecipes } from '@/data/recipes';

export default function Home() {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleClear = () => {
    setSearchValue('');
  };

  const handleAddRecipe = () => {
    // TODO: Implement add recipe functionality
    console.log('Add recipe clicked');
  };


  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Recipe App</h1>
          <button
            onClick={handleAddRecipe}
            className="bg-orange-500 hover:bg-orange-600 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <SearchBar 
          value={searchValue}
          onChange={handleSearchChange}
          onClear={handleClear}
          placeholder="Search recipes..."
        />
      </Card>
      <RecipeSection header="My Recipes" items={myRecipes} viewMoreLink="/my-recipes" />
      <RecipeSection header="Discover" items={discoverRecipes} viewMoreLink="/discover" />
    </div>
  );
}
