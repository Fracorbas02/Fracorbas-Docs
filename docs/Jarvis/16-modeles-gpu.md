---
sidebar_position: 16
sidebar_label: Modèles locaux et GPU
title: Découverte des modèles GGUF et gestion du GPU
description: Scan des répertoires de modèles (~/models, cache HF, JARVIS_MODEL_DIRS), classification LLM/STT/TTS par répertoire parent ou nom, détection GPU (NVIDIA/ROCm/Vulkan/lspci), choix persistant gpu.json et répartition multi-GPU (--device / CUDA_VISIBLE_DEVICES).
tags: [jarvis, gguf, modèles, gpu, vulkan, rocm, cuda, llama.cpp, multi-gpu]
last_update:
  date: 2026-11-01
  author: bastien
---

# Modèles locaux et GPU

## Découverte des GGUF (`models.py`)

L'app ne connaît pas les modèles à l'avance : elle scanne (dédupliqué, `*.gguf` récursif) :

1. **`$JARVIS_MODEL_DIRS`** (chemins séparés par `:`) ;
2. **`~/models`** ;
3. **`~/.cache/huggingface/hub`** (cache HF).

Chaque fichier est classé par **mode** (`llm` / `tts` / `stt`) :

1. **répertoire parent** nommé `stt/` ou `tts/` (ex. `~/models/stt/Q4_K_M.gguf`) → mode forcé, même si le nom du fichier est opaque ;
2. sinon **heuristique de nom** : `whisper` / `ggml-` (convention whisper.cpp) → **STT** ; `piper|kokoro|xtts|coqui|vits|melo|tts|style-tts|your-tts|voxtral` → **TTS** ;
3. le reste → **LLM**.

Les modes correspondent aux grandes familles de l'app : chat LLM (llama-server principal), TTS (serveur :9932), STT (serveur :8178).

## Détection GPU (`gpu.py`)

`detect_gpus()` essaie dans l'ordre :

- **NVIDIA** : `nvidia-smi --query-gpu=...` ;
- **AMD ROCm** : `rocm-smi` ;
- **Vulkan** : `vulkaninfo` / `llama-server --list-devices` (noms ggml type `Vulkan0`, `Vulkan1`) ;
- **fallback** : `lspci` (cartes graphiques détectées sans backend utilisable).

## Choix du GPU et répartition multi-GPU

Le choix de l'onglet **Réglages** (ou du pop-up de 1er lancement) est persisté dans **`~/.config/jarvis/gpu.json`** et traduit par `choice_args()` / `choice_env()` :

- **Vulkan** → args `--device <nom ggml>` (ex. `Vulkan1`) — pas de variable d'env équivalente. Permet de **répartir les modèles sur plusieurs GPU** : LLM sur `Vulkan0`, STT sur `Vulkan1`…
- **CUDA / HIP / CPU** → env `CUDA_VISIBLE_DEVICES` / `HIP_VISIBLE_DEVICES` / `ROCR_VISIBLE_DEVICES`.

Consommation :

- `server.py` (llama-server principal) : args GPU placés **avant** `extra_args` pour que la config puisse surcharger ; jamais de `--device` brut type `vulkan:0` ;
- `voice.py` (STT/TTS) : chaque serveur peut surcharger individuellement via `device = "Vulkan1"` et `env = {"CUDA_VISIBLE_DEVICES": "1"}` dans `[voice.stt]` / `[voice.tts]` ; sinon le choix global de l'onglet Réglages s'applique, sinon le 1er device trouvé.

Sur le Framework 13 (Ryzen AI 9 HX 370, Radeon 890M), la VRAM est de la RAM partagée : régler la **carve-out UMA dans le BIOS** (32 Go recommandés pour un 24B Q4) pour que tout le modèle tienne côté GPU (`-ngl 99`).
