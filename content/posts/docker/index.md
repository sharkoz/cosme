---
title: "Votre premier pas avec Docker"
date: 2023-03-05
summary: Un guide de présentation de docker, avec les étapes pour lancer un premier conteneur
description: Un guide de présentation de docker, avec les étapes pour lancer un premier conteneur
keywords: hébergement, auto, auto-hébergement, self-hosted, serveur, maison, docker, conteneur
draft: true
---

Aujourd'hui je vais vous parler du mode de déploiement que je trouve le plus adapté pour tester différents services en auto-hébergement : Docker. 

Je vais séparer cette introduction en plusieurs parties pour y aller en douceur. Aujourd'hui, on va se concentrer sur l'installation et l'exécution d'un traditionnel *hello world*.

Et voici le programme du jour :
{{< toc >}}

## Docker en quelques mots

Pour citer la documentation officielle, *Docker est une plateforme qui permet de développer, de déployer et d'exécuter des applications*. 

Pour vous présenter Docker de manière un peu plus *pratique*, Docker permet surtout de packager une application avec toutes ses dépendances dans un objet unique et facilement manipulable, qu'on appelle un *conteneur*. Un conteneur est l'objet de base pour Docker qui va donc permettre de délimiter simplement un programme, avec tout ce dont il a besoin pour s'exécuter.

Ses principaux avantages pour moi dans le cadre de l'auto-hébergement sont :
- C'est reproductible : une même image s'exécutera sur deux serveurs de la même manière (tant qu'on garde la même architecture CPU). Les dépendances sont embarquées, donc il n'y a pas de risque d'incompatiblité à cause d'un autre package installé, ou de configuration différente...
- C'est 'propre' : par là je veux dire qu'on exécute un service en une commande, et qu'on peut le supprimer en une commande également. Ca ne laisse pas de trace qui pourrait modifier le comportement de votre serveur à l'avenir (fini les 32 versions de python qui traînent en parallèle...)
- C'est simple : en lien avec le point du dessus, en une commande on déploie tout un service qui a été pré-configuré en amont
- C'est *mainstream* : Je vais en choquer certains, mais de mon expérience c'est précieux d'avoir un écosystème riche et de nombreux acteurs sur la technologie. Et tant pour les experts que les débutants : Il y a plus de questions sur *docker* que sur *linux* sur stackoverflow, ça augmente les chances de trouver des réponses à vos questions ! Et c'est également appréciable, une grande partie des services qui peuvent être intéressants à auto-héberger disposent d'une version *docker* pour le faire.

Le fonctionnement classique d'exécution d'une application avec Docker est le suivant :
- On commence par télécharger une *image* Docker, qui correspond à un gros fichier qui contient tout ce dont on a besoin pour faire tourner l'application. En général on télécharge cette image à partir d'un *registre* Docker, qui est comme une bibliothèque qui contient un certain nombre d'images Docker prêtes à l'emploi. Le registre le plus connu est [Docker Hub](https://hub.docker.com/). Il est disponible par défaut dans Docker
- Puis on lance l'image avec une commande `docker run`, ce qui crée à partir de l'image un *conteneur* qui exécute le code défini dans l'image

{{< mermaid >}}
flowchart LR
    subgraph Client cli
    A[docker]
    end
    subgraph SD[Démon Docker]
        direction TB
        A -- "1) envoie des commandes" --> B[dockerd]
        subgraph Conteneurs
        C[Conteneur 2]
        end
    end
    subgraph SR[Registre]
    direction RL
    D[image 1]
    C <-- "3) télécharge l'image et l'exécute" --> E[image 2]
    end
B --"2) cherche une image"--> SR
{{< /mermaid >}}

Et voilà ! Votre application est opérationnelle. Avant de rentrer plus dans le détail, je vous propose de passer à la pratique et de déployer ensemble votre première application sur Docker.

## Installation

Ce tutoriel part du principe que vous avez déjà une distribution Linux installée, sur une machine qui a accès à internet. Je vais décrire les actions applicables sur un OS de type Debian ou Ubuntu, pour d'autres systèmes d'exploitation je vous renvoie vers la [documentation Docker](https://docs.docker.com/engine/install/).

Pour un serveur qui fera de l'auto-hébergement, je vous conseille de partir sur une version disponible sur les dépôts *apt* plutôt qu'une version *desktop*.

Il faut commencer par ajouter le dépôt apt Docker, qui n'est pas présent par défaut dans les configurations.

On prépare les dépendances :
``` bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release
```
On installe la clé GPG de Docker :

``` bash
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

Et on rajoute l'adresse du dépôt :
``` bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Une fois le dépôt ajouté, on met à jour la liste des packages disponibles 
``` bash
sudo apt-get update
```

Puis on installe le package *docker* et quelques autres qui serviront plus tard :
``` bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Pour confirmer que l'installation s'est bien passée, on peut exécuter :
``` bash
docker run hello-world
```

## Premier pas avec *hello-world*

Pour confirmer que l'installation s'est bien passée, il est temps de lancer votre premier conteneur Docker !
``` bash
docker run hello-world
```

Si tout se passe bien, vous devriez avoir à peu près ce rendu :

{{< highlight docker "linenos=table, hl_lines=1" >}}
$> docker run hello-world
    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    2db29710123e: Pull complete
    Digest: sha256:6e8b6f026e0b9c419ea0fd02d3905dd0952ad1feea67543f525c73a0a790fefb
    Status: Downloaded newer image for hello-world:latest

    Hello from Docker!
    ...
{{< /highlight >}}

Si on détaille ce qui vient de se passer :
- `docker run hello-world` demande à Docker d'exécuter l'image appelée *hello-world*. Docker par défaut essaye de la trouver sur *Docker hub* et récupère donc l'image officielle [hello-world](https://hub.docker.com/_/hello-world)


- `Unable to find image 'hello-world:latest' locally` devrait être assez clair si vous parlez anglais : Docker ne trouve pas l'image l'image *hello world* localement. Notez qu'il rajoute derrière le nom de l'image <mark>:latest</mark>, qui est le *tag* de l'image par défaut, et qui correspond à la version de l'image. La convention de nommage veut que le tag *latest* pointe toujours vers la version de l'image la plus récente :

{{< highlight docker "linenos=table, hl_lines=2" >}}
$> docker run hello-world
    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    2db29710123e: Pull complete
    Digest: sha256:6e8b6f026e0b9c419ea0fd02d3905dd0952ad1feea67543f525c73a0a790fefb
    Status: Downloaded newer image for hello-world:latest

    Hello from Docker!
    ...
{{< /highlight >}}


- Les lignes suivantes jusqu'à `Hello from Docker!` montrent que l'image a été téléchargée. Docker par défaut essaye de la trouver sur *Docker hub* et récupère donc l'image officielle [hello-world](https://hub.docker.com/_/hello-world) :

{{< highlight docker "linenos=table, hl_lines=3-6" >}}
$> docker run hello-world
    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    2db29710123e: Pull complete
    Digest: sha256:6e8b6f026e0b9c419ea0fd02d3905dd0952ad1feea67543f525c73a0a790fefb
    Status: Downloaded newer image for hello-world:latest

    Hello from Docker!
    ...
{{< /highlight >}}


- A partir de `Hello from Docker!`, c'est tout simplement le message qui est affiché par le container une fois qu'on l'a lancé. Ici le container *hello-world* est très simple et se contente d'afficher ce message puis de s'arrêter :

{{< highlight docker "linenos=table, hl_lines=8-9" >}}
$> docker run hello-world
    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    2db29710123e: Pull complete
    Digest: sha256:6e8b6f026e0b9c419ea0fd02d3905dd0952ad1feea67543f525c73a0a790fefb
    Status: Downloaded newer image for hello-world:latest

    Hello from Docker!
    ...
{{< /highlight >}}


Si vous relancez une nouvelle fois la même commande `docker run hello-world`, vous verrez que vu que l'image existe maintenant localement, Docker n'essaye plus de la télécharger à nouveau et se contente d'afficher le message `Hello from Docker! ...` :

{{< highlight docker "linenos=table, hl_lines=2-3x  x   " >}}
$> docker run hello-world
    Hello from Docker!
    ...
{{< /highlight >}}

<br>
  
Et voilà ! Vous avez lancé votre premier container Docker. C'était plutôt simple non ? 

Pour l'instant on s'est contentés d'afficher le simplissime *hello world*, mais dans le prochain billet, on regardera comment Docker peut exécuter des applications plus complexes.

Pour être alerté des prochaines publications sur le blog, vous pouvez suivre le [flux RSS](https://www.cosmecharlier.fr/index.xml)

<div style="text-align: right"> 

*Poursuivons la discussion sur le fil du [Journal du Hacker](https://www.journalduhacker.net/)* 
</div>


