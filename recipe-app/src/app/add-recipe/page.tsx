'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ingredient, Instruction } from '@/data/recipes';
import Card from '@/components/Card';
import CircularButton from '@/components/CircularButton';
import Modal, { ConfirmModal, LoadingModal } from '@/components/Modal';
import { isRecipeComplete } from '@/lib/utils/recipe/recipeValidation';

export default function AddRecipePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    ingredients: [] as Ingredient[],
    instructions: [] as Instruction[]
  });

  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');

  // Check for incomplete recipe data from sessionStorage on mount
  useEffect(() => {
    const incompleteRecipeData = sessionStorage.getItem('incompleteRecipe');
    if (incompleteRecipeData) {
      try {
        const recipeData = JSON.parse(incompleteRecipeData);
        alert('The imported recipe data was incomplete. Please fill in the missing information.');
        setFormData({
          title: recipeData.title || '',
          description: recipeData.description || '',
          image: recipeData.image || '',
          ingredients: recipeData.ingredients || [],
          instructions: recipeData.instructions || []
        });
        setShowCreateRecipe(true);
        sessionStorage.removeItem('incompleteRecipe');
      } catch (error) {
        console.error('Error parsing incomplete recipe data:', error);
        sessionStorage.removeItem('incompleteRecipe');
      }
    }
  }, []);

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
    console.log('Creating new recipe:', formData);

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          image: formData.image,
          ingredients: formData.ingredients,
          instructions: formData.instructions
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('Recipe created:', result.data);
        // Handle success - redirect to home page
        router.push('/');
      } else {
        console.error('Error creating recipe:', result.error);
        // Handle error - you might want to show an error message to the user
        alert('Error creating recipe: ' + result.error);
      }
    } catch (error) {
      console.error('Network error:', error);
      // Handle network error
      alert('Network error occurred while creating recipe');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const handleAddImage = () => {
    console.log('Adding image');
  };

  const handleRecipeImport = () => {
    setShowImportModal(true);
  };

  const handleImportConfirm = async () => {
    setShowLoadingModal(true);
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
        setShowCreateRecipe(true);
        setFormData({
          title: parsedRecipe.title || '',
          description: parsedRecipe.description || '',
          image: parsedRecipe.image || '',
          ingredients: parsedRecipe.ingredients || [],
          instructions: parsedRecipe.instructions || []
        });

        setShowLoadingModal(false);
        setShowImportModal(false);
        return;
      }

      // Step 2: Create the recipe (POST request)
      const createResponse = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: parsedRecipe.title,
          description: parsedRecipe.description,
          image: parsedRecipe.image,
          ingredients: parsedRecipe.ingredients,
          instructions: parsedRecipe.instructions,
          recipeUrl: importUrl,
          creatorId: parsedRecipe.creatorId || 'placeholder'
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
      setShowLoadingModal(false);
      setShowImportModal(false);
    }
  };

  const isFormValid = () => {
    return formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.ingredients.length > 0 &&
      formData.instructions.length > 0;
  };

  return (
    <div className='flex flex-col items-center justify-center p-6 mt-4'>

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
      {/* Import Section - Always visible */}
      <h1 className="text-black text-2xl font-bold mb-6">Import recipes</h1>
      <div className="flex justify-center gap-6 mb-6">
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

      {/* Conditional Content */}
      {showCreateRecipe ? (
        <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">

          {/* Header Section */}
          <Card className="w-full max-w-4xl" backgroundColor="bg-orange-350">
            <div className="flex flex-col items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Create New Recipe</h1>

              <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.title || 'Recipe'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <button onClick={handleAddImage} className="text-gray-400 text-4xl" >+</button>
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
              <button
                onClick={addIngredient}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Ingredient
              </button>
            </div>

            {formData.ingredients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🥘</div>
                <p>No ingredients added yet. Click "Add Ingredient" to get started!</p>
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
                        <button
                          onClick={() => removeIngredient(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Instructions Section */}
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Cooking Instructions <span className="text-red-500">*</span>
              </h2>
              <button
                onClick={addInstruction}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Step
              </button>
            </div>

            {formData.instructions.length === 0 ? (
              <Card className="bg-lime-300">
                <div className="text-center py-8 text-gray-600">
                  <div className="text-4xl mb-2">👨‍🍳</div>
                  <p>No cooking steps added yet. Click "Add Step" to get started!</p>
                </div>
              </Card>
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
                        <button
                          onClick={() => removeInstruction(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors duration-200 text-sm"
                        >
                          Remove
                        </button>
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
          </div>

          {/* Action Buttons */}
          <Card className="w-full max-w-4xl">
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid()}
                className={`px-6 py-3 rounded-md transition-colors duration-200 ${isFormValid()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Create Recipe
              </button>
            </div>

            {!isFormValid() && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Please fill in all required fields (marked with <span className="text-red-500">*</span>) to create your recipe.
                </p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">
          <h1 className="text-black text-2xl font-bold mb-6">Or Create a New Recipe</h1>
          <CircularButton
            onClick={() => setShowCreateRecipe(true)}
            variant="primary"
            size="md"
            title="Create new recipe"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </CircularButton>
        </div>
      )}
    </div>


  );
}
