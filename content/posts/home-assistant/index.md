---
title: "Pourquoi j'ai choisi Home Assistant pour ma domotique"
date: 2025-08-10
summary: Retour d'expérience sur l'utilisation de Home Assistant pour une maison connectée
draft: true
---

La domotique, aussi appelée maison connectée, désigne l'ensemble des technologies permettant de superviser, de contrôler et d'automatiser différents équipements de la maison : éclairage, chauffage, volets roulants, arrosage, sécurité, etc. Elle vise à améliorer le confort, et à automatiser les tâches répétitives de la maison.
 
Quand j'ai commencé à m'intéresser à la domotique, mon objectif était simple : pouvoir piloter quelques ampoules à distance. J'ai démarré simple, avec des produits Philips Hue. L'application est fluide, l'installation simple, mais rapidement, j'ai ressenti les limites de cette approche.

En effet, avec une base Hue, on peut connecter pas mal de choses, mais on est restreints à utiliser du matériel Phillips. Déjà l'écosystème ne couvre pas tout ce que peut faire la domotique, et puis le matériel est vite assez cher.


## Du plug-and-play au besoin d'un système centralisé

Donc j'ai commencé à utiliser d'autres appareils connectés d'autres marques, mais très vite le problème est arrivé : chaque système nécessite sa propre application, son compte dédié, et mon téléphone devenait une télécommande multi-applications, tout en étant l'unique point de contrôle de tout. Et puis surtout, les systèmes n'étaient pas interopérables : Mon capteur de présence Hue pouvait allumer l'ampoule Hue mais pas la prise connectée Tuya par exemple.

{{< mermaid >}}
mindmap
root((Smartphone))
  Philips Hue
    Ampoules
    Interrupteurs
  Tuya
    Prises connectées
    Capteur de porte
  Daikin
    Climatisation
  Samsung SmartThings
    TV
    Frigo
{{< /mermaid >}}


C'est à ce moment que j'ai cherché à unifier tout ça, et que j'ai découvert [Home Assistant](https://www.home-assistant.io/). Une solution open source, installable localement, capable de faire le lien entre tous ces écosystèmes différents.

## Installer Home Assistant

Home assistant propose dans sa [documentation](https://www.home-assistant.io/installation/) deux modes d'installation :
- Un déploiement via _docker_ appelé _Home Assistant Container_ qui s'installe sur un serveur existant
- Et un OS complet, appelé _Home Assistant Operating System_ (HA OS), qui monopolise donc l'intégralité du serveur sur lequel ils s'installe (comme un Raspbery Pi ou leur serveur fait maison _Home Assistant Green_, ou dans une machine virtuelle dédiée)

Bien que j'aime habituellement déployer mes services dans des containers Docker ([je l'explique ici]({{< ref "/posts/proxy-inverse/" >}})), ici c'est l'approche _HA OS_ que j'ai choisie, notamment car elle permet d'utiliser des _Add ons_ bien pratiques.

{{< mermaid >}}
graph TD

A[Appli téléphone ] --> HA[Home Assistant]

B[ Interface web ] --> HA[Home Assistant]

C[ Invités] --> HA[Home Assistant]

HA --> H[Philips Hue]

HA --> T[Tuya]

HA --> D[Daikin]

HA --> S[Samsung SmartThings]

HA --> R[...]
{{< /mermaid >}}

## Premiers pas en terre inconnue

## Les intégrations

## Dashboards et automatisations

## Le déclic du Zigbee : le déménagement en maison

Lorsque j'ai déménagé d'un appartement vers une maison, la configuration a changé du tout au tout. Le Wi-Fi ne suffisait plus à couvrir l'ensemble du terrain, et les prises Wi-Fi n'étaient pas toujours fiables. J'ai alors commencé à m'intéresser à Zigbee, un protocole plus adapté à un réseau domotique maillé, basé sur une faible consommation et une meilleure portée.

J'ai investi dans une clé Zigbee compatible Home Assistant (via Zigbee2MQTT ou ZHA), et commencé à migrer mes appareils.

## Cas d'usages concrets

Aujourd'hui, ma maison est principalement gérée via Home Assistant, avec une interface unique, accédable localement ou à distance. Voici quelques exemples de cas d'usages que j'ai mis en place :

- **Gestion de la piscine** : une prise connectée Zigbee gère la pompe de filtration selon un planning défini dans Home Assistant. Un thermomètre Zigbee permet aussi de suivre la température de l'eau.
- **Arrosage automatique** : un capteur d'humidité du sol Zigbee placé dans le jardin déclenche une vanne d'arrosage lorsque le sol devient trop sec, uniquement en dehors des heures d'ensoleillement maximal.
- **Automatisations lumière** : les anciennes ampoules Hue sont toujours présentes, mais pilotées via Home Assistant, intégrées dans des scénarios plus complexes selon la présence ou l'heure.

## Pourquoi Home Assistant ?

Ce que j'apprécie dans Home Assistant, c'est :

- **L'indépendance** : pas besoin de cloud, tout fonctionne en local
- **L'interopérabilité** : Zigbee, Wi-Fi, Hue, MQTT... tout cohabite
- **La personnalisation** : on peut créer des dashboards adaptés, des automatisations complexes, des alertes
- **La communauté** : immense, réactive, avec une documentation riche

## Les avantages concrets de Home Assistant

Home Assistant se distingue de nombreuses solutions domotiques par sa flexibilité et sa philosophie orientée vers l'utilisateur avancé. Son principal avantage est de permettre une totale maîtrise de son environnement : pas de cloud obligatoire, aucune donnée personnelle qui transite par des serveurs tiers. On reste maître chez soi. Sa capacité à interfacer quasiment tous les équipements du marché permet d’éviter le piège des écosystèmes fermés. Enfin, la communauté très active fournit un soutien précieux, tant pour la résolution de problèmes que pour l'inspiration dans les usages.

## Conclusion

D'un besoin simple d'allumer une ampoule, je suis arrivé à une maison entièrement pilotée, optimisée pour le confort et les économies d'énergie. Home Assistant est devenu le cœur de mon système domotique, et je ne reviendrais pas en arrière. D'autres usages viendront sans doute enrichir cette base, mais le socle est posé.

Dans de futurs articles, je détaillerai certaines intégrations ou automatisations plus complexes que j'ai mises en place.

