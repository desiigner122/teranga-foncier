# Migration Segmentation Plan

Current large files: 
- 20250819_institutions_geo_audit.sql
- 20250819_batch_all_core_foundations.sql
- future draft schema

### Target Segments
1. geo_and_institutions.sql (regions, departments, communes, institution_profiles)
2. audit_logs.sql
3. feature_flags_predictions_heatmap.sql
4. events_backbone.sql (events + price history + parcel_timeline view)
5. events_constraints.sql (pattern, size, importance)
6. parcel_triggers.sql (price + status)
7. document_institution_triggers.sql
8. risk_layers_minimal.sql
9. future_optional (embeddings, workflows, fraud, billing) – gated.

### Steps
- Duplicate content into new sequentially numbered migrations.
- Mark old batch file deprecated (retain for reference only).
- Deploy sequentially to staging; verify each before next.

### Rollback Strategy
- For additive migrations no destructive changes; rollback = drop new objects.
- Keep each migration idempotent with IF NOT EXISTS.

### Testing
- After events_backbone: insert test events; check timeline view.
- After triggers: update parcel price and status (validate event creation).

