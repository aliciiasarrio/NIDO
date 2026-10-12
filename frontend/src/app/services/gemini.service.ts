import { Injectable, signal } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';

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
  activeModel = signal<string>(localStorage.getItem('nido_gemini_active_model') || '');

  private conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  constructor() {
    const savedKey = localStorage.getItem('nido_gemini_key');
    if (savedKey) {
      this._apiKey = savedKey.trim().replace(/^["']|["']$/g, '').trim();
      this.hasApiKey.set(!!this._apiKey);
      if (this._apiKey) {
        this.discoverModels().then(models => {
          if (models.length > 0 && !this.activeModel()) {
            this.activeModel.set(models[0]);
          }
        });
      }
    }
  }

  setApiKey(key: string) {
    this._apiKey = key.trim().replace(/^["']|["']$/g, '').trim();
    localStorage.setItem('nido_gemini_key', this._apiKey);
    this.hasApiKey.set(!!this._apiKey);
    if (this._apiKey) {
      this.discoverModels().then(models => {
        if (models.length > 0) {
          this.activeModel.set(models[0]);
          localStorage.setItem('nido_gemini_active_model', models[0]);
        }
      });
    }
  }

  getApiKey(): string {
    return this._apiKey;
  }

  async discoverModels(): Promise<string[]> {
    if (!this._apiKey) return [];
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(this._apiKey)}`,
      `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(this._apiKey)}`
    ];

    for (const ep of endpoints) {
      try {
        const resp = await fetch(ep);
        if (!resp.ok) continue;
        const data = await resp.json();
        if (data?.models && Array.isArray(data.models)) {
          const supported = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace(/^models\//, ''));
          if (supported.length > 0) {
            return supported;
          }
        }
      } catch (e) {
        console.warn('ListModels fetch failed for', ep, e);
      }
    }
    return [];
  }

  sendMessage(userMessage: string): Observable<string> {
    if (!this._apiKey) {
      return throwError(() => new Error('API_KEY_MISSING'));
    }
    return from(this.executeWithFallback(userMessage));
  }

  private async executeWithFallback(userMessage: string): Promise<string> {
    if (!this._apiKey) {
      throw new Error('API_KEY_MISSING');
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

    // 1. Compile list of models to try
    const modelsToTry: string[] = [];

    // Prioritize cached working model
    const cachedModel = localStorage.getItem('nido_gemini_active_model');
    if (cachedModel) {
      modelsToTry.push(cachedModel);
    }

    // Try dynamically discovering models available for this specific API key
    try {
      const discovered = await this.discoverModels();
      if (discovered.length > 0) {
        const prioritized = [...discovered].sort((a, b) => {
          const score = (m: string) => {
            if (m.includes('2.5-flash')) return 100;
            if (m.includes('2.0-flash')) return 90;
            if (m.includes('1.5-flash')) return 80;
            if (m.includes('flash')) return 70;
            if (m.includes('pro')) return 60;
            return 10;
          };
          return score(b) - score(a);
        });
        for (const m of prioritized) {
          if (!modelsToTry.includes(m)) {
            modelsToTry.push(m);
          }
        }
      }
    } catch (e) {
      console.warn('Model discovery failed:', e);
    }

    // Fallback list of known Gemini models
    const fallbackList = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro'
    ];
    for (const fb of fallbackList) {
      if (!modelsToTry.includes(fb)) {
        modelsToTry.push(fb);
      }
    }

    const apiVersions = ['v1beta', 'v1'];
    let lastError: any = null;

    // Try candidates in order
    for (const model of modelsToTry) {
      for (const apiVersion of apiVersions) {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${encodeURIComponent(this._apiKey)}`;

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          const data = await response.json();

          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            this.conversationHistory.push({
              role: 'model',
              parts: [{ text }]
            });
            this.activeModel.set(model);
            localStorage.setItem('nido_gemini_active_model', model);
            return text;
          }

          if (response.status === 404) {
            // Model not available on this version, try next
            lastError = data?.error || { message: `Modelo ${model} no disponible (404)` };
            continue;
          }

          // Non-404 error (e.g., 400 Invalid key, 403 Forbidden, 429 Rate limit)
          const googleMsg = data?.error?.message || response.statusText;
          this.conversationHistory.pop();
          if (response.status === 400) {
            throw new Error(`API key no válida (400): ${googleMsg}`);
          } else if (response.status === 403) {
            throw new Error(`Permiso denegado por Google AI (403): ${googleMsg}`);
          } else if (response.status === 429) {
            throw new Error(`Límite de solicitudes superado (429): ${googleMsg}`);
          } else {
            throw new Error(`Error de Google AI (${response.status}): ${googleMsg}`);
          }
        } catch (err: any) {
          if (err.message && !err.message.includes('Failed to fetch')) {
            throw err;
          }
          lastError = err;
        }
      }
    }

    this.conversationHistory.pop();
    const detail = lastError?.message || 'Ningún modelo disponible respondió';
    throw new Error(`Ningún modelo de Gemini respondió con éxito para tu clave. Detalle: ${detail}`);
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
