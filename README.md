# node-dota2
  _____        _        ___     _____ _        _       
 |  __ \      | |      |__ \   / ____| |      | |      
 | |  | | ___ | |_ __ _   ) | | (___ | |_ __ _| |_ ___ 
 | |  | |/ _ \| __/ _` | / /   \___ \| __/ _` | __/ __|
 | |__| | (_) | || (_| |/ /_   ____) | || (_| | |_\__ \
 |_____/ \___/ \__\__,_|____| |_____/ \__\__,_|\__|___/
                                                       
                                                       
 ## Voraussetzungen:
- Node.js 0.10.2x
- MongoDB 

 ## Installation:
- Node.js installieren
- In der Kommandozeile in den node-dota2 Ordner wechseln
- npm install -g sails@beta
- npm install
	Bei Problemen damit npm install -g node-gyp ausführen und danach erneut versuchen

- MongoDB auf localhost 27017 ohne user und password starten.
	Ansonsten in der config/local.js die Daten anpassen
	Es wird eine Datenbank node-dota2 angelegt, dem Nutzer die entsprechenden Rechte einräumen falls nötig
- den Webserver mit sails lift in der Kommandozeile starten.
	Wenn das nicht geht node app.js  probieren


Der Prototyp verwendet ein Steamkonto. Wir haben ein Testkonto unter  xyz Pw: asdf  aufgesetzt.




