---
slug: Rust-cheatsheet
title: Cheatsheet langage Rust
authors: [bastien]
tags: [informatique]
date: 2026-02-05
last_update:
  date: 2026-02-05
  author: bastien
---
:::warning[Information]
Article toujours en cours de rédaction
:::
# Pourquoi Rust
J'ai pu précédemment faire une petite [cheatsheet sur le langage C](/blog/Cheatsheet-du-langage-C). C'est un langage très permissif mais surtout très minutieu. Chaque action que l'on réalise a un réel impact sur toute la stack processeur qui traite nos demande. Chaque type de variable doit être utilisé dans l'objectif de manier la mémoire avec une grande précision.
<!-- truncate -->
Cependant, cette liberté accordée ajoute une complexité non négligeable au code produit et ajoute une charge mentale supplémentaire. RUST provient de ce constat et vise principalement à faciliter la vie des développeurs avec une vision basée sur une amélioration de la performance et une gestion de la mémoire plus sécurisée.

Comme pour le langage C, j'utilise la plateforme Coddy pour apprendre ce langage et écrire cet article.

# RUST

Pour commencer un programme dans ce langage, il est nécessaire d'utiliser le point d'entrée. Ce point d'entrée est défini par la fonction `main` défini comme cela :
```rust title="Fonction point d'entrée en RUST"
fn main() {
	.... some code
}
```
