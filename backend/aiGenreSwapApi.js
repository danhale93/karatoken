
const express = require('express');
const router = express.Router();
// POST / (for /api/ai/genre-swap)
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// POST /api/ai/genre-swap (combined pipeline)
router.post('/', async (req, res) => {
  const { youtubeUrl, targetGenre } = req.body;
  if (!youtubeUrl || !targetGenre) {
    return res.status(400).json({ error: 'youtubeUrl and targetGenre are required' });
  }
  try {
    // 1. Download YouTube audio
    const id = Date.now();
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const audioPath = path.join(tempDir, `${id}.mp3`);
    const audioStream = ytdl(youtubeUrl, { filter: 'audioonly' });
    const writeStream = fs.createWriteStream(audioPath);
    await new Promise((resolve, reject) => {
      audioStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });

    // 2. Run Demucs (Python) to separate vocals
    const outputDir = path.join(tempDir, `${id}_demucs`);
    const python = process.platform === 'win32' ? 'python' : 'python3';
    await new Promise((resolve, reject) => {
      const demucsScript = path.join(process.cwd(), 'backend', 'demucs_infer.py');
      const proc = spawn(python, [demucsScript, audioPath, outputDir], { stdio: 'inherit' });
      proc.on('close', code => code === 0 ? resolve() : reject(new Error('Demucs failed')));
      proc.on('error', reject);
    });

    // 3. Genre transfer (Python)
    const vocalsPath = path.join(outputDir, 'vocals.wav');
    if (!fs.existsSync(vocalsPath)) {
      return res.status(500).json({ error: 'Vocals file not found' });
    }
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const genreOutFile = path.join(publicDir, `${id}_vocals_genre_${targetGenre}.wav`);
    await new Promise((resolve, reject) => {
      const genreTransferScript = path.join(process.cwd(), 'backend', 'genre_transfer.py');
      const proc = spawn(python, [genreTransferScript, vocalsPath, genreOutFile, targetGenre], { stdio: 'inherit' });
      proc.on('close', code => code === 0 ? resolve() : reject(new Error('Genre transfer failed')));
      proc.on('error', reject);
    });

    const swappedAudioUrl = `/public/${id}_vocals_genre_${targetGenre}.wav`;

    // 4. Transcribe the output using Whisper
    const scriptPath = path.join(process.cwd(), 'backend', 'whisper_transcribe.py');
    const transcribeProc = spawn(python, [scriptPath, genreOutFile]);
    let output = '';
    transcribeProc.stdout.on('data', (data) => {
      output += data.toString();
    });
    transcribeProc.stderr.on('data', (data) => {
      console.error('Whisper stderr:', data.toString());
    });
    transcribeProc.on('close', (code) => {
      if (code === 0) {
        try {
          const transcription = JSON.parse(output);
          // Save transcription to a JSON file
          const transcriptionPath = path.join(publicDir, `${id}_transcription.json`);
          fs.writeFileSync(transcriptionPath, JSON.stringify(transcription, null, 2));
          // Convert to LRC
          const lrcPath = path.join(publicDir, `${id}_lyrics.lrc`);
          const lrcScript = path.join(process.cwd(), 'backend', 'transcription_to_lrc.py');
          const lrcProc = spawn(python, [lrcScript, transcriptionPath, lrcPath]);
          lrcProc.on('close', (lrcCode) => {
            if (lrcCode === 0) {
              res.json({ swappedAudioUrl, transcription, lrcUrl: `/public/${id}_lyrics.lrc` });
            } else {
              res.json({ swappedAudioUrl, transcription, lrcUrl: null, lrcError: 'LRC conversion failed' });
            }
          });
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse Whisper output', swappedAudioUrl, raw: output });
        }
      } else {
        res.status(500).json({ error: 'Whisper transcription failed', swappedAudioUrl, raw: output });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Genre swap failed' });
  }
});
// Express router for AI genre swap, vocal separation, and genre coach endpoints


// POST /api/ai/genre-swap/genre-swap
router.post('/genre-swap', async (req, res) => {
  const { audioUrl, targetGenre } = req.body;
  if (!audioUrl || !targetGenre) {
    return res.status(400).json({ error: 'audioUrl and targetGenre are required' });
  }
  try {
    // Locate the input audio file
    const inputPath = path.join(process.cwd(), audioUrl.replace('/public/', 'public/'));
    const outputPath = inputPath.replace('.wav', `_genre_${targetGenre}.wav`);

    // Call your genre transfer model (Python script example)
    const python = process.platform === 'win32' ? 'python' : 'python3';
    await new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'backend', 'genre_transfer.py');
      const proc = spawn(python, [scriptPath, inputPath, outputPath, targetGenre], { stdio: 'inherit' });
      proc.on('close', code => code === 0 ? resolve() : reject(new Error('Genre transfer failed')));
      proc.on('error', reject);
    });

    // Serve the processed file
    const publicUrl = `/public/${path.basename(outputPath)}`;
    res.json({ swappedAudioUrl: publicUrl });
  } catch (err) {
    console.error('[GenreSwap] Genre transfer error:', err);
    res.status(500).json({ error: err.message || 'Genre transfer failed' });
  }
});
// POST /api/ai/transcribe
router.post('/transcribe', async (req, res) => {
  const { audioPath } = req.body; // Path to the audio file to transcribe
  if (!audioPath || !fs.existsSync(audioPath)) {
    return res.status(400).json({ error: 'audioPath is required and must exist' });
  }
  try {
    const python = process.platform === 'win32' ? 'python' : 'python3';
    const scriptPath = path.join(process.cwd(), 'backend', 'whisper_transcribe.py');
    const proc = spawn(python, [scriptPath, audioPath]);

    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    proc.stderr.on('data', (data) => {
      console.error('Whisper stderr:', data.toString());
    });
    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          res.json(result);
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse Whisper output', raw: output });
        }
      } else {
        res.status(500).json({ error: 'Whisper transcription failed', raw: output });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/genre-coach
router.post('/genre-coach', async (req, res) => {
  // TODO: Integrate with AI coach model for genre tips
  // Accepts: genre
  // Returns: tip
  const { genre } = req.body;
  res.json({ tip: `Sing with the groove and style of ${genre}! Try to match the phrasing and energy typical for this genre.` });
});

module.exports = router;
