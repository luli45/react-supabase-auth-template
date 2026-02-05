import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
    text: string;
}

export function AudioPlayer({ text }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [rate, setRate] = useState(1);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Initialize voice
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Try to find a good English voice
            const preferredVoice = voices.find(v => v.name.includes('Google US English'))
                || voices.find(v => v.name.includes('Samantha'))
                || voices.find(v => v.lang.startsWith('en'));
            setVoice(preferredVoice || null);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Manage playback
    useEffect(() => {
        if (!text) return;

        // Cancel previous speaking if text changes significantly? 
        // For now, let's just setup the utterance
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.rate = rate;

        u.onend = () => setIsPlaying(false);
        u.onerror = (e) => {
            console.error("Speech error", e);
            setIsPlaying(false);
        };

        utteranceRef.current = u;

    }, [text, voice]);

    // Live update rate while playing
    useEffect(() => {
        if (window.speechSynthesis.speaking && isPlaying) {
            // SpeechSynthesis is tricky with dynamic updates.
            // Often you need to cancel and restart to change rate mid-stream.
            // For simplicity in this v1, we apply rate on next play or restart
            // But we can try to pause/resume with new rate if needed. 
            // Most reliable way: cancel, create new utterance from current char index? Too complex for v1.
            // We'll just confirm that the NEXT play uses the new rate.
            window.speechSynthesis.cancel();
            if (utteranceRef.current) {
                utteranceRef.current.rate = rate;
                window.speechSynthesis.speak(utteranceRef.current);
            }
        }
    }, [rate]);

    const togglePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            if (utteranceRef.current) {
                // Ensure rate is set
                utteranceRef.current.rate = rate;
                window.speechSynthesis.speak(utteranceRef.current);
                setIsPlaying(true);
            }
        }
    };

    const speeds = [0.75, 1, 1.25, 1.5, 2];

    if (!text) return null;

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px', // Or center? Floating bottom is good.
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            zIndex: 100,
            boxShadow: 'var(--shadow-float)'
        }}>
            {/* Play/Pause */}
            <button
                onClick={togglePlay}
                style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
                )}
            </button>

            {/* Content Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>Audio Mode</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)' }}>
                    {isPlaying ? 'Playing...' : 'Paused'}
                </span>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }}></div>

            {/* Speed Control */}
            <div style={{ display: 'flex', gap: '4px' }}>
                {speeds.map(s => (
                    <button
                        key={s}
                        onClick={() => setRate(s)}
                        style={{
                            background: rate === s ? 'var(--color-surface-active)' : 'transparent',
                            color: rate === s ? 'var(--color-primary)' : 'var(--color-secondary)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
    );
}
