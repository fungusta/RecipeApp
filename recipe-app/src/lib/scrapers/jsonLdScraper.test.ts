import { parseUrlToRecipeDataUsingJsonLdScraper } from '@/lib/scrapers/jsonLdScraper';

jest.mock('@/lib/utils/fetchHtml', () => ({
    fetchHtml: jest.fn((url: string) => {
        if (url.includes('allrecipes.com')) {
            return Promise.resolve(`
                <html>
                    <head>
                        <script type="application/ld+json">
                        {
                            "@type": "Recipe",
                            "name": "Simple Macaroni and Cheese",
                            "description": "A delicious mac and cheese recipe",
                            "image": "https://example.com/mac-cheese.jpg",
                            "recipeIngredient": ["8 ounces macaroni", "2 cups cheddar cheese", "2 cups milk"],
                            "recipeInstructions": [
                                {"@type": "HowToStep", "text": "Cook macaroni according to package directions"},
                                {"@type": "HowToStep", "text": "Drain and return to pot"},
                                {"@type": "HowToStep", "text": "Stir in cheese and milk until melted"}
                            ]
                        }
                        </script>
                    </head>
                    <body></body>
                </html>
            `);
        } else if (url.includes('bbcgoodfood.com')) {
            return Promise.resolve(`
                <html>
                    <head>
                        <script type="application/ld+json">
                        {
                            "@type": "Recipe",
                            "name": "Rhubarb custard scones",
                            "description": "Light and fluffy scones with rhubarb",
                            "image": "https://example.com/scones.jpg",
                            "recipeIngredient": ["350g self-raising flour", "85g butter", "3 tbsp caster sugar", "175ml milk", "200g rhubarb"],
                            "recipeInstructions": [
                                {"@type": "HowToStep", "text": "Heat oven to 220C"},
                                {"@type": "HowToStep", "text": "Mix flour, butter and sugar"},
                                {"@type": "HowToStep", "text": "Add milk and rhubarb"},
                                {"@type": "HowToStep", "text": "Bake for 12-15 mins"}
                            ]
                        }
                        </script>
                    </head>
                    <body></body>
                </html>
            `);
        } else {
            return Promise.resolve('<html><body>Not a recipe page</body></html>');
        }
    })
}));

const validAllRecipeUrl = 'https://www.allrecipes.com/recipe/238691/simple-macaroni-and-cheese/';
const validBBCGoodFoodUrl = 'https://www.bbcgoodfood.com/recipes/rhubarb-custard-scones';
const invalidRecipeUrl = 'https://www.google.com';

describe('jsonLdScraper', () => {
    it('should parse the recipe data from the All Recipes url', async () => {
        const recipe = await parseUrlToRecipeDataUsingJsonLdScraper(validAllRecipeUrl);
        expect(recipe).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            image: expect.any(String),
            ingredients: expect.any(Array),
            instructions: expect.any(Array)
        });
    });

    it('should parse the recipe data from the BBC Good Food url', async () => {
        const recipe = await parseUrlToRecipeDataUsingJsonLdScraper(validBBCGoodFoodUrl);
        expect(recipe).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            image: expect.any(String),
            ingredients: expect.any(Array),
            instructions: expect.any(Array)
        });
    });

    it('should return null if the url is not a valid recipe url', async () => {
        const recipe = await parseUrlToRecipeDataUsingJsonLdScraper(invalidRecipeUrl);
        expect(recipe).toBeNull();
    });
});