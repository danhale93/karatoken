/**
 * 🚀 Karatoken Development Utilities
 * Super-powered debugging and performance tools
 */

// 🎯 Performance Monitor
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static start(label: string) {
    this.timers.set(label, Date.now());
    console.log(`⏱️ [${label}] Started`);
  }

  static end(label: string) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(`✅ [${label}] Completed in ${duration}ms`);
      this.timers.delete(label);
      return duration;
    }
    console.warn(`⚠️ No timer found for: ${label}`);
    return 0;
  }
}

// 🔍 Enhanced Logger
export class Logger {
  static debug(message: string, data?: any) {
    if (__DEV__) {
      console.log(`🐛 [DEBUG] ${message}`, data || '');
    }
  }

  static info(message: string, data?: any) {
    console.log(`ℹ️ [INFO] ${message}`, data || '');
  }

  static warn(message: string, data?: any) {
    console.warn(`⚠️ [WARN] ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`❌ [ERROR] ${message}`, error || '');
  }

  static success(message: string, data?: any) {
    console.log(`✅ [SUCCESS] ${message}`, data || '');
  }

  static karatoken(message: string, data?: any) {
    console.log(`🎤 [KARATOKEN] ${message}`, data || '');
  }
}

// 🎵 Audio Debug Helper
export class AudioDebugger {
  static logAudioState(state: any) {
    Logger.debug('Audio State', {
      isPlaying: state.isPlaying,
      position: state.position,
      duration: state.duration,
      volume: state.volume,
    });
  }

  static logPitchData(pitch: number, target: number) {
    const accuracy = Math.abs(pitch - target);
    const emoji = accuracy < 10 ? '🎯' : accuracy < 50 ? '📏' : '🎲';
    Logger.debug(`${emoji} Pitch: ${pitch.toFixed(1)}Hz (Target: ${target.toFixed(1)}Hz)`);
  }
}

// 🌐 Network Monitor
export class NetworkMonitor {
  static async logAPICall(url: string, method: string, data?: any) {
    Logger.info(`🌐 API Call: ${method} ${url}`, data);
    const startTime = Date.now();
    
    return {
      logResponse: (response: any, status: number) => {
        const duration = Date.now() - startTime;
        const emoji = status < 300 ? '✅' : status < 500 ? '⚠️' : '❌';
        Logger.info(`${emoji} API Response: ${status} (${duration}ms)`, response);
      },
      logError: (error: any) => {
        const duration = Date.now() - startTime;
        Logger.error(`❌ API Error after ${duration}ms`, error);
      }
    };
  }
}

// 🎮 User Action Tracker
export class ActionTracker {
  static track(action: string, data?: any) {
    Logger.karatoken(`User Action: ${action}`, data);
    
    // In production, you could send to analytics
    if (!__DEV__) {
      // analytics.track(action, data);
    }
  }
}

// 🔧 Development Helper
export class DevHelper {
  static showDevMenu() {
    if (__DEV__) {
      // You can add more dev tools here
      Logger.info('🛠️ Development menu activated');
    }
  }

  static async simulateDelay(ms: number, label?: string) {
    if (label) Logger.debug(`⏳ Simulating ${ms}ms delay: ${label}`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static mockAPIResponse<T>(data: T, delay: number = 1000): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        Logger.debug('🎭 Mock API Response', data);
        resolve(data);
      }, delay);
    });
  }
}

// 🎨 UI Debug Helper
export class UIDebugger {
  static highlightComponent(componentName: string) {
    if (__DEV__) {
      Logger.debug(`🎨 Rendering: ${componentName}`);
    }
  }

  static logDimensions(width: number, height: number, component?: string) {
    Logger.debug(`📐 Dimensions${component ? ` (${component})` : ''}: ${width}x${height}`);
  }
}

// 🎯 Quick Debug Macros
export const DEBUG = {
  time: PerformanceMonitor,
  log: Logger,
  audio: AudioDebugger,
  network: NetworkMonitor,
  track: ActionTracker,
  dev: DevHelper,
  ui: UIDebugger,
};

// Global debug helper (use in console)
if (__DEV__) {
  (global as any).DEBUG = DEBUG;
  Logger.success('🚀 Debug utilities loaded! Use DEBUG.log.info("Hello World!")');
}

export default DEBUG;