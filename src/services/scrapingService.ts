export interface ScrapeResult {
    markdown?: string;
    text?: string;
    title?: string;
    error?: string;
}

export const scrapingService = {
    async scrapeUrl(url: string): Promise<ScrapeResult> {
        const apiKey = import.meta.env.VITE_HYPERBROWSER_API_KEY;

        if (!apiKey) {
            throw new Error('Hyperbrowser API Key is missing. Please add VITE_HYPERBROWSER_API_KEY to your .env file.');
        }

        // Using the REST API directly
        // Note: If CORS issues arise, this needs to be moved to a Supabase Edge Function
        const apiUrl = 'https://api.hyperbrowser.ai/v1/scrape';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'x-api-key': apiKey, // Trying common auth headers
                },
                body: JSON.stringify({
                    url,
                    scrapeOptions: {
                        formats: ['markdown', 'text'],
                    },
                    sessionOptions: {
                        useProxy: true,
                        solveCaptchas: true,
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hyperbrowser API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // Handle async job response if it returns a jobId
            if (data.jobId && !data.data) {
                // For now, simpler implementation assuming synchronous or fast return
                // If it's async, we'd need to poll /jobs/{id}
                throw new Error('Async scraping not yet fully implemented in client-side service. Please retry or update service.');
            }

            return {
                markdown: data.data?.markdown || data.markdown,
                text: data.data?.text || data.text,
                title: data.data?.metadata?.title || data.metadata?.title || new URL(url).hostname
            };

        } catch (error) {
            console.error('Scraping failed:', error);
            throw error;
        }
    }, // Correctly close the scrapeUrl method and add a comma for the next property

    /**
     * Client-side function to clean and de-fluff text.
     * Useful when API is unavailable or for manual paste.
     */
    cleanText(rawText: string): string {
        if (!rawText) return '';

        let cleaned = rawText
            // Remove common ad/tracking patterns (simple heauristics)
            .replace(/Advertisement/gi, '')
            .replace(/Sponsored Content/gi, '')
            .replace(/Share this:/gi, '')
            .replace(/Click here to/gi, '')

            // Normalize whitespace
            .replace(/\t/g, ' ')
            .replace(/ {2,}/g, ' ')     // Multiple spaces to single
            .replace(/\n{3,}/g, '\n\n') // Max 2 newlines

            // Fix common copy-paste artifacts
            .replace(/•/g, '-')
            .trim();

        return cleaned;
    }
};
