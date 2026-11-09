# Guide de Contribution — SYNTARA AI (CONTRIBUTING.md)

Merci de contribuer à **SYNTARA AI — Universal Autonomous Intelligence Operating System** (Licence MIT).

## 1. Standards de Qualité & Architecture
- **Typage Strict** : Tout nouveau module TypeScript doit compiler sans erreur via `npm run lint` (`tsc --noEmit`).
- **Validation des Contrats** : Utiliser des schémas `zod` pour toutes les entrées API et les manifestes de plugins.
- **Zéro Dépendance Propriétaire Forcée** : Tout appel à un modèle IA doit passer par l'abstraction `SYNTARA Model Adapter`.
- **Sécurité par Conception** : Aucun agent ne peut s'auto-attribuer des permissions supplémentaires. Toute mutation d'espace de travail doit générer un diff avant/après vérifiable.

## 2. Création d'un Plugin SDK
Chaque extension dans `Universal Tool Fabric` doit déclarer :
- Ses schémas d'entrée (`inputs`) et de sortie (`outputs`).
- Ses permissions minimales requises (`permissions`).
- Ses limites de mémoire et de temps d'exécution (`resourceLimits`).

## 3. Validation avant Pull Request
Exécutez systématiquement la suite des 15 tests d'acceptation :
```bash
npm run lint
npm test
npm run build
```
