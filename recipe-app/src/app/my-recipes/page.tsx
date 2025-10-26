'use client';

import Card from "@/components/Card";
import CircularButton from "@/components/CircularButton";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal, { ConfirmModal, LoadingModal } from "@/components/Modal";
import { myRecipes } from "@/data/recipes";


export default function MyRecipesPage() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLoadingModal, setShowLoadingModal] = useState(false);

    const handleAddRecipe = () => {
        router.push('/add-recipe');
    }

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    }

    const handleClear = () => {
        setSearchValue('');
    }

    const handleRecipeImport = () => {
        setShowImportModal(true);
        console.log('Importing recipes');
    }

    const handleImportConfirm = () => {
        setShowLoadingModal(true);
        // Simulate loading
        setTimeout(() => {
            setShowLoadingModal(false);
            setShowImportModal(false);
            console.log('Recipe import completed');
        }, 2000);
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">
            <Card className="w-full max-w-xl">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">My Recipes</h1>
                    <CircularButton
                        onClick={handleAddRecipe}
                        variant="primary"
                        size="md"
                        title="Add new recipe"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </CircularButton>
                </div>
                <SearchBar
                    value={searchValue}
                    onChange={handleSearchChange}
                    onClear={handleClear}
                    placeholder="Search recipes..."
                />

                {/* Import Recipes Section */}
                <div className='flex flex-col items-center justify-center p-6 mt-4'>
                    <h2 className="text-black text-lg font-medium mb-6">Import recipes</h2>
                    <div className="flex justify-center gap-6">
                        {/* Instagram Import Button */}
                        <CircularButton
                            onClick={handleRecipeImport}
                            variant="primary"
                            size="md"
                            title="Import from Instagram"
                        >
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </CircularButton>

                        {/* TikTok Import Button */}
                        <CircularButton
                            onClick={handleRecipeImport}
                            variant="primary"
                            size="md"
                            title="Import from TikTok"
                        >
                            <svg fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                        </CircularButton>

                        {/* URL Import Button */}
                        <CircularButton
                            onClick={handleRecipeImport}
                            variant="primary"
                            size="md"
                            title="Import from URL"
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </CircularButton>
                    </div>
                </div>
            </Card>

            {/* Recipe Section */}
            <div className="w-full max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                    {myRecipes.map((recipe, index) => (
                        <Card
                            key={recipe.id || index}
                            backgroundColor="bg-lime-300"
                            className="cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col items-center gap-3"
                            onClick={() => router.push(`/recipes/${recipe.id}`)}
                        >
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-24 h-24 object-cover rounded-lg"
                            />
                            <p className="text-sm font-medium text-center">{recipe.title}</p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                title="Import recipes"
                size="md"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4 min-h-[60px] flex items-center justify-center border border-gray-200">
                            <input
                                type="text"
                                placeholder="Paste your recipe link here (Instagram, Tiktok, or website)"
                                className="w-full bg-transparent text-gray-600 placeholder-gray-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex justify-center space-x-6">
                            {/* Instagram Icon */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </div>

                            {/* TikTok Icon */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </div>

                            {/* URL Icon */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleImportConfirm}
                        className="w-full bg-lime-200 hover:bg-lime-300 text-gray-800 font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
                    >
                        Import
                    </button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    console.log('Confirmed!');
                    setShowConfirmModal(false);
                }}
                title="Confirm Action"
                message="Are you sure you want to proceed with this action?"
                confirmText="Yes, Continue"
                cancelText="Cancel"
            />

            <LoadingModal
                isOpen={showLoadingModal}
                title="Importing Recipe"
                message="Please wait while we import your recipe..."
            />
        </div>


    )
}