import EditRecipeForm from "@/components/EditRecipeForm";
import { getRecipeById } from "@/lib/database";
import Card from "@/components/Card";
import { auth } from '@clerk/nextjs/server';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
    const { userId } = await auth();

    const resolvedParams = await params;
    const recipeId = resolvedParams.id;

    if (!recipeId) {
        return (
            <div className="flex items-center justify-center py-16">
                <Card className="w-full max-w-2xl" backgroundColor="bg-orange-350">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Recipe ID</h1>
                        <p className="text-gray-600">The recipe ID is missing or invalid.</p>
                    </div>
                </Card>
            </div>
        );
    }

    let recipe = null;
    let fetchError: string | null = null;

    try {
        recipe = await getRecipeById(recipeId);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        fetchError = error instanceof Error ? error.message : 'Failed to fetch recipe';
    }

    if (!recipe && !fetchError) {
        return (
            <div className="flex items-center justify-center py-16">
                <Card className="w-full max-w-2xl" backgroundColor="bg-orange-350">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Recipe Not Found</h1>
                        <p className="text-gray-600">The recipe you're trying to edit doesn't exist.</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Check ownership - handle both camelCase and snake_case field names
    if (recipe) {
        const recipeCreatorId = (recipe as any).creatorId || (recipe as any).creator_id;
        if (recipeCreatorId !== userId) {
            return (
                <div className="flex items-center justify-center py-16">
                    <Card className="w-full max-w-2xl" backgroundColor="bg-orange-350">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
                            <p className="text-gray-600">You do not have permission to edit this recipe.</p>
                        </div>
                    </Card>
                </div>
            );
        }
    }

    if (fetchError) {
        return (
            <div className="flex items-center justify-center py-16">
                <Card className="w-full max-w-2xl" backgroundColor="bg-orange-350">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Recipe</h1>
                        <p className="text-gray-600 mb-4">{fetchError}</p>
                        <form action={() => window.location.reload()}>
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors duration-200"
                            >
                                Try Again
                            </button>
                        </form>
                    </div>
                </Card>
            </div>
        );
    }

    const parsedRecipe = {
        ...recipe!,
        ingredients: typeof recipe!.ingredients === 'string'
            ? JSON.parse(recipe!.ingredients)
            : recipe!.ingredients,
        instructions: typeof recipe!.instructions === 'string'
            ? JSON.parse(recipe!.instructions)
            : recipe!.instructions
    };

    return <EditRecipeForm initialRecipe={parsedRecipe} recipeId={recipeId} />;
}