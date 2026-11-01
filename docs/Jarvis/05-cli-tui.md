---
sidebar_position: 5
sidebar_label: CLI / TUI et sessions
title: CLI (REPL) — commandes et sessions
description: Toutes les commandes / du REPL Jarvis, la saisie multiligne, les métriques, les notifications desktop et les sessions persistantes.
tags: [jarvis, cli, repl, tui, rich, prompt-toolkit, sessions]
last_update:
  date: 2026-11-01
  author: bastien
---

# CLI (REPL) — commandes et sessions

`uv run jarvis` ouvre un REPL dans le terminal. La bannière affiche le modèle, le statut du serveur (`GET /v1/models`), la taille de contexte max (lue dynamiquement via `GET /slots` ou `/props`) et le nombre d'outils chargés. Le prompt affiche l'usage réel du contexte : `[toi] › (ctx ~12345/16384)`.

## Commandes `/`

Tab **complète** les commandes en début de saisie.

| Commande | Effet |
|---|---|
| `/help` | Liste complète des commandes |
| `/tools` | Table outil / description (1re ligne) de tous les outils MCP |
| `/thinking` | Réaffiche le raisonnement complet du dernier tour |
| `/tool N` | Résultat complet du N-ième outil du dernier tour |
| `/history` | Les 10 derniers messages envoyés |
| `/undo` | Retire le dernier échange (tout depuis le dernier message user) |
| `/copy` | Copie la dernière réponse dans le presse-papier (`wl-copy` / `xclip` / `xsel` / `pbcopy`) |
| `/save [fichier]` | Exporte la conversation en Markdown (défaut `~/.cache/jarvis/session-AAAAMMJJ-HHMMSS.md`) |
| `/sessions` | Liste les conversations passées (date, titre, nb messages, marque « actuelle ») |
| `/load N` | Reprend la conversation n°N de `/sessions` |
| `/new` | Nouvelle conversation (archive l'actuelle) |
| `/compact` | Résume l'historique via le LLM pour libérer du contexte (le modèle peut aussi appeler `jarvis__compact` seul) |
| `/reset` | Efface l'historique de conversation |
| `/verbose` | Bascule les logs console en DEBUG (le log fichier complet est toujours dans `~/.cache/jarvis/jarvis.log`) |
| `/tts <texte>` | Synthétise le texte (API Mistral si `[voice.tts_api] enabled`, sinon TTS local) et le joue |
| `/stt [fichier.wav]` | Transcrit un WAV ; sans argument, enregistre le micro **jusqu'à la fin de parole** (VAD, plafond 60 s) puis transcrit |
| `/voice` | Statut des deux serveurs voix (STT / TTS) |
| `/ttsapi <texte>` | **Test** : synthétise via l'API Mistral (clé `mistral.json` / `MISTRAL_API_KEY`) avec le modèle+voix configurés, joue le résultat |
| `/apimodels` | **Test** : liste les modèles TTS du compte Mistral (`GET /v1/models`, filtre tts ; liste statique de secours sans clé) |
| `/apivoices` | **Test** : liste les voix du compte Mistral (`GET /v1/audio/voices`) |
| `/quit` | Quitte (ou Ctrl+D) |

## Saisie multiligne

- **Maj+Entrée** insère un saut de ligne (protocole clavier **kitty**, CSI u `[13;2u`, sur kitty/wezterm/ghostty/foot) ; **Entrée** envoie.
- **Fallback universel** (tous terminaux) : `\` en fin de ligne puis Entrée = continuation.
- L'historique des saisies persiste dans `~/.cache/jarvis/history` (recherche avec Ctrl+R).
- **Ctrl+C** annule la saisie en cours ; **double Ctrl+C** (à moins d'1 s d'écart) quitte. En plein tour, Ctrl+C interrompt la génération (l'historique est restauré sur le snapshot d'avant-tour).

> Note technique : le prompt tourne dans un **thread daemon** (pas dans la coroutine) pour que `prompt_toolkit` lise stdin en synchrone — sinon il retombe en mode asyncio, lit par petits chunks et découpe les séquences CSI u (Maj+Entrée). `ttyguard` restaure les termios quoi qu'il arrive (atexit + signaux + `finally`).

## Affichage d'un tour (TUI `rich`)

- **Raisonnement** (`delta.reasoning_content`) : streamé en direct dans un panneau grisé, replié en une ligne résumé (durée, tokens) à la fin — la vraie pensée du modèle, visible. `/thinking` la réaffiche en entier.
- **Réponse** : rendue en **Markdown dans un panneau, en live** (repaint manuel throttlé à ~15 Hz, reparse à chaque fragment) ; la version finale reste affichée.
- **Appels d'outils** : spinner pendant l'exécution, puis statut `✓`/`✗` + durée + aperçu du résultat ; `/tool N` montre le résultat complet.
- **Métriques** : une ligne `tok, tok/s, durée` suit chaque réponse streamée.
- **Notification desktop** en fin de tour long (> 3 s) : séquences OSC 777 (kitty, foot, wezterm, ghostty) + OSC 9 (iTerm2, wezterm, konsole) — les terminaux qui ne les connaissent pas les ignorent.

## Latence et thinking

Les modèles *thinking* type Qwen3.6 réfléchissent avant de répondre : à ~24 tok/s, une réponse longue avec raisonnement peut dépasser une minute (mesuré : ~76 s pour un résumé CVE détaillé). Le choix assumé est de **garder le thinking et de le rendre visible** (streaming du panneau grisé). Pour le couper au profit de la latence pure, au cas par cas :

```toml
[llm]
chat_template_kwargs = { enable_thinking = false }
```

## Sessions persistantes

Globales (pas par dossier) : chaque conversation est sauvegardée en JSON dans `~/.cache/jarvis/sessions/<id>.json` **après chaque tour** (écriture atomique `.tmp` + `replace`, `sid` validé contre le path traversal).

- Au démarrage, la **dernière session est reprise automatiquement** (message « session reprise : « titre » (N messages) »).
- `/sessions` liste, `/load N` reprend, `/new` démarre frais, `/reset` vide l'historique courant.
- `/save [fichier]` exporte en Markdown (`# Session jarvis`, `## [toi]` / `## [jarvis]`, aperçus des résultats d'outils).
- L'app GTK a la même mécanique dans sa **sidebar repliable** (`Adw.OverlaySplitView`) : liste des conversations (titre + date + nb messages), clic = reprise, conversation active surlignée, bouton `+` pour une nouvelle.
