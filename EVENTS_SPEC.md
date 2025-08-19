# EVENTS SPECIFICATION

Namespace pattern: `<entity>.<action>` or `<context>.<action>`.

| Event Type | Description | Core Fields (data JSON) | Importance |
|------------|-------------|-------------------------|------------|
| parcel.price_changed | Prix d'une parcelle modifié (trigger) | old_price, new_price | 2 |
| parcel.created | Parcelle créée | status, owner_id | 1 |
| parcel.status_updated | Statut parcelle changé | old_status, new_status | 1 |
| user.favorite_added | Ajout favori sur une parcelle | favorite_id | 0 |
| user.favorite_removed | Retrait favori sur une parcelle | (none) | 0 |
| request.created | Demande créée | type, status | 0 |
| request.status_updated | Statut demande changé | new_status | 0 |
| transaction.created | Transaction créée | amount, status | 1 |
| transaction.status_updated | Statut transaction changé | new_status | 1 |

## Table Structure
See `20250819_batch_all_core_foundations.sql` (table: events).

## Conventions
- event_type: lowercase, dot-separated, stable.
- importance scale: 0=info,1=normal,2=important,3=critical.
- data payload: only minimal keys; for diffs use `old_*` / `new_*`.
- actor_user_id may be null for system/trigger events.
- entity_id stored as text for polymorphism; cast when needed (e.g. parcel).

## Future Additions
- institution.status_updated
- document.uploaded
- document.classified
- document.verified
- workflow.transition
- fraud.alert_raised

## Validation (future)
Add CHECK constraint example:
```
ALTER TABLE events ADD CONSTRAINT chk_event_type_pattern CHECK (event_type ~ '^[a-z]+(\.[a-z_]+)+$');
```
(Place into a new migration when ready.)

## Retention
- Short-term: keep all.
- Long-term: archive events > 18 mois dans table partitionnée.

## Index Strategy
- idx_events_entity (entity_type, entity_id, created_at DESC)
- idx_events_event_type
- Add GIN on data for advanced filters when required.

