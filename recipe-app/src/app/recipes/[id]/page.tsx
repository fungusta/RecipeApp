import { myRecipes, discoverRecipes, Recipe } from '@/data/recipes';
import Card from '@/components/Card';
import IngredientsSection from '@/components/IngredientsSection';
import CookingSection from '@/components/CookingSection';

interface RecipePageProps {
    params: {
        id: string;
    };
}

export default async function RecipePage({ params }: RecipePageProps) {
    const resolvedParams = await params;
    const allRecipes = [...myRecipes, ...discoverRecipes];
    const recipe = allRecipes.find((r: Recipe) => r.id === resolvedParams.id);

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

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-4 py-8">
            <Card className="w-full max-w-4xl" backgroundColor="bg-orange-400">
                <div className="flex flex-col items-center mb-4">
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-32 h-32 object-cover rounded-lg mb-4"
                    />
                    <h1 className="text-2xl text-center mb-4">{recipe.title}</h1>
                    <p className="text-lg text-center">{recipe.description}</p>
                </div>
            </Card>

            <IngredientsSection ingredients={recipe.ingredients} />
            
            <CookingSection instructions={recipe.instructions} />
            
            <Card className="w-full max-w-4xl">
                <p className="text-gray-500 text-center">More recipe content will be added here...</p>
            </Card>
        </div>
    );
}
