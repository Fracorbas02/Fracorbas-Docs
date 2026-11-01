---
sidebar_position: 2
sidebar_label: Veille sécurité et web
title: Serveurs MCP — veille sécurité et web
description: "Catalogue détaillé des serveurs MCP de Jarvis (partie 2) : cve (NVD), kev (CISA), epss (FIRST), ghsa (GitHub), exploitdb, fetch, rss, echo — API, clés optionnelles et garde-fous."
tags: [jarvis, mcp, cve, kev, epss, ghsa, exploitdb, veille, sécurité, ssrf, rss]
last_update:
  date: 2026-11-01
  author: bastien
---

# Serveurs MCP — veille sécurité et web

## `cve` — API NVD 2.0 (stdlib uniquement)

| Outil | Description |
|---|---|
| `cve__cve_info(cve_id)` | Détails complets d'une CVE (ex. `CVE-2024-3094`) : description, score CVSS + vecteur (v3.1 > v3.0 > v2, label déduit pour la v2), CWE, produits affectés (CPE), références, dates |
| `cve__search_cve(keywords, limit=10, days=0)` | Recherche par mots-clés (produit, éditeur, technologie), triée de la plus récente ; `days` = fenêtre glissante en jours (max 120) — **« récentes » = passer `days` ici** |
| `cve__latest_cve(days=7, limit=20)` | CVEs publiées sur les N derniers jours (max 120), veille quotidienne globale |

- **Sans clé API** : throttling intégré côté serveur, **5 requêtes / 30 s**.
- **Clé gratuite** (50 req/30 s) : https://nvd.nist.gov/developers/request-key puis `export NVD_API_KEY=...` avant de lancer jarvis.

## `kev` — CISA Known Exploited Vulnerabilities (sans clé)

Catalogue public des CVE **exploitées activement**.

| Outil | Description |
|---|---|
| `kev__kev_recent(days=30, limit=20)` | Entrées ajoutées sur les N derniers jours (max 365), de la plus récente |
| `kev__kev_search(query, limit=20)` | Recherche (éditeur, produit, nom, CVE) |
| `kev__kev_info(cve_id)` | Détail : éditeur/produit, action requise (`requiredAction`), échéance (`dueDate`), usage ransomware, CWE, notes |

## `epss` — FIRST EPSS (sans clé, `FIRST_API_KEY` optionnel)

Score de **probabilité d'exploitation à 30 jours**.

| Outil | Description |
|---|---|
| `epss__epss_score(cves)` | Score EPSS (0-1) + percentile pour une **liste** de CVEs (ex. `"CVE-2024-3094,CVE-2021-44228"`), trié du plus exploitable au moins |
| `epss__epss_history(cve, days=30)` | Historique du score sur N jours (max 90, `scope=time-series`) — voir si une CVE « monte en flèche » |

Sans clé : ~300 req/min ; avec `export FIRST_API_KEY=...` : plus de débit.

## `ghsa` — GitHub Security Advisories (API REST publique)

| Outil | Description |
|---|---|
| `ghsa__ghsa_search(query, ecosystem="", limit=20)` | Recherche d'advisories (texte libre, CVE…) par écosystème optionnel |
| `ghsa__ghsa_for_package(package, ecosystem="npm", limit=20)` | Advisories d'un **package précis** — dépendances d'un projet (npm, PyPI, Go, Maven, Cargo, NuGet…) |
| `ghsa__ghsa_info(ghsa_id)` | Détail : GHSA/CVE, sévérité, CVSS, packages et versions affectées, versions corrigées (`patched`), références, date |

Sans token : **60 req/h** ; avec `export GITHUB_TOKEN=ghp_...` : 5000 req/h.

## `exploitdb` — Exploit-DB (lecture seule)

| Outil | Description |
|---|---|
| `exploitdb__exploit_search(query, limit=20)` | Recherche d'exploits publics (produit/CVE/mot-clé) : `searchsploit` **local** si installé, sinon API JSON d'exploit-db.com |
| `exploitdb__exploit_info(edb_id)` | Métadonnées d'un exploit par son ID EDB (ex. `49757`) : titre, auteur, date, plateforme, type, chemin du PoC local |

## `fetch` — récupération de pages web (garde SSRF)

| Outil | Description |
|---|---|
| `fetch__fetch_page(url, max_chars=20000, allow_private=False)` | Télécharge une page http(s) et renvoie son **texte lisible** (HTML → texte brut) — pour faire lire/résumer une doc ou un article par le LLM |
| `fetch__fetch_headers(url)` | En-têtes HTTP (HEAD si possible, GET sinon) : statut, serveur, content-type, redirections… |

**Garde SSRF stricte** (`_check_url` + `netguard.check_url_ssrf`) : http(s) uniquement ; **toutes les IP résolues** sont vérifiées (anti DNS-rebinding) ; loopback, link-local (`169.254.169.254` — métadonnées cloud), non routable et multicast **toujours refusés** ; IP privées refusées sauf `allow_private=True`. Override de test uniquement : `JARVIS_FETCH_ALLOW_PRIVATE=1` (désactive les contrôles d'IP, jamais la vérification de schéma).

## `rss` — flux RSS 2.0 + Atom (stdlib, garde SSRF)

| Outil | Description |
|---|---|
| `rss__rss_latest(feed_url, n=10)` | N derniers articles (max 50) : titre, date, lien, résumé |
| `rss__rss_check(feed_url)` | Vérifie qu'un flux répond : titre du site, langue, nombre d'articles |

Même garde SSRF que `fetch`.

## `echo` — test du harnais

| Outil | Description |
|---|---|
| `echo__ping(target)` | Répond `pong` vers la cible — **uniquement pour tester le harnais** sans LLM réel ni outils réseau (`tests/test_agent.py` l'utilise avec un mock LLM) |

## Chaîne de confiance des secrets

Les serveurs MCP reçoivent **l'environnement complet** du processus jarvis (`mcp.py` : `env={**os.environ}`), donc `NVD_API_KEY`, `FIRST_API_KEY`, `GITHUB_TOKEN`, `JARVIS_*` leur parviennent. Côté journalisation : seuls les **noms** d'outils sont logués en INFO (jamais les args, qui peuvent contenir des secrets) ; le log fichier DEBUG (`~/.cache/jarvis/jarvis.log`) ne reçoit jamais le corps des réponses HTTP en erreur TTS, et `server.py` ne loggue que les variables GPU modifiées, jamais `os.environ` complet.
