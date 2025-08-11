---
title: "Docker pour s'auto-héberger : Les bases à connaître"
date: 2023-02-24
summary: Un guide de présentation de docker, avec les étapes pour lancer un premier conteneur
description: Un guide de présentation de docker, avec les étapes pour lancer un premier conteneur
keywords: hébergement, auto, auto-hébergement, self-hosted, serveur, maison, docker, conteneur
draft : true
---


Dans cet article, nous allons nous intéresser aux principaux paramètres de lancement que vous serez amenés à rencontrer pour auto hégerger vos services avec Docker.

## Introduction aux Paramètres de Docker

Avant de commencer à explorer les paramètres de Docker, il est essentiel de comprendre ce qu'est Docker et pourquoi il est important. Docker est une plateforme de conteneurisation open-source qui permet aux développeurs de packager des applications et leurs dépendances dans des conteneurs. Ces conteneurs peuvent être déployés sur n'importe quelle machine, indépendamment du système d'exploitation ou de l'infrastructure sous-jacente.

Les paramètres de Docker sont essentiels pour configurer la façon dont les conteneurs fonctionneront et interagiront avec le système hôte. En définissant les bons paramètres, vous pouvez vous assurer que votre conteneur Docker fonctionne de manière fluide et efficace.

## Comprendre les Ports Docker

Les ports sont essentiels lorsqu'on travaille avec des conteneurs Docker. Ils permettent à vos conteneurs de communiquer avec le monde extérieur. Les conteneurs Docker peuvent exposer des ports au système hôte ou à d'autres conteneurs, ce qui facilite l'accès aux services exécutés à l'intérieur du conteneur.

Lors de l'exécution d'un conteneur Docker, vous pouvez spécifier le mappage de port à l'aide de l'option -p. Par exemple, pour mapper le port 80 du système hôte au port 8080 dans le conteneur, vous utiliseriez la commande suivante :

    docker run -p 80:8080 myapp

## Politiques de Redémarrage

Les politiques de redémarrage définissent la façon dont Docker gère les redémarrages de conteneurs en cas de défaillance ou de redémarrage système. Docker fournit quatre politiques de redémarrage : no, on-failure, unless-stopped, et always.

La politique no signifie que Docker ne tentera pas de redémarrer le conteneur, tandis que la politique on-failure redémarrera le conteneur uniquement s'il se termine avec un code de sortie non nul. La politique unless-stopped redémarrera le conteneur sauf s'il est explicitement arrêté par l'utilisateur, tandis que la politique always redémarrera le conteneur quoi qu'il arrive.

Pour définir la politique de redémarrage, vous pouvez utiliser l'option --restart lors de l'exécution du conteneur. Par exemple, pour définir la politique always, vous utiliseriez la commande suivante :

    docker run --restart=always myapp

## Les Volumes Docker

Les volumes Docker vous permettent de partager des données entre des conteneurs ou entre le système hôte et le conteneur. Les volumes sont persistants et survivent au cycle de vie des conteneurs. Cela signifie que vous pouvez stocker des données en dehors du conteneur lui-même, ce qui facilite la sauvegarde et la restauration des données.

Lorsque vous créez un volume Docker, vous pouvez le monter dans un conteneur en utilisant l'option -v lors de l'exécution du conteneur. Par exemple, pour monter le volume mydata dans le conteneur, vous utiliseriez la commande suivante :

    docker run -v mydata:/data myapp

## Les Variables d'Environnement Docker

Les variables d'environnement Docker sont utilisées pour configurer les applications à l'aide de paramètres définis à l'avance. Les variables d'environnement peuvent être utilisées pour définir des informations de connexion, des clés d'API, des identifiants de base de données, et plus encore.

Lorsque vous exécutez un conteneur Docker, vous pouvez définir des variables d'environnement à l'aide de l'option -e. Par exemple, pour définir la variable d'environnement DB_HOST sur localhost, vous utiliseriez la commande suivante :

    docker run -e DB_HOST=localhost myapp

## Les Réseaux Docker

Les réseaux Docker sont utilisés pour connecter des conteneurs entre eux et avec le système hôte. Les réseaux Docker sont isolés les uns des autres, ce qui signifie que les conteneurs dans un réseau ne peuvent pas communiquer avec les conteneurs dans un autre réseau, sauf s'ils sont explicitement configurés pour le faire.

Lorsque vous exécutez un conteneur Docker, vous pouvez le connecter à un réseau en utilisant l'option --network. Par exemple, pour connecter le conteneur myapp au réseau mynet, vous utiliseriez la commande suivante :

    docker run --network mynet myapp

## Les Liens Docker

Les liens Docker sont utilisés pour connecter des conteneurs ensemble en créant une relation parent-enfant. Les liens Docker permettent à un conteneur de communiquer avec un autre conteneur en utilisant son nom de conteneur comme adresse IP.

Lorsque vous exécutez un conteneur Docker, vous pouvez le lier à un autre conteneur en utilisant l'option --link. Par exemple, pour lier le conteneur myapp au conteneur mydb, vous utiliseriez la commande suivante :

    docker run --link mydb:db myapp
