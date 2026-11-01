---
sidebar_position: 1
sidebar_label: STT + TTS local
title: Voix locale — STT et TTS
description: Les deux serveurs voix indépendants de Jarvis (whisper-server :8178, llama-server TTS :9932), la cascade de transcription (batch -> chat multimodal -> websocket /v1/realtime), le VAD, l'enregistrement micro et la lecture WAV.
tags: [jarvis, voix, stt, tts, whisper.cpp, voxtral, vad, websocket, llama.cpp, audio]
last_update:
  date: 2026-11-01
  author: bastien
---

# Voix locale — STT + TTS

Deux serveurs **indépendants** du llama-server principal (config `[voice.stt]` / `[voice.tts]`, voir [Configuration](../Commencer/configuration.md)). S'ils ne répondent pas, le CLI et l'app GTK **les lancent automatiquement** avec le GGUF de la config (`ensure_voice_server(..., auto_start=True)` au CLI ; bouton dédié dans l'app).

```sh
# STT : whisper.cpp (ggml), sert POST /inference
whisper-server --host 127.0.0.1 --port 8178 -m ~/models/stt/Q4_K_M.gguf -ngl 99

# TTS : llama-server + modèle de synthèse, sert POST /v1/audio/speech (et POST /tts sur les builds récents)
llama-server -m ~/models/tts/voxtral-4b-tts-q4_k.gguf \
  --host 127.0.0.1 --port 9932 -ngl 99 --jinja -fa on
```

Statut : `/voice` au CLI, popover de statut dans l'app (états `online` / `géré par jarvis` / `hors ligne`).

## STT — deux protocoles (`[voice.stt] protocol`)

### `protocol = "whisper"` (défaut)

`whisper-server` + GGUF whisper.cpp → `POST /inference` (multipart `file=<wav>`, `response_format=json`).

### `protocol = "voxtral"` — Voxtral Mini 4B Realtime

`llama-server` + modèle audio llama.cpp → nécessite **llama.cpp >= b11675 (v0.8.0)**, sinon « unknown model architecture: 'voxtral_realtime' » (l'app remonte cette erreur dans le statut du serveur STT).

**Deux GGUF** : le décodeur texte (arch `mistral3`) en `-m`, plus l'encodeur audio **mmproj** (arch `voxtral_realtime`) en `--mmproj`. Si le `mmproj*.gguf` est dans le **même dossier** que le modèle, Jarvis l'ajoute automatiquement ; sinon `extra_args = ["--mmproj", "..."]`.

```sh
hf download ggml-org/Voxtral-Mini-4B-Realtime-2602-GGUF \
  Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf mmproj-Voxtral-Mini-4B-Realtime-2602-BF16.gguf \
  --local-dir ~/models/stt/

llama-server -m ~/models/stt/Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf \
  --mmproj ~/models/stt/mmproj-Voxtral-Mini-4B-Realtime-2602-BF16.gguf \
  --host 127.0.0.1 --port 8178 -ngl 99 --jinja --ctx-size 8192
```

(`hf` = CLI officielle Hugging Face depuis `huggingface_hub` v1.0, ex-`huggingface-cli` déprécié.)

## La cascade de transcription (`STTClient.transcribe`)

Toutes les transcriptions passent par la même cascade, l'ordre dépendant du protocole :

1. **`POST /v1/audio/transcriptions`** (multipart OpenAI-compatible) pour voxtral, **`POST /inference`** pour whisper ;
2. en cas de **404** → on essaie l'autre endpoint batch ;
3. en cas de **501** « does not support chat/completions » (route batch ASR inactive) → **`POST /v1/chat/completions` multimodal** avec le WAV en base64 (bloc `input_audio`) ;
4. en dernier recours → **websocket `GET /v1/realtime?intent=transcription`** : PCM16 base64 envoyé par `input_audio_buffer.append` puis `commit` — **seul chemin supporté par llama-server pour les modèles ASR streaming** comme Voxtral Mini 4B Realtime, qui n'ont pas de route batch.

Le client websocket est un **mini client RFC 6455 en stdlib** (handshake HTTP + trames texte/close/ping, pas de dépendance websocket) : `RealtimeSTTClient` dans `voice.py`. Un échec sur un endpoint fait passer au suivant au lieu de planter ; si tout échoue, l'erreur agrège le détail de chaque tentative.

## Enregistrement micro + VAD

- **CLI** : `/stt` sans argument enregistre le micro **jusqu'à la fin de parole** — VAD par **seuil RMS sur le flux live** (PCM s16le 16 kHz mono), plafond **60 s** — puis transcrit.
- **App GTK** : le bouton micro de la **Conversation** fait pareil (`transcribe_vad`) : record → transcribe → tour LLM.
- `record_cmd` (config `[voice]`) : `arecord -q -t raw -f S16_LE -r 16000 -c 1 -` par défaut (`-` = stdout) ; si `arecord` est absent, **fallback automatique sur ffmpeg** (`-f alsa -i default`). Source PipeWire précise : `pulse:<source>` → `ffmpeg -f pulse -i <source>` (sélecteur de micro dans l'app, listé via `pactl` quand alsa-utils manque).
- Le WAV produit est du **16 kHz mono 16-bit** (attendu par `/v1/realtime`).
- `play_cmd` : `ffplay -nodisp -autoexit` par défaut (fallback `aplay`/`paplay`/`play`).

## TTS local (`TTSClient`)

- `POST /v1/audio/speech` (JSON OpenAI-compatible `{input, voice?, response_format: "wav", model}`) → en cas de **404**, fallback **`POST /tts`** (`{"input": ...}` → WAV) sur les builds récents.
- Retourne toujours des **octets WAV** (vérifie l'en-tête `RIFF`).
- `GET /v1/audio/voices` liste les voix exposées par le serveur (liste vide si non exposé).
- `/tts <texte>` au CLI : synthétise (API Mistral si `[voice.tts_api] enabled`, sinon local), écrit le fichier dans `~/.cache/jarvis/tts-HHMMSS.<ext>` et le joue.

## Découverte des modèles voix

La classification d'un GGUF en STT/TTS se fait d'abord par le **répertoire parent** (`~/models/stt/` → STT, `~/models/tts/` → TTS, même pour un nom opaque comme `Q4_K_M.gguf`), sinon par heuristique de nom (`whisper`/`ggml-` → STT ; `voxtral`/`piper`/`kokoro`/`xtts`/`tts`… → TTS ; reste → LLM). Voir [Découverte des modèles](../Noyau/modeles-gpu.md).
