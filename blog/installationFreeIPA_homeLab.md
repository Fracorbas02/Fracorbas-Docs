---
slug: homelab-installationFreeIPA
title: "Installation de FreeIPA dans mon home-lab"
authors: [bastien]
tags: [informatique, open-source, Système, Linux, lab]
date: 2026-05-30
last_update:
  date: 2026-05-30
  author: bastien
---

Pour faire suite à mes autres articles, je mets en place ici une solution d'authentification centralisée. Un annuaire open source nommé FreeIPA qui permet de faire tout un tas de chose, u pau à la `Active Directory` de Microsoft.

Ce serveur sera central dans l'authentification sur le réseau, la résolution DNS, la gestion des utilisateurs et des machines.
<!--truncate-->

## Pourquoi FreeIPA
Il existe beaucoup de solutions OpenSource qui permettent de faire office d'annuaire LDAP. Ce protocole a pour objectif d'être une source de vérifé des identités dans la plupart des organisations.
Cela permet plein de chose, notamment une harmonisation des utilisateurs. Au lieu de se retrouver avec le même compte ayant le même identifiant sur chaque ressource interne (et tous indépendant les uns des autres), on se retrouve avec une identité unique qui permet d'aller partout (lorsque le protocole est pris en charge).

L'avantage de FreeIPA est que c'est un outil particulièrement complet avec la possibilité de faire plein de choses :
* Annuaire LDAP
* Résolution DNS (sur un domaine interne ou en tant que serveur de relai)
* PKI afin de gérer des certificats et faire office d'autorité de certification principale
* Authentification sur le réseau via des protocoles comme RADIUS ou kerberos permettant ainsi d'authentifier un utilisateur ou une machine sur le réseau de manière sécurisée en utilisant l'annuaire LDAP

De surctoît, c'est une solution développée par RedHat qui reste une entité reconnue pour la sécurité des solutions qu'ils développent. Et qui d'ailleur sont utilisées mondialement.

## Quel OS utiliser ?
Là dessus, on a plein de solutions différentes. On peut se dire "FreeIPA = RedHat" donc on va aller sur RHEL. Souci, ça reste une solution privée même si on peut avoir des licences pour des environnements restreints (comme des labs).

Je commpte partir sur Fedora qui est en fait l'origine de RHEL. RedHat se base des sources de Fedora pour construire un OS plus restreint / sécurisé afin d'en faire une solution propre à une utilisation professionnelle pouvant remplacer microsoft.
Et donc tous les outils nécessaire seront disponible facilement / nativement dans fedora.

## L'installation
Il faut pour ça aller récupérer sa meilleure iso [fedora server](https://fedoraproject.org/server/download/) et l'envoyer dans proxmox.

Pour ma part, j'ai donc créé mon serveur sur mon bridge `internal` avec le vlan 20 (donc sur le réseau `10.20.20.0/24`)

Une fois le serveur lancé, vous aurez une belle petite interface graphique qui vous permet de tout installer en quelques clics.

:::info apparté
Pour l'administration de mes serveurs qui sont pour le moment sur mon bridge internal, j'ai besoin de me connecter dessus en direct. Dans un monde idéal, on doit utiliser un bastion pour se connecter.

Mais dans mon infra, un simpe 
```bash
sudo ip route add 10.0.0.0/8 dev [l'interface réseau] via 192.168.1.250
```
me permet de me connecter à tous les réseaux de mon bridge `internal`.
:::

:::note
j'ai un souci que je ne comprend toujours pas. Il m'est impossible de me connecter à mon pare-feu sur son interface "WAN" (qui est en réalité sur mon LAN) :
```bash
curl https://192.168.1.250 -k
curl: (35) Recv failure: Connexion ré-initialisée par le correspondant
```
J'ai cherché pas mal de temps sur les trames qui passent et ça donnerait presque l'impression qu'il y a un souci, j'ai tout le temps un ttl à 63 contre 64 pour n'importe quelle autre destination.
je n'ai pas pour le moment trouvé, en tout cas la route que je donne au dessus permet de se connecter sur les interfaces vlan du pare-feu.
Je mettrai ça à jour si jamais je trouve la solution (et ça ne provient pas d'un reply-to ou d'un souci du driver vtnet de freeBSD, j'ai vérifié)
:::

Une fois l'installation terminée, le serveur redémarre et vous pouvez vous connecter avec le compte que vous avez configuré.


