import { scrapeRecipeFromJsonLd } from '@/lib/scrapers/jsonLdScraper';
import { allrecipesRecipe, bbcGoodFoodRecipe } from '@/lib/utils/testFixtures';

jest.mock('@/lib/utils/fetchHtml', () => ({
    fetchHtml: jest.fn((url: string) => {
        if (url.includes('allrecipes.com')) {
            return Promise.resolve(allrecipesRecipe);
        } else if (url.includes('bbcgoodfood.com')) {
            return Promise.resolve(bbcGoodFoodRecipe);
        } else {
            return Promise.resolve('<html><body>Not a recipe page</body></html>');
        }
    }),
    FetchError: jest.fn().mockImplementation((message: string, url: string, originalError?: unknown) => {
        return new Error(message);
    })
}));

const validRecipeUrl = 'https://www.allrecipes.com/recipe/238691/simple-macaroni-and-cheese/';
const validBBCGoodFoodRecipeUrl = 'https://www.bbcgoodfood.com/recipes/slow-cooker-pork-casserole';
const invalidRecipeUrl = 'https://www.google.com';

describe('jsonLdScraper', () => {
    it('should parse the recipe data from the recipe url', async () => {
        const recipe = await scrapeRecipeFromJsonLd(validRecipeUrl);
        expect(recipe).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            image: expect.any(String),
            ingredients: expect.any(Array),
            instructions: expect.any(Array)
        });

        expect(recipe?.title).toBe('Simple Macaroni and Cheese');
        expect(recipe?.description).toBe('This mac and cheese recipe is simple to prepare...');
        expect(recipe?.image).toBe('https://www.allrecipes.com/thmb/xI5g0WBP8yPHwRt1Nt5WudTctzE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/238691-Simple-Macaroni-And-Cheese.jpg');
        expect(recipe?.ingredients).toEqual([{ name: '1 (8 ounce) box elbow macaroni' }, { name: '0.25 cup butter' }, { name: '0.25 cup all-purpose flour' }]);
        expect(recipe?.instructions).toEqual([{ title: 'Gather the ingredients.', description: 'Gather the ingredients' }]);
    });

    it('should return null if the url is not a valid recipe url', async () => {
        const recipe = await scrapeRecipeFromJsonLd(invalidRecipeUrl);
        expect(recipe).toBeNull();
    });

    it('should parse the recipe data from the BBC Good Food url', async () => {
        const recipe = await scrapeRecipeFromJsonLd(validBBCGoodFoodRecipeUrl);
        expect(recipe).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            image: expect.any(String),
            ingredients: expect.any(Array),
            instructions: expect.any(Array)
        });

        expect(recipe?.title).toBe('Slow cooker recipes');
        expect(recipe?.description).toBe('We love slow cookers at Good Food! Put your trusty kitchen gadget to use with our easy slow cooker recipes, including soups, stews, chillies and curries.');
        expect(recipe?.image).toBe('https://images.immediate.co.uk/production/volatile/sites/30/2022/04/Slow-cooker-recipes-2a91dec.jpg?resize=768,845');
        expect(recipe?.ingredients).toEqual([{ name: '1 pound beef' }, { name: '2 cups chicken' }, { name: '3 cups vegetables' }, { name: '1 pound lamb' }, { name: '1 pound pork' }, { name: '1 pound turkey' }]);
        expect(recipe?.instructions).toEqual([{ title: 'Slow cook the beef in the slow cooker for 4-5 hours on low heat.', description: 'Slow cook the beef in the slow cooker for 4-5 hours on low heat' }]);
    });
});