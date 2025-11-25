import Card from '@/components/Card';
import IngredientsSection from '@/components/IngredientsSection';
import CookingSection from '@/components/CookingSection';
import { getRecipeById } from '@/lib/database';
import EditButton from '@/components/EditButton';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: PageProps) {
    const { userId } = await auth();

    const resolvedParams = await params;
    const recipeId = resolvedParams.id;

    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Recipe Not Found</h1>
                    <p className="text-gray-600">The recipe you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    // Check ownership - handle both camelCase and snake_case field names
    const recipeCreatorId = (recipe as any).creatorId || (recipe as any).creator_id;
    if (recipeCreatorId !== userId) {
        return (
            <div className="flex items-center justify-center py-16">
                <Card className="w-full max-w-2xl" backgroundColor="bg-orange-350">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
                        <p className="text-gray-600">You do not have permission to view this recipe.</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Parse JSON fields if they're strings
    const parsedRecipe = {
        ...recipe,
        ingredients: typeof recipe.ingredients === 'string'
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients,
        instructions: typeof recipe.instructions === 'string'
            ? JSON.parse(recipe.instructions)
            : recipe.instructions
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">
            <Card className="w-full max-w-4xl" backgroundColor="bg-orange-350">
                <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center justify-end w-full mb-4">
                        <EditButton href={`/recipes/${recipeId}/edit`} />
                    </div>
                    {parsedRecipe.image && (
                        <img
                            src={parsedRecipe.image}
                            alt={parsedRecipe.title}
                            className="w-32 h-32 object-cover rounded-lg mb-4"
                        />
                    )}
                    <h1 className="text-2xl text-center mb-4">{parsedRecipe.title}</h1>
                    <p className="text-lg text-center">{parsedRecipe.description}</p>
                </div>
            </Card>

            <IngredientsSection ingredients={parsedRecipe.ingredients} />
            
            <CookingSection instructions={parsedRecipe.instructions} />
        </div>
    );
}
