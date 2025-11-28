import {
    GiAppleCore,
    GiBanana,
    GiGrapes,
    GiCarrot,
    GiGarlic,
    GiChickenLeg,
    GiCow,
    GiFishCooked,
    GiMilkCarton,
    GiCheeseWedge,
    GiGrain,
    GiMushroom,
    GiTomato,
    GiPotato,
  } from "react-icons/gi"; // Game Icons are great for food
  
  import { TbSalt } from "react-icons/tb";
  import { RiLeafFill } from "react-icons/ri";
  import { IconType } from "react-icons";
  
  export const ingredientIcons: Record<string, IconType> = {
    // ----- FRUITS -----
    apple: GiAppleCore,
    apples: GiAppleCore,
    banana: GiBanana,
    bananas: GiBanana,
    grape: GiGrapes,
    grapes: GiGrapes,
  
    // ----- VEGETABLES -----
    carrot: GiCarrot,
    carrots: GiCarrot,
    garlic: GiGarlic,
    tomato: GiTomato,
    tomatoes: GiTomato,
    potato: GiPotato,
    potatoes: GiPotato,
    mushroom: GiMushroom,
    mushrooms: GiMushroom,
  
    // ----- MEAT -----
    beef: GiCow,
    steak: GiCow,
    meat: GiCow,
    chicken: GiChickenLeg,
    pork: GiCow,
  
    // ----- SEAFOOD -----
    fish: GiFishCooked,
    salmon: GiFishCooked,
    tuna: GiFishCooked,
    seafood: GiFishCooked,
  
    // ----- DAIRY -----
    milk: GiMilkCarton,
    dairy: GiMilkCarton,
    cheese: GiCheeseWedge,
    butter: GiCheeseWedge,
    yogurt: GiMilkCarton,
  
    // ----- GRAINS / BAKING -----
    wheat: GiGrain,
    flour: GiGrain,
    grain: GiGrain,
    grains: GiGrain,
    rice: GiGrain,
    oats: GiGrain,
  
    // ----- SEASONING -----
    salt: TbSalt,
    sugar: TbSalt,
    herbs: RiLeafFill,
    herb: RiLeafFill,
    spice: RiLeafFill,
    spices: RiLeafFill,
  };
  
  export const fallbackIcon = RiLeafFill;
  
  
export function useIngredientIcon(name: string) {
    if (!name) return fallbackIcon;
  
    const cleaned = name.toLowerCase().trim();
    const singular = cleaned.endsWith("s")
      ? cleaned.slice(0, -1)
      : cleaned;
  
    // direct match
    if (ingredientIcons[cleaned]) return ingredientIcons[cleaned];
    if (ingredientIcons[singular]) return ingredientIcons[singular];
  
    // fuzzy match
    for (const key of Object.keys(ingredientIcons)) {
      if (cleaned.includes(key)) return ingredientIcons[key];
    }
  
    return fallbackIcon;
  }