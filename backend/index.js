// Main backend server for Karatoken
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Routers
const aiGenreSwapApi = require('./aiGenreSwapApi');
const lyricsApi = require('./lyricsApi');
const youtubeAudioApi = require('./youtubeAudioApi');

const vocalIsolateApi = require('./vocalIsolateApi');
const battleApi = require('./battleApi');

app.use('/api/ai/genre-swap', aiGenreSwapApi);
app.use('/api/ai/vocal-isolate', vocalIsolateApi);
app.use('/api/lyrics', lyricsApi);
app.use('/api/youtube', youtubeAudioApi);
app.use('/api/battle', battleApi);

// Health check
app.get('/', (req, res) => res.send('Karatoken backend running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
