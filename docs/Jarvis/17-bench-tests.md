---
sidebar_position: 17
sidebar_label: Benchmark et tests
title: Benchmark (TTFT / tok/s) et suite de tests
description: bench_llm.py (mesure du TTFT et tokens/s en streaming, séparation raisonnement/contenu pour les modèles thinking) et la suite de tests sans LLM réel (mock SSE + tool_calls fragmentés, MCP echo, ws_mock, tests GTK avec stub gi).
tags: [jarvis, bench, benchmark, ttft, tests, pytest, mock, llama.cpp]
last_update:
  date: 2026-11-01
  author: bastien
---

# Benchmark et tests

## Benchmark — `bench/bench_llm.py`

```sh
uv run python bench/bench_llm.py --prompt "..." --max-tokens 2048 -n 3
```

Mesure le **TTFT** (time to first token) et les **tokens/s** **en streaming** sur le serveur réel (lit `[llm]` de `config.toml`, fallback `config.example.toml`). Les modèles *thinking* (type Qwen3.6) sont gérés : llama.cpp sépare le raisonnement dans `delta.reasoning_content`, le bench chronomètre et compte **les deux flux séparément** — pour la boucle vocale, le TTFT qui compte est celui du **premier token de contenu**.

## Suite de tests — sans LLM réel

```sh
uv run pytest tests/                     # suite complète
uv run python tests/test_agent.py        # boucle agent end-to-end (mock LLM + MCP echo réel)
python3 tests/test_gtk_backend.py        # pont GTK : flux d'événements, sessions, réglages
python3 tests/test_gtk_app_structure.py  # structure de la fenêtre GTK (stub gi, sans GTK)
python3 tests/test_tui.py                # validation visuelle du rendu TUI sans LLM
```

### Les mocks

- **`tests/mock_llm.py`** : serveur **OpenAI-compatible mock** qui émet du **SSE avec des `tool_calls fragmentés`** (id/name/arguments par morceaux) pour valider le réassemblage par index côté `llm.py`, plus des réponses avec raisonnement (`reasoning_content`).
- **`mcp_servers/echo.py`** : vrai serveur MCP réel en sous-processus (`echo__ping`) pour valider la transmission des schémas, le déroulé tool_call → exécution MCP → injection `role=tool` → réponse finale.
- **`tests/ws_mock.py`** : simule le **websocket `/v1/realtime`** pour tester la cascade STT Voxtral (dernier recours de `STTClient`).
- **`tests/mock_voice.py`** : voix mock (STT/TTS) pour les tests d'intégration.
- Configs de test : `tests/config.test.toml`, `tests/config.chatmock.toml`.

### Ce qui est couvert

| Fichier de test | Couvre |
|---|---|
| `test_agent.py` | Boucle agent end-to-end : schémas MCP transmis, tool_call → MCP → `role=tool` → réponse finale |
| `test_mcp_servers.py` / `test_mcp_servers_extra.py` | Garde SSRF (fetch/rss/http_get), confinement `files`, règles scan/lan/snmp, limites |
| `test_mcp_injection.py` | Anti-injection d'options dans les args de sous-processus |
| `test_audit_fixes.py` / `test_bugfix_audit.py` | Audits de durcissement (fixs de sécurité) |
| `test_server.py` | `server.py` : statuts online/managed/offline, garde loopback, start/stop |
| `test_tty_guard.py` | Restauration termios sur signaux et sur pty de test |
| `test_voice.py` / `test_mistral_tts.py` | Cascade STT (batch → chat → WS), client TTS local, client API Mistral (erreurs sans corps logué) |
| `test_gtk_backend.py` / `test_gtk_app_structure.py` / `test_gtk_markdown*.py` | Pont GTK (événements, sessions, réglages), structure fenêtre (stub `gi`), parseur Markdown GTK |
| `test_tui.py` | Rendu TUI (thinking repliable, outils ✓/✗, Markdown live) sans LLM |

Le principe : **le harnais est testé sans modèle ni réseau**, le modèle restant interchangeable — il ne dépend que de l'API OpenAI-compatible. Le futur fine-tune cybersécurité (CyberLLM) se branche à la place du LLM sans rien réécrire, tant que l'interface outils reste du MCP standard.
