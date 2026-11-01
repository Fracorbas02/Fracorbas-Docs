---
sidebar_position: 2
sidebar_label: Installation
title: Installation et lancement
description: Installer Jarvis (uv, dépendances), configurer config.toml, lancer le CLI, l'app GTK4 et le bench ; piège du venv uv avec PyGObject.
tags: [jarvis, installation, uv, python, gtk4, pygobject, llama.cpp]
last_update:
  date: 2026-11-01
  author: bastien
---

# Installation et lancement

## Prérequis

- **Python >= 3.11** et [**uv**](https://docs.astral.sh/uv/)
- **llama.cpp** buildé avec le backend Vulkan (`-DGGML_VULKAN=ON`) pour servir le LLM (`llama-server`)
- Pour la voix locale : **whisper.cpp** (`whisper-server`) et/ou un llama.cpp récent (>= b11675 / v0.8.0 pour Voxtral Realtime) ; binaires audio : `arecord` (alsa-utils) ou `ffmpeg`, et `ffplay`/`aplay`/`paplay` pour la lecture
- Pour l'app GTK : paquets **système** `python-gobject`, `gtk4`, `libadwaita` (et `webkit2gtk-6.0` en option pour le rendu HTML)
- Outils MCP selon usage : `nmap`, `net-snmp`, `arp-scan`/`fping`, `ripgrep`, `iperf3`, `searchsploit`, `smartctl`, `lm-sensors`, `docker`… (chacun est optionnel, le serveur dégrade gracieusement)

## Installation

```sh
git clone <repo jarvis> && cd jarvis
uv sync
cp config.example.toml config.toml   # ajuster base_url / modèle / serveurs MCP
uv run jarvis                        # CLI
```

Deux entrées sont déclarées dans `pyproject.toml` :

```toml
[project.scripts]
jarvis = "jarvis.cli:main"
jarvis-app = "jarvis.gtk.app:main"
```

Dépendances Python (uv) : `httpx`, `mcp>=2.3,<3`, `rich`, `prompt-toolkit`, `markdown-it-py[plugins]`, `bleach` + `tinycss2`, `linkify-it-py`, `matplotlib`. Dev : `pytest`.

## Lancer le LLM (llama-server)

Depuis llama.cpp **v0.7.0**, le port par défaut de `llama-server` est **9931** et `-fa` requiert une valeur explicite (`on|off|auto`) :

```sh
# MoE recommandé (3B actifs/token sur bande passante mémoire partagée)
llama-server -m ~/models/Qwen_Qwen3.6-35B-A3B-Q4_K_M.gguf \
  -ngl 99 --jinja -fa on --port 9931 --ctx-size 16384

# Dense (comparaison bench)
llama-server -m Mistral-Small-3.3-24B-Instruct.Q4_K_M.gguf \
  -ngl 99 --jinja -fa on --port 9931 --ctx-size 16384
```

Sur le Framework 13 (Ryzen AI 9 HX 370, Radeon 890M), la VRAM est de la RAM partagée : régler la **carve-out UMA dans le BIOS** (32 Go recommandés pour un 24B Q4, Qwen3.6-35B-A3B Q4_K_M ≈ 21 Go tient alors côté GPU).

L'app GTK peut aussi lancer elle-même le serveur : bouton **Parler à Jarvis** sur l'accueil → sélection du GGUF (découvert dans `~/models`, cache HF, `$JARVIS_MODEL_DIRS`) → `llama-server -m <gguf> -ngl 99 --jinja -fa on --ctx-size <réglable>`.

## Lancer le CLI

```sh
uv run jarvis                 # REPL
uv run jarvis --config /chemin/config.toml   # (équivalent: JARVIS_CONFIG=...)
```

Au démarrage : bannière (modèle, serveur, contexte max lu dynamiquement via `GET /slots` ou `/props`, nombre d'outils), reprise automatique de la **dernière session**, prompt avec usage réel du contexte `(ctx ~N/M)`.

## Lancer l'app GTK4 (`jarvis-app`)

```sh
uv run jarvis-app
uv run jarvis-app --config /chemin/config.toml
```

> **Dépendances système (PAS installées par uv/pip)** : PyGObject (`gi`) vient du système, et le venv uv utilise son propre Python isolé qui ne voit pas les site-packages système.

| Distribution | Paquets |
|---|---|
| Arch/Manjaro | `sudo pacman -S python-gobject gtk4 libadwaita` (+ `webkit2gtk-6.0` pour `JARVIS_WEBKIT=1`) |
| Debian/Ubuntu | `sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-adw-1` (+ `gir1.2-webkit-6.0`) |
| Fedora | `sudo dnf install python3-gobject gtk4 libadwaita` (+ `webkitgtk6.0`) |

### Le piège du venv uv (PyGObject)

PyGObject vit dans les site-packages du **Python système** (`/usr/lib/python3.x/site-packages`). Le venv d'uv doit donc être créé sur ce Python **avec** les site-packages système, sinon `import gi` échoue même avec `python-gobject` installé :

```sh
rm -rf .venv                                   # jamais uv.lock !
uv venv --system-site-packages --python /usr/bin/python3
uv sync --frozen
# ou si uv resette le venv sans le flag :
UV_SYSTEM_SITE_PACKAGES=true uv sync --python /usr/bin/python3

uv run python -c "import gi; gi.require_version('Gtk','4.0'); from gi.repository import Gtk; print('GTK', Gtk.get_major_version())"
uv run jarvis-app
```

Pour **refaire un `uv sync` propre** (une dépendance a sauté) : supprimer **`.venv`**, jamais `uv.lock`.

### Rendu Markdown de l'app

- **Par défaut** : rendu en **widgets GTK natifs** (parseur CommonMark+GFM maison, stable) — titres, gras/italique/`code`/barré, liens cliquables, images, listes (puces/numérotées/à cocher), citations, tableaux, blocs de code, footnotes, séparateurs ; re-rendu à chaque fragment en streaming.
- **`JARVIS_WEBKIT=1`** (expérimental, opt-in) : les réponses passent en HTML complet (`markdown-it-py`) dans une WebView WebKitGTK 6.0 ; si WebKit échoue, **repli automatique** sur le rendu natif (log stderr « webview KO »).

## Benchmark

```sh
uv run python bench/bench_llm.py --max-tokens 2048 -n 3
```

Mesure le **TTFT** et les **tokens/s** en streaming sur le serveur réel, en séparant le raisonnement du contenu (`delta.reasoning_content`) — pour la boucle vocale, le TTFT qui compte est celui du **premier token de contenu**. Lit `[llm]` de `config.toml` (ou `config.example.toml`).

## Tests (sans LLM réel)

```sh
uv run python tests/test_agent.py        # boucle agent end-to-end : mock OpenAI-compatible + MCP echo réel
uv run pytest tests/                     # suite complète (agent, MCP, sécurité, voix mock, GTK…)
python3 tests/test_gtk_backend.py        # pont GTK sans GTK ni LLM (mock LLM + MCP echo)
python3 tests/test_gtk_app_structure.py  # structure de la fenêtre (stub gi)
python3 tests/test_tui.py                # validation visuelle du rendu sans LLM
```

Le mock LLM (`tests/mock_llm.py`) émet du SSE avec des `tool_calls` **fragmentés** pour valider le réassemblage ; `tests/ws_mock.py` simule le websocket `/v1/realtime` pour le STT Voxtral.
