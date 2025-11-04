import got from 'got';

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
        console.error(`Error fetching HTML from ${url}:`, err instanceof Error ? err.message : String(err));
        return '';
    }
}