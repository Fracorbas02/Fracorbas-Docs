---
sidebar_position: 3
sidebar_label: Contexte et compactage
title: Gestion du contexte et compactage
description: Comment Jarvis surveille l'usage du contexte (GET /slots), injecte la note d'usage dans le system prompt, et compacte l'historique (manuel, auto à 75%, rattrapage sur tool call tronqué, outil interne jarvis__compact).
tags: [jarvis, contexte, compactage, llama.cpp, slots, tokens]
last_update:
  date: 2026-11-01
  author: bastien
---

# Gestion du contexte et compactage

## Lire l'usage réel du contexte

llama-server expose l'état de ses slots via `GET /slots` :

- **`n_ctx`** (par slot, ou `GET /props` `context_window`) = taille max du contexte → affichée dans la bannière et le prompt (`ctx ~N/M`) ; lue **dynamiquement**, donc un serveur relancé avec `--ctx-size 32768` est reflété sans rien changer (`[llm] ctx_size` n'est qu'un fallback).
- **`n_prompt_tokens`** (par slot) → l'usage réel ; Jarvis prend le **MAX sur tous les slots** (`server_ctx_usage`). Le prompt du CLI et la barre de contexte de l'app GTK l'affichent en live. Si `/slots` est indisponible, fallback sur une estimation ~4 caractères/token.

## Trois mécanismes de compactage

### 1. Note d'usage injectée dans le system prompt

À chaque itération d'un tour, l'agent remplace (ou ajoute) dans le message `system` :

```
[Usage du contexte : ~N/M tokens. Si tu approches de la limite, appelle jarvis__compact pour libérer du contexte.]
```

Le modèle voit donc combien il lui reste et peut décider lui-même de compacter via l'**outil interne `jarvis__compact`**.

### 2. Compaction automatique avant l'appel LLM (seuil 75 %)

Si `usage >= 0.75 × ctx_max` (usage réel de `/slots` si dispo, sinon estimation), l'agent **compacte de lui-même** avant l'appel LLM. Sans cela, un long prompt en un seul tour remplit les 16k tokens : le modèle n'a plus la place de générer un tool call entier, llama-server tronque les arguments JSON et renvoie HTTP 500.

### 3. Rattrapage sur tool call tronqué

Si malgré tout le serveur renvoie une erreur de *tool call* (HTTP 500 « Failed to parse tool call arguments »), l'agent compacte l'historique (sans le message user courant), **réinjecte** ce message, et réessaie **une fois**.

### Commande manuelle

`/compact` au CLI (et bouton dans l'app) déclenche la même fonction à la demande.

## `compact.py` — le résumé par le LLM

`compact_history(agent, history)` :

1. Ne touche à rien si moins de 4 messages non-system (« historique déjà court »).
2. Tronque chaque message à **4000 caractères** — un historique avec des résultats d'outils bruts (logs, `read_file` de centaines de ko) dépasserait sinon le contexte sur l'appel de compact lui-même, qui est censé le sauver.
3. Demande au LLM un **résumé fidèle et concis** (prompt dédié : faits établis, décisions, commandes et résultats, sorties d'outils importantes, URLs, CVE, hôtes, état actuel — « ne perds aucune information nécessaire pour continuer », en français, structuré en listes), en **non-stream**.
4. Remplace l'historique par :

```python
[
  {"role": "system", "content": agent.system_prompt},
  {"role": "user", "content": "[Contexte précédent, résumé automatiquement — N messages :]\n<résumé>"},
  {"role": "assistant", "content": "Compris, je repars de ce résumé pour la suite."},
]
```

Résultat affiché : `contexte compacté : N messages → résumé de X car. (~Y tok estimés)`.

## L'outil interne `jarvis__compact`

Exposé au modèle (schéma de paramètres vide), il permet au LLM de compacter **lui-même** quand il le juge utile (typiquement après avoir vu la note d'usage). Son `fn` peut retourner un **nouvel historique** qui remplace l'ancien dans la boucle — c'est le seul outil (avec `jarvis__voice_tone`) à pouvoir modifier l'historique.
