# Mensabär

Mensabär ist eine Expo-/React-Native-App für die Berliner Mensen. Sie zeigt
aktuelle Speisepläne, speichert Favoriten und Einstellungen offline und lässt
Gerichte durch einen separaten SWI-Prolog-Dienst empfehlen.

## Funktionen

- Übersicht und Suche über alle Berliner Mensen
- datumsbezogene Speisepläne mit Studierendenpreisen, Badges und Allergenen
- persistierte Lieblingsmensen, Lieblingsgerichte und Filter
- API-Cache für bereits geladene Daten bei vorübergehend fehlendem Internet
- sichtbare Mensa- und Sieben-Tage-Auswahl in Speiseplan und Gerichtefinder
- Gerichtefinder mit regelbasierter SWI-Prolog-Auswertung für den gewählten Tag
- kompakte Gerichtkarten mit aufklappbaren Details zu Allergenen und Umweltwerten
- konfigurierbare tägliche Essens-Erinnerung als lokale Notification
- verständliche Lade-, Leer- und Fehlerzustände mit Wiederholen-Funktion

## Voraussetzungen

- Node.js LTS
- Docker Desktop oder SWI-Prolog 9+
- gültiger Mensa-API-Key von
  [mensa.gregorflachs.de/swaggerdoku](https://mensa.gregorflachs.de/swaggerdoku)
- Android Studio für Android-Emulator/-Build oder Xcode für iOS

## Installation

```bash
git clone https://github.com/HTW-PMA/mensa-app-sose26-gruppe-07.git
cd mensa-app-sose26-gruppe-07
npm install
```

`.env.example` nach `.env` kopieren und den API-Key eintragen:

```dotenv
EXPO_PUBLIC_MENSA_API_KEY=dein-api-key
EXPO_PUBLIC_PROLOG_API_URL=http://localhost:4000
```

Ohne gültigen API-Key kann beim ersten Start nichts geladen werden. Nach einem
erfolgreichen Abruf stehen die gespeicherten Daten auch offline zur Verfügung.
`.env` wird von Git ignoriert und darf nicht committet werden.

## Prolog-Dienst starten

Der Dienst liegt im separaten Repository
`prolog-webserver-sose26-gruppe-07`:

```bash
cd ../prolog-webserver-sose26-gruppe-07
docker compose up -d --build
```

Mit `http://localhost:4000/health` lässt sich prüfen, ob der Dienst läuft.

Für Web und iOS-Simulator ist `http://localhost:4000` der Standard. Der
Android-Emulator verwendet automatisch `http://10.0.2.2:4000`. Auf einem echten
Gerät muss `EXPO_PUBLIC_PROLOG_API_URL` auf die im WLAN erreichbare IP des
Entwicklungsrechners oder auf einen gehosteten HTTPS-Dienst zeigen.

## App starten

Zuerst im Android-Studio-Device-Manager einen Emulator starten. Danach im
App-Repository:

```bash
npx expo start -c
```

Mit `a` wird die App im laufenden Android-Emulator über Expo Go geöffnet; mit `w`
startet die Web-Version. Die übrige App lässt sich in Expo Go testen, ohne dass
`expo-notifications` beim Start abstürzt. Die Essens-Erinnerung bleibt
dort deaktiviert und zeigt beim Aktivierungsversuch einen Hinweis.

Um auch die lokale Essens-Erinnerung im Emulator zu testen, ist ein eigener
Development Build nötig:

```bash
npx expo install expo-dev-client
npx expo run:android
```

Beim ersten Aktivieren fragt die App nach der Systemberechtigung. Remote Push
Notifications sind nicht Teil dieses Stands; dafür wären zusätzlich EAS-Projekt-ID
sowie FCM-/APNs-Credentials erforderlich.

## Qualität prüfen

```bash
npm run typecheck
npx expo install --check
npx expo export --platform all
```

Die Prolog-Regeltests werden im Backend-Repository ausgeführt:

```bash
swipl -q -g run_tests -t halt tests/recommendation_engine_tests.pl
```

## Architektur

```text
Mensa REST API -> mensaApi + AsyncStorage-Cache -> Hooks -> Screens
Gerichtefinder -> recommendationService -> SWI-Prolog /recommend
Profil -> notificationService -> lokale Android-/iOS-Notification
```

Die App nutzt Context API für Auswahl, Favoriten und Präferenzen. Rohdaten der
Mensa-API werden ausschließlich in `src/services/mensaApi.ts` in Domänentypen
umgewandelt.
