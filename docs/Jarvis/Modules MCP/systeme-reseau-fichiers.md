---
sidebar_position: 1
sidebar_label: Système, réseau, fichiers
title: Serveurs MCP — système, réseau, fichiers, utilitaires
description: "Catalogue détaillé des serveurs MCP de Jarvis (partie 1) : nettools, sysinfo, scan, snmp, lan, docker, files, git, memory, notes, netutils, textutils — outils et garde-fous."
tags: [jarvis, mcp, outils, réseau, système, fichiers, git, docker, snmp]
last_update:
  date: 2026-11-01
  author: bastien
---

# Serveurs MCP — système, réseau, fichiers, utilitaires

Chaque serveur vit dans `mcp_servers/<nom>.py`, est lancé en **sous-processus stdio** par `mcp.py`, et expose ses outils au LLM sous le nom **`« <nom>__<outil> »`**. Config : `[mcp.servers.<nom>] command = [...]` dans `config.toml`.

## `nettools` — diagnostic réseau

Binaires système (`ping`, `dig`, `traceroute`, `whois`, `ss`, `ip`, `openssl`) + urllib.

| Outil | Description |
|---|---|
| `nettools__ping(host, count=4)` | Ping ICMP, sortie brute |
| `nettools__dig(query, record="A", server=None)` | Requête DNS (A, AAAA, MX, TXT, PTR…), résolveur optionnel |
| `nettools__traceroute(host)` | Traceroute |
| `nettools__whois(query)` | WHOIS d'un domaine ou d'une IP |
| `nettools__listening_ports()` | Ports TCP/UDP en écoute (`ss -tulpn`) |
| `nettools__connections()` | Connexions établies (`ss -tnp`) : état, local, distant, processus |
| `nettools__ip_addr()` | Adresses des interfaces + routes (`ip -brief addr`, `ip route`) |
| `nettools__tls_info(host, port=443)` | Chaîne de certificats TLS : émetteur, sujet, dates, SAN |
| `nettools__bandwidth_test(server, duration=10)` | Débit via **iperf3** (client TCP, up+down) — `server` **obligatoire**, aucun serveur public par défaut |
| `nettools__http_get(url, timeout=15, allow_private=False)` | GET HTTP(S) : statut, headers, début du corps — **garde SSRF** (voir [Sécurité](../Noyau/securite-garde-fous.md)) |

Garde-fous : `_check_host` valide toute cible passée à un binaire externe (jamais d'argument commençant par `-`, donc jamais d'option déguisée) ; `_check_url_ssrf` bloque loopback/link-local/privé.

## `sysinfo` — état de la machine

Local uniquement (`/proc`, binaires système).

| Outil | Description |
|---|---|
| `sysinfo__disk_usage(path="/")` | Espace disque utilisé/libre d'un point de montage, en Go |
| `sysinfo__memory()` | RAM + swap (totale, utilisée, disponible) |
| `sysinfo__load()` | Load average 1/5/15 min + nombre de processus |
| `sysinfo__gpu_status()` | `rocm-smi` (AMD) / `nvidia-smi`, sinon sysfs amdgpu : nom, VRAM, température, ventilateur, puissance |
| `sysinfo__temperatures()` | `sensors` (lm-sensors), sinon `/sys/class/thermal` |
| `sysinfo__processes(sort="cpu", limit=10)` | Top processus (cpu ou mem, max 50 lignes) |
| `sysinfo__logs(service, lines=50, since="1h ago")` | Logs systemd d'un service (`journalctl`) |
| `sysinfo__ports_listening()` | Ports en écoute + processus (`ss -tulpn`) |
| `sysinfo__network_interfaces()` | Interfaces, IP, état (`ip addr`, secours `/proc/net/dev`) |
| `sysinfo__services(state="failed")` | Unités systemd (`failed` par défaut, `running`, `all`) |
| `sysinfo__service_status(name)` | `systemctl status` détaillé : actif, uptime, mémoire, processus |
| `sysinfo__smart_disk(device="/dev/sda")` | Santé SMART (`smartctl -a`) |
| `sysinfo__battery()` | Batterie (`/sys/class/power_supply`) : capacité %, état |

## `scan` — scan de ports (nmap)

| Outil | Description |
|---|---|
| `scan__port_scan(target, ports="1-1024", allow_public=False)` | Scan TCP connect (`nmap -sT`) |
| `scan__service_detect(target, ports="1-1024", allow_public=False)` | Détection de versions (`-sV`) sur les ports ouverts |
| `scan__os_detect(target, allow_public=False)` | Empreinte OS (`-O`, souvent besoin des droits root) |

**Garde-fous** : cibles **LAN/localhost uniquement** sauf `allow_public=True` explicite ; plage max **4096 ports**.

## `snmp` — SNMP v2c (net-snmp)

| Outil | Description |
|---|---|
| `snmp__snmp_get(target, oid, community="")` | GET d'un OID |
| `snmp__snmp_walk(target, oid="1.3.6.0.2.1.1", community="")` | WALK sous un OID (défaut : infos système) |
| `snmp__snmp_interfaces(target, community="")` | Interfaces : ifDescr, ifOperStatus, vitesses |

**GET/WALK uniquement** (jamais de SET). Communauté : paramètre ou `JARVIS_SNMP_COMMUNITY`.

## `lan` — découverte LAN

| Outil | Description |
|---|---|
| `lan__arp_table()` | Table ARP locale (`/proc/net/arp`) : IP ↔ MAC + interface |
| `lan__dhcp_leases(path="")` | Baux DHCP actifs (défaut : fichiers standards) — chemin **restreint à `/var/lib` et `/etc/dhcp`** |
| `lan__lan_hosts(subnet="")` | Découverte douce : `arp-scan` si installé, sinon ping sweep (`nmap`/`fping`) — **sous-réseaux privés uniquement** (même politique que `scan`) |

## `docker` — inspection lecture seule

| Outil | Description |
|---|---|
| `docker__containers(all=True)` | `docker ps` : ID, image, commande, statut, ports, noms |
| `docker__container_stats(name)` | Stats temps réel (une mesure, `--no-stream`) : CPU, mémoire, I/O |
| `docker__container_logs(name, lines=100, since="1h")` | Logs (max 500 lignes) |
| `docker__images()` | Images locales : dépôt, tag, taille, date |
| `docker__container_inspect(name)` | Config complète (`docker inspect`) : réseau, volumes, env, healthcheck, limites |
| `docker__disk_usage()` | Espace disque Docker (images, conteneurs, volumes, build cache) |

**Lecture seule** : pas de run/stop/rm/exec. Les noms de conteneurs sont validés (jamais d'argument commençant par `-`).

## `files` — fichiers confinés

| Outil | Description |
|---|---|
| `files__grep_files(pattern, path=".", glob="", context=0)` | Recherche regex via **ripgrep** si dispo (fallback Python), avec contexte |
| `files__read_file(path, offset=0, limit=200)` | Lecture **paginée** (lignes) : retourne la taille totale pour paginer |
| `files__file_info(path)` | Métadonnées : type (`file`), taille, permissions, propriétaire, dates, empreintes **md5/sha256** (< 64 Mo) |
| `files__list_dir(path=".", pattern="")` | Liste d'un répertoire (tailles), filtre `fnmatch` optionnel |

**Lecture seule et confinée** : tout chemin résolu doit tomber dans `JARVIS_FILES_ROOTS` (séparés par `:`, défaut `cwd + $HOME`), sinon erreur. Ex. `export JARVIS_FILES_ROOTS="$HOME:/srv:/var/log"`.

## `git` — dépôt en lecture seule

| Outil | Description |
|---|---|
| `git__git_status()` | Branche, suivi amont, fichiers modifiés/ajoutés/non suivis |
| `git__git_log(n=10)` | N derniers commits (max 50) : hash court, date, auteur, sujet |
| `git__git_diff(what="worktree", path="")` | Diff : `worktree` (défaut), `staged`, ou une ref (`HEAD~3`), path optionnel |
| `git__git_branches()` | Branches locales + distantes, courante marquée |
| `git__git_remotes()` | Remotes (URLs fetch/push) |
| `git__git_show(ref, path="")` | Fichier à une révision (`git show ref:path`) ou détail d'un commit |

Dépôt lu = **cwd au lancement**, ou `JARVIS_GIT_REPO` (chemin absolu). **Aucune commande d'écriture**. Les refs passées à diff/show sont validées : jamais de valeur commençant par `-` (sinon git la lirait comme une option, ex. `--output=<fichier>` qui exécuterait un programme externe via un pager/core.pager).

## `memory` / `notes` — persistance

| Outil | Description |
|---|---|
| `memory__remember(fact)` | Note un fait en mémoire persistante |
| `memory__recall(query="", limit=50)` | Rappelle les faits (filtre texte insensible à la casse ; chaque fait numéroté) |
| `memory__forget(number)` | Supprime le fait n°N du dernier `recall()` |
| `notes__note_add(note, topic="general")` | Ajoute une note horodatée à un sujet (`[a-z0-9_-]`, créé si besoin) |
| `notes__note_list(topic="general", limit=50)` | Notes d'un sujet, de la plus récente à la plus ancienne |
| `notes__note_topics()` | Sujets existants + nombre d'entrées |
| `notes__note_search(query, limit=20)` | Recherche plein texte dans toutes les notes (max 50) |

Stockage : `~/.cache/jarvis/memory.md` (ou `JARVIS_MEMORY_FILE`) et `~/.cache/jarvis/notes/<sujet>.md` (ou `JARVIS_NOTES_DIR`).

## `netutils` / `textutils` — utilitaires purs (stdlib, aucun appel externe)

| Outil | Description |
|---|---|
| `netutils__ip_calc(subnet)` | Découpe un CIDR/IP : réseau, broadcast, masque, nb hôtes, plage… |
| `netutils__ip_convert(ip)` | IP ↔ entier, notation pointillée/binaire |
| `netutils__encode(text, op)` | `b64encode`, `b64decode`, `hexencode`, `hexdecode`, `urlencode`, `urldecode`, `rot13` |
| `netutils__hash_text(text, algo="sha256")` | md5, sha1, sha256, sha512, sha3_256 |
| `netutils__time_now(tz="Europe/Paris")` | Heure actuelle dans un fuseau |
| `netutils__time_convert(epoch, tz="Europe/Paris")` | Timestamp Unix → date lisible locale + UTC |
| `textutils__diff(a, b, from_name, to_name)` | Diff unifié (`diff -u`) entre deux textes |
| `textutils__json_query(json_text, path="")` | Extraction par chemin simple `a.b[0].c` (vide = tout) |
| `textutils__regex_test(pattern, text, flags="")` | Teste une regex Python : nb de matchs + groupes de chaque match |
| `textutils__unit_convert(value, from_unit, to_unit)` | Conversions **même dimension obligatoire** : tailles (o/ko/mo/go/to), débits, durées, températures — refuse les conversions inter-dimensions (s → go) |

→ Partie 2 (veille sécurité + web) : [MCP — veille sécurité et web](../Modules%20MCP/veille-securite-web.md)
