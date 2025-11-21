'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingModal } from '@/components/Modal';
import Card from '@/components/Card';
import CircularButton from '@/components/CircularButton';
import { Ingredient, Instruction, Recipe } from '@/data/recipes';

interface EditRecipeFormProps {
    initialRecipe: Recipe;
    recipeId: string;
}

export default function EditRecipeForm({ initialRecipe, recipeId}: EditRecipeFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        title: initialRecipe.title || '',
        description: initialRecipe.description || '',
        image: initialRecipe.image || '',
        ingredients: initialRecipe.ingredients || [],
        instructions: initialRecipe.instructions || []
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((ingredient, i) =>
                i === index ? { ...ingredient, [field]: value } : ingredient
            )
        }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '' }]
        }));
    };

    const removeIngredient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const handleInstructionChange = (index: number, field: keyof Instruction, value: string) => {
        setFormData(prev => ({
            ...prev,
            instructions: prev.instructions.map((instruction, i) =>
                i === index ? { ...instruction, [field]: value } : instruction
            )
        }));
    };

    const addInstruction = () => {
        setFormData(prev => ({
            ...prev,
            instructions: [...prev.instructions, { title: '', description: '', time: '' }]
        }));
    };

    const removeInstruction = (index: number) => {
        setFormData(prev => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);

        let finalImageUrl = formData.image;

        try {
            // Step 1: Upload image if a new file was selected
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);

                const uploadResponse = await fetch('/api/recipes/image', {
                    method: 'POST',
                    body: uploadFormData,
                });

                const uploadResult = await uploadResponse.json();

                if (uploadResult.success && uploadResult.url) {
                    finalImageUrl = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error || 'Failed to upload image');
                }
            }

            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    image: finalImageUrl,
                    ingredients: formData.ingredients,
                    instructions: formData.instructions
                })
            });

            const result = await response.json();

            if (result.success) {
                router.push(`/recipes/${recipeId}`);
            } else {
                throw new Error(result.error || 'Failed to save recipe');
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            setSaveError(error instanceof Error ? error.message : 'Failed to save recipe');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/recipes/${recipeId}`);
    };

    const handleAddImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            image: previewUrl
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isFormValid = () => {
        return formData.title.trim() !== '' &&
            formData.description.trim() !== '' &&
            formData.ingredients.length > 0 &&
            formData.instructions.length > 0;
    };
    
    return (
        <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">
            {/* Loading Modal for Save */}
            <LoadingModal
                isOpen={isSaving}
                title="Saving Recipe"
                message="Please wait while we save your changes..."
            />

            {/* Error Display for Save */}
            {saveError && (
                <Card className="w-full max-w-4xl" backgroundColor="bg-orange-350">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Saving Recipe</h2>
                            <p className="text-gray-600">{saveError}</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSaveError(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-colors duration-200"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors duration-200"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Header Section */}
            <Card className="w-full max-w-4xl" backgroundColor="bg-orange-350">
                <div className="flex flex-col items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit Recipe</h1>

                    <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center relative group">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {formData.image ? (
                            <>
                                <img
                                    src={formData.image}
                                    alt={formData.title || 'Recipe'}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 rounded-lg">
                                    <CircularButton
                                        onClick={handleAddImage}
                                        variant="secondary"
                                        size="sm"
                                        title="Change Image"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-90 group-hover:scale-100 shadow-lg"
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </CircularButton>
                                </div>
                            </>
                        ) : (
                            <CircularButton
                                onClick={handleAddImage}
                                variant="secondary"
                                size="sm"
                                title="Add Image"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </CircularButton>
                        )}
                    </div>

                    <div className="w-full max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recipe Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-0 py-2 bg-transparent border-none outline-none text-2xl text-center focus:bg-white focus:bg-opacity-20 focus:rounded-md focus:px-3 transition-all duration-200"
                                placeholder="Enter recipe title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-0 py-2 bg-transparent border-none outline-none text-lg text-center resize-none focus:bg-white focus:bg-opacity-20 focus:rounded-md focus:px-3 transition-all duration-200"
                                rows={3}
                                placeholder="Enter recipe description"
                                required
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Ingredients Section */}
            <Card className="w-full max-w-4xl bg-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-center">
                        Ingredients <span className="text-red-500">*</span>
                    </h2>
                    <CircularButton
                        onClick={addIngredient}
                        variant="secondary"
                        size="md"
                        title="Add Ingredient"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </CircularButton>
                </div>

                {formData.ingredients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🥘</div>
                        <p>No ingredients added yet. Click the + icon to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.ingredients.map((ingredient, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={ingredient.name}
                                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                            className="w-full px-0 py-2 bg-transparent border-none outline-none text-center focus:bg-white focus:bg-opacity-50 focus:rounded-md focus:px-3 transition-all duration-200"
                                            placeholder="Chicken"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <CircularButton
                                            onClick={() => removeIngredient(index)}
                                            variant="danger"
                                            size="sm"
                                            title="Remove Ingredient"
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </CircularButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Instructions Section */}
            <Card className="w-full max-w-4xl" backgroundColor="bg-lime-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Cooking Instructions <span className="text-red-500">*</span>
                    </h2>
                    <CircularButton
                        onClick={addInstruction}
                        variant="secondary"
                        size="md"
                        title="Add Step"
                        className="!bg-lime-300 hover:!bg-lime-400 text-gray-800"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </CircularButton>
                </div>

                {formData.instructions.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                        <div className="text-4xl mb-2">👨‍🍳</div>
                        <p>No cooking steps added yet. Click the + icon to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.instructions.map((instruction, index) => (
                            <Card
                                key={index}
                                backgroundColor="bg-lime-300"
                                className="relative"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900">Step {index + 1}</h3>
                                        <CircularButton
                                            onClick={() => removeInstruction(index)}
                                            variant="danger"
                                            size="sm"
                                            title="Remove Step"
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </CircularButton>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={instruction.title}
                                            onChange={(e) => handleInstructionChange(index, 'title', e.target.value)}
                                            className="w-full px-0 py-2 bg-transparent border-none outline-none text-center focus:bg-white focus:bg-opacity-20 focus:rounded-md focus:px-3 transition-all duration-200"
                                            placeholder="Enter step title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time (optional)</label>
                                        <input
                                            type="text"
                                            value={instruction.time || ''}
                                            onChange={(e) => handleInstructionChange(index, 'time', e.target.value)}
                                            className="w-full px-0 py-2 bg-transparent border-none outline-none text-center focus:bg-white focus:bg-opacity-20 focus:rounded-md focus:px-3 transition-all duration-200"
                                            placeholder="15 minutes"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={instruction.description}
                                            onChange={(e) => handleInstructionChange(index, 'description', e.target.value)}
                                            className="w-full px-0 py-2 bg-transparent border-none outline-none text-center resize-none focus:bg-white focus:bg-opacity-20 focus:rounded-md focus:px-3 transition-all duration-200"
                                            rows={3}
                                            placeholder="Enter step description"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>

            {/* Action Buttons */}
            <Card className="w-full max-w-4xl">
                <div className="flex justify-center gap-4 items-center">
                    <CircularButton
                        onClick={handleCancel}
                        variant="gray"
                        size="md"
                        title="Cancel"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </CircularButton>
                    <CircularButton
                        onClick={handleSave}
                        disabled={!isFormValid()}
                        variant={isFormValid() ? "primary" : "gray"}
                        size="md"
                        title={isFormValid() ? "Save Recipe" : "Fill all required fields"}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </CircularButton>
                </div>

                {!isFormValid() && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                            Please fill in all required fields (marked with <span className="text-red-500">*</span>) to save your recipe.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}