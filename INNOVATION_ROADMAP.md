# Innovation & Expansion Roadmap

Status codes: ⛔ Not started | 🛠 In progress | ✅ Done | 🧪 Prototype | 🔍 Research
Priority: P0 critical, P1 high, P2 medium, P3 exploratory

## Phase 0 – Foundations (Weeks 0–2)
| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Feature Flag System | P0 | ⛔ | Env-driven + table `feature_flags` (key, audience) |
| Audit Log Hardening (view + filters) | P0 | 🛠 | Base UI exists; add export & retention policy |
| Realtime Auth Hardening | P0 | ⛔ | Move to view + RLS function `jwt_is_admin()` |
| Background Job Scheduler | P0 | ⛔ | Supabase cron functions (market refresh, AI retrain) |
| Error & Perf Telemetry | P0 | ⛔ | Add Sentry + Web Vitals capture |

## Phase 1 – Data & Geospatial (Weeks 2–6)
| Feature | Priority | Status | Notes |
| Parcelles Heatmap (price/m2) | P1 | ⛔ | Materialized view + tileserver style |
| Isochrone Access (services) | P2 | ⛔ | External API (OSRM/GraphHopper) cache results |
| Risk Layers (inondation, litige) | P1 | ⛔ | Table `risk_layers` + join to parcels |
| Similar Parcels (embedding) | P2 | ⛔ | Vector table `parcel_vectors` (pgvector) |
| Ownership History Graph | P2 | ⛔ | Table `parcel_ownership_history` + timeline UI |

## Phase 2 – AI & Intelligence (Weeks 4–10 overlap)
| Feature | Priority | Status | Notes |
| Document OCR + Classification | P1 | ⛔ | Edge function + queue -> store structured fields |
| Price Prediction v1 | P1 | ⛔ | Train XGBoost offline, store model metadata |
| RAG Q&A (lois / docs) | P2 | ⛔ | Embeddings store `legal_embeddings` |
| Fraud Scoring Baseline | P1 | ⛔ | Features table + nightly score refresh |
| Due Diligence Auto Summary | P2 | ⛔ | LLM summarizer over parcel + docs |
| ROI Scenario Monte Carlo | P2 | ⛔ | Client calculation + caching results |

## Phase 3 – Workflow & Automation (Weeks 8–14)
| Feature | Priority | Status | Notes |
| Visual Workflow Builder | P2 | ⛔ | Tables: `workflows`, `workflow_nodes`, `workflow_runs` |
| SLA Tracker (Notaire/Mairie) | P1 | ⛔ | Table `sla_definitions` + timer events |
| Alert Rules Engine | P1 | ⛔ | JSON rule eval in Edge Function |
| Auto Reminders (documents manquants) | P1 | ⛔ | Scheduled function; email + in-app |

## Phase 4 – Advanced UX & Guidance (Weeks 10–18)
| Feature | Priority | Status | Notes |
| Guided Onboarding per Rôle | P1 | ⛔ | Table `onboarding_steps` with progress |
| Coach Sidebar (context AI) | P2 | ⛔ | Streaming LLM with function tools |
| Portfolio Simulator | P2 | ⛔ | Scenario set + charts + export PDF |
| 3D Parcels Preview | P3 | ⛔ | Three.js + elevation sample / placeholder |
| Accessibility Pass (WCAG) | P1 | ⛔ | Audit & adjust components |

## Phase 5 – Market & Monetization (Weeks 14–20)
| Feature | Priority | Status | Notes |
| Subscription Plans (Stripe) | P1 | ⛔ | Table `plans`, `subscriptions`; entitlements layer |
| Usage Metering (API credits) | P1 | ⛔ | Table `usage_events`; periodic aggregation |
| Premium Heatmap / Predictions Paywall | P2 | ⛔ | Feature flags + gating middleware |
| Commission Engine | P2 | ⛔ | Config table + apply on transactions |

## Phase 6 – Collaboration & Trust (Weeks 16–22)
| Feature | Priority | Status | Notes |
| Contextual Chat (per parcel) | P1 | ⛔ | `parcel_threads`, `thread_messages` |
| Co‑édition Dossier | P2 | ⛔ | Optimistic lock + presence channel |
| Reputation & Ratings | P3 | ⛔ | `entity_ratings` aggregated views |
| Hash Chain Integrity Log | P2 | ⛔ | Append-only table with previous_hash |

## Phase 7 – Performance & Observability (Continuous)
| Feature | Priority | Status | Notes |
| Slow Query Analyzer & Dashboard | P2 | ⛔ | Collect pg_stat_statements snapshots |
| Precomputation Job (daily aggregates) | P1 | ⛔ | Materialized views + refresh cron |
| Edge Cache Layer (CDN) | P2 | ⛔ | Signed JSON responses via Worker |

## Data Model Additions (Summary)
```
feature_flags(key text pk, enabled bool, audience jsonb)
parcel_ownership_history(parcel_id, previous_owner, new_owner, changed_at)
legal_embeddings(id, doc_id, embedding vector(1536), chunk text)
workflow_* tables...
fraud_scores(user_id, score, factors jsonb, computed_at)
usage_events(id, user_id, feature, quantity, occurred_at)
plans / subscriptions / entitlements
parcel_vectors(parcel_id, embedding vector(768))
parcel_price_predictions(parcel_id, predicted_price, conf_low, conf_high, model_version, computed_at)
```

## Edge / Functions (Planned)
- `ocr-document` (extract + classify)
- `price-predict` (serve cached predictions)
- `fraud-score-refresh` (scheduled)
- `workflow-runner` (exec nodes)
- `alert-dispatcher` (rules -> notifications)
- `embedding-indexer` (chunk & embed legal/docs)

## AI Stack Choices
| Layer | Tool | Rationale |
| Embeddings | OpenAI / local fallback | Speed vs privacy adjustable |
| Vector Store | pgvector | Native Postgres simplicity |
| Model Serving | Edge Functions / external API | Low latency region proximity |
| Scheduling | Supabase cron / external worker | Lightweight first |

## Prioritization Rationale
P0/P1 focus sur: fiabilité, monétisation rapide (prédictions, abonnements), différenciation (due diligence AI), réduction friction (onboarding guidé), confiance (fraude + audit).

## Success Metrics (Examples)
- Taux conversion onboarding complet (>70% des nouveaux rôles en 7j)
- Adoption heatmap premium (>=30% des utilisateurs actifs mensuels payants)
- Réduction délai dossier notaire (-25%) via workflow builder
- Précision prédiction prix (MAPE < 12%)
- Score complétude document parcelles (+40% vs baseline)

## Rollout Strategy
1. Dark launch (feature flags) sur modules AI.
2. Internal dogfooding (admin only) sur risk layers & fraude.
3. Beta payants early adopters (predictions + heatmap).
4. Généralisation + marketing intégré (dashboard widgets + upsell prompts).

## Risk & Mitigation
| Risque | Mitigation |
|-------|------------|
| Explosion complexité AI | Commencer par MVP XGBoost + fallback baseline |
| Coûts API élevés | Cache + batch + monitoring coût/token |
| Qualité données insuffisante | Pipelines nettoyage + scoring complétude |
| Charge DB (embeddings) | Partition + quantization / pruning |

## Next Immediate Steps (Actionable Sprint 1)
- Créer `feature_flags` + hook frontend.
- Mettre en place Sentry + Web Vitals.
- Ajouter table `parcel_price_predictions` + job stub.
- Implémenter `price-predict` (retourne stub). 
- Début materialized view heatmap (structure + placeholder).

---
Ce roadmap est modulaire: ajuster priorités selon feedback marché.
