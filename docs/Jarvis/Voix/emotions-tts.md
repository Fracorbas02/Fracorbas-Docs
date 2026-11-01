---
sidebar_position: 3
sidebar_label: Émotions TTS
title: Émotions dans la voix — tags Voxtral 3
description: Les tags [emotion=..][pace=..] (34 émotions + 2 paces) posés par le LLM en tête de réponse, envoyés au TTS uniquement et jamais affichés/sauvegardés ; l'outil interne jarvis__voice_tone comme alternative fiable ; filtrage du tag dès le premier fragment en streaming.
tags: [jarvis, tts, voxtral, emotion, tags, voice-tone, streaming]
last_update:
  date: 2026-11-01
  author: bastien
---

# Émotions dans la voix — tags Voxtral TTS 3

Quand le TTS API Mistral est actif, le LLM peut piloter l'expressivité de la voix de deux façons.

## 1. Tag inline en tête de réponse

Voxtral TTS 3 accepte des tags inline en début de ligne : `[emotion=happy][pace=fast] Bonjour !` — **34 émotions + 2 paces** (`slow`/`fast`). Le `system_prompt` de `config.example.toml` instruit le LLM d'en poser un **systématiquement en toute première ligne** quand la réponse est destinée à être lue à voix haute (ex. `[emotion=calm]`, `[emotion=happy]`, `[emotion=curious]`, `[emotion=serious]`, `[emotion=excited]`…), et **jamais ailleurs**.

Émotions retenues côté Jarvis (`tts_tags.EMOTIONS`) : `neutral, happy, sad, angry, excited, calm, curious, surprised, confused, sarcastic, whisper, laugh, sigh, frustrated, confident, nervous, playful, serious, warm` (+ la suite des 34 documentées par Mistral).

**Règle d'or** : le tag est envoyé **uniquement au TTS** (il rend la voix plus expressive) et **retiré du texte affiché et de l'historique** — jamais lu à l'écran. Désactivable : `[voice.tts_api] emotion_tags = false`.

## 2. Outil interne `jarvis__voice_tone` (plus fiable)

Un tag oublié dans le texte est invisible ; un **appel d'outil est tracable**. Le LLM appelle explicitement :

```json
jarvis__voice_tone({"emotion": "excited", "pace": "fast"})
```

Jarvis enregistre le ton dans `trace.tts_tags` (repris par `Agent.turn` à la fin du tour) et l'envoie au TTS uniquement. Valeurs invalides → erreur explicite listant les émotions/pace disponibles. Le `system_prompt` de l'exemple présente les deux mécanismes (tag en tête, ou mieux : l'outil).

## Mécanique d'extraction (`tts_tags.py`)

- `LEAD_TAGS_RE` n'accepte les tags qu'en **début de 1re ligne** : `^((?:\[emotion=[a-z_]+\]|\[pace=(?:slow|fast)\]\s*)+)`.
- `extract_lead_tags(text)` → `(tags, texte_nettoyé)` ; `strip_all_tags(text)` retire **tous** les tags (sécurité affichage) ; `apply_tags(text, tags)` les re-préfixe pour l'envoi TTS uniquement.
- **En streaming** (`agent.py`) : le tag ne doit jamais apparaître, même dans le **premier fragment**. `Agent.turn` enveloppe `on_content` : le 1er chunk est bufferisé, les tags extraits (→ `stream_tags` → `trace.tts_tags`) et seul le texte nettoyé passe à l'affichage. Le tag du 1er fragment n'est donc **plus jamais affiché** (fix dédié).
- **En non-stream** : extraction sur le contenu final ; dans les deux cas `msg["content"]` est mis à jour, donc l'historique sauvegardé (sessions JSON) ne contient jamais le tag.
- Au CLI, `/tts <texte>` applique la même extraction sur le texte saisi.
