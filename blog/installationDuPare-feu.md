---
slug: homelab-installationDuFirewall
title: "Installation du firewall de mon home-lab"
authors: [bastien]
tags: [informatique, open-source, Système, Linux, lab]
date: 2026-05-29
last_update:
  date: 2026-05-29
  author: bastien
---

Je commence la mise en place de mon home-lab, cet article est le début d'une petite série de mise en place de plein de solution.

Quoi de mieux pour commencer une infra que de commencer par le pare-feu. L'entité qui me servira pour tous les éléments réseaux de mon lab
<!--truncate-->

## Le firewall
j'ai fais le choix de partir avec OpnSense. Plusieurs raisons ont porté mon choix. Notamment le fait que je me sois habitué à cet outil depuis un long moment et notament que c'est honnêtement une solution très simple à utiliser en GUI (avec la doc à côté certes).

D'autres solutions existent tel que PfSense (outil qui est forké par OpnSense), mais son interface graphique est honnêtement... vieillotte et très pu intuitive.

Il existe très probablement d'autres solutions que je ne connais pas, en tout cas dans le monde open source, je ne connais que celle-là.

### L'installation
Déjà, on ne part pas installer quelque chose sans savoir ce que l'on va faire, donc voici mon objectif :
```mermaid
graph TD
    %% --- Connexion Internet ---
    Internet((Internet)) -->|WAN| vmbr0[vmbr0<br/>WAN Bridge<br/>192.168.1.0/24]

    %% --- Proxmox ---
    subgraph Proxmox["Proxmox VE"]
        direction TB
        vmbr0
        vmbr1[vmbr1<br/>Internal Bridge<br/><i>VLAN Aware</i>]
    end

    %% --- OPNsense (2 interfaces) ---
    OPNsense[OPNsense<br/>Firewall/Router]
    vmbr0 -->|WAN| OPNsense
    vmbr1 -->|LAN Trunk| OPNsense

    %% --- VLANs (gérés par OPNsense) ---
    subgraph VLANs["VLANs Internes"]
        V10[VLAN 10<br/>10.10.10.0/24]
        V20[VLAN 20<br/>10.20.20.0/24]
        V30[VLAN 30<br/>10.30.30.0/24]
        V40[VLAN 40<br/>10.40.40.0/24]
    end

    OPNsense --> V10
    OPNsense --> V20
    OPNsense --> V30
    OPNsense --> V40

    %% --- Autres VMs (connectées au bridge internal avec tag VLAN) ---
    subgraph VMs["Autres VMs"]
        VM1[VM 1]
        VM2[VM 2]
        VM3[VM 3]
        VM4[VM 4]
    end

    vmbr1 -.->|Tag 10| VM1
    vmbr1 -.->|Tag 20| VM2
    vmbr1 -.->|Tag 30| VM3
    vmbr1 -.->|Tag 40| VM4

    %% --- Styles ---
    style Proxmox fill:#f0f0f0,stroke:#333
    style VLANs fill:#e6f3ff,stroke:#333
    style VMs fill:#e6ffe6,stroke:#333
    style OPNsense fill:#fff0f0,stroke:#d63333
```

Comme je le mentionne dans [Les réseaux proxmox](./Les-Reseaux-Proxmox), les bridges Linux sont littéralement des switchs. Une fois qu'on leur donne le paramètre "vlan aware", ils se comporte alors comme un switch managé.
Donc chaque serveur pourra être dans son vlan, directement relié au pare-feu qui sera leur seule porte de sortie.
