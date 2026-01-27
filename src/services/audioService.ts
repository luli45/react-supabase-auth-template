export interface AudioGenerationParams {
    text: string;
    voiceId?: string; // Default to specific neuro-calm voice if not provided
}

export const audioService = {
    async generateSpeech({ text, voiceId }: AudioGenerationParams): Promise<ArrayBuffer> {
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

        if (!apiKey) {
            throw new Error('ElevenLabs API Key is missing. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
        }

        // Default voice (Rachel) if none provided
        const voice = voiceId || "21m00Tcm4TlvDq8ikWAM";
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ElevenLabs API Error: ${response.status} ${errorText}`);
        }

        return await response.arrayBuffer();
    }
};
