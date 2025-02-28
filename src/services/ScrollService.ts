export class ScrollService {
  private isAutoScrollEnabled: boolean = true;
  private messagesEndRef: React.RefObject<HTMLDivElement>;
  private messageContainerRef: React.RefObject<HTMLDivElement>;

  constructor(
    messagesEndRef: React.RefObject<HTMLDivElement>,
    messageContainerRef: React.RefObject<HTMLDivElement>
  ) {
    this.messagesEndRef = messagesEndRef;
    this.messageContainerRef = messageContainerRef;
  }

  public scrollToBottom(): void {
    if (this.isAutoScrollEnabled && this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  public handleScroll(): void {
    if (!this.messageContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = this.messageContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    this.isAutoScrollEnabled = isAtBottom;
  }

  public getAutoScrollEnabled(): boolean {
    return this.isAutoScrollEnabled;
  }
}
