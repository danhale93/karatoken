import 'package:flutter_sound/flutter_sound.dart';
import 'package:just_audio/just_audio.dart';
import 'dart:io';

class RecordingService {
  final FlutterSoundRecorder _recorder = FlutterSoundRecorder();
  final AudioPlayer _instrumentalPlayer = AudioPlayer();
  final AudioPlayer _vocalPlayer = AudioPlayer();
  String? _recordedPath;

  Future<void> startRecording(String savePath) async {
    await _recorder.openRecorder();
    await _recorder.startRecorder(toFile: savePath, codec: Codec.aacMP4);
    _recordedPath = savePath;
  }

  Future<void> stopRecording() async {
    await _recorder.stopRecorder();
    await _recorder.closeRecorder();
  }

  Future<void> playInstrumental(String instrumentalPath) async {
    await _instrumentalPlayer.setFilePath(instrumentalPath);
    await _instrumentalPlayer.play();
  }

  Future<void> playRecording({String? vocalPath, String? instrumentalPath}) async {
    if (instrumentalPath != null) {
      await _instrumentalPlayer.setFilePath(instrumentalPath);
      await _instrumentalPlayer.play();
    }
    if (vocalPath != null) {
      await _vocalPlayer.setFilePath(vocalPath);
      await _vocalPlayer.play();
    }
  }

  Future<void> stopPlayback() async {
    await _instrumentalPlayer.stop();
    await _vocalPlayer.stop();
  }

  String? get recordedPath => _recordedPath;
} 