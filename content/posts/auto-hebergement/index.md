---
title: "L'auto-hébergement en 2023"
date: 2023-02-23
summary: Une présentation des choix que je fais en 2023 pour gérer mes services auto hébergés
description: Une présentation des choix que je fais en 2023 pour gérer mes services auto hébergés
keywords: hébergement, auto, auto-hébergement, self-hosted, serveur, maison
draft: true
---

Suite a un article discuté sur Hacker News ([Self hosting in 2023](https://news.ycombinator.com/item?id=34860655)) sur l'auto-hébergement, je me suis dit qu'il serait intéressant de partager en français mon approche personnelle.

{{< alert "comment" >}}
L'objectif de ce post est de donner une vue globale des options que j'ai choisies et de servir de feuille de route à de futurs posts pour détailler les points qui le méritent. Si vous voulez suivre les futures publications du blog, vous pouvez vous abonner au [flux RSS](https://www.cosmecharlier.fr/index.xml)
{{< /alert >}}

## Définition

L'auto hébergement de services consiste à faire tourner soi même les logiciels qu'on utilise, par opposition à l'utilisation de solutions qui sont gérées par des tiers. Concrètement, cela regroupe l'ensemble des pratiques liées à l'hébergement de services et a l'administration de serveurs #TODO

## Matériel

Différentes options sont possibles pour le matériel de votre auto hébergement :
- Vous pouvez utiliser un vieux PC qui ne sert plus et le recycler en un serveur maison
- Vous pouvez acheter un [Raspberry Pi](https://www.kubii.fr/40-cartes-raspberry-pi) qui peut largement suffire pour un bon nombre de besoins pas trop exigeants en ressources
- Vous pouvez faire tourner une machine virtuelle sur votre PC avec [VirtualBox](https://www.virtualbox.org/) pour expérimenter différentes choses
- Certaines BOX internet proposent de faire tourner des VM dessus, par exemple les [Freebox Delta](https://portail.free.fr/nouveautes/freebox-delta-les-vms-machines-virtuelles-disponibles-pour-tous-les-utilisateurs-et-utilisatrices-dune-freebox-delta-ou-delta-s/)

Chaque solution a ses avantages et ses inconvénients, mais dans l'absolu pour se lancer, la meilleure solution est celle qu'on a sous la main !

## Système d'exploitation

La bataille des OS est toujours très clivante, mais sur le sujet de l'auto hébergement, on tourne en général sur Linux. Mon choix par défaut est une distribution Debian, mais certains peuvent préférer Ubuntu.

## Sécurisation

Une fois le système d'exploitation installé, la première chose à faire sur un serveur est de le sécuriser. Les principaux points que je met en place sur un nouveau serveur sont :
- De créer un utilisateur avec un nom distinctif (donc pas <mark>admin</mark> par exemple)
- D'interdire la connexion SSH aux autres utilisateurs
- D'utiliser une connexion SSH par clé et d'interdire la connexion par mot de passe
- De configurer un service [*fail2ban*](https://www.fail2ban.org/wiki/index.php/Main_Page) qui bloquera les attaques de type bruteforce sur le serveur en bannissant les adresses IP qui font trop de tentatives de connexion infructueuses

## Déploiement

Une fois que votre serveur a un OS et qu'il est sécurisé, il reste à déployer les services que vous voulez héberger dessus !
Personnellement, j'utilise pour ceci *docker* et *docker compose*, pour déployer facilement des applications, les mettre à jour, et les supprimer, avec une complexité minimale.

## Exposition interne

Pour exposer un ensemble de services web sur un même serveur, la solution la plus simple consiste à utiliser un *reverse proxy* qui permet de router correctement les requêtes entrantes vers le bon service.
J'utilise pour cela [Traefik](https://github.com/traefik/traefik), qui peut détecter automatiquement les services déployés avec *docker compose*. D'autres alternatives similaires existent, telles que [Caddy](https://caddyserver.com/) ou Nginx.

Une fonctionnalité que j'utilise également est l'ajout d'un *middleware* d'authentification qui me permet de limiter l'accès à tout ou partie des services derrière une authentification Google : [traefik-forward-auth](https://github.com/thomseddon/traefik-forward-auth). Cela me permet d'exposer des services sur internet tout en restreignant l'accès aux comptes Google que j'autorise.

## Exposition externe

Pour pouvoir accéder aux services que j'héberge depuis l'extérieur de mon réseau local, j'utilise un nom de domaine public que je paye quelques euros par an à [OVH](https://www.ovhcloud.com/fr/domains/).
Pour protéger l'accès à mon serveur et éviter d'exposer mon IP à l'extérieur, j'utilise [Cloudflare](https://www.cloudflare.com/) comme gestionnaire DNS et pare feu web (WAF) en le positionnant en tant que *reverse proxy* frontal.

Pour exploiter au maximum les options de sécurisations offertes par Cloudflare, j'utilise également le service *Tunnels* qui me permet de ne pas ouvrir sur internet les ports 80 ou 443 de ma box internet. Pour cela, je fais tourner sur le serveur le démon *cloudflared* qui crée un tunnel privé entre le reverse proxy de Cloudflare et mon reverse proxy *traefik* : Je suis ainsi sûr que tout le traffic entrant sur le serveur est filtré par le pare feu et l'anti DDOS de Cloudflare.

## Synthèse

Voici, pour résumer, ma configuration dans le schéma ci dessous :

{{< mermaid >}}
graph LR
%%{init: {"flowchart": {"defaultRenderer": "dagre"}} }%%
    subgraph Réseau local
    subgraph padding [ ]
        subgraph Serveur physique Debian
        subgraph padding2 [ ]
            subgraph Docker
                C[Traefik reverse proxy <br> avec authentification Google]
                D[Service 1]-->C
                E[Service 2]-->C
            end
            C --> F[Cloudflared]
        end
        end
    end
    end
    subgraph Internet
        F-- VPN -->G[Cloudflare]
    end
    subgraph padding3 [ ]
        G<-- HTTPS -->H((Clients<br>))
    end

classDef padding fill:none,stroke:none
class padding,padding2,padding3 padding
{{< /mermaid >}}

L'approche que je décris me permet d'avoir une simplicité d'utilisation, et un bon niveau de sécurité.

## Conclusion

Pour moi, l'objectif de l'auto-hébergement est avant tout d'apprendre. Ce que je présente ici correspond à l'itération la plus adaptée après des années d'essais. Chaque choix présenté peut être discuté et réalisé de différentes manières. L'important est de trouver ce qui vous convient le mieux. 

Chaque élément mérite sans doute d'être explicité. Par conséquent, je prévois de présenter les sujets avec plus de détails dans de futurs billets ! Pour être alerté des prochaines publications sur le blog, vous pouvez suivre le [flux RSS](https://www.cosmecharlier.fr/index.xml)

<div style="text-align: right"> 

*Poursuivons la discussions sur le fil du [Journal du Hacker]()* 
</div>