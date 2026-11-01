---
sidebar_position: 2
sidebar_label: TTS API Mistral
title: TTS cloud — API Mistral (Voxtral)
description: TTS via l'API Mistral (POST /v1/audio/speech, modèles voxtral-*-tts), gestion de la clé API (mistral.json chmod 600 ou MISTRAL_API_KEY), voix preset/clonées, liste dynamique des modèles, fallback automatique sur le TTS local.
tags: [jarvis, tts, mistral, voxtral, api, cloud, fallback, clé-api]
last_update:
  date: 2026-11-01
  author: bastien
---

# TTS cloud — API Mistral (Voxtral)

Si les modèles TTS locaux ne suffisent pas, Jarvis peut lire les réponses via **l'API Mistral** (`POST {base_url}/v1/audio/speech`, modèles `voxtral-*-tts-2603` / `voxtral-mini-tts-3-0`).

## Clé API — stockage local sécurisé

- Dans l'app GTK : onglet **Réglages > Voix API Mistral**, champ masqué + « Enregistrer » → écrit dans **`~/.config/jarvis/mistral.json`** avec **chmod 0600**.
- **Jamais dans `config.toml`**, jamais affichée/écrite en log ; les messages d'erreur TTS ne contiennent **jamais** le corps des réponses HTTP.
- `export MISTRAL_API_KEY=...` fonctionne aussi et **prime** sur le fichier. La clé survit à l'arrêt de l'app.

## Activation et secours automatique

```toml
[voice.tts_api]
enabled = true
base_url = "https://api.mistral.ai"
model = "voxtral-mini-tts-3-0"   # Voxtral TTS 3 (dernier, 20/10/2026) ; ou voxtral-mini-tts-2603 / voxtral-tts-2603 / latest
voice_id = "voice_592"           # Marie, FR
response_format = "mp3"          # mp3 | wav | pcm | flac | opus
emotion_tags = true              # autorise les tags [emotion=..][pace=..] en tête de réponse
```

- Si « Utiliser l'API Mistral pour le TTS » est coché **et** qu'une clé est enregistrée, chaque réponse de Jarvis est synthétisée par l'API et jouée (menu de l'app, ou Réglages > Voix ; persistant dans `~/.config/jarvis/ui.json`, clé `tts`).
- **Vrai secours** : si l'API échoue (réseau, 401, 403, 404…) ou si aucune clé n'est définie, Jarvis **retombe automatiquement sur le serveur TTS local** (toast « TTS local utilisé en secours » dans l'app, message au CLI). Réglable par défaut ou non.
- Au CLI, `/tts <texte>` emprunte ce chemin si `enabled=true`. Commandes de test dédiées : `/ttsapi <texte>`, `/apimodels`, `/apivoices`.

## Modèles et voix

- **Modèles** : `voxtral-mini-tts-3-0` (Voxtral TTS 3, 35+ langues), `voxtral-mini-tts-2603` (rapide), `voxtral-tts-2603` (qualité max). La liste du combo « Modèle TTS » dans l'app est **rafraîchie dynamiquement** via `GET /v1/models` (bouton Rafraîchir, auto après la clé) : les nouveaux modèles TTS y apparaissent **sans mise à jour du code** (liste statique de secours sans clé).
- **Voix** : presets Mistral — FR : Marie `voice_592`, Manon `voice_3137`, Lea, Camille ; EN-GB : `gb_jane_neutral` ; EN-US : `en_paul_neutral` ; DE/ES/IT/PT… (`voice_481` Heidi, DE) — **+ voix clonées du workspace**, listées via `GET /v1/audio/voices` (paginé, bouton « Rafraîchir »). Le choix est persisté (`ui.json`) et réglable dans `config.toml` (`voice_id`).

## Endpoints utilisés (`mistral_tts.py`)

| Endpoint | Usage |
|---|---|
| `POST {base_url}/v1/audio/speech` | `{"model", "input", "voice_id", "response_format"}` (+ tags émotion en préfixe de `input`, voir page suivante) → octets audio |
| `GET {base_url}/v1/models` | Liste des modèles du compte, filtrés sur `tts` |
| `GET {base_url}/v1/audio/voices` | Voix preset + custom du workspace (paginé, `page_size=100`) |

Erreurs remontées sans jamais journaliser le corps : 401 → « clé API invalide ou expirée », autre HTTP → « HTTP `<code>` sur /v1/... — corps non journalisé ».

→ Émotions dans la voix : [Émotions TTS (tags Voxtral 3)](../Voix/emotions-tts.md)
