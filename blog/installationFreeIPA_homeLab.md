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
