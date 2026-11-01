---
sidebar_position: 4
sidebar_label: Configuration (config.toml)
title: Configuration — config.toml
description: Toutes les sections de config.toml (exemple complet) et les variables d'environnement JARVIS_* / clés API.
tags: [jarvis, configuration, toml, env, llama.cpp, mcp, voix]
last_update:
  date: 2026-11-01
  author: bastien
---

# Configuration — `config.toml`

La config se charge dans cet ordre de priorité : chemin passé en argument → `JARVIS_CONFIG` → `./config.toml`. Copier `config.example.toml` en `config.toml` et ajuster.

## `[llm]` — serveur LLM

```toml
[llm]
base_url = "http://127.0.0.1:9931/v1"   # llama-server (port 9931 par défaut depuis llama.cpp v0.7.0)
model = "qwen3.6-35b-a3b"                # étiquette seulement : n'affecte pas le modèle chargé
api_key = "local"                        # llama-server accepte n'importe quoi en local
temperature = 0.3
max_tokens = 4096
timeout = 300.0                          # 1er chargement + prompt processing peuvent être longs
# chat_template_kwargs = { enable_thinking = false }  # couper le thinking (Qwen3.6) pour la latence
# ctx_size = 32768                       # fallback d'affichage si /props indisponible (sinon lu dynamiquement)
```

- `chat_template_kwargs` est passé à chaque requête (`POST /v1/chat/completions`) : `{ enable_thinking = false }` coupe le raisonnement des modèles *thinking* au profit de la latence pure, au cas par cas.
- La **taille de contexte affichée** est lue dynamiquement (`n_ctx` de `GET /slots`, sinon `/props`) : relancer le serveur avec `--ctx-size 32768` est reflété sans rien changer. `ctx_size` n'est qu'un fallback.

## `[agent]` — boucle agent

```toml
[agent]
system_prompt = """Tu es Jarvis, l'assistant local de Bastien..."""
max_iterations = 8    # nombre max d'appels LLM (tool calls) par tour
```

Le `system_prompt` de l'exemple contient l'instruction pour la veille CVE (`days` sur `search_cve`) et celle pour les **tags d'émotion TTS** (voir [Émotions TTS](./13-emotions-tts.md)).

## `[voice.stt]` / `[voice.tts]` — serveurs voix locaux

Deux serveurs **indépendants** du llama-server principal. S'ils ne répondent pas, le CLI et l'app les lancent automatiquement avec le GGUF indiqué.

```toml
[voice.stt]
binary = "whisper-server"                       # whisper.cpp (examples/server)
base_url = "http://127.0.0.1:8178"
model = "~/models/stt/Q4_K_M.gguf"              # ggml whisper (ex. ggml-large-v3), relatif à ~/models ou absolu
protocol = "whisper"                            # "whisper" (défaut, POST /inference) | "voxtral"
# extra_args = ["-ngl", "99"]
# device = "Vulkan1"                            # nom ggml (llama-server --list-devices) -> --device
# env = { "CUDA_VISIBLE_DEVICES" = "1" }

# --- Variante Voxtral Mini 4B Realtime (llama-server + mmproj) ---
# [voice.stt]
# binary = "llama-server"
# model = "~/models/stt/Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf"
# protocol = "voxtral"
# extra_args = ["--mmproj", "~/models/stt/mmproj-Voxtral-Mini-4B-Realtime-2602-BF16.gguf"]
# Voxtral Realtime = DEUX GGUF : décodeur texte (-m) + encodeur audio (--mmproj).
# Si le mmproj*.gguf est dans le même dossier que le modèle, il est ajouté
# automatiquement ; sinon via extra_args. Nécessite llama.cpp >= b11675 (v0.8.0).

[voice.tts]
binary = "llama-server"                         # sert POST /v1/audio/speech et POST /tts
base_url = "http://127.0.0.1:9932"
model = "~/models/tts/voxtral-4b-tts-q4_k.gguf"
# extra_args = ["-ngl", "99", "--jinja", "-fa", "on"]
# device = "Vulkan0"
```

Lancement manuel équivalent :

```sh
# STT whisper.cpp
whisper-server --host 127.0.0.1 --port 8178 -m ~/models/stt/Q4_K_M.gguf -ngl 99

# STT Voxtral Realtime (llama.cpp >= v0.8.0)
llama-server -m ~/models/stt/Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf \
  --mmproj ~/models/stt/mmproj-Voxtral-Mini-4B-Realtime-2602-BF16.gguf \
  --host 127.0.0.1 --port 8178 -ngl 99 --jinja --ctx-size 8192
# ex. téléchargement : hf download ggml-org/Voxtral-Mini-4B-Realtime-2602-GGUF \
#   Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf mmproj-Voxtral-Mini-4B-Realtime-2602-BF16.gguf \
#   --local-dir ~/models/stt/

# TTS local
llama-server -m ~/models/tts/voxtral-4b-tts-q4_k.gguf \
  --host 127.0.0.1 --port 9932 -ngl 99 --jinja -fa on
```

## `[voice]` — record / play

```toml
# record_cmd : "-" en dernier élément = le binaire écrit sur stdout
#   (PCM s16le pour ffmpeg, WAV pour arecord sans -t raw)
# arecord absent -> fallback automatique sur ffmpeg (-f alsa -i default)
# [voice]
# record_cmd = ["arecord", "-q", "-t", "raw", "-f", "S16_LE", "-r", "16000", "-c", "1", "-"]
# play_cmd   = ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet"]
```

Pour forcer une source micro précise (PipeWire) :

```sh
pactl list short sources | grep alsa_input | grep -v monitor
pactl set-default-source <source>     # sinon « default » est suivi
# ou record_cmd direct, ex. :
# record_cmd = ["ffmpeg", "-loglevel", "error", "-f", "pulse", "-i",
#               "alsa_input.pci-0000_d4_00.6.HiFi__Mic1__source",
#               "-ar", "16000", "-ac", "1", "-f", "s16le", "-"]
```

Sans alsa-utils, l'app GTK liste aussi les sources PipeWire (`pactl`) dans le sélecteur de micro : choisir une entrée `pulse:...` enregistre via `ffmpeg -f pulse -i <source>`.

## `[voice.tts_api]` — TTS cloud Mistral (Voxtral)

```toml
# [voice.tts_api]
# enabled = true
# base_url = "https://api.mistral.ai"
# model = "voxtral-mini-tts-3-0"     # Voxtral TTS 3 (dernier) ; ou voxtral-mini-tts-2603 / voxtral-tts-2603 / latest
# voice_id = "voice_592"             # Marie, FR (presets : voice_3137 Manon, gb_jane_neutral EN-GB,
#                                    # en_paul_neutral EN-US, voice_481 Heidi DE... ou voix clonée du workspace)
# response_format = "mp3"            # mp3 | wav | pcm | flac | opus
# emotion_tags = true                # le LLM peut poser [emotion=..][pace=..] en tête de réponse
```

- Endpoints utilisés : `POST {base_url}/v1/audio/speech` `{"model", "input", "voice_id", "response_format"}` et `GET {base_url}/v1/audio/voices` (voix preset + workspace). La liste des modèles TTS affichée dans l'app est **rafraîchie dynamiquement** via `GET /v1/models` (bouton Rafraîchir) : les nouveaux modèles y apparaissent sans mise à jour du code.
- **La clé API n'est PAS dans ce fichier** : `~/.config/jarvis/mistral.json` (chmod 0600, enregistrée depuis l'app *Réglages > Voix API Mistral*, champ masqué) ou `export MISTRAL_API_KEY=...` — la variable d'env **prime** sur le fichier. Jamais affichée/loguée ; les messages d'erreur TTS ne contiennent jamais le corps des réponses HTTP.
- Si `enabled=true` mais que l'API échoue (réseau, 401, 403, 404…) ou qu'aucune clé n'est définie → **fallback automatique sur le TTS local** (toast « TTS local utilisé en secours » dans l'app, message au CLI).
- Au CLI, `/tts <texte>` utilise l'API si `[voice.tts_api] enabled=true`.

## `[mcp.servers.<nom>]` — serveurs MCP stdio

```toml
[mcp.servers.nettools]
command = ["uv", "run", "python", "mcp_servers/nettools.py"]
# ... idem pour cve, sysinfo, files, netutils, git, memory, notes, textutils,
# kev, epss, ghsa, exploitdb, scan, snmp, lan, docker, fetch, rss, echo
```

Préfixe des outils exposés au LLM : `"<nom>__<outil>"`. Une `command` peut être une chaîne (convertie en liste à 1 élément). Erreurs de structure (table manquante, `command` non liste de chaînes) → `TOMLDecodeError` explicite avec indice (« clé dupliquée ? bloc copié de l'exemple laissé sous le tien »).

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `JARVIS_CONFIG` | Chemin de la config TOML (priorité sous l'argument CLI) |
| `JARVIS_LOG_DIR` | Dossier d'état (défaut `~/.cache/jarvis`) : logs, sessions, history, WAV TTS |
| `JARVIS_MODEL_DIRS` | Répertoires de modèles supplémentaires (séparés par `:`) scannés par la découverte GGUF |
| `JARVIS_FILES_ROOTS` | Racines autorisées du serveur `files` (séparées par `:`, défaut `cwd:$HOME`) |
| `JARVIS_GIT_REPO` | Dépôt lu par le serveur `git` (défaut : cwd au lancement) |
| `JARVIS_MEMORY_FILE` | Fichier de la mémoire persistante (défaut `~/.cache/jarvis/memory.md`) |
| `JARVIS_NOTES_DIR` | Dossier des notes (défaut `~/.cache/jarvis/notes`) |
| `JARVIS_SNMP_COMMUNITY` | Communauté SNMP par défaut du serveur `snmp` |
| `JARVIS_FETCH_ALLOW_PRIVATE` | `=1` désactive les contrôles d'IP privée de la garde SSRF (tests locaux uniquement ; le schéma http(s) reste vérifié) |
| `JARVIS_ALLOW_PUBLIC_LLM` | `=1` autorise `start_server` sur un host non-loopback (sinon refusé : llama-server exposé sans clé API) |
| `JARVIS_WEBKIT` | `=1` active le rendu HTML markdown-it-py dans WebKitGTK (app GTK, sinon widgets natifs) |
| `NVD_API_KEY` | Clé API NVD 2.0 (50 req/30 s au lieu de 5) pour le serveur `cve` |
| `FIRST_API_KEY` | Token FIRST optionnel pour plus de débit sur `epss` |
| `GITHUB_TOKEN` | Token GitHub optionnel pour `ghsa` (5000 req/h au lieu de 60) |
| `MISTRAL_API_KEY` | Clé API Mistral — **prime** sur `~/.config/jarvis/mistral.json` pour le TTS API |

Les serveurs MCP reçoivent **l'environnement complet** du processus jarvis (voir `mcp.py`), donc toutes ces variables leur parviennent.
