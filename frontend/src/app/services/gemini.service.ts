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

function isNonTextModel(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes('tts') ||
    lower.includes('audio') ||
    lower.includes('embed') ||
    lower.includes('imagen') ||
    lower.includes('realtime') ||
    lower.includes('whisper') ||
    lower.includes('moderation') ||
    lower.includes('aqa') ||
    lower.includes('medlm')
  );
}

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
  activeModel = signal<string>(this.getCleanCachedModel());

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

  private getCleanCachedModel(): string {
    const cached = localStorage.getItem('nido_gemini_active_model');
    if (cached && !isNonTextModel(cached)) {
      return cached;
    }
    localStorage.removeItem('nido_gemini_active_model');
    return '';
  }

  setApiKey(key: string) {
    this._apiKey = key.trim().replace(/^["']|["']$/g, '').trim();
    localStorage.setItem('nido_gemini_key', this._apiKey);
    this.hasApiKey.set(!!this._apiKey);
    localStorage.removeItem('nido_gemini_active_model');
    this.activeModel.set('');
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
            .filter((m: any) =>
              m.supportedGenerationMethods?.includes('generateContent') &&
              !isNonTextModel(m.name)
            )
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

    // Prioritize clean cached working model
    const cachedModel = this.getCleanCachedModel();
    if (cachedModel) {
      modelsToTry.push(cachedModel);
    }

    // Try dynamically discovering models available for this specific API key
    try {
      const discovered = await this.discoverModels();
      if (discovered.length > 0) {
        const prioritized = [...discovered].sort((a, b) => {
          const score = (m: string) => {
            const lower = m.toLowerCase();
            if (lower === 'gemini-2.0-flash' || lower === 'gemini-2.0-flash-001') return 100;
            if (lower === 'gemini-2.5-flash') return 95;
            if (lower.includes('gemini-2.0-flash')) return 90;
            if (lower.includes('gemini-2.5-flash')) return 85;
            if (lower === 'gemini-1.5-flash' || lower === 'gemini-1.5-flash-latest' || lower === 'gemini-1.5-flash-001') return 80;
            if (lower.includes('gemini-1.5-flash')) return 75;
            if (lower.includes('flash')) return 70;
            if (lower.includes('pro')) return 60;
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

    // Fallback list of known text-compatible Gemini models
    const fallbackList = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
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

          const googleMsg = data?.error?.message || response.statusText || '';

          // 404: model not found in this endpoint version
          if (response.status === 404) {
            lastError = data?.error || { message: `Modelo ${model} no disponible (404)` };
            continue;
          }

          // Check if 400 is an authentic invalid API key error vs a model capability error (e.g. modalities)
          const isKeyError = response.status === 400 && (
            googleMsg.toLowerCase().includes('api key not valid') ||
            googleMsg.toLowerCase().includes('pass a valid api key') ||
            data?.error?.details?.some((d: any) => d.reason === 'API_KEY_INVALID')
          );

          if (isKeyError) {
            this.conversationHistory.pop();
            throw new Error(`API key no válida: ${googleMsg}`);
          }

          if (response.status === 403 && (
            googleMsg.toLowerCase().includes('permission') ||
            googleMsg.toLowerCase().includes('unregistered') ||
            googleMsg.toLowerCase().includes('identity')
          )) {
            this.conversationHistory.pop();
            throw new Error(`Permiso denegado por Google AI (403): ${googleMsg}`);
          }

          if (response.status === 429) {
            this.conversationHistory.pop();
            throw new Error(`Límite de solicitudes superado (429): ${googleMsg}`);
          }

          // If the model gave a 400 about modalities (e.g. AUDIO only) or capability, skip to next model!
          console.warn(`Model ${model} (${apiVersion}) failed with ${response.status}: ${googleMsg}. Trying next model...`);
          lastError = data?.error || { message: googleMsg };
          continue;

        } catch (err: any) {
          if (err.message && !err.message.includes('Failed to fetch')) {
            throw err;
          }
          lastError = err;
        }
      }
    }

    this.conversationHistory.pop();
    const detail = lastError?.message || 'Ningún modelo de texto disponible respondió';
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
