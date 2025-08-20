import { supabase } from './supabaseClient';

class AntiFraudAIService {
  constructor() {
    this.riskThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
      critical: 0.9
    };
  }

  // Détection de fraude sur les documents
  async analyzeDocumentFraud(documents, parcelId, userId) {
    const fraudIndicators = [];
    let riskScore = 0;

    try {
      // Vérifier l'historique des documents similaires
      const { data: similarDocs } = await supabase
        .from('document_fraud_history')
        .select('*')
        .eq('parcel_id', parcelId);

      // Analyser les incohérences temporelles
      const temporalInconsistencies = this.detectTemporalInconsistencies(documents);
      if (temporalInconsistencies.length > 0) {
        fraudIndicators.push({
          type: 'temporal_inconsistency',
          severity: 'high',
          details: temporalInconsistencies,
          message: 'Incohérences temporelles détectées dans les documents'
        });
        riskScore += 0.3;
      }

      // Détecter les signatures suspectes
      const signatureAnalysis = await this.analyzeSignatures(documents);
      if (signatureAnalysis.suspicious) {
        fraudIndicators.push({
          type: 'suspicious_signature',
          severity: 'critical',
          details: signatureAnalysis,
          message: 'Signatures potentiellement falsifiées détectées'
        });
        riskScore += 0.4;
      }

      // Vérifier les duplications de documents
      const duplicateCheck = await this.checkDocumentDuplicates(documents);
      if (duplicateCheck.hasDuplicates) {
        fraudIndicators.push({
          type: 'document_duplication',
          severity: 'high',
          details: duplicateCheck,
          message: 'Documents identiques utilisés pour plusieurs parcelles'
        });
        riskScore += 0.35;
      }

      // Analyser les métadonnées des fichiers
      const metadataAnalysis = this.analyzeFileMetadata(documents);
      if (metadataAnalysis.suspicious) {
        fraudIndicators.push({
          type: 'metadata_manipulation',
          severity: 'medium',
          details: metadataAnalysis,
          message: 'Métadonnées de fichiers suspectes'
        });
        riskScore += 0.2;
      }

      // Logger l'analyse
      await this.logFraudAnalysis('DOCUMENT_ANALYSIS', {
        parcelId,
        userId,
        riskScore,
        indicators: fraudIndicators.length,
        fraudTypes: fraudIndicators.map(f => f.type)
      });

      return {
        riskScore: Math.min(riskScore, 1),
        riskLevel: this.getRiskLevel(riskScore),
        fraudIndicators,
        recommendations: this.generateRecommendations(fraudIndicators),
        requiresManualReview: riskScore > this.riskThresholds.medium
      };

    } catch (error) {
      throw error;
    }
  }

  // Détection de fraude sur les transactions
  async analyzeTransactionFraud(transaction, participants) {
    const fraudIndicators = [];
    let riskScore = 0;

    try {
      // Vérifier les patterns de prix suspects
      const priceAnalysis = await this.analyzeSuspiciousPricing(transaction);
      if (priceAnalysis.suspicious) {
        fraudIndicators.push({
          type: 'suspicious_pricing',
          severity: 'high',
          details: priceAnalysis,
          message: `Prix ${priceAnalysis.deviation > 0 ? 'anormalement élevé' : 'anormalement bas'} pour cette zone`
        });
        riskScore += 0.3;
      }

      // Détecter les ventes multiples
      const multiplesales = await this.detectMultipleSales(transaction.parcel_id);
      if (multipleSales.detected) {
        fraudIndicators.push({
          type: 'multiple_sales',
          severity: 'critical',
          details: multipleSales,
          message: 'Tentative de vente multiple de la même parcelle détectée'
        });
        riskScore += 0.5;
      }

      // Analyser les participants
      const participantAnalysis = await this.analyzeParticipants(participants);
      if (participantAnalysis.suspicious) {
        fraudIndicators.push({
          type: 'suspicious_participants',
          severity: 'medium',
          details: participantAnalysis,
          message: 'Participants avec historique suspect'
        });
        riskScore += 0.25;
      }

      // Vérifier les transactions circulaires
      const circularCheck = await this.detectCircularTransactions(participants);
      if (circularCheck.detected) {
        fraudIndicators.push({
          type: 'circular_transactions',
          severity: 'high',
          details: circularCheck,
          message: 'Pattern de transactions circulaires détecté'
        });
        riskScore += 0.35;
      }

      // Analyser la rapidité de la transaction
      const speedAnalysis = this.analyzeTransactionSpeed(transaction);
      if (speedAnalysis.suspicious) {
        fraudIndicators.push({
          type: 'unusual_speed',
          severity: 'medium',
          details: speedAnalysis,
          message: 'Transaction anormalement rapide'
        });
        riskScore += 0.2;
      }

      return {
        riskScore: Math.min(riskScore, 1),
        riskLevel: this.getRiskLevel(riskScore),
        fraudIndicators,
        recommendations: this.generateRecommendations(fraudIndicators),
        requiresManualReview: riskScore > this.riskThresholds.medium,
        shouldBlock: riskScore > this.riskThresholds.high
      };

    } catch (error) {
      throw error;
    }
  }

  // Détection de fraude sur les utilisateurs
  async analyzeUserFraud(userId, recentActivity) {
    const fraudIndicators = [];
    let riskScore = 0;

    try {
      // Vérifier les profils multiples
      const multipleProfiles = await this.detectMultipleProfiles(userId);
      if (multipleProfiles.detected) {
        fraudIndicators.push({
          type: 'multiple_profiles',
          severity: 'high',
          details: multipleProfiles,
          message: 'Utilisateur avec plusieurs profils suspects'
        });
        riskScore += 0.4;
      }

      // Analyser l'activité anormale
      const activityAnalysis = this.analyzeAbnormalActivity(recentActivity);
      if (activityAnalysis.suspicious) {
        fraudIndicators.push({
          type: 'abnormal_activity',
          severity: 'medium',
          details: activityAnalysis,
          message: 'Pattern d\'activité anormal détecté'
        });
        riskScore += 0.25;
      }

      // Vérifier les informations contradictoires
      const consistencyCheck = await this.checkUserConsistency(userId);
      if (consistencyCheck.hasInconsistencies) {
        fraudIndicators.push({
          type: 'inconsistent_information',
          severity: 'medium',
          details: consistencyCheck,
          message: 'Informations utilisateur incohérentes'
        });
        riskScore += 0.2;
      }

      // Détecter les bots ou comptes automatisés
      const botDetection = this.detectBotBehavior(recentActivity);
      if (botDetection.isBot) {
        fraudIndicators.push({
          type: 'bot_behavior',
          severity: 'high',
          details: botDetection,
          message: 'Comportement automatisé suspect détecté'
        });
        riskScore += 0.35;
      }

      return {
        riskScore: Math.min(riskScore, 1),
        riskLevel: this.getRiskLevel(riskScore),
        fraudIndicators,
        recommendations: this.generateUserRecommendations(fraudIndicators),
        requiresVerification: riskScore > this.riskThresholds.low,
        shouldSuspend: riskScore > this.riskThresholds.high
      };

    } catch (error) {
      throw error;
    }
  }

  // Analyse spécialisée pour les parcelles
  async analyzeParcelFraud(parcelId, ownershipHistory) {
    const fraudIndicators = [];
    let riskScore = 0;

    try {
      // Vérifier les conflits de propriété
      const ownershipConflicts = await this.detectOwnershipConflicts(parcelId);
      if (ownershipConflicts.hasConflicts) {
        fraudIndicators.push({
          type: 'ownership_conflict',
          severity: 'critical',
          details: ownershipConflicts,
          message: 'Conflits de propriété détectés'
        });
        riskScore += 0.5;
      }

      // Analyser l'historique des transferts
      const transferAnalysis = this.analyzeTransferHistory(ownershipHistory);
      if (transferAnalysis.suspicious) {
        fraudIndicators.push({
          type: 'suspicious_transfers',
          severity: 'high',
          details: transferAnalysis,
          message: 'Historique de transferts suspect'
        });
        riskScore += 0.3;
      }

      // Vérifier les limites géographiques
      const boundaryCheck = await this.verifyParcelBoundaries(parcelId);
      if (boundaryCheck.hasIssues) {
        fraudIndicators.push({
          type: 'boundary_issues',
          severity: 'medium',
          details: boundaryCheck,
          message: 'Incohérences dans les limites de la parcelle'
        });
        riskScore += 0.25;
      }

      // Détecter les parcelles fantômes
      const ghostParcelCheck = await this.detectGhostParcel(parcelId);
      if (ghostParcelCheck.isGhost) {
        fraudIndicators.push({
          type: 'ghost_parcel',
          severity: 'critical',
          details: ghostParcelCheck,
          message: 'Parcelle potentiellement inexistante'
        });
        riskScore += 0.6;
      }

      return {
        riskScore: Math.min(riskScore, 1),
        riskLevel: this.getRiskLevel(riskScore),
        fraudIndicators,
        recommendations: this.generateParcelRecommendations(fraudIndicators),
        requiresFieldVerification: riskScore > this.riskThresholds.medium,
        shouldQuarantine: riskScore > this.riskThresholds.high
      };

    } catch (error) {
      throw error;
    }
  }

  // Analyse des réseaux de fraude
  async analyzeNetworkFraud(entityId, entityType) {
    try {
      // Construire le graphe des relations
      const networkGraph = await this.buildNetworkGraph(entityId, entityType);
      
      // Détecter les clusters suspects
      const suspiciousClusters = this.detectSuspiciousClusters(networkGraph);
      
      // Analyser les patterns de fraude en réseau
      const networkPatterns = this.analyzeNetworkPatterns(networkGraph);
      
      return {
        networkSize: networkGraph.nodes.length,
        suspiciousClusters,
        networkPatterns,
        riskEntities: this.identifyRiskEntities(networkGraph),
        recommendations: this.generateNetworkRecommendations(suspiciousClusters, networkPatterns)
      };

    } catch (error) {
      throw error;
    }
  }

  // Détection des incohérences temporelles
  detectTemporalInconsistencies(documents) {
    const inconsistencies = [];
    
    documents.forEach((doc, index) => {
      if (doc.created_date && doc.signature_date) {
        const created = new Date(doc.created_date);
        const signed = new Date(doc.signature_date);
        
        if (signed < created) {
          inconsistencies.push({
            document: doc.name,
            issue: 'signature_before_creation',
            createdDate: created,
            signedDate: signed
          });
        }
      }
    });

    return inconsistencies;
  }

  // Analyse des signatures suspectes
  async analyzeSignatures(documents) {
    // Simulation d'analyse de signature avancée
    const signatures = documents.filter(doc => doc.signatures);
    let suspiciousCount = 0;
    const issues = [];

    signatures.forEach(doc => {
      doc.signatures.forEach(signature => {
        // Vérifier la cohérence des signatures d'une même personne
        if (signature.variations > 0.3) {
          suspiciousCount++;
          issues.push({
            document: doc.name,
            signer: signature.signer_name,
            issue: 'high_variation',
            confidence: signature.variations
          });
        }
      });
    });

    return {
      suspicious: suspiciousCount > 0,
      suspiciousCount,
      issues,
      confidence: suspiciousCount / Math.max(signatures.length, 1)
    };
  }

  // Analyse des prix suspects
  async analyzeSuspiciousPricing(transaction) {
    try {
      // Récupérer les prix du marché pour la zone
      const { data: marketPrices } = await supabase
        .from('market_predictions')
        .select('predicted_price_per_sqm, confidence_score')
        .eq('location', transaction.location)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!marketPrices || marketPrices.length === 0) {
        return { suspicious: false, reason: 'no_market_data' };
      }

      const marketPrice = marketPrices[0].predicted_price_per_sqm;
      const transactionPricePerSqm = transaction.price / transaction.area_sqm;
      const deviation = (transactionPricePerSqm - marketPrice) / marketPrice;

      // Prix suspect si déviation > 50% ou < -30%
      const suspicious = Math.abs(deviation) > 0.5 || deviation < -0.3;

      return {
        suspicious,
        deviation,
        marketPrice,
        transactionPrice: transactionPricePerSqm,
        confidence: marketPrices[0].confidence_score,
        reason: deviation > 0.5 ? 'overpriced' : deviation < -0.3 ? 'underpriced' : 'normal'
      };

    } catch (error) {
      return { suspicious: false, reason: 'analysis_error' };
    }
  }

  // Utilitaires
  getRiskLevel(score) {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    if (score >= this.riskThresholds.low) return 'low';
    return 'minimal';
  }

  generateRecommendations(fraudIndicators) {
    const recommendations = [];

    fraudIndicators.forEach(indicator => {
      switch (indicator.type) {
        case 'suspicious_signature':
          recommendations.push('Demander une vérification d\'identité en personne');
          recommendations.push('Exiger des documents d\'identité supplémentaires');
          break;
        case 'multiple_sales':
          recommendations.push('Bloquer immédiatement toutes les transactions liées');
          recommendations.push('Alerter les autorités compétentes');
          break;
        case 'ownership_conflict':
          recommendations.push('Suspendre la transaction jusqu\'à résolution du conflit');
          recommendations.push('Demander une enquête cadastrale officielle');
          break;
        case 'suspicious_pricing':
          recommendations.push('Demander une évaluation indépendante de la parcelle');
          recommendations.push('Vérifier les motivations de la transaction');
          break;
        default:
          recommendations.push('Effectuer une vérification manuelle approfondie');
      }
    });

    return [...new Set(recommendations)]; // Supprimer les doublons
  }

  async logFraudAnalysis(analysisType, details) {
    try {
      await supabase.from('fraud_analysis_log').insert({
        analysis_type: analysisType,
        details,
        timestamp: new Date().toISOString(),
        ai_version: '1.0.0'
      });
    } catch (error) {
    }
  }

  // Méthodes de détection spécialisées (stubs pour implémentation future)
  async detectMultipleSales(parcelId) {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('parcel_id', parcelId)
      .eq('status', 'En cours');

    return {
      detected: data && data.length > 1,
      count: data ? data.length : 0,
      transactions: data || []
    };
  }

  async detectMultipleProfiles(userId) {
    // Logique de détection de profils multiples
    return { detected: false, profiles: [] };
  }

  analyzeAbnormalActivity(activity) {
    // Logique d'analyse d'activité anormale
    return { suspicious: false, patterns: [] };
  }

  detectBotBehavior(activity) {
    // Logique de détection de bots
    return { isBot: false, indicators: [] };
  }

  async detectOwnershipConflicts(parcelId) {
    // Logique de détection de conflits de propriété
    return { hasConflicts: false, conflicts: [] };
  }

  analyzeTransferHistory(history) {
    // Logique d'analyse de l'historique des transferts
    return { suspicious: false, issues: [] };
  }
}

export const antiFraudAI = new AntiFraudAIService();
