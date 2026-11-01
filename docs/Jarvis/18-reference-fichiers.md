---
sidebar_position: 18
sidebar_label: Référence des fichiers et état
title: Référence des fichiers — code, config et état utilisateur
description: Tableau de correspondance complet fichier par fichier (src/jarvis, mcp_servers, bench, tests) et chemins d'état utilisateur (~/.config/jarvis, ~/.cache/jarvis), plus la carte des variables d'environnement.
tags: [jarvis, référence, fichiers, chemins, env, state]
last_update:
  date: 2026-11-01
  author: bastien
---

# Référence des fichiers et de l'état

## Code (`src/jarvis/`)

| Fichier | Lignes | Rôle |
|---|---|---|
| `cli.py` | ~820 | REPL : bannière, prompt (thread dédié), commandes `/`, multiligne, notifications OSC 777/9, métriques |
| `tui.py` | ~370 | Affichage `rich` : panneau thinking repliable, réponse Markdown live (repaint manuel ~15 Hz), statut outils ✓/✗, `/thinking`, `/tool N` |
| `agent.py` | ~300 | Boucle tool-calling, outils internes, compaction auto (75 %), note d'usage du contexte, rattrapage tool call tronqué, filtre des tags TTS en streaming |
| `llm.py` | ~145 | Client OpenAI-compatible httpx, streaming SSE, réassemblage des tool_calls fragmentés |
| `mcp.py` | ~100 | Agrégation MCP stdio → schémas `"<serveur>__<outil>"`, env complet transmis |
| `voice.py` | ~1215 | STT (whisper/voxtral : cascade batch → chat multimodal → WS `/v1/realtime`), TTS (`/v1/audio/speech` → `/tts`), gestion des processus, record/play WAV, VAD RMS |
| `mistral_tts.py` | ~260 | Client API Mistral : `/v1/audio/speech`, `/v1/models`, `/v1/audio/voices`, clé dans `mistral.json` (0600) |
| `tts_tags.py` | ~55 | Tags `[emotion=..][pace=..]` : extraction tête de réponse, strip, re-préfixe pour le TTS |
| `voice_tone.py` | ~55 | Outil interne `jarvis__voice_tone` |
| `compact.py` | ~80 | Compactage : résumé LLM (messages tronqués à 4000 car.), nouvel historique `[system, user(résumé), assistant]` |
| `config.py` | ~175 | Chargement TOML + dataclasses + erreurs explicites (clé dupliquée, structure `[mcp.servers]`) |
| `server.py` | ~165 | Statut/start/stop llama-server, garde loopback (`JARVIS_ALLOW_PUBLIC_LLM`), log hygiénique |
| `models.py` | ~150 | Découverte GGUF, classification LLM/TTS/STT |
| `gpu.py` | ~330 | Détection GPU (NVIDIA/ROCm/Vulkan/lspci), choix persisté `gpu.json`, `--device` vs `*_VISIBLE_DEVICES` |
| `sessions.py` | ~85 | Sessions JSON persistantes, écriture atomique, sid validé |
| `netguard.py` | ~45 | Garde SSRF partagée (aussi utilisée pour les images Markdown GTK) |
| `ttyguard.py` | ~90 | Snapshot/restauration termios (atexit + SIGTERM/SIGINT + finally) |
| `gtk/app.py` | ~1500 | Fenêtre `Adw.ApplicationWindow` : accueil, conversation, réglages, header (cloche, LevelBar contexte, popover statut) |
| `gtk/backend.py` | ~890 | `GtkBackend` : boucle asyncio + queue + `GLib.idle_add`, sessions, statut serveurs, record STT, TTS, clé API |
| `gtk/widgets.py` | ~930 | Bulles de messages, reasoning repliable, lignes d'outils |
| `gtk/markdown.py` + `gtk/markdown_lib.py` | ~1090 | Parseur CommonMark+GFM → widgets GTK natifs (tableaux, tâches, footnotes…) |

## `mcp_servers/` (19 serveurs, ~2970 lignes)

`nettools` · `sysinfo` · `scan` · `snmp` · `lan` · `docker` · `files` · `git` · `memory` · `notes` · `netutils` · `textutils` · `cve` · `kev` · `epss` · `ghsa` · `exploitdb` · `fetch` · `rss` · `echo`

→ détails : [MCP 1/2](./08-mcp-serveurs.md) et [MCP 2/2](./09-mcp-veille-securite.md).

## `bench/` et `tests/`

- `bench/bench_llm.py` : TTFT / tok/s en streaming, séparation raisonnement/contenu.
- `tests/` : mock LLM (SSE + tool_calls fragmentés), `ws_mock.py` (websocket realtime), `mock_voice.py`, configs de test, et la suite (agent, MCP, injection, sécurité, voix, serveur, ttyguard, TUI, GTK).

## État utilisateur

| Chemin | Contenu |
|---|---|
| `config.toml` (racine projet) | Configuration (copie de `config.example.toml`) ; `JARVIS_CONFIG` pour un autre chemin |
| `~/.config/jarvis/mistral.json` | Clé API Mistral (chmod **0600**) |
| `~/.config/jarvis/ui.json` | Préférences UI GTK : thème, micro (`mic`), TTS (`tts`), `ctx_size`, `mic_permission_asked` |
| `~/.config/jarvis/gpu.json` | Choix GPU persistant (`device` + `env`) |
| `~/.cache/jarvis/jarvis.log` | Log DEBUG complet |
| `~/.cache/jarvis/llama-server-gui.log` | Log du llama-server lancé par l'app (args + env GPU modifié uniquement) |
| `~/.cache/jarvis/sessions/*.json` | Sessions de conversation (une par fichier, écriture atomique) |
| `~/.cache/jarvis/history` | Historique des saisies du REPL |
| `~/.cache/jarvis/memory.md` | Mémoire persistante MCP (`JARVIS_MEMORY_FILE`) |
| `~/.cache/jarvis/notes/<sujet>.md` | Notes MCP (`JARVIS_NOTES_DIR`) |
| `~/.cache/jarvis/tts-*.wav/mp3` | Fichiers TTS produits par `/tts` |
| `~/models/{,stt/,tts/}` + cache HF | Modèles GGUF découverts (`JARVIS_MODEL_DIRS` pour plus) |

Tout le dossier `~/.cache/jarvis` peut être déplacé via **`JARVIS_LOG_DIR`**.

## Variables d'environnement (récap)

`JARVIS_CONFIG` · `JARVIS_LOG_DIR` · `JARVIS_MODEL_DIRS` · `JARVIS_FILES_ROOTS` · `JARVIS_GIT_REPO` · `JARVIS_MEMORY_FILE` · `JARVIS_NOTES_DIR` · `JARVIS_SNMP_COMMUNITY` · `JARVIS_FETCH_ALLOW_PRIVATE=1` (tests SSRF) · `JARVIS_ALLOW_PUBLIC_LLM=1` (override loopback) · `JARVIS_WEBKIT=1` (WebKitGTK) · `NVD_API_KEY` · `FIRST_API_KEY` · `GITHUB_TOKEN` · `MISTRAL_API_KEY` (prime sur `mistral.json`)

→ détails et priorités : [Configuration](./04-configuration.md#variables-denvironnement)
