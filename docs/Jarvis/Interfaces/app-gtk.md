---
sidebar_position: 1
sidebar_label: Application GTK4
title: Application GTK4 / libadwaita (jarvis-app)
description: L'interface graphique native de Jarvis — accueil micro, conversation (sidebar, streaming Markdown en widgets natifs, barre de contexte live), réglages, notifications en cloche, popover de statut serveur, autorisation micro au premier lancement.
tags: [jarvis, gtk4, libadwaita, pygobject, ui, webkit, markdown]
last_update:
  date: 2026-11-01
  author: bastien
---

# Application GTK4 / libadwaita (`jarvis-app`)

```sh
uv run jarvis-app                 # fenêtre native GTK4 (PyGObject + libadwaita)
uv run jarvis-app --config /chemin/config.toml
```

L'UI ne touche à **rien d'autre que la partie graphique** : le cœur LLM + MCP + voix + sessions est réutilisé tel quel. Toute la logique async vit dans `gtk/backend.py` (`GtkBackend`) : une **boucle asyncio dans un thread dédié**, les événements remontent au thread GTK via une queue + `GLib.idle_add`. L'agent tourne avec les mêmes outils internes (`jarvis__compact`, `jarvis__voice_tone`).

Installation des dépendances système et piège du venv uv (`--system-site-packages`) : voir [Installation](../Commencer/installation.md#le-piège-du-venv-uv-pygobject).

## Accueil

Un seul gros bouton micro **« Parler à Jarvis »** :

- si aucun llama-server ne répond → il en **démarre un** avec le GGUF choisi (sélecteur dans le popover statut, `--ctx-size` réglable) puis ouvre la conversation ;
- sinon il ouvre directement la conversation.

Le prompt texte est dans le **menu (Ctrl+P)**, avec les conversations (Ctrl+O) et la lecture TTS.

## Conversation

- **Sidebar repliable** (bouton toggle en haut à gauche, `Adw.OverlaySplitView`) : conversations passées (titre + date + nb messages), clic = reprise, conversation active surlignée, bouton `+` pour une nouvelle.
- **Barre d'actions dans la page Conversation** (pas dans le header global — elle n'apparaît donc que sur l'onglet chat) : **Nouvelle** (Ctrl+N) et **Reset contexte** (cible LLM / STT / TTS) — redémarre le serveur **géré par Jarvis** avec le même GGUF (jamais un serveur externe) pour repartir sur un contexte vierge.
- **Zone d'échange centrée**, barre du bas : bouton **micro** (STT local : record VAD → transcribe → tour LLM) + champ texte + envoyer. La barre de saisie fait **70 % de la largeur** de la fenêtre (recalculée au `map` et sur `notify::default-width` — GTK4 n'a pas de signal `size-allocate` sur un `Gtk.Box`).
- **Réponses en streaming rendues en Markdown 100 %** :
  - par défaut **widgets GTK natifs** (parseur CommonMark+GFM maison, `gtk/markdown.py`) : titres, **gras**/*italique*/`code`/~~barré~~, liens cliquables, images, listes puces/numérotées/à tâches, citations, **tableaux**, blocs ` ``` `, footnotes, séparateurs — re-rendu à chaque fragment ;
  - avec **`JARVIS_WEBKIT=1`** et WebKitGTK 6.0 installé : HTML complet (`markdown-it-py`) dans une WebView, **repli automatique** sur le rendu natif si WebKit échoue.
  - **Raisonnement repliable** et **appels d'outils dépliables** avec résultat.
- **Appels d'outils intercalés dans le flux** : la ligne `⚡`/`✓`/`✗` nom(args) + durée reste **à l'endroit du flux où le LLM a appelé l'outil** (et non plus regroupée en fin de bulle — en mode WebKit, où on ne peut pas intercaler, elles restent en bas de bulle). Clic sur la ligne = déplie le résultat. En replay d'historique, l'aperçu indique « (résultat non rejoué) ».
- **Méta du tour sous chaque bulle assistant** : « N tok en X s → Y tok/s » (plus l'erreur du tour si présente).
- **Bouton « i » sur chaque bulle assistant** (label texte, indépendant du thème d'icônes) → popover avec les **stats réelles de la réponse** : tokens générés **réels** remontés par le serveur (`stream_options.include_usage` en streaming, champ `usage` sinon — fallback estimation ~4 car/tok si le serveur ne renvoie rien), **tok/s calculé sur le temps de génération seul** (hors exécution des outils), tokens de prompt, durée du tour, nombre d'outils/itérations.
- **Copie/sélection** : les réponses assistant sont sélectionnables et copiables (tableaux Markdown compacts inclus).
- **Sessions sans parasite** : une conversation sans message n'est **pas écrite sur disque** (plus d'entrée « (vide) » dans la sidebar) ; la suppression n'est confirmée par toast que sur le **résultat réel** de l'événement `session_deleted` ; l'envoi d'un prompt et le changement de conversation sont **bloqués pendant un tour en cours ou un chargement** (évite qu'un prompt parti entre deux aille dans la mauvaise conversation).

## Header : statut, contexte, notifications

- **Popover de statut serveur** (icône réseau) : `en ligne` / `géré` / `hors ligne`, modèle servi, usage réel du contexte (`GET /slots`), start/stop du serveur géré.
- **Barre d'usage du contexte en live** : `used/n_ctx` tokens (LevelBar), rafraîchie à chaque poll de statut via `GET /slots`.
- **Notifications en cloche** : plus de toasts en bas de fenêtre — une **cloche dans le header avec badge compteur**, clic = popover listant les notifications + « Tout effacer ».

## Réglages (vrai onglet)

- **Thème** : système / sombre / clair.
- **GPU** utilisé par les serveurs locaux (persisté dans `~/.config/jarvis/gpu.json`) — voir [Modèles et GPU](../Noyau/modeles-gpu.md).
- **Taille de contexte** (`--ctx-size`) du serveur géré.
- **Liste des outils MCP** chargés (groupés par serveur).
- **Micro utilisé** (`arecord -L` / sources PipeWire `pactl`, persisté dans `~/.config/jarvis/ui.json`).
- **TTS** : activer la lecture des réponses, choisir API Mistral vs local, voix/modèle (liste rafraîchie via `GET /v1/models` et `/v1/audio/voices`).
- **Voix API Mistral** : champ masqué pour la clé → `~/.config/jarvis/mistral.json` (chmod 0600).
- **Autorisations système** : statut de l'autorisation micro via le **portail XDG**, test du micro + ouverture des réglages Confidentialité GNOME.

**Premier lancement** : une boîte de dialogue demande l'autorisation micro — le bouton « Autoriser » fait un **test d'enregistrement réel de 0,5 s** qui déclenche la demande système GNOME ; le dialogue ne se remontre plus ensuite (flag `mic_permission_asked` dans `ui.json`).

## Raccourcis

| Raccourci | Action |
|---|---|
| `Ctrl+P` | Prompt texte |
| `Ctrl+O` | Conversations (sessions) |
| `Ctrl+N` | Nouvelle conversation |
| `Ctrl+Q` | Quitter |
| `Alt+Home` | Accueil |

## Tests du pont GTK (sans GTK ni LLM réel)

```sh
python3 tests/test_gtk_backend.py          # flux d'événements, sessions, réglages (mock LLM + MCP echo)
python3 tests/test_gtk_app_structure.py    # structure de la fenêtre (stub gi)
```
