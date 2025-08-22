const express = require('express');
const router = express.Router();
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

// Promisify ffprobe
const ffprobe = util.promisify(ffmpeg.ffprobe);

// --- Multer Setup for File Uploads ---
// This temporarily stores the uploaded images and audio files
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// --- Video Assembly Route ---
router.post('/assemble', upload.any(), async (req, res) => {
    console.log('Video assembly request received.');
    const files = req.files;
    const scenes = JSON.parse(req.body.scenes);
    const tempVideoClips = [];

    try {
        // Step 1: Create a short video clip for each scene (image + audio)
        for (let i = 0; i < scenes.length; i++) {
            const imageFile = files.find(f => f.fieldname === `image_${i}`);
            const audioFile = files.find(f => f.fieldname === `audio_${i}`);

            if (!imageFile || !audioFile) {
                console.error(`Missing files for scene ${i}`);
                continue;
            }
            
            // Get the duration of the audio file to set the image duration
            const audioMeta = await ffprobe(audioFile.path);
            const audioDuration = audioMeta.format.duration;
            
            const clipPath = path.join(__dirname, '../outputs', `clip_${i}.mp4`);

            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(imageFile.path)
                    .loop(audioDuration) // Loop the image for the duration of the audio
                    .input(audioFile.path)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .pixFmt('yuv420p') // for compatibility
                    .outputOptions('-tune stillimage')
                    .on('end', resolve)
                    .on('error', reject)
                    .save(clipPath);
            });
            tempVideoClips.push(clipPath);
        }

        if (tempVideoClips.length === 0) {
            return res.status(400).json({ success: false, message: 'No video clips could be created.' });
        }

        // Step 2: Concatenate all the clips into a single video
        const outputFileName = `video-${Date.now()}.mp4`;
        const outputPath = path.join(__dirname, '../outputs', outputFileName);

        await new Promise((resolve, reject) => {
            const merger = ffmpeg();
            tempVideoClips.forEach(clip => merger.input(clip));
            
            merger
                .on('end', resolve)
                .on('error', reject)
                .mergeToFile(outputPath, path.join(__dirname, '../uploads')); // temp dir
        });
        
        res.json({
            success: true,
            videoUrl: `http://localhost:${process.env.PORT || 5000}/outputs/${outputFileName}`,
        });

    } catch (error) {
        console.error('Error during video assembly:', error);
        res.status(500).json({ success: false, message: 'Failed to create video.' });
    } finally {
        // Step 3: Clean up temporary files
        files.forEach(file => fs.unlink(file.path).catch(err => console.error("Failed to delete upload:", err)));
        tempVideoClips.forEach(clip => fs.unlink(clip).catch(err => console.error("Failed to delete clip:", err)));
    }
});

module.exports = router;