/**
 * Test fixtures for recipe scraping tests.
 * Contains HTML with JSON-LD structured data for testing.
 */

export const allrecipesRecipe = `
<!DOCTYPE html>
<html>
<head>
    <title>Simple Macaroni and Cheese</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": "Simple Macaroni and Cheese",
        "description": "This mac and cheese recipe is simple to prepare...",
        "image": "https://www.allrecipes.com/thmb/xI5g0WBP8yPHwRt1Nt5WudTctzE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/238691-Simple-Macaroni-And-Cheese.jpg",
        "recipeIngredient": [
            "1 (8 ounce) box elbow macaroni",
            "0.25 cup butter",
            "0.25 cup all-purpose flour"
        ],
        "recipeInstructions": [
            {
                "@type": "HowToStep",
                "text": "Gather the ingredients.",
                "name": "Gather the ingredients."
            }
        ]
    }
    </script>
</head>
<body>
    <h1>Simple Macaroni and Cheese</h1>
</body>
</html>
`;

export const bbcGoodFoodRecipe = `
<!DOCTYPE html>
<html>
<head>
    <title>Slow cooker recipes</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": "Slow cooker recipes",
        "description": "We love slow cookers at Good Food! Put your trusty kitchen gadget to use with our easy slow cooker recipes, including soups, stews, chillies and curries.",
        "image": "https://images.immediate.co.uk/production/volatile/sites/30/2022/04/Slow-cooker-recipes-2a91dec.jpg?resize=768,845",
        "recipeIngredient": [
            "1 pound beef",
            "2 cups chicken",
            "3 cups vegetables",
            "1 pound lamb",
            "1 pound pork",
            "1 pound turkey"
        ],
        "recipeInstructions": [
            {
                "@type": "HowToStep",
                "text": "Slow cook the beef in the slow cooker for 4-5 hours on low heat.",
                "name": "Slow cook the beef in the slow cooker for 4-5 hours on low heat."
            }
        ]
    }
    </script>
</head>
<body>
    <h1>Slow cooker recipes</h1>
</body>
</html>
`;

