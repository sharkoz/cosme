---
title: "Déployer et exposer ses services auto hébergés en quelques secondes"
date: 2023-04-23
summary: Une présentation de configuration a base de docker compose et traefik qui permet de déployer très rapidement de noveaux services auto hébergés
description: Une présentation de configuration a base de docker compose et traefik qui permet de déployer très rapidement de noveaux services auto hébergés
draft: false
_build:
  list: never
  publishResources: true
  render: always
keywords: hébergement, auto, auto-hébergement, self-hosted, serveur, maison
---

Depuis que je fais de l'auto-hébergement, et comme j'aime bien essayer régulièrement de nouveaux services, j'ai cherché une organisation qui me permettrait de gérer mes services de la manière la plus simple possible.
Aujourd'hui, je vais vous présenter ma méthode de travail qui me permet d'exécuter et de tester de nouveaux services en un minimum de temps.

Pour vous donner les grandes lignes de cette méthode :
- Je fais tourner les services dans des environnements isolés et reproductibles grâce à [Docker Compose](#docker-compose)
- Ces services sont automatiquement exposés sur mon serveur grâce à un [proxy inverse](#reverse-proxy) (Traefik)
- Je les rends accessibles depuis l'extérieur en utilisant des sous-domaines DNS

## Un déploiement éclair avec Docker Compose {#docker-compose}

Lorsque l'on veut déployer un service pour l'auto-héberger, la première question à se poser est le mode d'installation. Les options disponibles en général sont :
- De télécharger les sources et de compiler l'application : c'est puissant, mais pas spécialement simple ni rapide
- De télécharger le binaire de l'application déja compilée pour votre système d'exploitation et de l'installer : c'est le cas classique
- D'utiliser une image docker précompilée pour l'application et de l'exécuter dans un conteneur Docker : c'est la solution que je présente ici

L'intérêt pour moi de déployer une application via docker, dans le cas de l'auto-hébergement, est d'avoir des applications qui tournent dans des environnements isolés et reproductibles. Cela permet également de bénéficier d'outillage complémentaire pour se faciliter la vie, dont je parlerai plus loin.

Je ne vais pas entrer ici dans les détails de l'installation de Docker. Si vous n'avez pas encore installé Docker sur votre serveur je vous conseille de consulter la [documentation officielle](https://docs.docker.com/engine/install/) qui est assez explicite. 

Pour servir d'exemple ici, partons du principe que nous cherchons à déployer un service très simple, appelé [`whoami`](https://github.com/traefik/whoami), qui est un simple serveur web qui répond quelques informations techniques lorsqu'on l'appelle. Pour déployer ce service, je vais créer un fichier nommé `docker-compose.yml` qui va contenir les paramètres de lancement de l'application. Pour organiser mes services, je vais mettre ce fichier dans un répertoire que j'appelle `who`.

Voici donc le contenu de mon fichier `who/docker-compose.yml`
{{< highlight yml "linenos=table,hl_lines=22" >}}
version: '3'
services:
  my-whoami:
    image: traefik/whoami
    ports:
      - 8888:80
{{< /highlight >}}

Ici, sans rentrer dans le détail du fonctionnement de Docker Compose (je vous renvoie encore vers la [doc](https://docs.docker.com/compose/features-uses/)), on définit ici un service, nommé `my-whoami` (ligne 3), qui exécute l'image `traefik/whoami`, et qu'on va exposer sur le port 8888 de notre serveur. J'ai nommé le répertoire, le service et l'image avec 3 noms différents pour bien montrer que l'on nomme le service et le répertoire comme on veut, le seul que l'on ne peut pas changer est le nom de l'image qui détermine quelle application on souhaite exécuter. Pour faire plus simple on peut nommer les 3 de la même manière, mais pour l'exercice d'aujourd'hui, séparer les noms permet de mieux voir de quoi on parle.

Une fois ce fichier écrit, on peut se rendre dans le répertoire `who`, lancer le conteneur avec la commande `docker compose up -d`, et vérifier le bon fonctionnement de l'application sur le port 8888 :
{{< highlight console "" >}}
> cd who
> docker compose up -d
 ...
 ✔ Container who-my-whoami-1  Started
> curl localhost:8888
Hostname: cecadeb42721
IP: 127.0.0.1
IP: 172.24.0.2
RemoteAddr: 172.24.0.1:42324
GET / HTTP/1.1
Host: localhost:8888
User-Agent: curl/7.74.0
Accept: */*
{{< /highlight >}}

Et voilà ! En quelques lignes de YAML et une commande, on a déployé une application conteneurisée. Je ne rentrerai pas ici dans toutes les options de paramétrage fournies par docker compose, mais par exemple vous pouvez dans le fichier yml changer le port (8888) sur lequel est exposé l'application de manière extrêmement simple, sans avoir à configurer le service lui même. Un cas d'usage courant également est de partager des répertoires locaux du serveur avec le conteneur pour persister de la donnée hors du conteneur, en utilisant des `volumes`. Mais tout ceci fera l'objet d'un autre billet !


## Exposer tous les services sur un même port grâce à un *proxy inverse* {#reverse-proxy}

Maintenant que vous savez exposer simplement un service, un point que vous avez dû remarquer est que ce service utilise un port réseau sur le serveur (le *8888* dans notre exemple précédent).

Et que si vous essayez de créer un deuxième service sur le même port, ça rique fort de ne pas marcher et de vous répondre des joyeusetés de ce type :

{{< highlight console "" >}}
> docker compose up -d
 ...
Error response from daemon: driver failed programming external connectivity on endpoint who-my-whoami2-1 (eef72cb881403afb6ed25b1b1c34a8f5c5dfc7d25ad8f70cd5b36a16fe1e4bc0): 
Bind for 0.0.0.0:8888 failed: port is already allocated
{{< /highlight >}}

Pour faire simple, la dernière ligne nous dit bien que le port 8888 est déjà utilisé et que donc on ne peux pas le réutiliser.
Donc si vous voulez avoir plusieurs services accessibles sur votre serveur, en première approche il faudrait associer à chaque service un port différent. Ca peut être vite difficile à retenir !

D'autant que cette notion de *port* est importante, car par défaut, le web utilise principalement deux ports :
- Le port <mark>80</mark> pour les appels HTTP[^1]
- Le port <mark>443</mark> pour les appels HTTPS[^2]

Le protocole HTTPS correspond au protocole HTTP avec une couche de sécurité en plus (d'ou le S final). C'est quand vous êtes sur une page en HTTPS que vous voyez apparaître le petit cadenas à gauche de votre barre d'addresse dans votre navigateur. Comme vous avez pu le constater, c'est maintenant le standard et la majorité des sites proposent de les consulter en HTTPS.

[^1]: *HyperText Transfer Protocol* littéralement *protocole de transfert hypertexte*
[^2]: *HyperText Transfer Protocol Secure* littéralement *protocole de transfert hypertexte sécurisé*

Et lorsqu'on appelle dans son navigateur un site, par exemple [https://www.cosmecharlier.fr/](https://www.cosmecharlier.fr/), on n'a pas l'habitude de préciser le port : c'est le navigateur qui choisit ici par défaut <mark>443</mark> car j'ai choisi le protocole https. Le plus simple serait donc d'exposer tous nos services sur ce même port <mark>443</mark> pour éviter d'avoir a retenir le port de chacun.

C'est ici qu'entre en jeu le *proxy inverse*, ou *reverse proxy* en anglais.

### Focus sur le proxy inverse

Le rôle du proxy inverse, est de capter en un point unique (via un seul port) le traffic à destination de plusieurs services, et de router ensuite chaque requête vers le bon service. Un schéma simplifié du fonctionnement est le suivant :

{{< mermaid >}}
graph LR;
    subgraph  
    direction LR
    C[Client]

    subgraph  SERVEUR
    RP[Proxy inverse]

    BS1[Service 1]
    BS2[Service 2]
    BS3[Service 3]
    end
    C--:443-->RP
    RP--:443-->BS1
    RP--:443-->BS2
    RP--:8080-->BS3
    end
{{< /mermaid >}}

Pour notre besoin, on voit qu'on peut ici faire tourner plusieurs services dans des conteneurs Docker, qu'ils utilisent ou pas le même port, et tout exposer au final depuis le proxy inverse qui écoute sur le port HTTPS (toujours le 443). 

Personnellement, j'utilise [Traefik](https://doc.traefik.io/traefik/) comme proxy inverse pour mes services auto-hébergés. Il a l'avantage d'être très facilement intégrable avec Docker, car il supporte notamment la configuration automatique du routage par des [*labels* Docker](https://doc.traefik.io/traefik/providers/docker/) positionnés sur les containers.

Je ne vais pas rentrer aujourdh'ui dans le détail de la configuration de Traefik, ça pourra faire l'objet d'un autre billet. On va donc partir de la configuration minimale proposée dans la documentation, qui n'est pas en HTTPS mais en HTTP. Pour l'exercice dans un premier temps ça suffira.

Comme précédemment, on va donc créer à côté du répertoire  `who` un répertoire `traefik`, et écrire dans ce répertoire un fichier `wdocker-compose.yml`.

Voici le contenu de ce fichier `traefik/docker-compose.yml`
{{< highlight yml "linenos=table,hl_lines=22" >}}
version: '3'
services:
  reverse-proxy:
    image: traefik:v2.9
    command: --providers.docker
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  whoami2:
    image: traefik/whoami
    labels:
      - "traefik.http.routers.whoami2.rule=Path(`/whoami`)"

networks:
  default:
    name: traefik
{{< /highlight >}}

Cette fois ci, on va déployer le proxy inverse *Traefik*, qui va écouter sur le port HTTP <mark>80</mark>. On lui donne accès ligne 9 à la *socket Docker*, ce qui lui permet de lire les informations sur les autres conteneurs et notamment les *labels*.
On déploie d'ailleurs à la ligne 11 une deuxième instance du service *whoami* qu'on appelle cette fois *whoami2* (oui j'étais inspiré !). On voit qu'on ajoute cette fois ligne 14 un *label*, qui sert ici à donner à Traefik la condition sur laquelle se baser pour rediriger les requêtes vers ce container. Pour ce conteneur, on n'expose pas de port sur l'hôte (pas de paramètre `ports` comme on le fait ligne 7 pour Traefik), donc par défaut il n'est pas joignable directement. La seule manière d'y accéder sera à travers le proxy inverse.
Le bloc `networks` à partir de la ligne 16 permet de définir un réseau virtuel appelé *traefik* dont on se servira au chapitre suivant.

Pour tester tout ça, on recommence : Depuis le répertoire `traefik` vous exécutez la commande : `docker compose up -d` :

{{< highlight console "" >}}
> cd traefik
> docker compose up -d
[+] Running 2/2
 ✔ Container traefik-whoami2-1        Started 
 ✔ Container traefik-reverse-proxy-1  Started    
{{< /highlight >}}

Vous voici avec un proxy inverse, prêt à gérer votre trafic !

Le premier test est un classique `curl localhost` :
{{< highlight console "" >}}
> curl localhost
404 page not found
{{< /highlight >}}

Ici on constate que traefik est opérationnel et a bien répondu. Il renvoie une page 404 car il n'a pas de contenu à retourner par défaut, mais c'est normal.

Maintenant, testons `curl localhost/whoami` :

{{< highlight console "" >}}
> curl localhost/whoami
Hostname: ce7262e8bf8f
IP: 127.0.0.1
IP: 172.25.0.2
RemoteAddr: 172.25.0.3:34674
GET /whoami HTTP/1.1
...
{{< /highlight >}}

Ca y est ! En appelant le chemin `/whoami` qu'on a configuré à la ligne 14 du fichier *docker-compose.yml*, on voit que maintenant, bien qu'on appelle le port 80 de traefik, ce dernier nous redirige vers le conteneur *whoami2* qu'on vient d'instancier. Le proxy est opérationnel !

Pour boucler la boucle, on peut maintenant revenir sur le fichier de la première partie, `who/docker-compose.yml`, pour y rajouter quelques lignes :
{{< highlight yml "linenos=table,hl_lines=7-22" >}}
version: '3'
services:
  my-whoami:
    image: traefik/whoami
    ports:
      - 8888:80
    labels:
      - "traefik.http.routers.whoami-router.rule=Path(`/whoami-external`)"
networks:
  default:
    name: traefik
    external: true   
{{< /highlight >}}

{{< alert "triangle-exclamation" >}}
Attention lorsque vous rajoutez des nouveaux services, à ce que le nom du routeur, ici `whoami-router` ligne 8, soit bien unique à travers vos services. S'il y a des doublons, les routeurs ne s'activent pas et les services restent injoignables.
{{< /alert >}}

On peut maintenant tester cette nouvelle route, et comparer les résultats aux autres appels :
{{< highlight console "linenos=table" >}}
> curl localhost/whoami-external
Hostname: 71cecddddd32
GET /whoami-external HTTP/1.1
Host: localhost:80
X-Forwarded-Server: 5a68d6bc158d

> curl localhost:8888
Hostname: 71cecddddd32
GET / HTTP/1.1
Host: localhost:8888

> curl localhost/whoami
Hostname: dd2bec6a01cf
GET /whoami HTTP/1.1
Host: localhost:80
X-Forwarded-Server: 5a68d6bc158d
{{< /highlight >}}

Pour bien comprendre ces résultats :
- Les appels des lignes 1 et 7 sont vers le même conteneur, celui créé dans la première partie dans le répertoire `who`. On peut constater ligne 2 et 8 que c'est bien le même conteneur qui répond à chaque fois, avec le hostname qui correspond à l'ID de ce conteneur si vous faite un `docker ps`
- Ce conteneur est appelé via 2 chemins différents : la première fois via Traefik (ligne 5 on voit le header `X-Forwarded-Server` avec l'ID du conteneur de Traefik), la seconde fois en direct via le port 8888 (et sans header `X-Forwarded-*`)
- L'appel ligne 12 est sur le conteneur créé dans le même fichier que Traefik, on vois que son *Hostname* est différent ligne 13, par contre il est bien passé par le même proxy inverse que le premier appel, comme on peut le voir en comparant les lignes 5 et 16

## Exposition externe avec des sous domaines

L'exemple du chapitre précédent présente une configuration minimale pour utiliser un proxy inverse pour vos services. Pour citer ses principaux défauts :
- Il utilise le protocole HTTP alors que la norme est maintenant au HTTPS. Pour parer à cela, je vous invite à consulter la [documentation](https://doc.traefik.io/traefik/https/acme/) car il existe de nomberuses configurations possibles selon votre situation. Mais Traefik permet d'obternir très facilement des certificats automatiques gérés par Let's Encrypt.
- Il expose vos services directement sur internet (si votre port 80 est exposé bien sûr), ce qui les rend accessibles par tous. Pour rajouter une couche de sécurité, j'utilise le plugin [traefik-forward-auth](https://github.com/thomseddon/traefik-forward-auth) qui vous permet de restreindre l'accès à vos services à des utilisateurs autentifiés auprès d'un fournisseur d'identité (Google, Github, etc.). La configuration dépend la aussi pas mal de votre contexte, mais je ferai peut être un billet sur le sujet un jour.
- La configuration du routage via des chemins est simple mais parfois peut interférer avec le fonctionnement des services eux mêmes. Pour parer à cela, le plus propre est d'attribuer à chaque service un sous-domaine DNS. Je vais prendre quelques lignes pour l'expliquer.

Pour ce dernier point, l'idée est donc d'attribuer à chaque service un sous-domaine DNS dédié. Il faut donc pour cela en pré-requis être le propriétaire d'un domaine, par exemple `mondomaine.com`. L'idée ensuite est donc de configurer :
- `service1.mondomaine.com` pour pointer vers un permier service
- `service2.mondomaine.com` pour pointer vers un autre service
- etc. vous avez compris

Pour obtenir ce résultat, il suffit de changer le label du routeur pour utiliser la fonction `Host` au lieu de `Path` :
```
- "traefik.http.routers.my-unique-service.rule=Host(`monservice.mondomaine.com`)"
```

Il faut bien sûr en parallèle configurer ce sous-domaine dans votre gestionnaire de DNS, pour qu'il pointe vers l'IP de votre serveur.

Et le tour en est joué ! Vos services ont maintenant chacun un sous-domaine dédié.


## Conclusion

Vous avez donc ici la synthèse de mon approche pour déployer un nouveau service : 
- Je crée un `docker-compose.yml`, le plus souvent les services à auto héberger en proposent déjà une version
- Je rajoute quelques labels docker pour router le service derrière mon proxy inverse
- Et je rajoute le sous domaine dans mon gestionnaire de DNS. 

Le tout prend le plus souvent moins d'une minute ! 

Bien sûr les approches exposées ici sont simplifiées, et mériteront sans doute plus de détails dans de futurs billets ! Pour être alerté des prochaines publications sur le blog, vous pouvez suivre le [flux RSS](https://www.cosmecharlier.fr/index.xml)

<div style="text-align: right"> 

*Poursuivons la discussion sur le fil du [Journal du Hacker](https://www.journalduhacker.net/s/)* 
</div>
