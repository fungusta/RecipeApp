import got from 'got';

/**
 * Custom error class for fetch-related errors.
 * Allows distinguishing fetch errors from other types of errors.
 */
export class FetchError extends Error {
    constructor(message: string, public readonly url: string, public readonly originalError?: unknown) {
        super(message);
        this.name = 'FetchError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FetchError);
        }
    }
}

export async function fetchHtml(url: string): Promise<string> {
    try {
        const response = await got(url, {
            timeout: { request: 8000 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MyScraperBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
            },
            followRedirect: true,
            responseType: 'text'
        });
        return response.body;
    } catch (err) {
        const message = `Failed to fetch HTML from ${url}: ${err instanceof Error ? err.message : String(err)}`;
        throw new FetchError(message, url, err);
    }
}