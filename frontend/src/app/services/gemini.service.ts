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
  private readonly PRIMARY_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private readonly FALLBACK_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
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
      this._apiKey = savedKey.trim().replace(/^["']|["']$/g, '').trim();
      this.hasApiKey.set(!!this._apiKey);
    }
  }

  setApiKey(key: string) {
    this._apiKey = key.trim().replace(/^["']|["']$/g, '').trim();
    localStorage.setItem('nido_gemini_key', this._apiKey);
    this.hasApiKey.set(!!this._apiKey);
  }

  getApiKey(): string {
    return this._apiKey;
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

    const callEndpoint = (apiUrl: string) => {
      const url = `${apiUrl}?key=${encodeURIComponent(this._apiKey)}`;
      return this.http.post<GeminiResponse>(url, body, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      });
    };

    return callEndpoint(this.PRIMARY_API_URL).pipe(
      catchError((primaryErr: any) => {
        // If 404 or model not found, try fallback to gemini-1.5-flash
        if (primaryErr?.status === 404) {
          console.warn('Gemini 2.0 Flash not available, trying Gemini 1.5 Flash fallback...');
          return callEndpoint(this.FALLBACK_API_URL);
        }
        return throwError(() => primaryErr);
      }),
      map(response => {
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text }]
        });
        return text;
      }),
      catchError((err: any) => {
        // Remove last user message from history on error
        this.conversationHistory.pop();
        console.error('Gemini API error details:', err);

        const googleError = err?.error?.error;
        const googleMsg: string = googleError?.message || '';

        let errorMsg = '';

        if (err.status === 0) {
          errorMsg = 'No se pudo conectar con los servidores de Google (código 0). Puede estar bloqueado por un adblocker en el navegador o un problema de red. Por favor revisa que generativelanguage.googleapis.com no esté bloqueado.';
        } else if (err.status === 400) {
          if (googleMsg.toLowerCase().includes('api key') || googleMsg.includes('INVALID_ARGUMENT')) {
            errorMsg = `API key no válida: ${googleMsg || 'Verifica que la clave copiada de Google AI Studio sea correcta.'}`;
          } else {
            errorMsg = googleMsg ? `Solicitud incorrecta: ${googleMsg}` : 'Solicitud rechazada (400) por Google AI.';
          }
        } else if (err.status === 403) {
          errorMsg = googleMsg
            ? `Permiso denegado por Google AI (403): ${googleMsg}`
            : 'Permiso denegado (403). Verifica que tu API key esté habilitada para la Generative Language API en Google AI Studio.';
        } else if (err.status === 404) {
          errorMsg = `Modelo de IA no encontrado (404): ${googleMsg || 'Los modelos probados no están disponibles en tu proyecto.'}`;
        } else if (err.status === 429) {
          errorMsg = 'Límite de solicitudes superado (429). Espera un momento antes de volver a consultar.';
        } else if (googleMsg) {
          errorMsg = `Error de Google AI (${err.status || 'desconocido'}): ${googleMsg}`;
        } else {
          errorMsg = `Error al conectar con la IA (${err.status ? 'código HTTP ' + err.status : 'revisa tu conexión y clave de API'}).`;
        }

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
