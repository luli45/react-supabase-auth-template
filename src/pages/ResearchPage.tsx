import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { scrapingService } from '../services/scrapingService';
import { aiService } from '../services/aiService';
import { useDocuments } from '../hooks/useDocuments';

export default function ResearchPage() {
    // Mode: 'url' or 'paste'
    const [mode, setMode] = useState<'url' | 'paste'>('paste'); // Default to paste as requested fallback

    // URL Mode State
    const [url, setUrl] = useState('');

    // Paste Mode State
    const [rawText, setRawText] = useState('');

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

    const handleCleanPaste = () => {
        if (!rawText.trim()) return;

        setIsLoading(true);

        // Simulate processing delay for better UX
        setTimeout(() => {
            const clean = scrapingService.cleanText(rawText);
            setResult({
                title: 'Cleaned Research Note',
                markdown: clean
            });
            setIsLoading(false);
        }, 500);
    };

    const handleDeepClean = async () => {
        if (!rawText.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            // Use AI Service to refine (fix grammar/typos)
            const response = await aiService.refine(rawText, 'grammar');

            if (response.error) throw new Error(response.error);

            setResult({
                title: 'AI Refined Note',
                markdown: response.content
            });
        } catch (err) {
            setResult({
                error: err instanceof Error ? err.message : 'AI refinement failed',
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
                <Link to="/dashboard" className="back-link">
                    Back to Dashboard
                </Link>
                <h1>Research Mode</h1>
                <p className="text-secondary">High-signal content capture. Remove the fluff.</p>
            </header>

            <div className="card glass-panel" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', maxWidth: '800px', margin: '0 auto' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
                    <button
                        onClick={() => setMode('url')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderBottom: mode === 'url' ? '2px solid var(--color-primary)' : 'none',
                            fontWeight: mode === 'url' ? 600 : 400,
                            color: mode === 'url' ? 'var(--color-primary)' : 'var(--color-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        URL Capture
                    </button>
                    <button
                        onClick={() => setMode('paste')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderBottom: mode === 'paste' ? '2px solid var(--color-primary)' : 'none',
                            fontWeight: mode === 'paste' ? 600 : 400,
                            color: mode === 'paste' ? 'var(--color-primary)' : 'var(--color-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Paste & Clean
                    </button>
                </div>

                {/* URL INPUT MODE */}
                {mode === 'url' && (
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
                                border: '1px solid var(--color-border)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1rem',
                                color: 'var(--color-primary)',
                                backgroundColor: 'var(--color-surface)'
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                        />
                        <button
                            onClick={handleScrape}
                            disabled={isLoading || !url.trim()}
                            className="btn"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                        >
                            {isLoading ? 'Scraping...' : 'Capture'}
                        </button>
                    </div>
                )}

                {/* PASTE INPUT MODE */}
                {mode === 'paste' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Paste messy article text here..."
                            rows={8}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1rem',
                                color: 'var(--color-primary)',
                                backgroundColor: 'var(--color-surface)',
                                resize: 'vertical'
                            }}
                        />
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCleanPaste}
                                disabled={isLoading || !rawText.trim()}
                                className="btn"
                                style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}
                            >
                                {isLoading ? 'Processing...' : '✨ Quick Clean (Regex)'}
                            </button>
                            <button
                                onClick={handleDeepClean}
                                disabled={isLoading || !rawText.trim()}
                                className="btn"
                                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                            >
                                {isLoading ? 'AI Thinking...' : '🧠 Deep Clean (AI)'}
                            </button>
                        </div>
                    </div>
                )}

                {/* RESULTS AREA */}
                {result?.error ? (
                    <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#FEE2E2', color: '#C0392B', borderRadius: 'var(--radius-md)' }}>
                        <strong>Error:</strong> {result.error}
                        <p style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-xs)' }}>
                            Try using "Paste & Clean" mode if the URL cannot be reached.
                        </p>
                    </div>
                ) : result?.markdown ? (
                    <div className="result-preview">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-lg)' }}>
                            <h3 style={{ margin: 0 }}>{result.title}</h3>
                            <button onClick={handleSave} className="btn" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>
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
                            fontSize: '0.9rem',
                            color: 'var(--color-primary)'
                        }}>
                            {result.markdown}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-secondary)', padding: 'var(--spacing-xl)' }}>
                        <p>Use "Capture" to scrape a URL or "Paste" to clean up text manually.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
