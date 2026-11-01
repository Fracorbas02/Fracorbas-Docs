---
sidebar_position: 2
sidebar_label: Agent et client LLM
title: Agent (boucle tool-calling) et client LLM
description: Détail d'agent.py (tour, outils internes, gestion d'erreurs), de llm.py (streaming SSE, réassemblage des tool_calls) et du choix de garder le thinking visible.
tags: [jarvis, agent, llm, streaming, sse, tool-calling, llama.cpp]
last_update:
  date: 2026-11-01
  author: bastien
---

# Agent et client LLM

## `llm.py` — client OpenAI-compatible (httpx)

Un client minimal, volontairement sans SDK OpenAI : le format Mistral tool-calling est fragile à travers les couches d'abstraction, on garde le contrôle total du format.

```python
LLMClient(base_url, model, api_key="local", temperature=0.3,
          max_tokens=4096, timeout=300.0, chat_template_kwargs={})
```

- `POST {base_url}/chat/completions` avec `{model, messages, temperature, max_tokens, stream?, tools?, tool_choice: "auto", chat_template_kwargs?}`.
- **Non-stream** : un POST, `choices[0].message` normalisé en `{"role": "assistant", "content": ..., "tool_calls"?}` (`tool_calls` absent plutôt que `null`, message directement réinsérable dans l'historique).
- **Stream** : parsing SSE manuel (`data: {...}` jusqu'à `[DONE]`) :
  - `delta.reasoning_content` → callback `on_reasoning` (le thinking en direct) ;
  - `delta.content` → callback `on_content` (la réponse en direct) ;
  - `delta.tool_calls` **fragmentés** → réassemblés par `index` (`id`, `function.name` et `function.arguments` concaténés morceau par morceau).
- Erreurs : `LLMError` sur HTTP != 200 (corps tronqué à 2000 car.) ou sur `chunk.error` dans le flux.

## `agent.py` — la boucle tool-calling

```python
reply, history, trace = await agent.turn(
    history, user_text,
    on_tool_call=..., on_tool_result=...,   # (name, args) puis (name, args, ok, durée, résultat)
    on_reasoning=..., on_content=...,        # fragments en streaming
    on_llm_end=...,                          # fin d'une réponse LLM (utile pour replier le thinking)
)
```

Déroulement d'un tour :

1. Le `system_prompt` est inséré en tête si absent.
2. **Compaction auto** si l'usage du contexte approche de la saturation (voir [Gestion du contexte](../Noyau/contexte-compactage.md)).
3. Le message user est ajouté ; la **note d'usage du contexte** est injectée dans le system prompt.
4. Boucle (max `max_iterations` = 8) : appel LLM streamé → s'il y a des `tool_calls`, chacun est exécuté (MCP ou outil interne), le résultat est injecté en `{"role": "tool", "tool_call_id": ..., "content": ...}`, et on repart. Sinon la réponse finale est retournée.
5. `TurnTrace` : `tool_calls: [(nom, args_json)]`, `iterations`, `error`, `tts_tags`, plus les **métriques d'usage réelles** remontées par le serveur : `prompt_tokens` et `completion_tokens` (somme sur toutes les itérations du tour, via le champ `usage` de la réponse — `0` si le serveur ne le renvoie pas, auquel cas l'UI retombe sur l'estimation ~4 car/tok) et `gen_seconds` (temps passé dans les appels LLM seuls, hors exécution des outils). Le client demande l'usage en streaming via `stream_options: {"include_usage": true}` et lit le chunk final `usage` (qui n'a pas de `choices`).

### Outils internes (hors MCP)

Exposés au modèle comme des outils classiques (schéma de paramètres vide) :

| Outil | Rôle |
|---|---|
| `jarvis__compact` | Remplace l'historique par un résumé produit par le LLM lui-même — appelé par le modèle quand il voit la note d'usage, ou automatiquement par l'agent (seuil 75 %) |
| `jarvis__voice_tone` | Le modèle fixe explicitement le ton de la voix lue (`{"emotion": "excited", "pace": "fast"}`) → enregistré dans `trace.tts_tags`, envoyé au TTS uniquement, jamais affiché (voir [Émotions TTS](../Voix/emotions-tts.md)) |

### Robustesse

- **Outil en erreur** (serveur MCP mort, timeout, args JSON invalides) : le tour ne meurt pas, le modèle reçoit `"ERREUR: <Type>: <message>"` comme résultat d'outil et peut réagir. Le nom de l'outil seul est logué en INFO (les args peuvent contenir des secrets — communauté SNMP, tokens — et le log fichier est en DEBUG).
- **Tool call tronqué** (contexte plein : llama-server coupe les arguments JSON → HTTP 500 « Failed to parse tool call arguments ») : l'agent **compacte l'historique et réessaie une seule fois**, en réinjectant le message user.
- Le statut `ok` d'un outil ne se déduit **pas** du contenu : un outil qui réussit peut renvoyer un texte commençant par « ERREUR » (ex. whois sur un domaine inconnu). Seule une exception (ou des args JSON invalides) = échec.

### Le tag `[emotion=..]` filtré à la source en streaming

En streaming, le tag Voxtral en tête de réponse ne doit **jamais** être affiché — même dans le tout premier fragment. `Agent.turn` enveloppe donc `on_content` d'un filtre : le premier fragment est bufferisé, `extract_lead_tags()` en extrait les tags (→ `trace.tts_tags`, envoyés au TTS) et ne laisse passer que le texte nettoyé. En non-stream, le strip se fait sur le contenu final. Dans les deux cas, `msg["content"]` est mis à jour : le tag est retiré de l'affichage **et de l'historique sauvegardé**.

## Garder le thinking visible

À ~24 tok/s, une réponse longue avec raisonnement peut prendre plus d'une minute. Le choix assumé : **garder le thinking et le rendre visible** — la TUI streame `delta.reasoning_content` dans un panneau grisé pendant la génération, le replie en une ligne (durée, tokens) à la fin, puis rend la réponse en Markdown dans un panneau en direct. L'équivalent du « je réfléchis… » de Le Chat, sauf que c'est la vraie pensée, en direct. Pour la couper au profit de la latence pure :

```toml
[llm]
chat_template_kwargs = { enable_thinking = false }
```

En boucle vocale, le raisonnement ne sera jamais parlé : il servira à décider si la réponse vaut l'attente, et à annoncer des étapes (« je consulte NVD… ») pendant que le TTS attend le premier token de contenu.
