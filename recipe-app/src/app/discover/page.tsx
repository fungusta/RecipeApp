'use client';

import Card from "@/components/Card";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { discoverRecipes } from "@/data/recipes";


export default function DiscoverPage() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState('');
    const [filterType, setFilterType] = useState('Hot');

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    }

    const handleClear = () => {
        setSearchValue('');
    }

    const handleRecipeClick = (recipeId: string) => {
        router.push(`/recipes/${recipeId}`);
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">
            <Card className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Discover Recipes</h1>
                </div>
                <SearchBar
                    value={searchValue}
                    onChange={handleSearchChange}
                    onClear={handleClear}
                    placeholder="Search recipes..."
                />
            </Card>
            <div className="flex w-full max-w-xl gap-4">
                <Card className={`px-4 py-4 flex-1 text-center cursor-pointer ${filterType === 'Hot' ? 'bg-lime-300' : 'bg-transparent shadow-none'}`} onClick={() => setFilterType('Hot')}>Hot</Card>
                <Card className={`px-4 py-4 flex-1 text-center cursor-pointer ${filterType === 'New' ? 'bg-lime-300' : 'bg-transparent shadow-none'}`} onClick={() => setFilterType('New')}>New</Card>
            </div>
            
            {/* Recipe List */}
            <div className="flex flex-col w-full max-w-xl gap-4">
                {discoverRecipes.map((recipe) => (
                    <Card 
                        key={recipe.id} 
                        className="bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => handleRecipeClick(recipe.id)}
                    >
                        <div className="flex items-center gap-4">
                            {/* Image */}
                            <img 
                                src={recipe.image} 
                                alt={recipe.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                            {/* Recipe Title */}
                            <h3 className="text-lg font-medium text-gray-800">
                                {recipe.title}
                            </h3>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}