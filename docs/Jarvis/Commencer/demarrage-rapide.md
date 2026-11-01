---
sidebar_position: 1
sidebar_label: Démarrage rapide
title: "Démarrage rapide — installer et utiliser Jarvis"
description: Le minimum pour avoir Jarvis qui tourne en 5 minutes — clone, uv sync, config.toml, llama-server, premier chat en CLI puis app GTK4.
tags: [jarvis, quickstart, installation, llama.cpp, cli, gtk4]
last_update:
  date: 2026-11-01
  author: bastien
---

# Démarrage rapide

Le minimum pour avoir Jarvis qui tourne, en 5 minutes.

## 1. Prérequis

- Python >= 3.11 + [**uv**](https://docs.astral.sh/uv/)
- **llama.cpp** buildé Vulkan (`-DGGML_VULKAN=ON`) → le binaire `llama-server`
- Un modèle GGUF (ex. `~/models/Qwen_Qwen3.6-35B-A3B-Q4_K_M.gguf`)
- Optionnel : `python-gobject gtk4 libadwaita` (paquets système) pour l'app graphique

## 2. Installer

```sh
git clone <repo jarvis> && cd jarvis
uv sync
cp config.example.toml config.toml
```

## 3. Servir le LLM

```sh
llama-server -m ~/models/Qwen_Qwen3.6-35B-A3B-Q4_K_M.gguf \
  -ngl 99 --jinja -fa on --port 9931 --ctx-size 16384
```

(Port par défaut **9931** depuis llama.cpp v0.7.0 ; `-fa on` explicite obligatoire. Sur AMD 890M, régler la carve-out UMA à 32 Go dans le BIOS pour charger un 24B Q4 côté GPU.)

## 4. Premier chat — CLI

```sh
uv run jarvis
```

Le REPL reprend automatiquement la dernière conversation. Commandes essentielles : `/help` (toutes les commandes), `/tools` (liste des outils MCP), `/sessions` (conversations passées), `/quit`. Tape ta question, Entrée pour envoyer.

## 5. App graphique (optionnel)

```sh
# paquets système d'abord, ex. Arch :
sudo pacman -S python-gobject gtk4 libadwaita
# puis le venv uv sur le Python système (sinon "No module named 'gi'") :
rm -rf .venv
uv venv --system-site-packages --python /usr/bin/python3
uv sync --frozen
uv run jarvis-app
```

Bouton **« Parler à Jarvis »** : démarre le serveur si besoin, puis ouvre la conversation (micro ou texte).

## 6. La voix (optionnel)

Deux serveurs indépendants, lancés automatiquement si absents (config `[voice.stt]` / `[voice.tts]`) :

```sh
whisper-server --host 127.0.0.1 --port 8178 -m ~/models/stt/Q4_K_M.gguf -ngl 99   # STT
llama-server -m ~/models/tts/voxtral-4b-tts-q4_k.gguf --host 127.0.0.1 --port 9932 -ngl 99 --jinja -fa on  # TTS
```

Au CLI : `/stt` (enregistre jusqu'à la fin de parole puis transcrit), `/tts <texte>` (synthétise et joue), `/voice` (statut). Dans l'app : bouton micro dans la conversation, lecture TTS dans les réglages.

## Ensuite

- [Installation détaillée](./installation.md) — tous les cas (distributions, WebKit, bench, tests)
- [Configuration `config.toml`](./configuration.md) — toutes les sections et variables d'env
- [CLI / TUI](./cli-tui.md) — toutes les commandes `/` et les sessions
- [Modules MCP](../Modules%20MCP/systeme-reseau-fichiers.md) — les 19 serveurs d'outils
- [App GTK4](../Interfaces/app-gtk.md) — l'interface graphique complète
