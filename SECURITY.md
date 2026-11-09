# Politique de Sécurité Zero-Trust — SYNTARA AI (SECURITY.md)

## 1. Principes Fondamentaux du Trust Engine (Engine 12)
Dans SYNTARA AI, **tous les agents et contenus externes sont considérés comme non fiables jusqu'à validation formelle de leurs opérations**.

### Protection Contre l'Injection de Prompts Indirecte
- Aucune instruction trouvée dans un document indexé (PDF, Markdown, HTML), un email ou une page web externe n'est interprétée comme une autorisation de modifier les règles système ou les permissions d'un agent.
- Le module `inspectPayloadSecurity` du Trust Engine filtre systématiquement les requêtes d'inférence et les documents ingérés dans le Knowledge Engine.

### Opérations Sensibles Soumises à Approbation Humaine
Les opérations suivantes sont systématiquement interceptées et placées à l'état `Waiting Approval` jusqu'à validation explicite par un opérateur disposant du rôle approprié :
1. Suppressions définitives de données ou de collections.
2. Transferts financiers, achats ou ouverture de webhooks de facturation.
3. Publications externes (API tierces, dépôts publics, envois clients).
4. Modifications du code de production, des règles de sécurité ou des permissions RBAC.

### Mécanisme d'Arrêt Immédiat (Kill Switch)
- **Par Agent** : Chaque agent dispose d'un bouton d'arrêt immédiat (`POST /api/v1/agents/:id/kill`) interrompant instantanément ses tâches en cours.
- **Global** : Le Command Center intègre un Kill Switch global (`POST /api/v1/trust/kill-switch`) suspendant l'ensemble des moteurs autonomes.
