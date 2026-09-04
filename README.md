# Fitness Tracker App

A cross-platform mobile app for logging workouts and visualizing fitness progress, built with Expo and React Native.

## Overview

Fitness Tracker App lets users log workouts (name, duration, calories, date) and review their activity through a dashboard and statistics view with weekly/monthly trend charts. The app supports light and dark themes and three languages (English, Arabic, Russian) with automatic RTL layout for Arabic. All data is stored locally on the device — there is no backend or account system.

## Features

- **Dashboard** with summary stats and bar/line charts of recent activity
- **Workouts** list with add, edit, and delete, plus swipe-friendly card layout and animated list updates
- **Statistics** screen showing total calories/duration, longest workout, and a weekly trend line chart
- **Settings** screen for switching language and theme, with an in-app about dialog
- **Multi-language support** (English, Arabic, Russian) via i18next, with automatic RTL layout for Arabic
- **Light/dark theme** with persisted user preference
- **Offline-first persistence** — workouts, theme, and language preferences are saved locally with AsyncStorage via Zustand's persist middleware
- **Custom localized fonts** (Inter, Cairo, Roboto) loaded through Expo Google Fonts

## Tech stack

- [Expo](https://expo.dev/) / React Native 0.81
- TypeScript
- React Navigation (bottom tabs)
- Zustand (state management + persistence)
- AsyncStorage (local storage)
- react-i18next / expo-localization (internationalization)
- react-native-chart-kit + react-native-svg (charts)
- date-fns (date handling)
- ESLint (eslint-config-expo)

## Getting started

### Prerequisites

- Node.js and npm
- Expo CLI (installed automatically via `npx expo`)
- Expo Go app on a physical device, or an iOS/Android simulator, for testing

### Install

```bash
npm install
```

### Run

```bash
npm start        # start the Expo dev server
npm run android   # start and open on Android
npm run ios       # start and open on iOS
npm run web       # start and open in a web browser
```

### Lint

```bash
npm run lint
```

No environment variables are required — the app runs entirely with local, on-device storage.

## Project structure

```
.
├── App.tsx                # Re-exports the app entry from src
├── index.ts                # Expo/React Native root component registration
├── app.json                 # Expo app configuration
├── assets/                  # App icons and splash images
└── src/
    ├── App.tsx              # Navigation container, theming, font/store hydration
    ├── components/           # Header, WorkoutCard, AddWorkoutModal, ThemeToggle, LanguageSwitcher
    ├── pages/                 # Dashboard, Workouts, Statistics, Settings screens
    ├── store/                 # Zustand stores: workouts, theme, language
    ├── styles/                # Theme definitions (light/dark palettes, fonts)
    └── i18n/                  # i18next setup and en/ar/ru translation files
```
