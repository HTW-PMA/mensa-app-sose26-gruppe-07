# Mensabär

Mensabär ist eine Expo-/React-Native-App für Berliner Mensen. Sie zeigt aktuelle
Speisepläne, Preise, Zusatzstoffe und Allergene, speichert persönliche
Einstellungen lokal und bewertet Gerichte mit einem separaten SWI-Prolog-Dienst.

## Funktionen

- Übersicht und Suche über Berliner Mensen
- tagesbezogene Speisepläne mit Studierendenpreisen, Badges sowie Zusatzstoffen
  und Allergenen
- gespeicherte Lieblingsmensa, Lieblingsgerichte und Gerichtefinder-Filter
- Offline-Grundfunktion für bereits geladene Daten durch lokalen Cache
- Gerichtefinder mit nachvollziehbarer, regelbasierter SWI-Prolog-Auswertung
- lokale tägliche Essens-Erinnerung und eine Testbenachrichtigung für die Demo
- verständliche Lade-, Leer- und Fehlerzustände mit Wiederholen-Funktion

## Voraussetzungen

- Node.js in einer aktuellen LTS-Version
- Docker Desktop (für den Prolog- und Mensa-API-Proxy)
- Android Studio mit Android-Emulator für Android
- macOS mit Xcode und iOS-Simulator für iOS

Die Anwendung besteht aus zwei Git-Repositories, die als direkte Nachbarn in
einem gemeinsamen Ordner liegen müssen. Das ist für `npm run presentation`
erforderlich.

```text
PMA/
├── mensa-app-sose26-gruppe-07/
└── prolog-webserver-sose26-gruppe-07/
```

## Einmalige Installation

Im gemeinsamen Arbeitsordner beide Repositories klonen:

```bash
git clone https://github.com/HTW-PMA/mensa-app-sose26-gruppe-07.git
git clone https://github.com/HTW-PMA/prolog-webserver-sose26-gruppe-07.git
```

Danach die JavaScript-Abhängigkeiten der App installieren:

```bash
cd mensa-app-sose26-gruppe-07
npm install
```

`npm install` wendet automatisch einen kleinen, versionierten Android-Gradle-Patch
an. Dieser ist für den lokalen Development Build erforderlich und bereits im
Repository enthalten.

## Backend und API-Key einrichten

Der Mensa-API-Key gehört ausschließlich in die Backend-`.env`. Er darf niemals
in die App-`.env`, in eine `EXPO_PUBLIC_*`-Variable, in einen Commit oder in eine
Präsentationsfolie geschrieben werden.

Windows PowerShell:

```powershell
cd ..\prolog-webserver-sose26-gruppe-07
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cd ../prolog-webserver-sose26-gruppe-07
cp .env.example .env
```

Danach `.env` öffnen und den persönlichen Schlüssel einsetzen:

```dotenv
MENSA_API_KEY=hier-den-echten-key-eintragen
```

Backend starten:

```bash
docker compose up -d --build
```

Prüfen, ob das Backend läuft:

```text
http://localhost:4000/health
```

Die Antwort muss `status: "ok"` und `mensaApiConfigured: true` enthalten. Sie
gibt den API-Key nicht aus. Fehlt der Key, bricht Docker absichtlich mit einer
klaren Fehlermeldung ab.

## App-Konfiguration

Für Android-Emulator und iOS-Simulator ist normalerweise **keine** App-`.env`
notwendig:

- Android-Emulator verwendet automatisch `http://10.0.2.2:4000`.
- iOS-Simulator verwendet automatisch `http://localhost:4000`.

Die mitgelieferte `.env.example` wird nur für ein echtes Smartphone oder einen
gehosteten Dienst benötigt. Dann eine App-`.env` anlegen und eine vom Gerät
erreichbare Backend-Adresse eintragen:

```dotenv
EXPO_PUBLIC_APP_API_URL=http://192.168.x.x:4000
```

Für ein echtes iPhone ist ein HTTPS-gehostetes Backend die verlässlichste
Variante. Bei einer lokalen WLAN-Adresse müssen Laptop und Telefon im selben
Netz sein und die Firewall den Port 4000 zulassen. Nach Änderungen an dieser
Variable Metro neu starten, zum Beispiel mit `npm run presentation`. Für eine
veröffentlichte Standalone-App wäre dagegen ein neuer Build nötig.

## Android starten

1. Docker Desktop starten und das Backend wie oben ausführen.
2. In Android Studio unter **Device Manager** einen Emulator starten.
3. In einem zweiten Terminal in das App-Repository wechseln.
4. Den Development Build einmalig installieren:

```bash
npm run android
```

Danach, solange sich keine native Abhängigkeit oder App-Konfiguration ändert,
reicht für weitere Starts:

```bash
npm run presentation
```

Der Befehl startet bzw. prüft das Backend, ruft echte Mensadaten ab und startet
Metro für den installierten Development Build.

## iOS starten

Diese Schritte funktionieren nur auf macOS.

1. Docker Desktop starten und das Backend wie oben ausführen.
2. Xcode öffnen und einen iOS-Simulator starten, zum Beispiel über
   **Xcode → Open Developer Tool → Simulator**.
3. In einem zweiten Terminal in das App-Repository wechseln.
4. Den Development Build einmalig installieren:

```bash
npm run ios
```

Danach, solange sich keine native Abhängigkeit oder App-Konfiguration ändert:

```bash
npm run presentation
```

Für ein echtes iPhone sind zusätzlich ein Apple-Signing-Team in Xcode sowie eine
vom iPhone erreichbare Backend-URL erforderlich. Die lokale Erinnerung selbst
benötigt keinen externen Push-Service.

## Notifications in der Präsentation demonstrieren

Für die Demo wird bewusst der installierte Development Build verwendet, nicht
Expo Go.

1. `npm run presentation` ausführen und die App im Emulator öffnen.
2. Zu **Mehr** wechseln.
3. **Test in 5 Sekunden** drücken.
4. Beim ersten Mal die Systemberechtigung erlauben.
5. Optional direkt zum Home-Bildschirm wechseln; nach etwa fünf Sekunden
   erscheint die echte lokale Systembenachrichtigung.

Die Testbenachrichtigung verändert die tägliche Erinnerung nicht.

## Vor einer Präsentation

```bash
npm run presentation:check
```

Dieser Check prüft die Backend-Konfiguration, startet Docker, prüft den
Health-Endpunkt und ruft echte Mensen ab. Nur wenn alle Schritte erfolgreich
sind, sollte die Live-Demo begonnen werden.

## Qualität prüfen

Im App-Repository:

```bash
npm run typecheck
npm test
npx expo-doctor
npx expo install --check
npx expo export --platform all
```

Im Backend-Repository:

```bash
swipl -q -g run_tests -t halt tests/recommendation_engine_tests.pl
swipl -q -g "run_tests(mensa_proxy),halt" tests/mensa_proxy_tests.pl
```

Ohne lokal installiertes SWI-Prolog können die Backend-Tests auch im Docker-
Container ausgeführt werden; die vollständigen Befehle stehen im Backend-README.

## Häufige Probleme

**Port 8081 ist bereits belegt:** Den vorhandenen Metro-Prozess beenden oder
den bereits laufenden Development Server weiterverwenden. Unter Windows zeigt
dieser Befehl den Prozess:

```powershell
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
```

**App zeigt keine Mensen:** Zuerst `http://localhost:4000/health` öffnen und
anschließend `npm run presentation:check` ausführen. Prüfen, ob Docker läuft
und `mensaApiConfigured` auf `true` steht.

**Android erreicht das Backend nicht:** Keine App-`.env` mit `localhost` für
den Android-Emulator verwenden. Dort wird automatisch `10.0.2.2` genutzt.

## Architektur

```text
Mensa REST API -> Backend /api/* -> App + AsyncStorage-Cache -> Screens
Gerichtefinder -> Backend /recommend -> SWI-Prolog-Regeln -> Rangfolge
Profil -> notificationService -> lokale Android-/iOS-Notification
```

Die App verwendet Context API für Auswahl, Favoriten und Präferenzen.
Mensa-Rohdaten werden ausschließlich in `src/services/mensaApi.ts` in
Domänentypen überführt. Der Prolog-Service erhält nur beobachtbare
Gerichtsfakten und leitet Eigenschaften sowie Scores selbst aus Regeln ab.
