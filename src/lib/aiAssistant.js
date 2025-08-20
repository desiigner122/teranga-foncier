import { supabase } from './supabaseClient';

import { supabase } from '../lib/supabaseClient';
class AIAssistantService {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.openai.com/v1';
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.model = 'gpt-4';
  }

  // Service IA pour traitement du langage naturel
  async processCommand(command, context = {}) {
    try {
      const response = await this.callAIAPI({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant IA pour la plateforme Teranga Foncier. 
            Tu dois interpréter les commandes en français et retourner des actions structurées.
            
            Contexte disponible: ${JSON.stringify(context)}
            
            Types d'actions possibles:
            - DELETE_USER: Supprimer un utilisateur
            - UPDATE_PARCEL: Modifier une parcelle
            - CREATE_TRANSACTION: Créer une transaction
            - SEARCH_DATA: Rechercher des données
            - GENERATE_REPORT: Générer un rapport
            - SEND_NOTIFICATION: Envoyer une notification
            - VALIDATE_DOCUMENT: Valider un document
            - PREDICT_PRICE: Prédire un prix
            - SCHEDULE_MEETING: Programmer un rendez-vous
            - ANALYZE_MARKET: Analyser le marché
            
            Réponds UNIQUEMENT en JSON avec cette structure:
            {
              "action": "ACTION_TYPE",
              "parameters": {...},
              "confidence": 0.95,
              "explanation": "Explication de l'action"
            }`
          },
          {
            role: 'user',
            content: command
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {      return {
        action: 'ERROR',
        parameters: {},
        confidence: 0,
        explanation: 'Impossible de traiter la commande'
      };
    }
  }

  // Exécution des actions IA
  async executeAction(actionData, userRole) {
    const { action, parameters } = actionData;

    try {
      switch (action) {
        case 'DELETE_USER':
          return await this.deleteUser(parameters, userRole);
        
        case 'UPDATE_PARCEL':
          return await this.updateParcel(parameters, userRole);
        
        case 'CREATE_TRANSACTION':
          return await this.createTransaction(parameters, userRole);
        
        case 'SEARCH_DATA':
          return await this.searchData(parameters, userRole);
        
        case 'GENERATE_REPORT':
          return await this.generateReport(parameters, userRole);
        
        case 'SEND_NOTIFICATION':
          return await this.sendNotification(parameters, userRole);
        
        case 'VALIDATE_DOCUMENT':
          return await this.validateDocument(parameters, userRole);
        
        case 'PREDICT_PRICE':
          return await this.predictPrice(parameters, userRole);
        
        case 'SCHEDULE_MEETING':
          return await this.scheduleMeeting(parameters, userRole);
        
        case 'ANALYZE_MARKET':
          return await this.analyzeMarket(parameters, userRole);
        
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
    } catch (error) {      throw error;
    }
  }

  // Actions spécifiques avec données réelles
  async deleteUser(parameters, userRole) {
    if (userRole !== 'admin') {
      throw new Error('Permission insuffisante pour supprimer un utilisateur');
    }

    const { userId, email, name } = parameters;
    
    // Vérification de sécurité
    if (!userId && !email) {
      throw new Error('ID utilisateur ou email requis');
    }

    let userToDelete;
    
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      userToDelete = data;
    } else if (email) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      userToDelete = data;
    }

    if (!userToDelete) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérification supplémentaire si un nom est fourni
    if (name && !userToDelete.full_name.toLowerCase().includes(name.toLowerCase())) {
      throw new Error('Le nom ne correspond pas à l\'utilisateur trouvé');
    }

    // Suppression de l'utilisateur
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userToDelete.id);

    if (deleteError) throw deleteError;

    // Log de l'action
    await this.logAction('DELETE_USER', {
      deletedUser: userToDelete,
      executedBy: userRole
    });

    return {
      success: true,
      message: `Utilisateur ${userToDelete.full_name} (${userToDelete.email}) supprimé avec succès`,
      deletedUser: userToDelete
    };
  }

  async updateParcel(parameters, userRole) {
    const { parcelId, updates } = parameters;
    
    const { data, error } = await supabase
      .from('parcels')
      .update(updates)
      .eq('id', parcelId)
      .select()
      .single();

    if (error) throw error;

    await this.logAction('UPDATE_PARCEL', {
      parcelId,
      updates,
      executedBy: userRole
    });

    return {
      success: true,
      message: 'Parcelle mise à jour avec succès',
      updatedParcel: data
    };
  }

  async searchData(parameters, userRole) {
    const { table, query, filters } = parameters;
    
    let queryBuilder = supabase.from(table).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    if (query) {
      queryBuilder = queryBuilder.textSearch('full_text', query);
    }

    const { data, error } = await queryBuilder;
    
    if (error) throw error;

    return {
      success: true,
      message: `${data.length} résultat(s) trouvé(s)`,
      results: data
    };
  }

  async generateReport(parameters, userRole) {
    const { reportType, dateRange, filters } = parameters;
    
    // Génération de rapport basée sur les données réelles
    let reportData;
    
    switch (reportType.toLowerCase()) {
      case 'transactions':
        reportData = await this.generateTransactionReport(dateRange, filters);
        break;
      case 'utilisateurs':
        reportData = await this.generateUserReport(dateRange, filters);
        break;
      case 'parcelles':
        reportData = await this.generateParcelReport(dateRange, filters);
        break;
      default:
        throw new Error(`Type de rapport non supporté: ${reportType}`);
    }

    return {
      success: true,
      message: 'Rapport généré avec succès',
      report: reportData
    };
  }

  async predictPrice(parameters, userRole) {
    const { parcelId, location, size, features } = parameters;
    
    // Algorithme de prédiction basé sur les données historiques
    const { data: historicalData } = await supabase
      .from('transactions')
      .select('*')
      .eq('location', location)
      .order('created_at', { ascending: false })
      .limit(50);

    // Calcul de prédiction simple (à améliorer avec ML)
    const avgPricePerM2 = historicalData.reduce((sum, t) => sum + (t.price / t.size), 0) / historicalData.length;
    const predictedPrice = avgPricePerM2 * size;
    
    // Facteurs d'ajustement
    let adjustmentFactor = 1;
    if (features?.includes('waterfront')) adjustmentFactor += 0.2;
    if (features?.includes('roadaccess')) adjustmentFactor += 0.1;
    
    const finalPrice = predictedPrice * adjustmentFactor;

    return {
      success: true,
      message: 'Prédiction de prix calculée',
      prediction: {
        estimatedPrice: finalPrice,
        pricePerM2: avgPricePerM2 * adjustmentFactor,
        confidence: 0.85,
        factors: features,
        basedOnTransactions: historicalData.length
      }
    };
  }

  async analyzeMarket(parameters, userRole) {
    const { location, period } = parameters;
    
    // Analyse du marché avec données réelles
    const { data: marketData } = await supabase
      .from('transactions')
      .select('*')
      .eq('location', location)
      .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString());

    const analysis = {
      totalTransactions: marketData.length,
      averagePrice: marketData.reduce((sum, t) => sum + t.price, 0) / marketData.length,
      priceRange: {
        min: Math.min(...marketData.map(t => t.price)),
        max: Math.max(...marketData.map(t => t.price))
      },
      trend: this.calculateTrend(marketData),
      recommendations: this.generateRecommendations(marketData)
    };

    return {
      success: true,
      message: 'Analyse de marché complétée',
      analysis
    };
  }

  // Utilitaires
  async callAIAPI(payload) {
    const response = await fetch(`${this.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erreur API IA: ${response.statusText}`);
    }

    return await response.json();
  }

  async logAction(action, details) {
    await supabase.from('ai_actions_log').insert({
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  calculateTrend(data) {
    if (data.length < 2) return 'insufficient_data';
    
    const sortedData = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, t) => sum + t.price, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.price, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (changePercent > 5) return 'rising';
    if (changePercent < -5) return 'falling';
    return 'stable';
  }

  generateRecommendations(marketData) {
    const recommendations = [];
    const avgPrice = marketData.reduce((sum, t) => sum + t.price, 0) / marketData.length;
    
    if (marketData.length < 5) {
      recommendations.push('Marché peu actif - surveiller les nouvelles opportunités');
    }
    
    if (avgPrice > 100000000) {
      recommendations.push('Marché haut de gamme - cibler les investisseurs premium');
    }
    
    return recommendations;
  }

  async generateTransactionReport(dateRange, filters) {
    let query = supabase.from('transactions').select('*');
    
    if (dateRange) {
      query = query.gte('created_at', dateRange.start)
                  .lte('created_at', dateRange.end);
    }
    
    const { data } = await query;
    
    return {
      totalTransactions: data.length,
      totalValue: data.reduce((sum, t) => sum + t.price, 0),
      averageValue: data.reduce((sum, t) => sum + t.price, 0) / data.length,
      byStatus: this.groupByField(data, 'status'),
      byType: this.groupByField(data, 'type')
    };
  }

  async generateUserReport(dateRange, filters) {
    let query = supabase.from('profiles').select('*');
    
    if (dateRange) {
      query = query.gte('created_at', dateRange.start)
                  .lte('created_at', dateRange.end);
    }
    
    const { data } = await query;
    
    return {
      totalUsers: data.length,
      byRole: this.groupByField(data, 'role'),
      byStatus: this.groupByField(data, 'status'),
      activeUsers: data.filter(u => u.last_sign_in_at > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
    };
  }

  groupByField(data, field) {
    return data.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
}

export const aiAssistant = new AIAssistantService();
