//speech uitility
export class SpeechManager {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isRecording = false;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  startRecording(onResult, onError) {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    this.isRecording = true;
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      onResult(transcript, confidence);
    };

    this.recognition.onerror = (event) => {
      this.isRecording = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
    };

    this.recognition.start();
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  speak(text, options = {}) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    utterance.lang = options.lang || 'en-US';

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// utils/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const interviewAPI = {
  createSession: async (resumeText) => {
    return apiClient.post('/ai/create-session', { resume: resumeText });
  },

  continueInterview: async (sessionId, userAnswer) => {
    return apiClient.post('/ai/continue', { sessionId, userAnswer });
  },

  endInterview: async (sessionId) => {
    return apiClient.post('/ai/end', { sessionId });
  },

  getSessionStatus: async (sessionId) => {
    return apiClient.get(`/ai/session/${sessionId}`);
  },
};

// utils/timer.js
export class Timer {
  constructor(initialTime, onTick, onComplete) {
    this.initialTime = initialTime;
    this.timeLeft = initialTime;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.intervalId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.onTick(this.timeLeft);

      if (this.timeLeft <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.timeLeft = this.initialTime;
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  getFormattedTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  addTime(seconds) {
    this.timeLeft += seconds;
    this.onTick(this.timeLeft);
  }
}

// utils/storage.js
export class SessionStorage {
  constructor() {
    this.isSupported = typeof Storage !== 'undefined';
  }

  set(key, value) {
    if (!this.isSupported) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  get(key) {
    if (!this.isSupported) return null;
    
    try {
      const serializedValue = sessionStorage.getItem(key);
      return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  remove(key) {
    if (!this.isSupported) return false;
    
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  clear() {
    if (!this.isSupported) return false;
    
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
}

// utils/validation.js
export const validateResume = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return errors;
  }

  if (file.type !== 'application/pdf') {
    errors.push('File must be a PDF');
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    errors.push('File size must be less than 5MB');
  }

  return errors;
};

export const validateAnswer = (answer) => {
  const errors = [];

  if (!answer || !answer.trim()) {
    errors.push('Answer cannot be empty');
    return errors;
  }

  if (answer.trim().length < 10) {
    errors.push('Answer is too short. Please provide a more detailed response.');
  }

  if (answer.trim().length > 1000) {
    errors.push('Answer is too long. Please keep it concise.');
  }

  return errors;
};

// utils/analytics.js
export class InterviewAnalytics {
  constructor() {
    this.events = [];
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = Date.now();
    this.trackEvent('interview_started');
  }

  end() {
    this.endTime = Date.now();
    this.trackEvent('interview_ended');
  }

  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      data,
    };
    this.events.push(event);
    console.log('Analytics Event:', event);
  }

  getDuration() {
    if (!this.startTime || !this.endTime) return 0;
    return Math.floor((this.endTime - this.startTime) / 1000);
  }

  getEventCount(eventName) {
    return this.events.filter(event => event.name === eventName).length;
  }

  getReport() {
    return {
      duration: this.getDuration(),
      totalEvents: this.events.length,
      events: this.events,
      questionsAnswered: this.getEventCount('question_answered'),
      recordingAttempts: this.getEventCount('recording_started'),
    };
  }
}

// utils/notifications.js
export class NotificationManager {
  constructor() {
    this.permission = null;
    this.checkPermission();
  }

  async checkPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  show(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  showTimeWarning(timeLeft) {
    if (timeLeft === 60) {
      this.show('Interview Timer', {
        body: '1 minute remaining!',
        icon: '⏰',
      });
    } else if (timeLeft === 30) {
      this.show('Interview Timer', {
        body: '30 seconds remaining!',
        icon: '⚠️',
      });
    }
  }
}

// utils/errorHandler.js
export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Global Error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection');
    });
  }

  handleError(error, context = 'Unknown') {
    const errorInfo = {
      message: error.message || 'Unknown error',
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };

    this.errors.push(errorInfo);
    console.error('Error handled:', errorInfo);

    // Send to analytics or logging service
    this.logError(errorInfo);

    return errorInfo;
  }

  logError(errorInfo) {
    // In production, send to logging service
    console.log('Logging error:', errorInfo);
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Export all utilities
export {
  SpeechManager,
  Timer,
  SessionStorage,
  InterviewAnalytics,
  NotificationManager,
  ErrorHandler,
};