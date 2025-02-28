import { GameMessage } from '../types';

export interface IdleServiceConfig {
  timeout: number;
  storageKey: string;
}

export interface MessageHandler {
  addMessage: (text: string, type: GameMessage['type']) => void;
}

export class IdleService {
  private lastActivityTime: number;
  private timeout: number;
  private storageKey: string;
  private messageHandler: MessageHandler;
  private idleTimeout?: NodeJS.Timeout;
  private hasShownInitialHelp: boolean = false;

  private readonly idleMessages = [
    "The world continues without you...",
    "Time flows ever onward...",
    "The torches continue to flicker in the silence...",
    "The air grows still in your absence...",
    "The shadows seem to watch and wait..."
  ];

  constructor(config: IdleServiceConfig, messageHandler: MessageHandler) {
    this.lastActivityTime = Date.now();
    this.timeout = config.timeout;
    this.storageKey = config.storageKey;
    this.messageHandler = messageHandler;
  }

  public updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  public startMonitoring(): () => void {
    const handleActivity = () => this.updateActivity();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    this.checkIdleState();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      this.stopIdleCheck();
    };
  }

  public showInitialHelpIfNeeded(): void {
    const hasShownReminder = localStorage.getItem(this.storageKey);
    if (!hasShownReminder && !this.hasShownInitialHelp) {
      this.messageHandler.addMessage(
        "Welcome! Remember: The world doesn't wait for you—events happen over time, " +
        "and the environment may change even when you're idle.",
        'system'
      );
      this.hasShownInitialHelp = true;
      localStorage.setItem(this.storageKey, 'true');
    }
  }

  private showIdleMessage(): void {
    const message = this.idleMessages[Math.floor(Math.random() * this.idleMessages.length)];
    this.messageHandler.addMessage(message, 'environment');
  }

  private checkIdleState(): void {
    this.stopIdleCheck();
    
    this.idleTimeout = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivityTime;
      if (timeSinceLastActivity >= this.timeout) {
        this.showIdleMessage();
      }
    }, this.timeout);
  }

  private stopIdleCheck(): void {
    if (this.idleTimeout) {
      clearInterval(this.idleTimeout);
    }
  }
}
