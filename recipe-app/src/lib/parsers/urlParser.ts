import got from "got";
import { scrapeRecipeFromJsonLd } from "../scrapers/jsonLdScraper";
import { scrapeRecipeFromMetaTags } from "../scrapers/metaScraper";
import { scrapeRecipeWithLibrary } from "../scrapers/recipeScraper";
import { Recipe } from "@/data/recipes";

// Type for scraper functions - all scrapers have the same signature
type ScraperFunction = (url: string) => Promise<Recipe | null>;

// Type for the return value of parseUrl
export interface ScraperStrategy {
    scrapers: ScraperFunction[];
}

export async function parseUrl(url: string): Promise<ScraperStrategy | null> {
    const domain = getDomainFromUrl(url);

    if (!domain) {
        console.error(`[Parser] Invalid or non-website URL: ${url}`);
        return null;
    }

    const isAccessible = await canFetchHTML(url);
    if (!isAccessible) {
        console.error(`[Parser] HTML Unable to be accessed: ${url}`);
        return null;
    }

    try {
        if (domain.includes('instagram.com')) {
            return {
                scrapers: [
                    // scrapeUrlInstagramScraper,
                    scrapeRecipeFromMetaTags,
                ],
            };
        } else if (domain.includes('tiktok.com')) {
            return {
                scrapers: [
                    scrapeRecipeFromMetaTags,
                ],
            };
        } else {
            return {
                scrapers: [
                    scrapeRecipeWithLibrary,
                    scrapeRecipeFromJsonLd,
                    scrapeRecipeFromMetaTags,
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

function getDomainFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        // Only allow HTTP/HTTPS protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            console.error(`[URL Parser] Non-HTTP protocol detected: ${urlObj.protocol} for URL: ${url}`);
            return null; // Not a website URL
        }
        
        const hostname = urlObj.hostname;
        
        // Check for valid domain (not localhost, file paths, etc.)
        if (!hostname || hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.')) {
            console.error(`[URL Parser] Invalid or local domain: ${hostname || 'empty'} for URL: ${url}`);
            return null; // Not a valid website domain
        }
        
        return hostname.replace(/^www\./, ""); // remove 'www.' if present
    } catch (error) {
        console.error(`[URL Parser] Failed to parse URL: ${url}`, error);
        return null;
    }
}

export function isInstagramURL(url: string): boolean {
    try {
        const { hostname } = new URL(url);
        return hostname.includes('instagram.com');
    } catch {
        return false;
    }
}

async function canFetchHTML(url: string): Promise<boolean> {
    try  {
        const response = await got.head(url, {
            timeout: { request: 2000 }, // 5 second timeout for quick validation
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MyScraperBot/1.0)',
            },
            followRedirect: true,
            throwHttpErrors: false, // Don't throw on 4xx/5xx, just return the response
        });

        return response.statusCode >= 200 && response.statusCode < 400;
    } catch (headError) {
       // If HEAD throws, it's a network/DNS error - URL cannot be fetched
        // Handle DNS errors (ENOTFOUND, EAI_AGAIN), network errors, etc.
        const errorCode = (headError as any)?.code;
        
        // DNS resolution errors mean the URL cannot be fetched
        if (errorCode === 'ENOTFOUND' || errorCode === 'EAI_AGAIN') {
            return false;
        }
        
        // Network errors (timeout, connection refused, etc.)
        if (errorCode === 'ETIMEDOUT' || errorCode === 'ECONNREFUSED' || errorCode === 'ENETUNREACH') {
            return false;
        }
        
        // For other errors, log and return false
        console.error(`[URL Validator] Failed to check URL ${url}:`, headError);
        return false;
    }
}