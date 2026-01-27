import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { scrapingService } from '../services/scrapingService';
import { useDocuments } from '../hooks/useDocuments';

export default function ResearchPage() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ title?: string; markdown?: string; error?: string } | null>(null);
    const { createDocument } = useDocuments();
    const navigate = useNavigate();

    const handleScrape = async () => {
        if (!url.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const data = await scrapingService.scrapeUrl(url);
            setResult({
                title: data.title,
                markdown: data.markdown || data.text,
            });
        } catch (err) {
            setResult({
                error: err instanceof Error ? err.message : 'Failed to scrape URL',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result?.markdown) return;

        try {
            // Create a new document with the scraped content
            const title = result.title || 'Research Note';
            // Note: Real implementation would inject content into BlockSuite. 
            // For now we create the doc and navigate, user can paste (or we'd update doc content API)
            const doc = await createDocument(title);

            // Navigate to it
            navigate(`/documents/${doc.id}`);
        } catch (err) {
            console.error('Failed to save document:', err);
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) 0' }}>
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                <Link to="/dashboard" className="btn btn--ghost btn--small" style={{ marginBottom: 'var(--spacing-md)', display: 'inline-flex' }}>
                    ← Back to Dashboard
                </Link>
                <h1>Research Mode</h1>
                <p className="text-secondary">Distraction-free web scraping. Enter a URL to capture its content.</p>
            </header>

            <div className="card" style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #E2E8F0',
                            fontFamily: 'var(--font-body)',
                            fontSize: '1rem',
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                    />
                    <button
                        onClick={handleScrape}
                        disabled={isLoading || !url.trim()}
                        className="btn btn--primary"
                    >
                        {isLoading ? 'Scraping...' : 'Capture'}
                    </button>
                </div>

                {result?.error ? (
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#FEE2E2', color: 'var(--color-error)', borderRadius: 'var(--radius-md)' }}>
                        <strong>Error:</strong> {result.error}
                        <p style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-xs)' }}>
                            (Note: If this is a CORS error, try using a backend proxy or server-side function.)
                        </p>
                    </div>
                ) : result?.markdown ? (
                    <div className="result-preview">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <h3 style={{ margin: 0 }}>{result.title}</h3>
                            <button onClick={handleSave} className="btn btn--accent">
                                Save to Notes
                            </button>
                        </div>
                        <div style={{
                            backgroundColor: 'var(--color-bg-default)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.9rem'
                        }}>
                            {result.markdown}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: 'var(--spacing-xl)' }}>
                        Use this tool to read articles without ads, popups, or distractions.
                    </div>
                )}
            </div>
        </div>
    );
}
