---
sidebar_position: 10
sidebar_label: Sécurité et garde-fous
title: Sécurité et garde-fous de Jarvis
description: Tous les mécanismes de confinement de Jarvis — garde SSRF (netguard), confinement fichiers, règles par serveur MCP (scan/lan/snmp/docker/git), anti-injection d'options, protection du terminal, hygiène des secrets et des logs.
tags: [jarvis, sécurité, ssrf, confinement, mcp, injection, secrets, logs]
last_update:
  date: 2026-11-01
  author: bastien
---

# Sécurité et garde-fous

Jarvis fait exécuter des commandes et des requêtes **pilotées par un LLM** : chaque serveur MCP embarque donc ses propres garde-fous. Voici l'inventaire complet.

## Garde SSRF partagée (`netguard.py`)

Utilisée par `fetch`, `rss`, `nettools.http_get` — et par le rendu des **images Markdown dans l'app GTK** (qu'un LLM peut peupler de n'importe quelle URL) :

```python
check_url_ssrf(url, allow_private=False) -> str | None   # None = OK, sinon message d'erreur
```

Politique :

- Schéma **http(s) obligatoire** (jamais `file:`, `gopher:`, etc.).
- Hôte résolu via `socket.getaddrinfo` : **toutes les IP résolues** sont vérifiées (anti DNS-rebinding simple).
- **Toujours refusés** : loopback, link-local (`169.254.169.254` — métadonnées cloud AWS/GCP/Azure), non routable (`0.0.0.0`), multicast.
- **IP privées refusées** sauf `allow_private=True` explicite par appel.
- Override de test uniquement : `JARVIS_FETCH_ALLOW_PRIVATE=1` désactive les contrôles d'IP (jamais la vérification de schéma).

## Anti-injection d'options dans les sous-processus

Toute entrée passée à un sous-processus en **argument positionnel** doit commencer par un caractère **alphanumérique** — jamais de `-x` en première position, donc jamais d'option déguisée. Appliqué à :

- `nettools._check_host` (hôtes passés à ping/dig/traceroute/whois…) ;
- `git._check_ref` (refs passées à `git diff`/`git show` — sinon `git` lirait `--output=<fichier>` comme une option, et un pager/`core.pager` exécuterait un programme externe) ;
- `docker._check_name` (noms de conteneurs).

## Règles par serveur MCP

| Serveur | Garde-fou |
|---|---|
| `files` | **Lecture seule et confinée** : le chemin résolu doit tomber dans `JARVIS_FILES_ROOTS` (défaut `cwd:$HOME`), sinon erreur |
| `git` | **Lecture seule** : status/log/diff/branches/remotes/show uniquement — aucune commande d'écriture |
| `docker` | **Lecture seule** : ps/stats/logs/images/inspect/system df — pas de run/stop/rm/exec |
| `scan` | Cibles **LAN/localhost uniquement** sauf `allow_public=True` ; plage max **4096 ports** |
| `lan` | `lan_hosts` refuse les sous-réseaux **non privés** ; `dhcp_leases` n'accepte que des chemins sous **`/var/lib`** et **`/etc/dhcp`** |
| `snmp` | **GET/WALK uniquement** (jamais de SET) |
| `nettools.http_get`, `fetch`, `rss` | Garde SSRF ci-dessus |
| `textutils.unit_convert` | Refuse les conversions **inter-dimensions** (s → go) |
| `mcp_servers` (tous) | Args de sous-process jamais en position d'option (voir ci-dessus) |

## Exposition réseau du llama-server (`server.py`)

Quand Jarvis lance lui-même le llama-server, un **host non-loopback est refusé** : sans clé API, llama-server serait exposé sur le réseau avec CORS ouvert (son propre log le prévient : « no API key is set and CORS allows all origins »). Override explicite et conscient : `JARVIS_ALLOW_PUBLIC_LLM=1`. `stop_server()` ne tue que le processus **géré par Jarvis**, jamais un serveur externe.

## Protection du terminal (`ttyguard.py`)

`install()` sauvegarde les termios de stdin à l'entrée de l'app et les restaure : à la sortie du process (`atexit`), sur `SIGTERM`/`SIGINT` (re-émis ensuite avec le handler par défaut), et via `restore_stdin()` dans le `finally` du point d'entrée. Un crash ne laisse jamais le shell en mode brut (plus d'echo).

## Hygiène des secrets et des logs

- **Clé API Mistral** : jamais dans `config.toml` — dans `~/.config/jarvis/mistral.json` (**chmod 0600**), ou `MISTRAL_API_KEY` en env (qui prime sur le fichier). Jamais affichée, jamais écrite en log ; les messages d'erreur TTS ne contiennent **jamais** le corps des réponses HTTP.
- **Logs** : `~/.cache/jarvis/jarvis.log` en DEBUG contient le détail, mais : seuls les **noms** d'outils sont logués (pas les args — communauté SNMP, tokens…) ; `server.py` ne loggue que les variables **GPU modifiées**, jamais `os.environ` complet (sinon `NVD_API_KEY`/`GITHUB_TOKEN`/`MISTRAL_API_KEY` y finiraient en clair).
- **Sessions** : écriture atomique (`.tmp` + `replace`) ; le `sid` est validé (pas de `/`, `\`, `..`) contre le path traversal.

## Tests de sécurité dédiés

`tests/` couvre ces garde-fous : `test_mcp_injection.py` (injection d'options dans les args de sous-processus), `test_mcp_servers.py` / `test_mcp_servers_extra.py` (garde SSRF de fetch/rss/http_get, confinement de `files`, règles scan/lan/snmp), `test_audit_fixes.py` / `test_bugfix_audit.py` (audits de durcissement), `test_tty_guard.py` (restauration termios sur signaux et pty de test).
