export interface Instruction {
  title: string;
  time?: string;
  description: string;
}

export interface Ingredient {
  name: string;
}

export interface Recipe {
  id: string;
  image: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
}

export const RECIPE_TEXT_FORMAT = {
  type: "json_schema",
  name: "recipe_response",
  schema: {
    type: "object",
    properties: {
      recipe: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            instructions: { 
              type: "array", 
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  // time: { type: "string" },
                },
                required: ["title", "description"],
                additionalProperties: false
              }
            },
            ingredients: { 
              type: "array", 
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                },
                required: ["name"],
                additionalProperties: false
              }
            },
          },
          required: ["title", "description", "ingredients", "instructions"],
          additionalProperties: false
        }
      },
    },
    required: ["recipe"],
    additionalProperties: false
  },
  strict: true,
} as const;

export const myRecipes: Recipe[] = [
  {
    id: '1',
    image: '/images/butter-chicken.png',
    title: 'Classic Butter Chicken',
    description: 'A rich and creamy Indian curry made with tender chicken pieces in a tomato-based sauce with aromatic spices.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
      { name: 'Butter' },
      { name: 'Cashews' },
      { name: 'Garam Masala' },
      { name: 'Turmeric' },
      { name: 'Cumin' }
    ],
    instructions: [
      {
        title: 'Marinate the Chicken',
        time: '30 minutes',
        description: 'Mix chicken pieces with yogurt, lemon juice, ginger-garlic paste, and spices. Let it marinate for at least 30 minutes.'
      },
      {
        title: 'Prepare the Sauce',
        time: '15 minutes',
        description: 'Blend tomatoes, onions, and cashews to make a smooth paste. Cook this paste with butter and spices until oil separates.'
      },
      {
        title: 'Cook the Chicken',
        time: '20 minutes',
        description: 'Grill or pan-fry the marinated chicken until golden brown and cooked through.'
      },
      {
        title: 'Combine and Simmer',
        time: '10 minutes',
        description: 'Add the cooked chicken to the sauce, add cream, and simmer for 10 minutes until everything is well combined.'
      }
    ]
  },
  {
    id: '2',
    image: '/images/butter-chicken.png',
    title: 'Spicy Butter Chicken',
    description: 'A fiery version of the classic butter chicken with extra heat from green chilies and red chili powder.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
      { name: 'Butter' },
      { name: 'Cashews' },
      { name: 'Garam Masala' },
      { name: 'Turmeric' },
      { name: 'Cumin' }
    ],
    instructions: [
      {
        title: 'Prepare Spicy Marinade',
        time: '20 minutes',
        description: 'Create a spicy marinade with extra red chili powder, green chilies, and hot spices.'
      },
      {
        title: 'Make Hot Sauce Base',
        time: '15 minutes',
        description: 'Prepare a spicier version of the tomato sauce with additional chilies and hot spices.'
      },
      {
        title: 'Cook Chicken',
        time: '25 minutes',
        description: 'Cook the spicy marinated chicken until well done and charred on the edges.'
      },
      {
        title: 'Final Assembly',
        time: '8 minutes',
        description: 'Combine chicken with the hot sauce and finish with cream and fresh herbs.'
      }
    ]
  },
  {
    id: '3',
    image: '/images/butter-chicken.png',
    title: 'Creamy Butter Chicken',
    description: 'An extra creamy version with more cream and cashews for a luxurious, velvety texture.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
      { name: 'Butter' },
      { name: 'Cashews' },
      { name: 'Garam Masala' },
      { name: 'Turmeric' },
      { name: 'Cumin' }
    ],
    instructions: [
      {
        title: 'Soak Cashews',
        time: '30 minutes',
        description: 'Soak cashews in warm water for 30 minutes to soften them for blending.'
      },
      {
        title: 'Create Creamy Base',
        time: '20 minutes',
        description: 'Blend soaked cashews with tomatoes and onions to create an ultra-smooth, creamy base.'
      },
      {
        title: 'Marinate Chicken',
        time: '25 minutes',
        description: 'Marinate chicken with yogurt and mild spices, focusing on tenderness rather than heat.'
      },
      {
        title: 'Simmer with Cream',
        time: '15 minutes',
        description: 'Add generous amounts of cream and simmer gently to create a luxurious, velvety sauce.'
      }
    ]
  },
  {
    id: '4',
    image: '/images/butter-chicken.png',
    title: 'Quick Butter Chicken',
    description: 'A simplified version that can be made in under 30 minutes using pre-made ingredients.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
      { name: 'Butter' },
      { name: 'Cashews' },
      { name: 'Garam Masala' },
      { name: 'Turmeric' },
      { name: 'Cumin' }
    ],
    instructions: [
      {
        title: 'Quick Prep',
        time: '5 minutes',
        description: 'Use pre-cut chicken and pre-made spice mix for faster preparation.'
      },
      {
        title: 'Fast Cooking',
        time: '15 minutes',
        description: 'Cook everything in one pan with pre-made sauce base for quick assembly.'
      },
      {
        title: 'Final Touch',
        time: '5 minutes',
        description: 'Add cream and finish with fresh herbs for a restaurant-quality result.'
      }
    ]
  },
  {
    id: '5',
    image: '/images/butter-chicken.png',
    title: 'Healthy Butter Chicken',
    description: 'A lighter version using Greek yogurt instead of cream and minimal oil for a healthier option.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
      { name: 'Butter' },
      { name: 'Cashews' },
      { name: 'Garam Masala' },
      { name: 'Turmeric' },
      { name: 'Cumin' }
    ],
    instructions: [
      {
        title: 'Prepare Healthy Marinade',
        time: '20 minutes',
        description: 'Use Greek yogurt instead of regular yogurt and minimal oil for a healthier marinade.'
      },
      {
        title: 'Make Light Sauce',
        time: '15 minutes',
        description: 'Create a lighter sauce using less butter and more tomato puree for fewer calories.'
      },
      {
        title: 'Bake Chicken',
        time: '25 minutes',
        description: 'Bake the marinated chicken instead of frying to reduce oil content.'
      },
      {
        title: 'Finish Light',
        time: '10 minutes',
        description: 'Use Greek yogurt instead of cream and fresh herbs for a healthy finish.'
      }
    ]
  },
  {
    id: '6',
    image: '/images/butter-chicken.png',
    title: 'Traditional Butter Chicken',
    description: 'The authentic recipe passed down through generations with traditional cooking methods.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Traditional Marinade',
        time: '2 hours',
        description: 'Use traditional spices and marinate chicken for at least 2 hours for authentic flavor.'
      },
      {
        title: 'Clay Pot Cooking',
        time: '30 minutes',
        description: 'Cook the sauce in a traditional clay pot for authentic taste and aroma.'
      },
      {
        title: 'Tandoor Style Chicken',
        time: '20 minutes',
        description: 'Cook chicken in tandoor or grill for authentic smoky flavor.'
      },
      {
        title: 'Traditional Finish',
        time: '15 minutes',
        description: 'Finish with traditional garnishes and serve in authentic style.'
      }
    ]
  },
  {
    id: '7',
    image: '/images/butter-chicken.png',
    title: 'Butter Chicken Biryani',
    description: 'A fusion dish combining butter chicken with aromatic basmati rice for a complete meal.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Rice',
        time: '20 minutes',
        description: 'Soak and parboil basmati rice with whole spices for aromatic flavor.'
      },
      {
        title: 'Make Butter Chicken',
        time: '25 minutes',
        description: 'Prepare butter chicken with extra sauce to layer with rice.'
      },
      {
        title: 'Layer Biryani',
        time: '15 minutes',
        description: 'Layer rice and butter chicken in a heavy-bottomed pot with saffron and herbs.'
      },
      {
        title: 'Dum Cooking',
        time: '20 minutes',
        description: 'Cook on dum (steam) for 20 minutes to infuse all flavors together.'
      }
    ]
  },
  {
    id: '8',
    image: '/images/butter-chicken.png',
    title: 'Butter Chicken Pizza',
    description: 'A creative fusion combining butter chicken with pizza for an innovative twist.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Pizza Dough',
        time: '1 hour',
        description: 'Make pizza dough and let it rise for at least 1 hour.'
      },
      {
        title: 'Make Butter Chicken Topping',
        time: '20 minutes',
        description: 'Prepare butter chicken with less sauce to use as pizza topping.'
      },
      {
        title: 'Assemble Pizza',
        time: '10 minutes',
        description: 'Spread butter chicken on pizza base and add cheese and vegetables.'
      },
      {
        title: 'Bake Pizza',
        time: '15 minutes',
        description: 'Bake in preheated oven until crust is golden and cheese is melted.'
      }
    ]
  },
  {
    id: '9',
    image: '/images/butter-chicken.png',
    title: 'Butter Chicken Pasta',
    description: 'An Italian-Indian fusion combining butter chicken sauce with pasta for a unique dish.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Cook Pasta',
        time: '12 minutes',
        description: 'Boil pasta according to package instructions until al dente.'
      },
      {
        title: 'Prepare Butter Chicken Sauce',
        time: '18 minutes',
        description: 'Make butter chicken sauce with extra liquid to coat pasta properly.'
      },
      {
        title: 'Combine Pasta and Sauce',
        time: '5 minutes',
        description: 'Toss cooked pasta with butter chicken sauce until well coated.'
      },
      {
        title: 'Garnish and Serve',
        time: '2 minutes',
        description: 'Garnish with fresh herbs and grated cheese before serving.'
      }
    ]
  }
];

export const discoverRecipes: Recipe[] = [
  {
    id: '10',
    image: '/images/butter-chicken.png',
    title: 'Chicken Tikka Masala',
    description: 'A British-Indian dish with grilled chicken in a creamy tomato-based sauce.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Marinate Chicken',
        time: '2 hours',
        description: 'Marinate chicken pieces in yogurt and spices for at least 2 hours.'
      },
      {
        title: 'Grill Chicken',
        time: '15 minutes',
        description: 'Grill marinated chicken until charred and cooked through.'
      },
      {
        title: 'Prepare Masala Sauce',
        time: '20 minutes',
        description: 'Make a rich tomato-based sauce with cream and aromatic spices.'
      },
      {
        title: 'Simmer Together',
        time: '10 minutes',
        description: 'Add grilled chicken to sauce and simmer until flavors meld.'
      }
    ]
  },
  {
    id: '11',
    image: '/images/butter-chicken.png',
    title: 'Chicken Curry',
    description: 'A traditional Indian curry with tender chicken in a flavorful onion-tomato gravy.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Curry Base',
        time: '15 minutes',
        description: 'Cook onions, tomatoes, and spices until they form a thick paste.'
      },
      {
        title: 'Add Chicken',
        time: '25 minutes',
        description: 'Add chicken pieces and cook until tender and well-coated with spices.'
      },
      {
        title: 'Add Water and Simmer',
        time: '15 minutes',
        description: 'Add water and simmer until chicken is fully cooked and sauce thickens.'
      },
      {
        title: 'Finish with Herbs',
        time: '5 minutes',
        description: 'Garnish with fresh cilantro and serve hot with rice or bread.'
      }
    ]
  },
  {
    id: '12',
    image: '/images/butter-chicken.png',
    title: 'Chicken Biryani',
    description: 'Aromatic basmati rice layered with spiced chicken and cooked to perfection.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Marinate Chicken',
        time: '1 hour',
        description: 'Marinate chicken with yogurt, spices, and herbs for at least 1 hour.'
      },
      {
        title: 'Prepare Rice',
        time: '20 minutes',
        description: 'Soak and parboil basmati rice with whole spices.'
      },
      {
        title: 'Layer Biryani',
        time: '15 minutes',
        description: 'Layer marinated chicken and rice in a heavy pot with saffron.'
      },
      {
        title: 'Dum Cooking',
        time: '25 minutes',
        description: 'Cook on low heat with sealed lid for perfect dum cooking.'
      }
    ]
  },
  {
    id: '13',
    image: '/images/butter-chicken.png',
    title: 'Chicken Korma',
    description: 'A mild, creamy curry with chicken cooked in yogurt and nut-based sauce.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Nut Paste',
        time: '30 minutes',
        description: 'Soak and blend cashews and almonds to make a smooth paste.'
      },
      {
        title: 'Cook Chicken',
        time: '20 minutes',
        description: 'Cook chicken with onions and spices until golden brown.'
      },
      {
        title: 'Add Nut Paste',
        time: '15 minutes',
        description: 'Add nut paste and yogurt to chicken and cook until creamy.'
      },
      {
        title: 'Finish with Cream',
        time: '10 minutes',
        description: 'Add cream and simmer gently for a luxurious finish.'
      }
    ]
  },
  {
    id: '14',
    image: '/images/butter-chicken.png',
    title: 'Chicken Vindaloo',
    description: 'A spicy Goan curry with chicken marinated in vinegar and hot spices.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Vindaloo Paste',
        time: '20 minutes',
        description: 'Make a spicy paste with vinegar, chilies, and aromatic spices.'
      },
      {
        title: 'Marinate Chicken',
        time: '2 hours',
        description: 'Marinate chicken in vindaloo paste for at least 2 hours.'
      },
      {
        title: 'Cook Chicken',
        time: '30 minutes',
        description: 'Cook marinated chicken with potatoes until tender and spicy.'
      },
      {
        title: 'Adjust Spice',
        time: '5 minutes',
        description: 'Adjust spice level and serve hot with rice or bread.'
      }
    ]
  },
  {
    id: '15',
    image: '/images/butter-chicken.png',
    title: 'Chicken Saag',
    description: 'Chicken cooked with spinach and aromatic spices in a creamy green sauce.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Spinach',
        time: '10 minutes',
        description: 'Blanch spinach and blend to make a smooth puree.'
      },
      {
        title: 'Cook Chicken',
        time: '20 minutes',
        description: 'Cook chicken with onions and spices until golden.'
      },
      {
        title: 'Add Spinach',
        time: '15 minutes',
        description: 'Add spinach puree and cook until chicken is tender.'
      },
      {
        title: 'Finish Creamy',
        time: '8 minutes',
        description: 'Add cream and simmer for a rich, green curry.'
      }
    ]
  },
  {
    id: '16',
    image: '/images/butter-chicken.png',
    title: 'Chicken Makhani',
    description: 'A rich and buttery chicken curry with a luxurious tomato-based sauce.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Rich Sauce',
        time: '25 minutes',
        description: 'Make a rich tomato and cashew-based sauce with butter.'
      },
      {
        title: 'Cook Chicken',
        time: '20 minutes',
        description: 'Cook chicken pieces until golden and tender.'
      },
      {
        title: 'Combine and Simmer',
        time: '15 minutes',
        description: 'Add chicken to sauce and simmer until well combined.'
      },
      {
        title: 'Finish with Butter',
        time: '5 minutes',
        description: 'Finish with fresh butter and cream for richness.'
      }
    ]
  },
  {
    id: '17',
    image: '/images/butter-chicken.png',
    title: 'Chicken Do Pyaza',
    description: 'A flavorful curry with double the onions for sweetness and depth.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Onion Base',
        time: '15 minutes',
        description: 'Cook onions until golden brown for the base of the curry.'
      },
      {
        title: 'Add Spices',
        time: '10 minutes',
        description: 'Add spices and cook until aromatic.'
      },
      {
        title: 'Cook Chicken',
        time: '25 minutes',
        description: 'Add chicken and more onions, cook until tender.'
      },
      {
        title: 'Garnish',
        time: '5 minutes',
        description: 'Garnish with fresh onions and herbs.'
      }
    ]
  },
  {
    id: '18',
    image: '/images/butter-chicken.png',
    title: 'Chicken Rogan Josh',
    description: 'A Kashmiri curry with chicken in a rich, aromatic red sauce.',
    ingredients: [
      { name: 'Chicken' },
      { name: 'Tomatoes' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Ginger' },
      { name: 'Yogurt' },
      { name: 'Heavy Cream' },
    ],
    instructions: [
      {
        title: 'Prepare Spice Mix',
        time: '10 minutes',
        description: 'Prepare traditional Kashmiri spice mix with fennel and cardamom.'
      },
      {
        title: 'Cook Chicken',
        time: '30 minutes',
        description: 'Cook chicken with spices until tender and aromatic.'
      },
      {
        title: 'Add Yogurt',
        time: '15 minutes',
        description: 'Add yogurt gradually and cook until sauce thickens.'
      },
      {
        title: 'Finish',
        time: '8 minutes',
        description: 'Finish with saffron and serve hot.'
      }
    ]
  }
];
