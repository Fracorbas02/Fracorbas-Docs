---
sidebar_position: 2
sidebar_label: Rendu Markdown
title: Rendu Markdown dans l'app GTK
description: Les deux moteurs de rendu des réponses dans l'app GTK4 — parseur CommonMark+GFM maison vers widgets GTK natifs (défaut, stable) et markdown-it-py + WebKitGTK (JARVIS_WEBKIT=1, expérimental) — et la garde SSRF appliquée aux images.
tags: [jarvis, gtk4, markdown, commonmark, gfm, webkit, markdown-it-py, ssrf]
last_update:
  date: 2026-11-01
  author: bastien
---

# Rendu Markdown dans l'app GTK

Les réponses streamées de l'agent sont du Markdown ; l'app GTK4 dispose de **deux moteurs de rendu**, le natif étant le défaut.

## Moteur par défaut — widgets GTK natifs (`gtk/markdown.py` + `gtk/markdown_lib.py` + `gtk/widgets.py`)

Un **parseur CommonMark + GFM maison** produit des widgets GTK natifs, re-rendu **à chaque fragment** du streaming :

- titres (H1-H6), **gras**, *italique*, `code` inline, ~~barré~~ ;
- liens **cliquables** (linkify), images ;
- listes à puces, numérotées, **à tâches** (`- [ ]` / `- [x]`) ;
- citations (`>`), séparateurs (`---`) ;
- **tableaux** GFM : le `Gtk.Grid` tient dans la bulle (**pas de scrollbar horizontale**, policy NEVER), les cellules longues wrappent ; alignement via `xalign` (texte) et non `halign` (widget, sans effet) ; bordures posées sur le conteneur + right/bottom par cellule (plus de doublons) ; scroll vertical AUTOMATIC avec `propagate_natural_height` pour éviter le warning GTK « Trying to measure MessageBox … needs at least N » en boucle ;
- blocs de code ` ``` ` avec langage : scroll horizontal AUTOMATIC + `propagate_natural_height` (même garde contre le warning de mesure) ;
- footnotes ;
- **lignes d'outils** `⚡`/`✓`/`✗` toujours visibles, intercalées dans le flux (voir [App GTK4](./app-gtk.md)) ; clic = déplie le résultat ; plus d'`Adw.ExpanderRow` dans un `Gtk.Box` (warning GTK), le raisonnement est placé dans un `Gtk.ListBox`.

**Parseur — règles corrigées** (`gtk/markdown.py`, `gtk/markdown_lib.py`) :

- maths `$...$` / `$$...$$` : règles pandoc (pas d'espace autour, `$` fermant non suivi d'un chiffre) — « 5$ et 3$ », « $HOME et $PATH » ne sont plus pris pour des maths ;
- titre ATX : la séquence de fermeture `#...` exige un espace avant — « ## C# » garde son `#` final ;
- `__`/`___` intra-mot (`a__b__c`) ne sont plus rendus en gras, comme `_` ;
- les lignes de continuation indentées d'un item de liste (fence, tableau, citation…) sont **rassemblées avant** le parsing, sinon un bloc multi-lignes dans une liste était découpé ligne par ligne.

Avantages : stable, pas de dépendance système lourde, les réponses restent **sélectionnables/copiables** (y compris les tableaux). Les images embarquées passent par la **garde SSRF** de `netguard.check_url_ssrf` (loopback/link-local/privé refusés — un LLM peut peupler le Markdown de n'importe quelle URL).

## Moteur expérimental — WebKitGTK (`JARVIS_WEBKIT=1`)

Avec `JARVIS_WEBKIT=1` **et** WebKitGTK 6.0 installé (`webkit2gtk-6.0` / `gir1.2-webkit-6.0` / `webkitgtk6.0` selon la distribution), les réponses passent en **HTML complet** (`markdown-it-py[plugins]`) dans une WebView. Si WebKit échoue (absent, sandbox…), **repli automatique** sur le rendu natif (log stderr « webview KO »).

Dépendances système (non installées par uv/pip) :

```sh
# Arch :        sudo pacman -S webkit2gtk-6.0
# Debian/Ubuntu: sudo apt install gir1.2-webkit-6.0
# Fedora :      sudo dnf install webkitgtk6.0
```

## Côté CLI

La TUI (`tui.py`, `rich`) rend le Markdown dans un panneau **en live** : repaint manuel throttlé (~15 Hz, reparse à chaque fragment, `_LiveRegion` déterministe sans thread), la version finale restant affichée. Le raisonnement est dans un panneau grisé séparé, replié en une ligne à la fin (`/thinking` pour le revoir).
