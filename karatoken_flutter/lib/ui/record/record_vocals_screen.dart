import 'package:flutter/material.dart';

class RecordVocalsScreen extends StatefulWidget {
  const RecordVocalsScreen({super.key});

  @override
  State<RecordVocalsScreen> createState() => _RecordVocalsScreenState();
}

class _RecordVocalsScreenState extends State<RecordVocalsScreen> {
  String? _instrumentalPath;
  String? _recordedPath;
  bool _isRecording = false;
  bool _isPlaying = false;

  void _selectInstrumental() async {
    // TODO: Implement file picker for instrumental
  }

  void _startRecording() async {
    // TODO: Call RecordingService.startRecording
    setState(() => _isRecording = true);
  }

  void _stopRecording() async {
    // TODO: Call RecordingService.stopRecording
    setState(() => _isRecording = false);
  }

  void _playRecording() async {
    // TODO: Call RecordingService.playRecording
    setState(() => _isPlaying = true);
  }

  void _stopPlayback() async {
    // TODO: Call RecordingService.stopPlayback
    setState(() => _isPlaying = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Record Vocals')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: _selectInstrumental,
              child: const Text('Select Instrumental'),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isRecording ? null : _startRecording,
              child: const Text('Record'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isRecording ? _stopRecording : null,
              child: const Text('Stop'),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isPlaying ? null : _playRecording,
              child: const Text('Play'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isPlaying ? _stopPlayback : null,
              child: const Text('Stop Playback'),
            ),
          ],
        ),
      ),
    );
  }
} 