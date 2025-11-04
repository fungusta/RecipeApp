// src/lib/metascraper/customRules.ts
import { Rules } from 'metascraper';

const customRules: Rules = {
    ingredients: [
        ({ htmlDom }) => {
            // Find all <li> items inside ingredient sections
            const items = htmlDom('[class*="ingredient"], [id*="ingredient"]')
                .find('li')
                .map((_, el) => htmlDom(el).text().trim())
                .get();

            if (items.length) return JSON.stringify(items); // structured array

            // Fallback: flat text extraction
            const text = htmlDom('[class*="ingredient"], [id*="ingredient"]').text().trim();
            return text || null;
        },
    ],

    instructions: [
        ({ htmlDom }) => {
            // Match common containers for directions
            const steps = htmlDom('[class*="instruction"], [id*="instruction"], [class*="direction"], [id*="direction"], [class*="steps"], [id*="steps"]')
                .find('li, p')
                .map((_, el) => htmlDom(el).text().trim())
                .get();

            if (steps.length) return JSON.stringify(steps);

            const text = htmlDom('[class*="instruction"], [id*="instruction"], [class*="direction"], [id*="direction"], [class*="steps"], [id*="steps"]').text().trim();
            return text || null;
        },
    ],
};

export default customRules;
