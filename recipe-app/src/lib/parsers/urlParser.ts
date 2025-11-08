import { scrapeUrlJsonLd } from "../scrapers/jsonLdScraper";
import { scrapeUrlMeta } from "../scrapers/metaScraper";
import { scrapeUrlRecipescraper } from "../scrapers/recipeScraper";
import { Recipe } from "@/data/recipes";

// Type for scraper functions - all scrapers have the same signature
type ScraperFunction = (url: string) => Promise<Recipe | null>;

// Type for the return value of parseUrl
export interface ScraperStrategy {
    scrapers: ScraperFunction[];
    needsExtraction?: boolean;  // Optional flag for social media URLs
}

export function parseUrl(url: string): ScraperStrategy | null {
    const domain = getDomainFromUrl(url);

    try {
        if (domain.includes('instagram.com')) {
            return {
                scrapers: [
                    // scrapeUrlInstagramScraper,
                    scrapeUrlMeta,
                ],
                needsExtraction: true  // Might need to extract recipe link from post
            };
        } else if (domain.includes('tiktok.com')) {
            return {
                scrapers: [
                    // scrapeUrlTiktokScraper,
                    scrapeUrlMeta,
                ],
                needsExtraction: true  // Might need to extract recipe link from post
            };
        } else {
            return {
                scrapers: [
                    scrapeUrlRecipescraper,
                    scrapeUrlJsonLd,
                    scrapeUrlMeta,
                ],
            }
        }
    } catch (err) {
        console.error(`[Parser] Failed for ${url}:`, err);
        return null;
    }
}

/**
 * Normalizes a URL to a consistent format for scraping
 * - Adds https:// protocol if missing
 * - Removes www. prefix
 * - Removes tracking parameters (utm_*, ref, fbclid, etc.)
 * - Removes fragments (#...)
 * - Removes trailing slashes (except root path)
 * - Trims whitespace
 * 
 * @param url - The URL string to normalize
 * @returns Normalized URL string, or original if invalid
 */
export function normalizeUrl(url: string): string {
    try {
        // 1. Trim whitespace
        let normalized = url.trim();
        
        if (!normalized) {
            return url; // Return original if empty after trim
        }

        // 2. Add protocol if missing (default to https)
        if (!normalized.match(/^https?:\/\//i)) {
            normalized = `https://${normalized}`;
        }

        // 3. Parse the URL
        const urlObj = new URL(normalized);
        
        // 4. Normalize hostname: remove www. and lowercase
        urlObj.hostname = urlObj.hostname.replace(/^www\./i, '').toLowerCase();
        
        // 5. Remove tracking parameters
        const trackingParams = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'ref', 'fbclid', 'gclid', 'msclkid', 'twclid', 'li_fat_id',
            'mc_cid', 'mc_eid', 'igshid', '_ga', '_gid', 'source', 'campaign'
        ];
        
        trackingParams.forEach(param => {
            urlObj.searchParams.delete(param);
        });
        
        // 6. Remove fragments
        urlObj.hash = '';
        
        // 7. Normalize path: remove trailing slashes (except root)
        let path = urlObj.pathname;
        if (path.length > 1 && path.endsWith('/')) {
            urlObj.pathname = path.slice(0, -1);
        }
        
        // 8. Reconstruct normalized URL
        normalized = urlObj.toString();
        
        // Remove trailing slash from the final URL if it's just the protocol + domain
        if (normalized.endsWith('/') && urlObj.pathname === '/') {
            normalized = normalized.slice(0, -1);
        }
        
        return normalized;
    } catch (error) {
        // If URL parsing fails, return original (might be invalid)
        console.error(`[URL Normalizer] Failed to normalize URL: ${url}`, error);
        return url;
    }
}

function getDomainFromUrl(url: string): string {
    try {
        const { hostname } = new URL(url);
        return hostname.replace(/^www\./, ""); // remove 'www.' if present
    } catch {
        return "";
    }
}