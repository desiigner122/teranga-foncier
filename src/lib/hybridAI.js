// src/lib/hybridAI.

/**
 * Service d'IA hybride optimisé - Gemini + ChatGPT seulement
 * Focus sur la performance et la visibilité des réponses
 */
class HybridAIService {
  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // Configuration des modèles selon leurs forces
    this.modelStrengths = {
      gemini: ['creativity', 'analysis', 'multilingual', 'technical'],
      openai: ['conversation', 'reasoning', 'general', 'professional']
    };
  }

  /**
   * Sélectionne le meilleur modèle entre Gemini et OpenAI
   */
  selectBestModel(query, context = {}) {
    const queryLower = query.toLowerCase();
    
    // Mots-clés pour chaque modèle
    const keywords = {
      openai: ['conversation', 'explication', 'aide', 'comment', 'pourquoi', 'conseil'],
      gemini: ['analyse', 'créatif', 'technique', 'recherche', 'évaluation', 'calcul']
    };

    // Score chaque modèle
    const scores = { openai: 0, gemini: 0 };
    
    Object.entries(keywords).forEach(([model, words]) => {
      words.forEach(word => {
        if (queryLower.includes(word)) {
          scores[model] += 1;
        }
      });
    });

    // Contexte spécifique à Teranga Foncier
    if (queryLower.includes('prix') || queryLower.includes('marché') || queryLower.includes('investissement')) {
      scores.gemini += 2; // Gemini pour l'analyse de marché
    }

    if (queryLower.includes('aide') || queryLower.includes('comment') || queryLower.includes('navigation')) {
      scores.openai += 2; // OpenAI pour l'assistance conversationnelle
    }

    // Retourne le modèle avec le meilleur score, Gemini par défaut
    const bestModel = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    return scores[bestModel] > 0 ? bestModel : 'gemini';
  }

  /**
   * Appel à Gemini API avec meilleur formatage
   */
  async callGemini(messages, options = {}) {
    if (!this.geminiApiKey) throw new Error('Gemini API key not configured');

    const systemPrompt = `Tu es l'assistant virtuel expert de Teranga Foncier, plateforme immobilière du Sénégal.
    
    INSTRUCTIONS IMPORTANTES :
    - Réponds de manière claire et structurée
    - Utilise des émojis pour rendre tes réponses plus visibles
    - Sois professionnel mais accessible
    - Fournis des conseils pratiques et précis
    
    Format de réponse souhaité :
    - Paragraphes bien séparés
    - Points clés en évidence
    - Suggestions d'actions concrètes`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
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
          required: ["text", "suggestions", "confidence"]
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
      const parsed = JSON.parse(aiResponseRaw);
      return {
        text: parsed.text || aiResponseRaw,
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8
      };
    } catch {
      return { 
        text: aiResponseRaw, 
        suggestions: ["Poser une autre question", "Explorer les fonctionnalités", "Obtenir plus d'aide"], 
        confidence: 0.7 
      };
    }
  }

  /**
   * Appel à OpenAI API avec meilleur formatage
   */
  async callOpenAI(messages, options = {}) {
    if (!this.openaiApiKey) throw new Error('OpenAI API key not configured');

    const systemPrompt = `Tu es l'assistant virtuel de Teranga Foncier, plateforme immobilière du Sénégal.

    DIRECTIVES DE RÉPONSE :
    - Réponds de manière claire et bien structurée 
    - Utilise des émojis pour améliorer la lisibilité
    - Sois professionnel mais chaleureux
    - Fournis des informations pratiques et actionables
    - Adapte ton ton selon le contexte (formel pour business, plus décontracté pour questions générales)
    
    STRUCTURE DE RÉPONSE :
    - Introduction claire du sujet
    - Points principaux bien organisés  
    - Conclusion avec prochaines étapes suggérées
    
    Format JSON obligatoire : {"text": "réponse complète", "suggestions": ["action1", "action2"], "confidence": 0.9}`;

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
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    
    const result = await response.json();
    
    try {
      const parsed = JSON.parse(result.choices[0].message.content);
      return {
        text: parsed.text || result.choices[0].message.content,
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8
      };
    } catch {
      return { 
        text: result.choices[0].message.content, 
        suggestions: ["Continuer la conversation", "Poser une autre question", "Explorer d'autres fonctionnalités"], 
        confidence: 0.7 
      };
    }
  }

  /**
   * Génère une réponse optimisée avec Gemini ou OpenAI
   */
  async generateHybridResponse(query, messages = [], context = {}) {
    const selectedModel = this.selectBestModel(query, context);    // Vérifier quels modèles sont disponibles
    const availableModels = [];
    if (this.openaiApiKey) availableModels.push('openai');
    if (this.geminiApiKey) availableModels.push('gemini');

    // Si le modèle sélectionné n'est pas disponible, choisir un disponible
    let modelToUse = selectedModel;
    if (!availableModels.includes(selectedModel)) {
      modelToUse = availableModels.length > 0 ? availableModels[0] : 'mock';    }

    try {
      let response;
      
      switch (modelToUse) {
        case 'openai':
          response = await this.callOpenAI([...messages, { sender: 'user', text: query }]);
          break;
        case 'gemini':
          response = await this.callGemini([...messages, { sender: 'user', text: query }]);
          break;
        case 'mock':
        default:
          response = await this.getMockResponse(query, messages, context);
          break;
      }

      // Ajouter des métadonnées sur le modèle utilisé
      response.modelUsed = modelToUse;
      response.timestamp = new Date().toISOString();
      
      return response;
    } catch (error) {      // Fallback vers l'autre modèle en cas d'erreur
      const fallbackModels = availableModels.filter(m => m !== modelToUse);
      
      for (const fallback of fallbackModels) {
        try {          let response;
          switch (fallback) {
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
        } catch (fallbackError) {          continue;
        }
      }
      
      // Si tous les modèles échouent, utiliser le mode simulation      return await this.getMockResponse(query, messages, context);
    }
  }

  /**
   * Réponse simulée intelligente pour tests et fallback
   */
  async getMockResponse(query, messages = [], context = {}) {
    // Simulation d'un délai réseau réaliste
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const queryLower = query.toLowerCase();
    
    // Réponses contextuelles selon le type de question
    const responses = {
      prix: {
        text: `💰 **ÉVALUATION DE PRIX IMMOBILIER**

📊 Selon notre analyse de marché :
• Prix moyen zone : 250,000 - 450,000 FCFA/m²
• Tendance : +5.2% sur 12 mois
• Facteurs impactants : localisation, viabilisation, proximité services

🎯 **RECOMMANDATIONS :**
✅ Vérifiez les prix comparables dans un rayon de 2km
✅ Considérez l'état de la voirie et des réseaux
✅ Évaluez le potentiel d'évolution du quartier

💡 *Cette estimation est basée sur les données de marché récentes de Teranga Foncier*`,
        suggestions: ["Voir propriétés similaires", "Calculer frais notariés", "Analyser le quartier"]
      },
      
      recherche: {
        text: `🔍 **RECHERCHE DE PROPRIÉTÉS**

🏠 Notre moteur de recherche vous offre :
• **Plus de 15,000 propriétés** référencées
• **Filtres avancés** : prix, superficie, localisation
• **Cartes interactives** avec vue satellite
• **Alertes personnalisées** selon vos critères

🎯 **POUR COMMENCER :**
1️⃣ Définissez votre budget et zone préférée
2️⃣ Utilisez les filtres pour affiner
3️⃣ Sauvegardez vos recherches favorites
4️⃣ Activez les notifications automatiques

🚀 *Trouvez le terrain idéal en quelques clics !*`,
        suggestions: ["Démarrer une recherche", "Configurer mes alertes", "Voir les zones populaires"]
      },
      
      procedure: {
        text: `📋 **PROCÉDURES ADMINISTRATIVES**

⚖️ **ÉTAPES D'ACQUISITION FONCIÈRE :**
1️⃣ **Vérification juridique** - Titre foncier, hypothèques
2️⃣ **Due diligence** - Bornage, servitudes, urbanisme  
3️⃣ **Négociation** - Prix, conditions, délais
4️⃣ **Acte authentique** - Signature chez notaire
5️⃣ **Enregistrement** - Conservation foncière

⏱️ **DÉLAIS MOYENS :** 45 à 90 jours
💰 **FRAIS ANNEXES :** 7 à 12% du prix d'achat

🔒 *Teranga Foncier vous accompagne à chaque étape*`,
        suggestions: ["Calculer les frais", "Trouver un notaire", "Vérifier un titre foncier"]
      },
      
      aide: {
        text: `🤝 **AIDE ET NAVIGATION**

🎯 **FONCTIONNALITÉS PRINCIPALES :**
• **Tableau de bord** personnalisé selon votre profil
• **Recherche avancée** avec géolocalisation
• **Comparateur de prix** en temps réel
• **Messagerie sécurisée** avec les professionnels
• **Suivi de dossiers** et notifications

📱 **ASTUCES D'UTILISATION :**
✨ Utilisez les raccourcis clavier (Ctrl+K pour recherche)
✨ Sauvegardez vos propriétés favorites
✨ Activez les notifications push
✨ Consultez l'historique des prix

🆘 *Support disponible 24h/7j via chat*`,
        suggestions: ["Visite guidée", "Raccourcis clavier", "Contacter le support"]
      },

      default: {
        text: `🌟 **ASSISTANT TERANGA FONCIER**

🏡 Je suis votre expert immobilier virtuel, spécialisé dans le marché foncier sénégalais.

💪 **MES COMPÉTENCES :**
🔍 Recherche et évaluation de propriétés
📊 Analyse de marché et tendances
⚖️ Conseils juridiques et administratifs  
💡 Stratégies d'investissement personnalisées
🗺️ Navigation et formation sur la plateforme

❓ **POSEZ-MOI VOS QUESTIONS SUR :**
• Recherche de terrains et propriétés
• Évaluation de prix et négociation
• Procédures et démarches légales
• Conseils d'investissement immobilier

🎯 *Je suis là pour vous accompagner dans vos projets !*`,
        suggestions: ["Rechercher un terrain", "Évaluer un prix", "Comprendre les procédures"]
      }
    };

    // Sélection de la meilleure réponse selon le contexte
    let selectedResponse = responses.default;
    
    if (queryLower.includes('prix') || queryLower.includes('coût') || queryLower.includes('valeur')) {
      selectedResponse = responses.prix;
    } else if (queryLower.includes('recherch') || queryLower.includes('trouv') || queryLower.includes('cherch')) {
      selectedResponse = responses.recherche;
    } else if (queryLower.includes('procédure') || queryLower.includes('démarche') || queryLower.includes('étape')) {
      selectedResponse = responses.procedure;
    } else if (queryLower.includes('aide') || queryLower.includes('comment') || queryLower.includes('navigation')) {
      selectedResponse = responses.aide;
    }

    return {
      text: selectedResponse.text,
      suggestions: selectedResponse.suggestions,
      confidence: 0.85,
      modelUsed: 'simulation-pro'
    };
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
    } catch (error) {      return {
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
