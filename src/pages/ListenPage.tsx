import { useState } from 'react';
import { Link } from 'react-router-dom';
import { audioService } from '../services/audioService';

export default function ListenPage() {
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        setError(null);
        setAudioUrl(null);

        try {
            const arrayBuffer = await audioService.generateSpeech({ text });
            const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to generate audio');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) 0' }}>
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                <Link to="/dashboard" className="btn btn--ghost btn--small" style={{ marginBottom: 'var(--spacing-md)', display: 'inline-flex' }}>
                    ← Back to Dashboard
                </Link>
                <h1>Neuro-Adaptive Audio</h1>
                <p className="text-secondary">Convert your notes into a podcast-style audio experience.</p>
            </header>

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

                {/* Input Section */}
                <div className="card" style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                    <label htmlFor="text-input" style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>
                        Text to Read
                    </label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your study notes here..."
                        style={{
                            width: '100%',
                            height: '300px',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #E2E8F0',
                            fontFamily: 'var(--font-body)',
                            fontSize: '1rem',
                            resize: 'vertical',
                            marginBottom: 'var(--spacing-md)'
                        }}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !text.trim()}
                        className="btn btn--accent"
                        style={{
                            width: '100%',
                            backgroundColor: 'var(--color-accent)',
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Generating Audio...' : 'Generate Podcast'}
                    </button>

                    {error && (
                        <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-error)', backgroundColor: '#FEE2E2', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Player Section */}
                <div className="card" style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', height: 'fit-content' }}>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Player</h2>

                    {audioUrl ? (
                        <div className="audio-player-wrapper">
                            <audio controls src={audioUrl} style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}>
                                Your browser does not support the audio element.
                            </audio>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-subtle)' }}>
                                <strong>Tip:</strong> You can adjust the playback speed in the player controls for faster review.
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--color-text-subtle)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🎧</div>
                            <p>Generate audio to see the player here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
