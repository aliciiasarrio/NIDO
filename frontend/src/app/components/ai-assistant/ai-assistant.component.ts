import { Component, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ChatMessage } from '../../services/gemini.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Botón flotante para abrir/cerrar -->
    <button
      class="ai-fab"
      (click)="togglePanel()"
      [class.active]="isOpen()"
      title="Asistente NIDO IA"
      id="ai-assistant-fab"
    >
      <span class="fab-icon" *ngIf="!isOpen()">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M8 12h.01M12 12h.01M16 12h.01"/>
        </svg>
      </span>
      <span class="fab-icon" *ngIf="isOpen()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
      <span class="fab-label" *ngIf="!isOpen()">IA</span>
      <div class="fab-pulse" *ngIf="!isOpen()"></div>
    </button>

    <!-- Panel lateral del chat -->
    <div class="ai-panel" [class.open]="isOpen()" id="ai-panel">
      <!-- Header -->
      <div class="ai-panel-header">
        <div class="ai-header-info">
          <div class="ai-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <span class="ai-name">NIDO Assistant</span>
            <span class="ai-status">
              <span class="status-dot" [class.online]="geminiService.hasApiKey()"></span>
              {{ geminiService.hasApiKey() ? 'Activo con Gemini AI' : 'Configura tu API key' }}
            </span>
          </div>
        </div>
        <div class="ai-header-actions">
          <button class="icon-btn" (click)="toggleSettings()" title="Configuración" id="ai-settings-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button class="icon-btn" (click)="clearChat()" title="Limpiar chat" id="ai-clear-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Settings panel -->
      <div class="settings-panel" *ngIf="showSettings()" id="ai-settings-panel">
        <p class="settings-title">🔑 Configura tu API Key de Gemini</p>
        <p class="settings-desc">
          Obtén tu API key gratuita en
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>
          (Plan gratuito disponible).
        </p>
        <div class="settings-input-row">
          <input
            type="password"
            [(ngModel)]="apiKeyInput"
            placeholder="Pega tu API key aquí..."
            class="api-key-input"
            id="ai-api-key-input"
          />
          <button class="btn-save" (click)="saveApiKey()" id="ai-save-key-btn">Guardar</button>
        </div>
        <p class="settings-saved" *ngIf="keySaved()">✅ API key guardada correctamente</p>
      </div>

      <!-- Quick actions chips -->
      <div class="quick-actions" *ngIf="geminiService.messages().length <= 1">
        <p class="quick-title">Preguntas rápidas:</p>
        <div class="chips">
          <button class="chip" (click)="quickSend('¿Qué recetas puedo hacer con arroz, pollo y tomate?')">🍽️ Recetas de hoy</button>
          <button class="chip" (click)="quickSend('¿Cuáles son las prendas de moda para esta temporada otoño-invierno?')">👗 Tendencias moda</button>
          <button class="chip" (click)="quickSend('¿Cómo puedo ahorrar en la compra semanal del supermercado?')">🛒 Ahorrar en compra</button>
          <button class="chip" (click)="quickSend('Dame consejos para organizar mejor mi despensa en casa')">🏠 Organizar hogar</button>
        </div>
      </div>

      <!-- Messages area -->
      <div class="messages-area" #messagesContainer id="ai-messages-area">
        <div
          *ngFor="let msg of geminiService.messages()"
          class="message-bubble"
          [class.user-msg]="msg.role === 'user'"
          [class.assistant-msg]="msg.role === 'assistant'"
        >
          <div class="bubble-avatar" *ngIf="msg.role === 'assistant'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="bubble-content">
            <div class="bubble-text" [innerHTML]="formatMessage(msg.content)"></div>
            <div class="bubble-time">{{ msg.timestamp | date: 'HH:mm' }}</div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div class="message-bubble assistant-msg loading-msg" *ngIf="geminiService.isLoading()">
          <div class="bubble-avatar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div class="bubble-content">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="ai-input-area">
        <div class="input-wrapper" [class.disabled]="!geminiService.hasApiKey()">
          <textarea
            [(ngModel)]="userInput"
            (keydown.enter)="onEnterKey($event)"
            [placeholder]="geminiService.hasApiKey() ? 'Pregúntame algo sobre tu hogar...' : 'Configura tu API key primero ↑'"
            [disabled]="!geminiService.hasApiKey() || geminiService.isLoading()"
            rows="1"
            class="chat-input"
            id="ai-chat-input"
            #chatInput
          ></textarea>
          <button
            class="send-btn"
            (click)="sendMessage()"
            [disabled]="!userInput.trim() || !geminiService.hasApiKey() || geminiService.isLoading()"
            id="ai-send-btn"
            title="Enviar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p class="powered-by">Powered by <strong>Gemini 2.0 Flash</strong> · Google AI</p>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div class="ai-overlay" *ngIf="isOpen()" (click)="togglePanel()"></div>
  `,
  styles: [`
    /* ─── FAB Button ─── */
    .ai-fab {
      position: fixed;
      bottom: 1.75rem;
      right: 1.75rem;
      z-index: 900;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.7rem 1.1rem 0.7rem 0.85rem;
      border: none;
      border-radius: 50px;
      background: linear-gradient(135deg, #d96846 0%, #e59866 100%);
      color: white;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(217, 104, 70, 0.45);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: fixed;

      &:hover {
        transform: translateY(-3px) scale(1.04);
        box-shadow: 0 10px 30px rgba(217, 104, 70, 0.55);
      }

      &.active {
        background: linear-gradient(135deg, #555 0%, #333 100%);
        box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        padding: 0.7rem 0.9rem;
        transform: none;

        &:hover { transform: scale(1.05); }
      }
    }

    .fab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fab-label {
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.03em;
    }

    .fab-pulse {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 12px;
      height: 12px;
      background: #4caf50;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse-ring 2s ease-in-out infinite;
    }

    @keyframes pulse-ring {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }

    /* ─── Panel ─── */
    .ai-panel {
      position: fixed;
      right: -400px;
      bottom: 0;
      top: 0;
      width: 380px;
      max-width: calc(100vw - 2rem);
      background: var(--color-surface);
      box-shadow: -8px 0 40px rgba(45, 35, 20, 0.15);
      z-index: 950;
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--color-border);
      transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;

      &.open {
        right: 0;
      }
    }

    /* ─── Header ─── */
    .ai-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1rem 0.85rem;
      background: linear-gradient(135deg, #d96846 0%, #e59866 60%, #d96846 100%);
      color: white;
      flex-shrink: 0;
    }

    .ai-header-info {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .ai-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid rgba(255,255,255,0.4);
      flex-shrink: 0;
    }

    .ai-name {
      display: block;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: -0.01em;
    }

    .ai-status {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      opacity: 0.85;
      font-weight: 500;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      flex-shrink: 0;

      &.online {
        background: #4caf50;
        box-shadow: 0 0 6px rgba(76, 175, 80, 0.8);
      }
    }

    .ai-header-actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--radius-md);
      background: rgba(255,255,255,0.18);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;

      &:hover { background: rgba(255,255,255,0.3); }
    }

    /* ─── Settings panel ─── */
    .settings-panel {
      padding: 0.85rem 1rem;
      background: #fffbf8;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .settings-title {
      font-weight: 700;
      font-size: 0.88rem;
      margin-bottom: 0.35rem;
      color: var(--color-text-main);
    }

    .settings-desc {
      font-size: 0.78rem;
      color: var(--color-text-muted);
      margin-bottom: 0.65rem;
      line-height: 1.5;

      a {
        color: var(--color-primary);
        font-weight: 600;
        text-decoration: none;

        &:hover { text-decoration: underline; }
      }
    }

    .settings-input-row {
      display: flex;
      gap: 0.5rem;
    }

    .api-key-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.82rem;
      font-family: var(--font-body);
      background: white;
      color: var(--color-text-main);
      transition: border-color 0.15s;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
      }
    }

    .btn-save {
      padding: 0.5rem 0.85rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;

      &:hover { background: var(--color-primary-hover); }
    }

    .settings-saved {
      margin-top: 0.45rem;
      font-size: 0.78rem;
      color: var(--color-success);
      font-weight: 600;
    }

    /* ─── Quick actions ─── */
    .quick-actions {
      padding: 0.75rem 1rem 0.5rem;
      flex-shrink: 0;
      background: #fffaf7;
      border-bottom: 1px solid var(--color-border-light);
    }

    .quick-title {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--color-text-light);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.5rem;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .chip {
      padding: 0.35rem 0.7rem;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-pill);
      background: white;
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all 0.15s;
      font-family: var(--font-body);

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: var(--color-primary-light);
      }
    }

    /* ─── Messages area ─── */
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      scroll-behavior: smooth;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    }

    .message-bubble {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      animation: fadeInUp 0.25s ease;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-msg {
      flex-direction: row-reverse;
    }

    .bubble-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d96846, #e59866);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bubble-content {
      max-width: 80%;
    }

    .bubble-text {
      padding: 0.65rem 0.85rem;
      border-radius: 16px;
      font-size: 0.855rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .assistant-msg .bubble-text {
      background: var(--color-sand);
      color: var(--color-text-main);
      border-bottom-left-radius: 4px;
    }

    .user-msg .bubble-text {
      background: linear-gradient(135deg, #d96846, #c45736);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bubble-time {
      font-size: 0.68rem;
      color: var(--color-text-light);
      margin-top: 0.25rem;
      padding: 0 0.25rem;
    }

    .user-msg .bubble-time {
      text-align: right;
    }

    /* ─── Typing dots ─── */
    .typing-dots {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0.75rem 1rem;
      background: var(--color-sand);
      border-radius: 16px;
      border-bottom-left-radius: 4px;

      span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--color-text-light);
        animation: typing-bounce 1.2s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes typing-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
      40% { transform: translateY(-6px); opacity: 1; }
    }

    /* ─── Input area ─── */
    .ai-input-area {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--color-border);
      background: white;
      flex-shrink: 0;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      background: var(--color-sand);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 0.5rem 0.5rem 0.5rem 0.85rem;
      transition: border-color 0.15s;

      &:focus-within { border-color: var(--color-primary); }

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .chat-input {
      flex: 1;
      border: none;
      background: transparent;
      resize: none;
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--color-text-main);
      line-height: 1.5;
      max-height: 120px;
      overflow-y: auto;

      &:focus { outline: none; }
      &::placeholder { color: var(--color-text-light); }
      &:disabled { cursor: not-allowed; }
    }

    .send-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #d96846, #c45736);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        transform: scale(1.08);
        box-shadow: 0 3px 12px rgba(217, 104, 70, 0.4);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }
    }

    .powered-by {
      text-align: center;
      font-size: 0.7rem;
      color: var(--color-text-light);
      margin-top: 0.5rem;

      strong { color: var(--color-text-muted); }
    }

    /* ─── Overlay (mobile) ─── */
    .ai-overlay {
      position: fixed;
      inset: 0;
      background: rgba(35, 34, 32, 0.4);
      z-index: 940;
      backdrop-filter: blur(2px);

      @media (min-width: 900px) { display: none; }
    }
  `]
})
export class AiAssistantComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  isOpen = signal<boolean>(false);
  showSettings = signal<boolean>(false);
  keySaved = signal<boolean>(false);
  userInput = '';
  apiKeyInput = '';
  private shouldScrollToBottom = false;

  constructor(public geminiService: GeminiService) {}

  ngOnInit() {
    // Show settings if no API key configured
    if (!this.geminiService.hasApiKey()) {
      // Will be shown once panel opens
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  togglePanel() {
    this.isOpen.update(v => !v);
    if (this.isOpen() && !this.geminiService.hasApiKey()) {
      this.showSettings.set(true);
    }
    if (this.isOpen()) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  toggleSettings() {
    this.showSettings.update(v => !v);
    this.keySaved.set(false);
  }

  saveApiKey() {
    if (!this.apiKeyInput.trim()) return;
    this.geminiService.setApiKey(this.apiKeyInput.trim());
    this.keySaved.set(true);
    this.apiKeyInput = '';
    setTimeout(() => {
      this.keySaved.set(false);
      this.showSettings.set(false);
    }, 2000);
  }

  quickSend(text: string) {
    this.userInput = text;
    this.sendMessage();
  }

  onEnterKey(event: Event) {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || !this.geminiService.hasApiKey() || this.geminiService.isLoading()) return;

    this.userInput = '';

    // Add user message
    const currentMessages = this.geminiService.messages();
    this.geminiService.messages.set([
      ...currentMessages,
      { role: 'user', content: text, timestamp: new Date() }
    ]);

    this.geminiService.isLoading.set(true);
    this.shouldScrollToBottom = true;

    this.geminiService.sendMessage(text).subscribe({
      next: (response) => {
        this.geminiService.isLoading.set(false);
        this.geminiService.messages.set([
          ...this.geminiService.messages(),
          { role: 'assistant', content: response, timestamp: new Date() }
        ]);
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        this.geminiService.isLoading.set(false);
        const errorMessage = err.message === 'API_KEY_MISSING'
          ? 'Por favor configura tu API key de Gemini para usar el asistente. Pulsa el ⚙️ de arriba.'
          : err.message || 'Ha ocurrido un error. Inténtalo de nuevo.';

        this.geminiService.messages.set([
          ...this.geminiService.messages(),
          { role: 'assistant', content: `❌ ${errorMessage}`, timestamp: new Date() }
        ]);
        this.shouldScrollToBottom = true;
      }
    });
  }

  clearChat() {
    this.geminiService.clearConversation();
  }

  formatMessage(content: string): string {
    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (_) {}
  }
}
