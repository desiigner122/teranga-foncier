// src/lib/hybridAI.js
import { openAIService } from './openai';

/**
 * Service d'IA hybride qui combine plusieurs modèles d'IA pour des réponses optimales
 * Utilise Claude, ChatGPT et Gemini selon le contexte et la complexité de la question
 */
class HybridAIService {
  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    
    // Configuration des modèles selon leurs forces
    this.modelStrengths = {
      gemini: ['creativity', 'multilingual', 'code', 'analysis'],
      openai: ['conversation', 'reasoning', 'general', 'summary'],
      claude: ['safety', 'ethics', 'legal', 'detailed_analysis']
    };
  }

  /**
   * Détermine le meilleur modèle selon le contexte
   */
  selectBestModel(query, context = {}) {
    const queryLower = query.toLowerCase();
    
    // Mots-clés pour chaque modèle
    const keywords = {
      claude: ['légal', 'juridique', 'conformité', 'éthique', 'sécurité', 'analyse détaillée'],
      openai: ['conversation', 'résumé', 'explication', 'général', 'aide'],
      gemini: ['créatif', 'code', 'technique', 'analyse', 'multilingue']
    };

    // Score chaque modèle
    const scores = { claude: 0, openai: 0, gemini: 0 };
    
    Object.entries(keywords).forEach(([model, words]) => {
      words.forEach(word => {
        if (queryLower.includes(word)) {
          scores[model] += 1;
        }
      });
    });

    // Contexte spécifique à Teranga Foncier
    if (queryLower.includes('foncier') || queryLower.includes('terrain') || queryLower.includes('propriété')) {
      scores.claude += 2; // Claude pour les questions légales foncières
    }

    if (queryLower.includes('prix') || queryLower.includes('marché') || queryLower.includes('investissement')) {
      scores.openai += 2; // OpenAI pour l'analyse de marché
    }

    if (queryLower.includes('recherche') || queryLower.includes('suggestion') || queryLower.includes('recommandation')) {
      scores.gemini += 2; // Gemini pour les recherches et suggestions
    }

    // Retourne le modèle avec le meilleur score, OpenAI par défaut
    const bestModel = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    return scores[bestModel] > 0 ? bestModel : 'openai';
  }

  /**
   * Appel à Gemini API
   */
  async callGemini(messages, options = {}) {
    if (!this.geminiApiKey) throw new Error('Gemini API key not configured');

    const payload = {
      contents: messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            text: { type: "STRING" },
            suggestions: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            confidence: { type: "NUMBER" }
          },
          required: ["text", "suggestions"]
        }
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    
    const result = await response.json();
    const aiResponseRaw = result.candidates[0].content.parts[0].text;
    
    try {
      return JSON.parse(aiResponseRaw);
    } catch {
      return { text: aiResponseRaw, suggestions: [], confidence: 0.5 };
    }
  }

  /**
   * Appel à OpenAI API
   */
  async callOpenAI(messages, options = {}) {
    if (!this.openaiApiKey) throw new Error('OpenAI API key not configured');

    const systemPrompt = `Tu es l'assistant virtuel de Teranga Foncier, une plateforme immobilière au Sénégal. 
    Réponds de manière professionnelle et concise. Propose des suggestions pertinentes.
    Format de réponse: JSON avec {text: "réponse", suggestions: ["suggestion1", "suggestion2"], confidence: 0.8}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    
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

  /**
   * Appel à Claude API
   */
  async callClaude(messages, options = {}) {
    if (!this.claudeApiKey) throw new Error('Claude API key not configured');

    const systemPrompt = `Tu es l'assistant virtuel expert de Teranga Foncier, spécialisé dans l'immobilier foncier au Sénégal. 
    Tu excelles dans les questions légales, de conformité et d'analyse détaillée.
    Réponds de manière précise et professionnelle.
    Format de réponse: JSON avec {text: "réponse détaillée", suggestions: ["suggestion1", "suggestion2"], confidence: 0.9}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.claudeApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      })
    });

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
    
    const result = await response.json();
    
    try {
      return JSON.parse(result.content[0].text);
    } catch {
      return { 
        text: result.content[0].text, 
        suggestions: [], 
        confidence: 0.8 
      };
    }
  }

  /**
   * Génère une réponse hybride en utilisant le meilleur modèle
   */
  async generateHybridResponse(query, messages = [], context = {}) {
    const selectedModel = this.selectBestModel(query, context);
    
    console.log(`🤖 Modèle sélectionné: ${selectedModel.toUpperCase()} pour: "${query.substring(0, 50)}..."`);

    try {
      let response;
      
      switch (selectedModel) {
        case 'claude':
          response = await this.callClaude([...messages, { sender: 'user', text: query }]);
          break;
        case 'openai':
          response = await this.callOpenAI([...messages, { sender: 'user', text: query }]);
          break;
        case 'gemini':
        default:
          response = await this.callGemini([...messages, { sender: 'user', text: query }]);
          break;
      }

      // Ajouter des métadonnées sur le modèle utilisé
      response.modelUsed = selectedModel;
      response.timestamp = new Date().toISOString();
      
      return response;
    } catch (error) {
      console.error(`Erreur avec ${selectedModel}:`, error);
      
      // Fallback vers un autre modèle en cas d'erreur
      const fallbackModels = ['gemini', 'openai', 'claude'].filter(m => m !== selectedModel);
      
      for (const fallback of fallbackModels) {
        try {
          console.log(`🔄 Tentative de fallback vers ${fallback.toUpperCase()}`);
          
          let response;
          switch (fallback) {
            case 'claude':
              response = await this.callClaude([...messages, { sender: 'user', text: query }]);
              break;
            case 'openai':
              response = await this.callOpenAI([...messages, { sender: 'user', text: query }]);
              break;
            case 'gemini':
              response = await this.callGemini([...messages, { sender: 'user', text: query }]);
              break;
          }
          
          response.modelUsed = fallback;
          response.fallback = true;
          response.originalModel = selectedModel;
          
          return response;
        } catch (fallbackError) {
          console.error(`Erreur avec fallback ${fallback}:`, fallbackError);
          continue;
        }
      }
      
      // Si tous les modèles échouent
      throw new Error('Tous les modèles d\'IA sont indisponibles');
    }
  }

  /**
   * Validation et amélioration de la réponse
   */
  validateAndEnhanceResponse(response, context = {}) {
    // Validation de base
    if (!response.text || response.text.length < 10) {
      response.text = "Je n'ai pas pu générer une réponse complète. Pouvez-vous reformuler votre question ?";
    }

    // Ajouter des suggestions par défaut si manquantes
    if (!response.suggestions || response.suggestions.length === 0) {
      response.suggestions = [
        "Comment puis-je vous aider d'autre ?",
        "Avez-vous d'autres questions ?",
        "Voulez-vous explorer d'autres fonctionnalités ?"
      ];
    }

    // Limitation à 3 suggestions maximum
    if (response.suggestions.length > 3) {
      response.suggestions = response.suggestions.slice(0, 3);
    }

    // Ajouter un score de confiance par défaut
    if (!response.confidence) {
      response.confidence = 0.7;
    }

    return response;
  }

  /**
   * Interface principale pour générer une réponse
   */
  async generateResponse(query, messages = [], context = {}) {
    try {
      const response = await this.generateHybridResponse(query, messages, context);
      return this.validateAndEnhanceResponse(response, context);
    } catch (error) {
      console.error('Erreur du service IA hybride:', error);
      
      return {
        text: `Désolé, je rencontre des difficultés techniques. ${error.message}. Veuillez réessayer dans quelques instants.`,
        suggestions: [
          "Réessayer",
          "Contacter le support",
          "Voir les FAQ"
        ],
        confidence: 0.1,
        error: true
      };
    }
  }
}

export const hybridAI = new HybridAIService();
export default hybridAI;
