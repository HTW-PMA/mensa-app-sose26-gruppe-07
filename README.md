# Mensabär


## Features (Grundgerüst)

- **Home**: Übersicht Berliner Mensen, Suche, Schnellzugriff
- **Speiseplan**: Tagesauswahl, Kategorie-Filter, Menü-Karten mit Allergenen
- **Favoriten**: Lieblingsmensen und Lieblingsgerichte (Context API)
- **Gerichtefinder**: KI-Auswahl mit Mock-Scoring (Prolog-Vorbereitung)
- **Profil**: Benutzerprofil und Einstellungen

## Tech-Stack bzw beachtete Vorgaben

- Expo (React Native)
- TypeScript
- React Navigation (Bottom Tabs)
- Context API für State Management
- StyleSheet.create (einheitliches Styling)
- Mensa API (nur GET-Endpoints)

## Voraussetzungen

- [Node.js](https://nodejs.org/) (LTS, v18+)
- [Expo CLI](https://docs.expo.dev/) (wird via `npx` genutzt)

### Android (Windows)

- [Android Studio](https://developer.android.com/studio) mit Android Emulator

### iOS (macOS – für Teammitglieder mit MacBook)

- [Xcode](https://developer.apple.com/xcode/) mit iOS Simulator

## Installation

```bash
# Repository klonen
git clone https://github.com/HTW-PMA/mensa-app-sose26-gruppe-07.git
cd mensa-app-sose26-gruppe-07

# Abhängigkeiten installieren
npm install

# API-Key konfigurieren (ohne Key werden Mock-Daten genutzt)
cp .env.example .env
# EXPO_PUBLIC_MENSA_API_KEY in .env eintragen
```

API-Key anfordern: [mensa.gregorflachs.de/swaggerdoku](https://mensa.gregorflachs.de/swaggerdoku)

## App starten

```bash
# Entwicklungsserver starten
npm start

# Android Emulator (Windows)
npm run android

# iOS Simulator (nur macOS)
npm run ios
```

## Projektstruktur

```
src/
  components/     # Wiederverwendbare UI-Komponenten
  constants/      # Farben, Layout-Tokens
  context/        # Context API (Favoriten, Präferenzen, App-State)
  hooks/          # useCanteens, useMeals
  navigation/     # Tab-Navigation
  screens/        # 5 Hauptscreens
  services/       # API-Client, Mock-Daten, Recommendation-Service
  types/          # TypeScript-Typen
```

## Design-Farben

| Name | Hex |
|------|-----|
| Waldgrün | `#2E3D23` |
| Salbeigrün | `#8FA877` |
| Creme | `#F1EDE0` |

## API-Nutzung

Nur GET-Endpoints werden genutzt:

- `GET /canteen`  Mensen
- `GET /meal`  Gerichte
- `GET /menue` Menükarten
- `GET /badge`  Auszeichnungen
- `GET /additive`  Zusatzstoffe/Allergene

Ohne API-Key lädt die App automatisch Mock-Daten (HTW Treskowallee, Pasta Arrabbiata, etc.).

## Prolog / KI-Feature

Das Gerichtefinder-Scoring nutzt aktuell einen **Mock-Provider** (`src/services/recommendationService.ts`). Die UI ist vorbereitet für einen späteren Prolog-Backend-Swap über das `RecommendationProvider`-Interface.

