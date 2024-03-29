<img src="/images/logo.png?raw=true" alt="Orpheo" width="200" height="200"/>

# Serveur node.js 

Ces deux microservices node.js permettent :<br/>
    - La génération d'un QRCode personnalisé à l'aide d'un formulaire à remplir.<br/>
    - La modification et génération de masse d'un PDF rentré en paramètre pour le remplir de QR Code de clé d'activation.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

Cloner le repo github avec la commande :<br/>
    "git@github.com:AlbaneseRemy/orpheo_nodejs.git"<br/>
Deux dossiers sont présents: <br/>
    - pdf-editor<br/>
    - qrcode-generation

Il faudra ouvrir les deux dans deux terminaux différents, puis rentrer dans chacun des dossiers, la commande suivante:<br/>
    "node server.mjs"
Cela ouvrira deux serveurs distincts aux ports suivants : 8000 et 3000<br/>
Le serveur de QR Code est totalement indépendant du serveur de PDF, tandis que le serveur de PDF a besoin des QR Codes pour fonctionner.

## Usage

L'interface pour la génération des QR Code se trouve à l'adresse internet "localhost:8000".<br/>

Vous pouvez générer un QR Code en remplissant le formulaire : <br/>
<img src="/images/form.png?raw=true" alt="Form screenshot"/>
Pour la génération d'une image, il n'y a pas besoin de rentrer de fichier json, ni de fichier pdf. Vous pouvez ensuite cliquer sur le bouton : "Preview".

Pour générer un PDF, il faut rentrer le pdf template, comportant deux champs: <br/>
    - Un champ textfield avec pour id : "activation-key"<br/>
    - Un champ button avec pour id : "qrcode_af_image"<br/>
Il faut également rentrer un fichier json suivant la structure suivante :<br/>
    Une liste "keys", comportant pour chaque élément :<br/>
        - Un élément "key" correspondant à la clé d'activation<br/>
        - Un élément "url" correspondant à ce qui sera encodé dans le QR Code.<br/>
