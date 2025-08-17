// src/lib/openai.js
/**
 * Service OpenAI pour Teranga Foncier
 */
class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateResponse(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = options.systemPrompt || `Tu es l'assistant virtuel de Teranga Foncier, une plateforme immobilière au Sénégal. 
    Réponds de manière professionnelle et concise. Propose des suggestions pertinentes.
    Format de réponse: JSON avec {text: "réponse", suggestions: ["suggestion1", "suggestion2"], confidence: 0.8}`;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        response_format: { type: "json_object" },
        max_tokens: options.maxTokens || 800,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    
    try {
      return JSON.parse(result.choices[0].message.content);
    } catch {
      return { 
        text: result.choices[0].message.content, 
        suggestions: [], 
        confidence: 0.6 
      };
    }
  }
}

export const openAIService = new OpenAIService();
export default openAIService;
