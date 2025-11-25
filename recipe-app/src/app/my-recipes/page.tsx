'use client';

import Card from "@/components/Card";
import CircularButton from "@/components/CircularButton";
import SearchBar from "@/components/SearchBar";
import ImportRecipesSection from "@/components/ImportRecipesSection";
import RecipeSkeleton from "@/components/RecipeSkeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal, { ConfirmModal, LoadingModal } from "@/components/Modal";
import { Recipe } from "@/data/recipes";
import { isRecipeComplete } from "@/lib/utils/recipe/recipeValidation";
import { useAuth } from "@clerk/nextjs";


export default function MyRecipesPage() {
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const [searchValue, setSearchValue] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRecipeImportLoadingModal, setShowRecipeImportLoadingModal] = useState(false);
    const [loadingRecipes, setLoadingRecipes] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        if (isSignedIn) {
            fetchRecipes();
        }
    }, [isSignedIn]);

    async function fetchRecipes() {
        setLoadingRecipes(true);
        try {
            const url = new URL('/api/recipes', window.location.origin);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setRecipes(data.data || []);
        } catch (error) {
            console.error('Error importing recipe:', error);
        } finally {
            setLoadingRecipes(false);
        }
    }

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
    }

    const handleImportConfirm = async () => {
        setShowRecipeImportLoadingModal(true);
        try {
            // Step 1: Parse the recipe (GET request - no side effects)
            const parseResponse = await fetch(`/api/recipes/parse?url=${encodeURIComponent(importUrl)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!parseResponse.ok) {
                const errorData = await parseResponse.json();
                throw new Error(errorData.error || 'Failed to parse recipe');
            }

            const parseData = await parseResponse.json();
            const parsedRecipe = parseData.data;

            if (!isRecipeComplete(parsedRecipe)) {
                // Store incomplete recipe data in sessionStorage for autofill
                const recipeDataToPass = {
                    title: parsedRecipe.title || '',
                    description: parsedRecipe.description || '',
                    image: parsedRecipe.image || '',
                    ingredients: parsedRecipe.ingredients || [],
                    instructions: parsedRecipe.instructions || []
                };
                sessionStorage.setItem('incompleteRecipe', JSON.stringify(recipeDataToPass));
                setShowRecipeImportLoadingModal(false);
                setShowImportModal(false);
                router.push('/add-recipe');
                return;
            }

            // Step 2: Try to format the recipe (with fallback to parsedRecipe on error)
            let recipeToUse = parsedRecipe; // Default to parsed recipe

            try {
                const formatResponse = await fetch('/api/recipes/format', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: parsedRecipe.title,
                        description: parsedRecipe.description,
                        ingredients: parsedRecipe.ingredients,
                        instructions: parsedRecipe.instructions,
                    })
                });

                if (formatResponse.ok) {
                    const formatData = await formatResponse.json();
                    if (formatData.success && formatData.data) {
                        recipeToUse = formatData.data;
                        console.log('Recipe formatted successfully');
                    } else {
                        console.warn('Format API returned unsuccessful response, using parsed recipe');
                    }
                } else {
                    console.warn('Format API failed, falling back to parsed recipe');
                }
            } catch (formatError) {
                // If formatting fails, log the error but continue with parsedRecipe
                console.warn('Error formatting recipe, using parsed recipe instead:', formatError);
            }

            // Step 3: Create the recipe using formatted or parsed recipe
            const createResponse = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: recipeToUse.title,
                    description: recipeToUse.description,
                    image: parsedRecipe.image,
                    ingredients: recipeToUse.ingredients,
                    instructions: recipeToUse.instructions,
                    recipeUrl: importUrl
                })
            });

            if (!createResponse.ok) {
                const errorData = await createResponse.json();
                throw new Error(errorData.error || 'Failed to create recipe');
            }

            const createData = await createResponse.json();
            router.push('/recipes/' + createData.data.id);
        } catch (error) {
            console.error('Error importing recipe:', error);
            alert(error instanceof Error ? error.message : 'Failed to import recipe');
        } finally {
            setShowRecipeImportLoadingModal(false);
            setShowImportModal(false);
        }
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
                <ImportRecipesSection onImportClick={handleRecipeImport} />
            </Card>

            {/* Recipe Section */}
            {loadingRecipes ? (
                <RecipeSkeleton count={10} />
            ) : recipes.length === 0 ? (
                <div className="w-full max-w-xl">
                    <Card className="flex flex-col items-center justify-center p-8" backgroundColor="bg-lime-300">
                        <p className="text-gray-600 text-center">No recipes found. Start by adding or importing a recipe!</p>
                    </Card>
                </div>
            ) : (
                <div className="w-full max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                        {recipes.map((recipe, index) => (
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
            )}

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
                                placeholder="Paste your recipe link here (Website or Instagram Post)"
                                className="w-full bg-transparent text-gray-600 placeholder-gray-500 focus:outline-none"
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleImportConfirm();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex justify-center space-x-6">
                            {/* Instagram Icon */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
                isOpen={showRecipeImportLoadingModal}
                title="Importing Recipe"
                message="Please wait while we import your recipe..."
            />
        </div>


    )
}