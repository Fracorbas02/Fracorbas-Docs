---
slug: Rust-cheatsheet
title: Cheatsheet langage Rust
authors: [bastien]
tags: [cheatsheet, informatique]
date: 2026-02-05
last_update:
  date: 2026-05-18
  author: bastien
---
:::warning[Information]
Article toujours en cours de rédaction
:::

## Pourquoi Rust

J'ai pu précédemment faire une petite [cheatsheet sur le langage C](/blog/Cheatsheet-du-langage-C). C'est un langage très permissif mais surtout très minutieux. Chaque action que l'on réalise a un réel impact sur toute la stack processeur qui traite nos demandes. Chaque type de variable doit être utilisé dans l'objectif de manier la mémoire avec une grande précision.
<!-- truncate -->

Cependant, cette liberté accordée ajoute une complexité non négligeable au code produit et ajoute une charge mentale supplémentaire. Rust provient de ce constat et vise principalement à faciliter la vie des développeurs avec une vision basée sur une amélioration de la performance et une gestion de la mémoire plus sécurisée.

Comme pour le langage C, j'utilise la plateforme [Coddy](https://coddy.tech) pour apprendre ce langage et écrire cet article.

:::tip[Information]
Là où le C te laisse faire à peu près tout ce que tu veux (y compris des bêtises), Rust te tient la main au moment de la compilation. Si ton programme compile, il y a de très fortes chances qu'il fonctionne correctement à l'exécution — c'est ce qu'on appelle la sécurité mémoire garantie par le compilateur.
:::

## Démarrage

### Le point d'entrée

Pour commencer un programme en Rust, il est nécessaire d'utiliser un point d'entrée. Ce dernier est défini par la fonction `main` :

```rust title="Fonction point d'entrée en Rust"
fn main() {
    // votre code ici
}
```

### Les commentaires

Pour effectuer des commentaires, il est possible d'utiliser deux méthodes différentes :

```rust title="Commentaire sur une ligne"
fn main() {
    // Ceci est un commentaire sur une seule ligne
    println!("Hello, world!"); // Et en voici un autre 
}
```

```rust title="Commentaire sur plusieurs lignes"
fn main() {
    /*
    Ceci est un commentaire sur plusieurs lignes
    Il peut s'étendre sur autant de lignes que nécessaire
    */
    println!("Hello, world!");
}
```

:::tip[Documentation]
Rust dispose aussi de commentaires de documentation avec `///` (pour documenter ce qui suit) et `//!` (pour documenter l'élément englobant). Ils sont utilisés par l'outil `rustdoc` pour générer automatiquement la documentation du projet.
:::

## Les variables

### Déclaration et immutabilité

C'est probablement la première grande différence avec le C : **par défaut, les variables sont immuables en Rust**. Cela signifie qu'une fois une valeur attribuée à une variable, elle ne peut plus être modifiée.

```rust title="Variable immuable (par défaut)"
let x = 5;
// x = 6; // ❌ Erreur de compilation
```

Pour rendre une variable modifiable, il faut explicitement utiliser le mot-clé `mut` :

```rust title="Variable mutable"
let mut x = 5;
x = 6; // ✅ Fonctionne
```

:::tip[Pourquoi]
Cette contrainte n'est pas là pour embêter le développeur. Elle permet au compilateur de garantir qu'une donnée ne sera pas modifiée par erreur, ce qui élimine toute une catégorie de bugs (et facilite la programmation concurrente).
:::

### Les types de données
:::tip[Information]
Malgré ce qui est marqué en dessous, le compilateur RUST peut automatiquement déduire le type de la variable en fonction de ce qu'on lui donne comme valeur.
Cela permet de rendre le code plus simple à lire, mais il faut bien garder à l'esprit le type de chaque variable.
:::
Rust est un langage à typage statique : chaque variable a un type connu à la compilation. Le compilateur peut souvent l'inférer, mais on peut aussi le spécifier explicitement.

|Type|Signification|Taille (en octet)|Plage de valeur|
|-|-|-|-|
|`i8`|Entier signé 8 bits|1|-128 à 127|
|`u8`|Entier non signé 8 bits|1|0 à 255|
|`i16`|Entier signé 16 bits|2|-32 768 à 32 767|
|`u16`|Entier non signé 16 bits|2|0 à 65 535|
|`i32`|Entier signé 32 bits (défaut)|4|-2 147 483 648 à 2 147 483 647|
|`u32`|Entier non signé 32 bits|4|0 à 4 294 967 295|
|`i64`|Entier signé 64 bits|8|≈ ±9.2 × 10¹⁸|
|`u64`|Entier non signé 64 bits|8|0 à ≈ 1.8 × 10¹⁹|
|`isize`|Entier signé taille pointeur|4 ou 8|Dépend de l'architecture|
|`usize`|Entier non signé taille pointeur|4 ou 8|Dépend de l'architecture|
|`f32`|Flottant simple précision|4|≈ ±3.4 × 10³⁸|
|`f64`|Flottant double précision (défaut)|8|≈ ±1.8 × 10³⁰⁸|
|`bool`|Booléen|1|`true` ou `false`|
|`char`|Caractère Unicode (sur 4 octets !)|4|Tout point de code Unicode. Déclaré avec `''`|
|`&str`|Tranche de chaîne (référence)|—|Chaîne immuable|
|`String`|Chaîne de caractères allouée|—|Chaîne modifiable. Déclaré avec `""`|

```rust title="Déclaration de variables typées"
let entier: i32 = 42;
let flottant: f64 = 3.14;
let booleen: bool = true;
let caractere: char = 'A';
let texte: &str = "Hello";
```

:::tip[char en Rust]
Contrairement au C où `char` fait 1 octet et représente un caractère ASCII, le `char` de Rust fait 4 octets et peut représenter n'importe quel caractère Unicode (lettres accentuées, émojis, idéogrammes…).
:::
### Gestion des string
La distinction est tout de même importante à faire, car faire : 
```rust
let s1 = "This is a string";
```
Revient à définir ce qui s'appelle un `string slice` qui est de type `&str`. C'est une chaîne immuable qui est stockée dasn le binaire compilé. Donc cette variable vit aussi longtemps que le programme (ou son scope) vit.
Pour le convertir en `String`, il faut manuellement **allouer** la mémoire dynamiquement pour stocker une copie modifiable de la chaîne initialement immuable :
```rust title="conversion d'un &str vers un String"
let s1 = "This is a string";
let s2: String = s1.to_string();
```
Ou le faire en une ligne : 
```rust
let s1: String = "Text".to_string();
```

#### Déclaration de String
Il y a d'autres méthodes pour directement déclarer une variable de type `String` :

1. avec `String::new();` :
```rust
let mut s = String::new();  // Capacité = 0
s.push_str("Hello");        // Alloue automatiquement si nécessaire
s.push('!');                // Ajoute un caractère Unicode
println!("{}", s);          // "Hello!"
```
2. Avec `String::with_capacity(n)` pour déclarer manuellement la taille alloué au String :
```rust
// Préalocation pour éviter les réallocations
let mut s = String::with_capacity(20);
s.push_str("Rust est génial");
println!("Capacité: {}, Longueur: {}", s.capacity(), s.len());  // 20, 15
```
3. pour la blague, directement depuis des octets :
```rust
let bytes = vec![72, 101, 108, 108, 111];  // "Hello" en ASCII
let s = String::from_utf8(bytes).unwrap();  // "Hello"
```

### Les booleens
ça ne change pas de ce que l'on a l'habitude de voir. Ces variables ne peuvent être que dans deux états : `false` ou `true`.

Elles se déclarent de cette manière : 
```rust title="déclaration de booleens"
let variable_true: bool = true;
let variable_false: bool = false;
```

### Les variables mutable
Comme on a vu, par défaut en rust, toutes les variables sont immuables, elles ne peuvent pas se voir attribuer une autre valeur. Sauf si on spécifie manuellement que la variable est mutable : 
```rust title="déclaration de variable mutable"
let x = 5; // x est immuable
let mut y = 10; // y est mutable
```
### Conversion de type


En Rust, il n'existe **pas** de conversion implicite entre types numériques, contrairement au C. Toute conversion doit être explicite à l'aide du mot-clé `as`.

```rust title="Conversion explicite avec as"
let entier: i32 = 10;
let flottant: f64 = entier as f64;

let prix: f32 = 45.95;
let prix_arrondi: i32 = prix as i32; // 45 (troncature)

let lettre: char = 'A';
let valeur_ascii: u32 = lettre as u32; // 65
```

:::warning[Attention aux pertes]
La conversion `as` peut tronquer ou faire perdre de l'information sans avertissement (passage de `f64` à `i32`, dépassement de capacité…). Pour des conversions sûres, on préfère utiliser `From`, `Into` ou `TryFrom` que je détaillerai dans un article plus avancé.
:::

### Les constantes

Les constantes diffèrent des variables immuables : leur type doit être annoté, elles peuvent être déclarées dans n'importe quel scope (y compris global), et leur valeur doit être connue à la compilation.

```rust title="Déclaration d'une constante"
const MAX_POINTS: u32 = 100_000;
```

:::tip[Convention]
Par convention, les constantes sont écrites en `SCREAMING_SNAKE_CASE`. Et le `_` dans les nombres est purement esthétique : il aide à la lisibilité (comme un séparateur de milliers).
:::

### Le shadowing

Rust permet de "redéclarer" une variable avec le même nom. La précédente est alors masquée par la nouvelle. Cela permet, entre autres, de changer le type d'une variable.

On peut faire cela en définissant des variables au sein de leur propre "scope". En Rust, le scope est défini par les `{}`, une variable ne vit qu'entre ces accolades. Le shadowing permet en définissant un nouveau scope de modifier temporairement la variable initiale
```rust title="Shadowing"
fn main() {
    let x: i32 = 5;
    println!("x is: {x}");       // Ici x vaut 5
    {
        let x = x + 3;           // On déclare la même variable, mais cette fois-ci dans un autre scope
        println!("x is: {x}");   // Ici x vaut 8
    }
    println!("x is: {x}");       // Ici c vaut 5
}
```
:::warning[Attention]
Lorsque l'on déclare une variable masquée, on ne peut pas la déclarer avec les raccourcis tels que `+=`
Dans le code au dessus, si on déclarait le x masquée en faisant `let x += 3`, le compilateur donnerait une erreur :
```
> error: can't reassign to an uninitialized variable
```
:::
:::tip[Différence avec mut]
Le shadowing n'est pas équivalent à `mut`. Avec `mut`, on modifie la même variable (et on ne peut pas changer son type). Avec le shadowing, on en crée une nouvelle qui réutilise le même nom.
:::

#### L'indépendance des variables masquée
Tout comme une variable conventionnelle, lorsque l'on déclare une variable masquée, on doit également définir son type et ses caractéristiques.

Cette variable masquée n'hérite pas des propriétés de mutation de sa variable mère. Il faut manuellement le repréciser
```rust
let mut x: i32 = 10;
{
	let x: i32 = 15;
	let x = 10; // Erreur, la variable masquée n'est pas mutable
	print!("{x}");
}
```
Cela devrait vous donner :
```rust
error[E0384]: cannot assign twice to immutable variable `x`
 --> main.rs:5:6
  |
4 |         let x: i32 = 15;
  |             - first assignment to `x`
5 |         x += 10; // Erreur, la variable masquée n'est pas mutable
  |         ^^^^^^^ cannot assign twice to immutable variable
```


## Les opérateurs

### Opérateurs d'affectation

Comme en C, on retrouve l'opérateur d'affectation simple `=` ainsi que les opérateurs composés (qui ne fonctionnent que sur les variables marquées `mut`).

* `=` : affectation simple
* `+=` : ajoute puis affecte
* `-=` : soustrait et affecte
* `*=` : multiplie et affecte
* `/=` : divise et affecte
* `%=` : effectue un modulo et affecte

```rust title="Exemple d'affectation"
let mut a = 5;
a += 3; // a contient maintenant 8
```

### Opérateurs relationnels

Ces opérateurs servent à comparer deux opérandes. Ils retournent un `bool` (`true` ou `false`), et **non un entier** comme en C.

|Opérateur|Signification|Exemple|
|--------------------|--------------------|--------------------|
|`==`|Égal|`1 == 2` retourne `false`|
|`!=`|Pas égal|`1 ! = 2` retourne `true`|
|`>`|Plus grand que|`1 > 2` retourne `false`|
|`<`|Plus petit que|`1 < 2` retourne `true`|
|`>=`|Plus grand ou égal|`1 >= 2` retourne `false`|
|`<=`|Plus petit ou égal|`1 <= 2` retourne `true`|

```rust title="Exemple d'opérateurs de comparaison"
let var1 = 13;
let var2 = 12;
let var3: bool = var1 != var2; // true
```
:::warning[Comparaison entre types]
Rust refusera de comparer deux valeurs de types différents (par exemple un `i32` avec un `f64`). Il faut explicitement les convertir avant.
:::

#### Comparaison de string
Ces comparaisons fonctionnent également pour du texte, peu importe la manière de les déclarer :
```rust
let str1 = "hello";
let str2 = "hello";
let str3 = "Hello";
let string1: String = "hello".to_string();
let string2: String = String::from("hello");
let string3 = "hello".to_owned();

let result1 = str1 == str2;  // true
let result2 = str1 == str3;  // false (case-sensitive)

// Comparaison de deux String ensemble
let result3 = string1 == string2;  // true

// On peut également comparer des String avec des &str
let result4 = string1 == str1;     // true
```
:::note
Rust refuse de comparer des valeurs de types différent mais accepte lorsque les données à l'intérieur sont identique : `i32` et `i64` contiennent tout deux des `int`.
:::

### Opérateurs logiques

Les opérateurs logiques s'utilisent sur des booléens et renvoient un `bool`.

|Opérateur|Signification|Exemple|
|--------------------|--------------------|--------------------|
|`&&`|ET — `true` si **tous** les opérandes sont `true`|`a && b`|
|`\|\|`|OU — `true` si **l'un** des opérandes est `true`|`a \|\| b`|
|`!`|NON — inverse la valeur de l'opérande|`!a`|

**Exemples :**

```rust title="5 est plus grand que 3 ET 1 est égal à 1"
let b1: bool = (5 > 3) && (1 == 1); // true
```

```rust title="5 n'est pas égal à 4 OU 5 est égal à 2"
let b2: bool = !(5 == 4) || (5 == 2); // true
```

Les tables de vérité sont identiques à celles du C (puisque ce sont les mêmes lois mathématiques).

Table de vérité pour l'opérateur **ET** :

|a|b|a `&&` b|
|--------------------|--------------------|--------------------|
|`false`|`false`|`false`|
|`false`|`true`|`false`|
|`true`|`false`|`false`|
|`true`|`true`|`true`|

Table de vérité pour l'opérateur **OU** :

|a|b|a `\|\|` b|
|-|-|-|
|`false`|`false`|`false`|
|`true`|`false`|`true`|
|`true`|`true`|`true`|

Table de vérité pour l'opérateur **NON** :

|a|`!a`|
|-|-|
|`false`|`true`|
|`true`|`false`|

Comme en C, Rust effectue une **évaluation en court-circuit** : dès que le résultat est connu, les opérandes restants ne sont pas évalués.

```rust title="Exemple de court-circuit"
let x = 0;
let y = 5;
// y / x n'est jamais évalué car x != 0 est false
let result = (x != 0) && (y / x > 2);
```

## Flux de contrôle

### La déclaration `if`

L'instruction `if` permet à votre programme de prendre des décisions. Contrairement au C, **les parenthèses autour de la condition sont optionnelles** (et même pas idiomatiques), mais les accolades sont **obligatoires**, même pour une seule instruction.

```rust title="Structure basique d'un if"
if condition {
    // code à exécuter si la condition est vraie
}
```

```rust title="Exemple simple"
let age = 20;

if age >= 18 {
    println!("Vous êtes adulte.");
}
```

:::warning[La condition DOIT être un bool]
Rust n'accepte pas `if 1 { ... }` comme en C. La condition doit obligatoirement être de type `bool`. C'est plus strict, mais cela évite les confusions classiques.
:::

### if - else

```rust title="Exemple de if-else"
let age = 17;
if age >= 18 {
    println!("Vous êtes adulte.");
} else {
    println!("Vous êtes mineur.");
}
```

### else if

```rust title="Exemple de else if"
let note = 75;

if note >= 90 {
    println!("A");
} else if note >= 80 {
    println!("B");
} else if note >= 70 {
    println!("C");
} else {
    println!("Échec");
}
```

### `if` en tant qu'expression

Une spécificité très intéressante de Rust : `if` est une **expression**, pas seulement une instruction. Cela signifie qu'on peut directement assigner son résultat à une variable.

```rust title="if comme expression (remplace l'opérateur ternaire)"
let a = 10;
let b = 20;

let max = if a > b { a } else { b };
```

C'est l'équivalent de l'opérateur ternaire `?:` du C, mais en plus lisible. Notez l'absence de `;` après `a` et `b` dans les branches — c'est ce qui en fait des expressions.

:::warning[Cohérence des types]
Toutes les branches d'un `if` utilisé comme expression doivent retourner **le même type**. Sinon le compilateur refusera de compiler.
:::

### Le `match` (équivalent du switch)

Le `match` est l'équivalent surpuissant du `switch-case` du C. Il permet de comparer une valeur à plusieurs motifs (patterns) et d'exécuter le code correspondant.

```rust title="Exemple de match simple"
let jour = 3;
match jour {
    1 => println!("Lundi"),
    2 => println!("Mardi"),
    3 => println!("Mercredi"),
    4 => println!("Jeudi"),
    5 => println!("Vendredi"),
    _ => println!("Week-end ou jour invalide"),
}
```

Le caractère `_` est un *wildcard* qui correspond à toutes les valeurs non couvertes (l'équivalent de `default` en C).

:::tip[Exhaustivité]
Contrairement au `switch` du C, le `match` doit être **exhaustif** : tous les cas possibles doivent être traités, sinon le code ne compile pas. C'est une sécurité énorme dans les gros programmes.
:::

Le `match` peut aussi retourner une valeur (comme `if`) :

```rust title="match comme expression"
let jour = 3;
let nom = match jour {
    1 => "Lundi",
    2 => "Mardi",
    3 => "Mercredi",
    _ => "Autre jour",
};
println!("{}", nom);
```

On peut également matcher des intervalles ou plusieurs valeurs :

```rust title="Motifs avancés"
let n = 5;
match n {
    1 | 2 | 3 => println!("Petit"),     // Ou logique
    4..=6 => println!("Moyen"),         // Intervalle inclusif
    _ => println!("Grand"),
}
```

## Input & Output

### La macro `println!`

En Rust, l'écriture sur la sortie standard se fait via la macro `println!` (notez le `!` qui indique qu'il s'agit d'une macro et non d'une fonction).

```rust title="Affichage simple"
println!("Bonjour, monde !");
```

Pour insérer des valeurs, on utilise les accolades `{}` comme *placeholders* :

```rust title="Affichage avec valeurs"
let age = 25;
println!("J'ai {} ans.", age);

let prenom = "Bastien";
let age = 30;
println!("Je m'appelle {} et j'ai {} ans.", prenom, age);
```

Depuis Rust 1.58, on peut directement interpoler les variables dans la chaîne :

```rust title="Interpolation directe"
let prenom = "Bastien";
let age = 30;
println!("Je m'appelle {prenom} et j'ai {age} ans.");
```

### Les spécificateurs de format

Le système de format de Rust est différent du C : il n'y a pas un spécificateur par type, mais un système unifié à base de **traits**.

* `{}` — affichage standard (trait `Display`)
* `{:?}` — affichage de débogage (trait `Debug`)
* `{:#?}` — affichage de débogage "joli" (pretty-print)
* `{:5}` — largeur minimale de 5
* `{:.2}` — 2 décimales pour un flottant
* `{:7.2}` — largeur 7 avec 2 décimales
* `{:<10}` — aligné à gauche sur 10 caractères
* `{:>10}` — aligné à droite sur 10 caractères
* `{:^10}` — centré sur 10 caractères
* `{:08}` — complété avec des zéros à gauche sur 8 caractères
* `{:b}` — binaire
* `{:o}` — octal
* `{:x}` ou `{:X}` — hexadécimal (minuscules / majuscules)
* `{:e}` ou `{:E}` — notation scientifique

```rust title="Exemples de formatage"
println!("{:.3}", 3.14159);     // 3.142
println!("{:08}", 42);          // 00000042
println!("{:>10}", "Rust");     //       Rust
println!("{:b}", 10);           // 1010
println!("{:#x}", 255);         // 0xff
```

:::tip[print! vs println! vs eprintln!]
* `print!` écrit sans saut de ligne
* `println!` ajoute un `\n` à la fin
* `eprintln!` écrit sur la sortie d'erreur standard (stderr)
:::

### Lire une entrée utilisateur

C'est un peu plus verbeux qu'en C, mais bien plus sûr. Il faut importer le module `io` de la bibliothèque standard.

```rust title="Lecture d'une ligne au clavier"
use std::io; //On importe la bibliothèque

fn main() {
    let mut entree = String::new(); //Création d'un String vide MUTABLE !
    
    println!("Entrez quelque chose :");
    io::stdin()
        .read_line(&mut entree) // Ajoute l'input à la fin de la chaine
        .expect("Erreur de lecture"); //ajoute un message d'erreur personnalisé en cas d'échec
    
    println!("Vous avez écrit : {}", entree);
}
```

#### Cas spécifique des lectures multiples
Comme on peut le voir au dessus, la méthode `read_line` ajoute à la fin de la variable la chaine qui a été écrite.

Cela signifie que dans un programme interractif où l'on doit demander plusieurs variables à l'utilisateur, il est impératif de vider la variable au préalable, par exemple : 
```rust title="Lecture de multiples lignes au clavier"
use std::io;

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let count: i32 = input.trim().parse().unwrap();
    
    let mut result: i32 = 0;
    let mut counter: i32;
    for _i in 0..count {
        input.clear(); //vider la variable input pour pouvoir demander une autre valeur
        io::stdin().read_line(&mut input).unwrap(); //ajout dans une string vide
        counter = input.trim().parse().unwrap();
        result += counter;
    }
    print!("{}",result);
}
```

### Conversion d'une entrée en nombre

`read_line` ne lit que du texte. Pour le convertir en nombre, on utilise `parse` :

```rust title="Lecture d'un entier"
use std::io;

fn main() {
    let mut entree = String::new();
    
    println!("Entrez un nombre :");
    io::stdin()
        .read_line(&mut entree)
        .expect("Erreur de lecture");
    
    let nombre: i32 = entree
        .trim()              // Enlève les espaces et le \n final
        .parse()             // Tente la conversion
        .expect("Ce n'est pas un nombre valide !");
    
    println!("Vous avez entré : {}", nombre);
}
```

:::tip[trim() est crucial]
`read_line` capture aussi le caractère de retour à la ligne (`\n`). Sans `trim()`, la conversion échouera systématiquement.
:::

### Validation propre de l'entrée

Plutôt que `expect` qui fait planter le programme en cas d'erreur, on peut utiliser `match` pour gérer proprement les cas invalides :

```rust title="Validation robuste"
use std::io;

fn main() {
    let mut entree = String::new();
    io::stdin().read_line(&mut entree).expect("Erreur de lecture");
    
    let nombre: i32 = match entree.trim().parse() {
        Ok(n) => n,
        Err(_) => {
            println!("Entrée invalide !");
            return;
        }
    };
    
    if nombre >= 1 && nombre <= 100 {
        println!("Valeur correcte : {}", nombre);
    } else {
        println!("Hors plage [1-100]");
    }
}
```

## Les boucles

Rust propose trois types de boucles : `loop`, `while` et `for`.

### La boucle `loop`

C'est la boucle infinie native de Rust. Elle s'exécute jusqu'à rencontrer un `break`.

```rust title="Boucle loop"
let mut compteur = 0;
loop {
    compteur += 1;
    if compteur == 5 {
        break;
    }
    println!("{}", compteur);
}
```

Spécificité utile : `loop` peut **retourner une valeur** via `break` :

```rust title="loop retournant une valeur"
let mut compteur = 0;
let resultat = loop {
    compteur += 1;
    if compteur == 10 {
        break compteur * 2; // La boucle "rend" cette valeur
    }
};
println!("Résultat : {}", resultat); // 20
```

### La boucle `while`

La boucle `while` exécute un bloc de code tant qu'une condition est vraie.

```rust title="Structure de la boucle while"
while condition {
    // code à répéter
}
```

```rust title="Boucle while comptant de 1 à 5"
let mut count = 1;
while count <= 5 {
    print!("{} ", count);
    count += 1;
}
```

:::tip[Pas de do-while ?]
Rust n'a pas de boucle `do-while` native. On la simule avec une boucle `loop` et un `break` conditionnel à la fin :

```rust
loop {
    // code à exécuter au moins une fois
    if !condition { break; }
}
```
:::

### La boucle `for`
:::tip [Warning variable inutilisée dans le compilateur]
Il est possible que dans l'utilisation de la boucle for, qu'une des variables que vous initialisez une variable dans votre boucle qui ne sera plus utilisée.
Le compilateur vous mettra un warning qu'une variable a été inutilisée.
Pour que cette erreur ne s'affiche pas, déclarez la variable avec un `_` directement dans la boucle :
```rust
for _i in 0..5 {
	...
}
```
:::

C'est la plus utilisée en Rust. Elle itère sur un **itérateur** (un tableau, un intervalle, une collection…).

```rust title="Boucle for sur un intervalle"
for i in 1..=5 {
    print!("{} ", i);
}
// Affiche : 1 2 3 4 5
```

* `1..5` — intervalle exclusif (1, 2, 3, 4)
* `1..=5` — intervalle inclusif (1, 2, 3, 4, 5)

```rust title="Boucle for sur un tableau"
let nombres = [10, 20, 30, 40, 50];
for n in nombres {
    print!("{} ", n);
}
```

Si on a besoin de l'index, on utilise `enumerate` :

```rust title="for avec index"
let mots = ["hello", "world", "rust"];
for (index, mot) in mots.iter().enumerate() {
    println!("{} : {}", index, mot);
}
```

:::tip[Pourquoi for est plus sûr]
Contrairement au C, on ne risque pas de dépasser la taille du tableau : l'itérateur s'arrête tout seul. Plus de `i < taille` à gérer à la main.
:::

### Instruction `break`

Identique au C : elle arrête immédiatement la boucle.

```rust title="Exemple de break"
for i in 0..10 {
    if i == 6 {
        break;
    }
    print!("{} ", i);
}
// Affiche : 0 1 2 3 4 5
```

### Instruction `continue`

Identique au C : elle saute à l'itération suivante.

```rust title="Exemple de continue"
for i in 3..9 {
    if i == 5 {
        continue;
    }
    print!("{} ", i);
}
// Affiche : 3 4 6 7 8
```

### Boucles étiquetées

Spécificité bien pratique de Rust : on peut nommer une boucle et faire un `break` ou `continue` ciblé. Très utile pour sortir d'une boucle imbriquée d'un coup.

```rust title="Boucle étiquetée"
'externe: for i in 0..5 {
    for j in 0..5 {
        if i * j > 6 {
            break 'externe; // Sort directement de la boucle externe
        }
        print!("({},{}) ", i, j);
    }
}
```

### Boucles imbriquées

Comme en C, on peut imbriquer des boucles. Pour chaque itération de la boucle externe, la boucle interne s'exécute entièrement.

```rust title="Exemple de boucle imbriquée"
for i in 0..2 {
    for j in 0..3 {
        print!("{},{} ", i, j);
    }
    println!();
}
```

```
0,0 0,1 0,2 
1,0 1,1 1,2 
```

## Les fonctions

### Déclarer une fonction

En Rust, une fonction est déclarée avec le mot-clé `fn`. Par convention, on utilise le `snake_case` pour les noms de fonctions.

```rust title="Structure d'une fonction"
fn nom_de_fonction(parametre1: Type1, parametre2: Type2) -> TypeRetour {
    // corps de la fonction
}
```

```rust title="Une fonction qui affiche un message"
fn saluer() {
    println!("Bonjour et bienvenue en Rust !");
}

fn main() {
    saluer();
}
```
:::tip
Rust résout le nom des fonction peu importe leur ordre. Donc une fonction peut être appelée avant sa déclaration
:::

### Paramètres et type de retour

Contrairement au C, on doit **toujours** annoter le type des paramètres. Le type de retour est précisé après la flèche `->`. Une fonction sans flèche retourne `()` (le type unité, équivalent du `void`).

```rust title="Fonction avec paramètres et valeur de retour"
fn additionner(a: i32, b: i32) -> i32 {
    a + b // Pas de point-virgule = expression retournée
}

fn main() {
    let resultat = additionner(5, 3);
    println!("{}", resultat); // 8
}
```

### Expressions vs instructions

C'est une notion fondamentale en Rust. La **dernière expression** d'une fonction (sans `;`) est automatiquement retournée. On peut aussi utiliser `return` explicitement.

```rust title="Deux façons de retourner une valeur"
fn carre_v1(x: i32) -> i32 {
    x * x  // ✅ Expression retournée (pas de ;)
}

fn carre_v2(x: i32) -> i32 {
    return x * x; // ✅ Avec return explicite
}

fn carre_v3(x: i32) -> i32 {
    x * x; // ❌ Le ; en fait une instruction qui retourne ()
}
```

:::warning[Le point-virgule change tout]
En Rust, `x * x` est une **expression** qui a une valeur. `x * x;` est une **instruction** qui retourne `()`. C'est subtil mais essentiel à comprendre.
:::

### Fonctions récursives

Comme dans tous les langages, une fonction peut s'appeler elle-même.

```rust title="Fonction récursive retournant n factoriel"
fn factorielle(n: u32) -> u32 {
    if n <= 1 {
        1
    } else {
        n * factorielle(n - 1)
    }
}

fn main() {
    println!("{}", factorielle(5)); // 120
}
```

## Ownership et références

C'est **LA** caractéristique fondamentale de Rust, celle qui le rend unique. Sans la comprendre, impossible d'écrire du Rust correct.

### Le principe d'ownership

En Rust, chaque valeur a un **propriétaire** (owner) unique. Quand le propriétaire sort du scope, la valeur est automatiquement libérée — pas besoin de `free()` comme en C, pas besoin de garbage collector.

```rust title="Transfert de propriété (move)"
let s1 = String::from("hello");
let s2 = s1; // La propriété est transférée à s2

// println!("{}", s1); // ❌ Erreur : s1 n'est plus valide !
println!("{}", s2);    // ✅ OK
```

:::tip[Pourquoi cette règle]
Cela empêche les "double free" (libérer deux fois la même mémoire) et les "use-after-free" (utiliser une mémoire déjà libérée), deux des bugs les plus dangereux du C.
:::

### Les références (emprunt)

Pour utiliser une valeur sans en prendre la propriété, on utilise une **référence** avec `&`. C'est ce qu'on appelle un *emprunt* (borrow).

```rust title="Emprunt avec une référence"
fn afficher_longueur(s: &String) {
    println!("Longueur : {}", s.len());
} // s sort du scope, mais comme c'est une référence, rien n'est libéré

fn main() {
    let texte = String::from("hello");
    afficher_longueur(&texte);
    println!("{}", texte); // ✅ texte est toujours valide
}
```

### Références mutables

Pour pouvoir modifier la valeur empruntée, il faut une référence mutable `&mut`. La variable elle-même doit aussi être `mut`.

```rust title="Référence mutable"
fn ajouter_point(s: &mut String) {
    s.push('.');
}

fn main() {
    let mut texte = String::from("hello");
    ajouter_point(&mut texte);
    println!("{}", texte); // hello.
}
```

:::warning[Règles de l'emprunt]
Rust impose deux règles strictes pour les références :
1. À un moment donné, on peut avoir **soit une seule référence mutable**, **soit autant de références immuables qu'on veut**.
2. Les références doivent toujours pointer vers une valeur valide.

Ces règles, vérifiées à la compilation, éliminent les *data races* (courses de données) en programmation concurrente.
:::

## Les tableaux

### Déclarer un tableau

Un tableau en Rust a une **taille fixe**, connue à la compilation. Tous les éléments doivent être du même type.

```rust title="Déclaration d'un tableau"
let nombres: [i32; 5] = [10, 20, 30, 40, 50];
// La notation [i32; 5] se lit : "tableau de 5 i32"
```

On peut aussi laisser Rust inférer le type :

```rust
let nombres = [10, 20, 30, 40, 50];
```

Ou initialiser toutes les cases avec la même valeur :

```rust title="Tableau initialisé à la même valeur"
let zeros = [0; 10]; // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

### Accéder aux éléments

L'indexation commence à 0, comme en C.

```rust title="Accès à un élément"
let nombres = [10, 20, 30, 40, 50];
let premier = nombres[0]; // 10
println!("{}", premier);
```

:::tip[Sécurité à l'exécution]
Contrairement au C, Rust **vérifie à l'exécution** que l'index est valide. Si vous accédez à un index hors limites, le programme s'arrête proprement (panic) au lieu de lire de la mémoire arbitraire.
:::

### Modifier un tableau

Le tableau doit être déclaré `mut`.

```rust title="Modification d'un élément"
let mut nombres = [10, 20, 30, 40, 50];
nombres[2] = 35;
// nombres vaut maintenant [10, 20, 35, 40, 50]
```

### Parcourir un tableau

```rust title="Parcours classique"
let nombres = [10, 20, 30, 40, 50];

for n in nombres {
    print!("{} ", n);
}

// Avec l'index
for (i, n) in nombres.iter().enumerate() {
    println!("{} -> {}", i, n);
}
```

### Tableaux multidimensionnels

Rust supporte les tableaux à plusieurs dimensions, qui sont en réalité des tableaux de tableaux.

```rust title="Déclarer une matrice"
let matrice: [[i32; 4]; 3] = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
];
```

```rust title="Accéder à une valeur"
let valeur = matrice[1][2]; // 7
```

```rust title="Parcourir une matrice"
for ligne in matrice {
    for valeur in ligne {
        print!("{} ", valeur);
    }
    println!();
}
```

### Les tuples

Bonus : Rust possède aussi les **tuples**, qui permettent de regrouper plusieurs valeurs de types différents.

```rust title="Tuple"
let info: (&str, i32, f64) = ("Bastien", 30, 1.78);

// Accès par index
println!("{}", info.0);
println!("{}", info.1);

// Décomposition (destructuring)
let (nom, age, taille) = info;
println!("{} a {} ans et mesure {} m", nom, age, taille);
```

### Les slices

Une **slice** est une vue (une référence) sur une partie d'un tableau, sans copie de données. Très utile pour passer des "sous-tableaux" à des fonctions.

```rust title="Création d'une slice"
let nombres = [10, 20, 30, 40, 50];
let tranche = &nombres[1..4]; // [20, 30, 40]

println!("{:?}", tranche);
```

## Pour aller plus loin

Cette cheatsheet couvre les fondamentaux de Rust, mais le langage propose énormément d'autres concepts que je détaillerai dans de prochains articles :

- Les **structures** (`struct`) et les **énumérations** (`enum`)
- Les types **`Option<T>`** et **`Result<T, E>`** pour la gestion des erreurs
- Les **traits** (équivalent puissant des interfaces)
- Les **génériques**
- Les **closures** et la programmation fonctionnelle
- La **concurrence** sûre avec les threads
- Le système de **modules** et de **crates**
- Le gestionnaire de paquets **Cargo**

:::tip[Conseil personnel]
Au début, le compilateur Rust peut paraître hostile : il refuse de compiler du code qui paraît parfaitement valide. Acceptez de vous laisser guider — ses messages d'erreur sont parmi les meilleurs de l'industrie et vous apprennent énormément. Une fois la logique d'ownership intégrée, écrire en Rust devient un vrai plaisir.
:::
