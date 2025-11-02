export interface SessionOptions {
  type: 'Meditation' | 'Stretching' | 'Breathing';
  focus: 'Stress Relief' | 'Focus' | 'Energy Boost' | 'Sleep';
  duration: 5 | 10 | 15 | 30 | 45 | 60;
}

export interface SessionData {
  title: string;
  script: string;
  imageUrl: string;
  audioUrl: string;
}

export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}