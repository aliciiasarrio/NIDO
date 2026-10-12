import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
}

const NIDO_SYSTEM_CONTEXT = `Eres NIDO Assistant, el asistente inteligente de la app NIDO, una plataforma de gestión del hogar en español.

Tu rol es ayudar a los usuarios con:
🛒 **Compras y precios**: Comparar precios, sugerir dónde comprar más barato, calcular costes.
🍽️ **Recetas**: Sugerir recetas con ingredientes disponibles, dar instrucciones paso a paso, adaptar recetas.
👗 **Moda y tendencias**: Informar sobre prendas en tendencia, combinar outfits, asesorar según temporada.
🏠 **Gestión del hogar**: Organizar despensa, recordar caducidades, gestionar inventario.
📊 **Consejos de ahorro**: Optimizar gastos del hogar, reducir desperdicios.

Responde SIEMPRE en español, de forma amigable, concisa y práctica.
Usa emojis moderadamente para hacer las respuestas más visuales.
Si el usuario pregunta sobre algo no relacionado con el hogar, redirige amablemente.`;

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private _apiKey = '';

  messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy NIDO Assistant, tu ayudante inteligente del hogar. Puedo ayudarte a:\n\n🛒 Comparar precios y ahorrar en la compra\n🍽️ Sugerirte recetas con lo que tienes\n👗 Asesorarte sobre tendencias de moda\n🏠 Gestionar mejor tu hogar\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);

  isLoading = signal<boolean>(false);
  hasApiKey = signal<boolean>(false);
  private conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  constructor(private http: HttpClient) {
    const savedKey = localStorage.getItem('nido_gemini_key');
    if (savedKey) {
      this._apiKey = savedKey;
      this.hasApiKey.set(true);
    }
  }

  setApiKey(key: string) {
    this._apiKey = key.trim();
    localStorage.setItem('nido_gemini_key', this._apiKey);
    this.hasApiKey.set(!!this._apiKey);
  }

  sendMessage(userMessage: string): Observable<string> {
    if (!this._apiKey) {
      return throwError(() => new Error('API_KEY_MISSING'));
    }

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const body = {
      system_instruction: {
        parts: [{ text: NIDO_SYSTEM_CONTEXT }]
      },
      contents: this.conversationHistory,
      generationConfig: {
        temperature: 0.75,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    const url = `${this.API_URL}?key=${this._apiKey}`;

    return this.http.post<GeminiResponse>(url, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map(response => {
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text }]
        });
        return text;
      }),
      catchError(err => {
        // Remove last user message from history on error
        this.conversationHistory.pop();
        console.error('Gemini API error:', err);
        const errorMsg = err.status === 400
          ? 'API key no válida. Introduce una key válida de Google AI Studio.'
          : err.status === 429
            ? 'Límite de solicitudes superado. Espera un momento.'
            : 'Error al conectar con la IA. Comprueba tu conexión.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  clearConversation() {
    this.conversationHistory = [];
    this.messages.set([{
      role: 'assistant',
      content: '¡Conversación reiniciada! ¿En qué puedo ayudarte? 😊',
      timestamp: new Date()
    }]);
  }
}
