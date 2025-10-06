'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SearchBar from '@/components/SearchBar';
import RecipeSection from '@/components/RecipeSection';

export default function Home() {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleClear = () => {
    setSearchValue('');
  };

  // Sample recipe data
  const myRecipes = [
    { id: '1', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '2', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '3', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '4', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '5', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '6', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '7', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '8', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '9', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
  ];

  const discoverRecipes = [
    { id: '10', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '11', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '12', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '13', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '14', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '15', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '16', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '17', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
    { id: '18', image: '/images/butter-chicken.png', title: 'Butter Chicken' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl text-center mb-4">Recipe App</h1>
        <SearchBar 
          value={searchValue}
          onChange={handleSearchChange}
          onClear={handleClear}
          placeholder="Search recipes..."
        />
      </Card>
      <RecipeSection header="My Recipes" items={myRecipes} />
      <RecipeSection header="Discover" items={discoverRecipes} />
    </div>
  );
}
