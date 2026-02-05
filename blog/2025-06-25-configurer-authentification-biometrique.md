---
slug: Configurer-authentification-biométrique
title: "Configurer l'authentification biométrique sous Linux"
authors: [bastien]
tags: [Linux, system]
date: 2025-06-25
last_update:
  date: 2025-06-25
  author: bastien
---
Envie d'utiliser votre doigt plutôt qu'un mot de passe à ralonge. Eh bien vous êtes au bon endroit
<!-- truncate -->


:::warning
Je préviens, j'ai procédé à cette installation sous Arch Linux, il existe également d'autres procédures en lignes qui permettent l'installation d'authentification biométrique
:::

## Installation de l'authentification biométrique
La première question que l'on doit se poser c'est : est-ce que mon périphérique est détecté et surtout est-ce que je peux l'utiliser ? Pour ça, on va utiliser la commande `lsusb`.  
:::note
si jamais, vous pouvez installer cette commande avec `sudo pacman -S usbutils`
:::
```bash
lsusb | grep -i light
Bus 003 Device 002: ID 1c7a:05a1 LighTuning Technology Inc. ETU905A80-E
```
> à titre informatif, j'utilise un Samsung book 3 pro 360

On peut alors vérifier si notre périphérique est pris en charge par libfprint  sur ce site : [libfprint — Supported Devices](https://fprint.freedesktop.org/supported-devices.html)

Et bingo pour moi, en recherchant mon id `1c7a:05a1`, il est dans la liste.

Donc on va procéder à l'installation : 
```bash
yay -S libfprint-tod-git fprintd-tod
```
Puis on installe `fprintd` qui est l'outil principal qui nous intéresse : 
```bash
sudo pacman -S fprintd
```

Une fois que tout est installé, on redémarre le service `fprintd` : 
```bash
sudo systemctl restart fprintd.service
```

Vous pouvez vérifier que tout est installé en utilisant la commande `fprintd-verify` et avoir un résultat similaire à : 
```bash
Using device /net/reactivated/Fprint/Device/0
ListEnrolledFingers failed: GDBus.Error:net.reactivated.Fprint.Error.NoEnrolledPrints: Failed to discover prints
```
Ici l'erreur signifie uniquement que l'on a pas encore enregistré d'empreinte. Donc notre périphérique est parfaitement fonctionnel !

:::note
PS : à partir de là, vous devriez également voir que la gestion des empreintes digitale est apparu dans votre gestionnaire graphique
:::

## Enregistrer son empreinte
On va pour cela utiliser la commande `fprintd-enroll`, vous pouvez également spécifier le doigt que vous voulez utiliser en spécifiant l'option `-f` : `fprintd-enroll -f right-index-finger`.  
Une fois que vous avez fait cette commande. On vous demande votre mot de passe, puis une ligne apparaît. C'est maintenant à **vous de jouer**. Appuyer à répétition sur le lecteur d'empreinte pour enregistrer votre empreinte.

Une fois que tout cela est terminé, vous allez avoir le message : `Enroll result: enroll-completed`.

Pour vérifier que votre empreinte soit bien enregistrée, utilisez la commande : `fprintd-list $USER`, vous devriez alors avoir : 
```bash
found 1 devices
Device at /net/reactivated/Fprint/Device/0
Using device /net/reactivated/Fprint/Device/0
Fingerprints for user user on Egis Technology (LighTuning) Match-on-Chip (press):
 - #0: right-index-finger
```

:::warning
Il existe également la commande `fprintd-verify`, cependant il semble y avoir un bug, et cette dernière supprimerait les enregistrements biométrique une fois lancée. Cela ne concernerait qu'à première vue les systèmes "Match-On-Chip" :  
[LighTuning fingerprint fprintd / Applications & Desktop Environments / Arch Linux Forums](https://bbs.archlinux.org/viewtopic.php?id=302751&utm_source=chatgpt.com)
:::

## Configurer l'authentification sur notre machine
Malgré ce petit bug, nous devrions être capable d'utiliser notre empreinte à la fois pour l'authentification système mais également console.

Dans cette partie, en toute logique il faut modifier les fichiers tel que `/etc/pam.d/sudo` et ajouter une ligne :
```
auth		sufficient	pam_fprintd.so
```

Cependant cette procédure n'allait que trop bien pour que mon expérience Linux soit complète. Une fois le fichier sauvegardé, le comportement attendus est celui-ci : 

Dans une nouvelle fenêtre, si vous faites `sudo ls` par exemple, la console est censé vous demander votre empreinte. Évidemment, pour ma part, il serait trop beau que tout fonctionne du premier coup. Donc qu'est-ce qu'il se passe pour moi ? On me demande mon mot de passe 🙃.

:::note
Edit : Cette erreur de mon côté provient du fait que je n'avais pas enregistré mon doigt... essayez d'en enregistrer un avant, sinon essayez de voir avec le débug ci-dessous pour voir si vous possédez bien le fichier `pam_fprintd.so`
:::

### du débug OUIIIIIII
Ducoup, premier réflexe, aller voir les journaux : 

```bash
journalctl -b | grep pam_fprintd
juin 25 22:35:34 archlinux sudo[69022]: PAM _pam_load_conf_file: unable to open config for pam_fprintd.so
```
très rassurant tout ça, donc maintenant, il faut que je trouve où se trouve se fichue fichier : 
```bash
locate pam_fprintd.so
bash: locate : commande introuvable
```
*Vous n'imaginez pas ma tête à ce moment là*  
On l'installe donc avec `sudo pacman -S locate` et on réessaie : 
```bash
locate pam_fprintd.so
pread: Short read (file corrupted?)
```
*Et là non plus vous n'imaginez pas*

Ducoup, il faut mettre à jour la base : `sudo updatedb`, puis cela devrait fonctionner : 
```bash
locate pam_fprintd.so
/usr/lib/security/pam_fprintd.so
```

*Je suis juste un peu bête. Il ne trouve pas le fichier dans un premier temps si on a pas enregistré d'empreinte. Essayez d'enregistrer un doigt avant...*

:::note
Si jamais le fichier ne s'affiche toujours pas, vous devriez alors installer pam_fprintd : `sudo pacman -S pam_fprintd`
:::



Là je suis désolé de vous décevoir, mais pour moi c'est la fin de l'aventure. La raison vient de ces différents élémets que j'ai découvert lors de la mise en place :  
* Lorsque l'on enregistre une empreinte, si on essaie de `fprintd-verify`, l'empreinte est directement supprimée. Visiblement c'est un bug référencé par la communauté.
* Lorsque l'on enregistre une empreinte, que l'on met la ligne `auth sufficient pam_fprintd.so` et que l'on essaie de faire un `sudo ls` dans un nouveau terminal. On me demande l'empreinte et on me dit que l'empreinte n'est pas reconnue avant même que je n'ai posé le doigt.

Visiblement l'erreur est référencée ici : [Bug #1956885 “Incorrect verify implementation, unable to verify ...” : Bugs : libfprint-2-tod1-broadcom](https://bugs.launchpad.net/libfprint-2-tod1-broadcom/+bug/1956885) Apparemment fix, mais pour ma part cela ne fonctionne toujours pas... dommage

Il y a tout de même cette issue dans la Arch wiki : [LighTuning fingerprint sensor with Plasma and fprintd / Applications & Desktop Environments / Arch Linux Forums](https://bbs.archlinux.org/viewtopic.php?pid=2248198#p2248198) J'ai relancé, on verra ce que cela donne.

Pour ceux à qui ça ne fonctionne pas comme moi, je ne veux pas vous faire de faux espoirs : [Unsupported Devices · Wiki · libfprint / wiki · GitLab](https://gitlab.freedesktop.org/libfprint/wiki/-/wikis/Unsupported%20Devices)  
On espère tout de même qu'on pourra les utiliser...
