import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const VideoGenerator = () => {
    const { isDark } = useTheme();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [scenes, setScenes] = useState([]);
    const [currentScene, setCurrentScene] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [finalVideoUrl, setFinalVideoUrl] = useState('');

    // --- API Functions ---

    const generateScript = async (topic) => {
        setLoadingMessage('Generating script with Gemini...');
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `Create a short, engaging educational video script about ${topic}. The script should be around 150 words and divided into 3 to 4 scenes. For each scene, provide a narration and a visual suggestion. Format as JSON with "scenes": [{"narration": "...", "visual": "..."}]` }]
                        }],
                    }),
                }
            );
            if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
            const data = await response.json();
            const jsonString = data.candidates[0].content.parts[0].text.replace(/```json\n?|\n?```/g, '');
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error generating script:', error);
            toast.error("Failed to generate script.");
            return null;
        }
    };

    const huggingFaceApi = async (model, data) => {
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                headers: { Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        if (!response.ok) throw new Error(`Hugging Face API error for ${model}: ${response.statusText}`);
        return response;
    };

    const generateAudio = async (text) => {
        setLoadingMessage('Generating audio...');
        try {
            // UPDATED MODEL
            const response = await huggingFaceApi("microsoft/speecht5_tts", { inputs: text });
            return response.blob();
        } catch (error) {
            console.error('Error generating audio:', error);
            return null;
        }
    };

    const generateImage = async (prompt) => {
        setLoadingMessage('Generating images...');
        try {
            // UPDATED MODEL
            const response = await huggingFaceApi("runwayml/stable-diffusion-v1-5", { inputs: prompt });
            return response.blob();
        } catch (error) {
            console.error('Error generating image:', error);
            return null;
        }
    };

    // --- Main Handler ---

    const handleGenerateVideo = async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a topic.");
            return;
        }
        setLoading(true);
        setFinalVideoUrl('');

        const script = await generateScript(prompt);
        if (!script || !script.scenes) {
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            const sceneMetadata = script.scenes.map(s => ({ narration: s.narration }));
            formData.append('scenes', JSON.stringify(sceneMetadata));

            for (let i = 0; i < script.scenes.length; i++) {
                const scene = script.scenes[i];
                setLoadingMessage(`Generating assets for scene ${i + 1}...`);

                const audioBlob = await generateAudio(scene.narration);
                const imageBlob = await generateImage(scene.visual);

                if (!audioBlob || !imageBlob) throw new Error(`Failed to generate assets for scene ${i + 1}`);

                formData.append(`image_${i}`, imageBlob, `image_${i}.png`);
                formData.append(`audio_${i}`, audioBlob, `audio_${i}.mp3`);
            }
            
            setLoadingMessage('Assembling video on server...');
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/video/assemble`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setFinalVideoUrl(result.videoUrl);
                toast.success("Your video has been created!");
            } else {
                throw new Error(result.message || 'Video assembly failed.');
            }

        } catch (error) {
            console.error("Error in video generation pipeline:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className={`p-6 min-h-[80vh] ${isDark ? 'bg-[#080808]' : 'bg-[#f8f8f8]'}`}>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Video Generator
            </h2>
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-[#181818] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g., The process of photosynthesis"
                        className={`flex-grow p-3 border rounded-lg ${isDark ? 'bg-[#101010] border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                    <button
                        onClick={handleGenerateVideo}
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg text-white font-semibold transition ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Generating...' : '✨ Generate Video'}
                    </button>
                </div>
                 {loading && <p className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{loadingMessage}</p>}
            </div>

            {finalVideoUrl && !loading && (
                <div className="mt-8">
                    <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Your Video is Ready!
                    </h3>
                    <video
                        src={finalVideoUrl}
                        controls
                        className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl"
                    />
                    <div className="text-center mt-4">
                        <a
                            href={finalVideoUrl}
                            download={`StudyAid-Video.mp4`}
                            className="inline-block px-6 py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition"
                        >
                            ⬇️ Download Video
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;