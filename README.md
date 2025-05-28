# Quizolandia

**Interaktywna platforma quizowa** umożliwiająca użytkownikom rozwiązywanie quizów, rywalizację i śledzenie postępów.
## Spis treści

- [Opis projektu](#opis-projektu)
- [Demo aplikacji](#demo-aplikacji)
- [Funkcjonalności](#funkcjonalności)
- [Technologie](#technologie)
- [Struktura projektu](#struktura-projektu)
- [Instalacja lokalna](#instalacja-lokalna)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
- [API Reference](#api-reference)
- [Autorzy](#autorzy)

## Opis projektu

Quizolandia to nowoczesna platforma edukacyjna oferująca interaktywne quizy i zadania wspomagające naukę. Aplikacja umożliwia użytkownikom:

- Rozwiązywanie quizów z różnych kategorii
- Śledzenie postępów i statystyk
- Rywalizację z innymi użytkownikami
- Przeglądanie rankingów
- Dodawanie komentarzy i ocen do quizów

## Strona Aplikacji

[Quizolandia - Platforma Quizowa](https://quiz.knuruf.tech/)

## Funkcjonalności

### System użytkowników
- **Rejestracja i logowanie** - bezpieczna autentyfikacja z hashowaniem haseł (bcrypt)
- **Profile użytkowników** - wyświetlanie statystyk, postępów i osiągnięć
- **System uprawnień** - rozróżnienie między zwykłymi użytkownikami a administratorami
- **Zarządzanie kontem** - możliwość aktualizacji danych profilu

### System quizów
- **Przeglądanie quizów** - kategorie, poziomy trudności, popularne quizy
- **Rozwiązywanie quizów** - interaktywny interfejs do odpowiadania na pytania
- **System oceniania** - automatyczne sprawdzanie odpowiedzi i naliczanie punktów
- **Komentarze i oceny** - system 5-gwiazdkowych ocen z komentarzami

### Ranking i statystyki
- **Globalny ranking** - top 10 użytkowników z podium
- **Statystyki osobiste** - wykresy postępów, passy, rozwiązane quizy, osiągnięcia
- **Historia aktywności** - śledzenie dat i wyników rozwiązanych quizów

### Wyszukiwanie
- **Wyszukiwarka quizów** - filtrowanie po kategorii, trudności, popularności
- **Kategorie tematyczne** - uporządkowane grupy quizów
## Technologie

### Frontend
- **HTML5** - struktura aplikacji
- **CSS3** - stylowanie z custom properties i responsywnym designem
- **Vanilla JavaScript** - logika frontendowa bez frameworków
- **WebSockets** - komunikacja w czasie rzeczywistym z serwerem

### Backend
- **Node.js** - środowisko uruchomieniowe
- **TypeScript** - typowany JavaScript dla lepszej jakości kodu
- **WebSocket Server (ws)** - obsługa połączeń w czasie rzeczywistym
- **MySQL2** - połączenie z bazą danych MySQL
- **Bcrypt** - hashowanie haseł
- **Winston** - system logowania z rotacją plików
- **Handlebars** - templating dla dynamicznych zapytań SQL
- **Zod** - walidacja schematów danych

### Baza danych
- **MySQL** - relacyjna baza danych

## Struktura projektu

```
quizolandia-ale-mi-sie-udalo/
├── backend/                    # Backend aplikacji
│   ├── src/
│   │   ├── index.ts           # Główny serwer WebSocket
│   │   ├── config.ts          # Konfiguracja bazy i serwera
│   │   └── types.ts           # Definicje TypeScript
│   ├── package.json           # Zależności Node.js
│   ├── dist/                  # Skompilowane pliki (generowane)
│   └── logs/                  # Logi aplikacji (generowane)
├── scripts/                   # JavaScript frontend
│   ├── quiz.js               # System quizów i komentarzy
│   ├── rank.js               # Rankingi użytkowników
│   ├── profile.js            # Profile i statystyki
│   ├── login.js              # Autentyfikacja
│   └── *.js                  # Inne skrypty pomocnicze
├── styles/                   # Style CSS
│   ├── global.css            # Podstawowe style
│   ├── home.css              # Strona główna
│   ├── quiz.css              # Strony quizów
│   └── *.css                 # Inne arkusze stylów
├── assets/                   # Zasoby statyczne
│   └── images/               # Grafiki i ikony
├── *.html                    # Strony HTML aplikacji
├── baza.sql                  # Schemat bazy danych MySQL
└── README.md                 # Ta dokumentacja
```

## Instalacja lokalna

*Ta sekcja jest przeznaczona dla deweloperów, którzy chcą uruchomić projekt lokalnie do celów deweloperskich lub testowych.*

### Wymagania
- **Node.js** (v16 lub nowszy)
- **MySQL** (v8.0 lub nowszy)
- **npm** lub **yarn**

### Kroki instalacji

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/Zenic1/quizolandia-ale-mi-sie-udalo.git
cd quizolandia-ale-mi-sie-udalo
```

2. **Zainstaluj zależności backendu**
```bash
cd backend
npm install
```

3. **Skonfiguruj bazę danych MySQL**
    - Utwórz nową bazę danych dla projektu
    - Zaimportuj schemat bazy danych (baza.sql)

## Konfiguracja

### Zmienne środowiskowe

Utwórz plik `.env` w katalogu `backend/`:

```env
# Konfiguracja bazy danych
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=quiz

# Inne ustawienia
SALT_ROUNDS=10
```

### Konfiguracja WebSocket

Serwer WebSocket domyślnie uruchamia się na porcie **8080** z następującymi ustawieniami:
- Kompresja per-message deflate
- Limit współbieżności: 10 połączeń
- Próg kompresji: 1024 bajtów

## Uruchomienie

### Środowisko deweloperskie

1. **Uruchom backend**
```bash
cd backend
npm run dev
```

2. **Uruchom frontend**
    - Otwórz `index.html` w przeglądarce
    - Lub użyj lokalnego serwera HTTP (np. Live Server w VS Code)

### Środowisko produkcyjne

1. **Zbuduj backend**
```bash
cd backend
npm run build
```

2. **Uruchom serwer**
```bash
npm start
```

## API Reference

### Architektura komunikacji

Aplikacja używa **WebSocket** do komunikacji między frontendem a backendem. Wszystkie żądania mają strukturę:

```typescript
interface ServerData {
  action: "request" | "response";
  params: RequestPayload | ResponsePayload;
}
```

### Główne metody API

#### Użytkownicy
- `user.add` - Rejestracja nowego użytkownika
- `user.getFromLogin` - Logowanie po nazwie użytkownika
- `user.getFromEmail` - Logowanie po emailu
- `user.getMinimum` - Pobieranie podstawowych danych użytkownika
- `user.update` - Aktualizacja profilu użytkownika
- `user.isAdmin` - Sprawdzanie uprawnień administratora

#### Quizy
- `quiz.get` - Pobieranie szczegółów quizu
- `quiz.getWithCategory` - Lista quizów z kategoriami
- `quiz.getTopTen` - Najpopularniejsze quizy

#### Komentarze
- `comment.add` - Dodawanie komentarza do quizu
- `comment.get` - Pobieranie komentarzy quizu

#### Ranking
- `quiz.getTopTen` - Top 10 użytkowników w rankingu
- `userScore.distinctCount` - Statystyki użytkownika

### Przykład użycia

```javascript
// Logowanie użytkownika
const loginData = {
  username: "przykład",
  password: "hasło123"
};

request('user.getFromLogin', loginData, 'loginResponse')
  .then(userData => {
    console.log('Zalogowano:', userData);
  })
  .catch(error => {
    console.error('Błąd logowania:', error);
  });
```

## Funkcje UI/UX

### System motywów
- Responsywny design dostosowany do różnych urządzeń
- Custom CSS properties dla łatwej personalizacji
- Gradient backgrounds i subtelne animacje
- System gwiazdek do oceniania (1-5 gwiazdek)

### Interaktywne elementy
- **Podium rankingowe** - wizualne przedstawienie top 3 użytkowników
- **Karty quizów** - preview z obrazkiem, kategorią i poziomem trudności
- **Wykresy statystyk** - słupkowe wykresy postępów użytkownika
- **System komentarzy** - z awatarami i datami

## Bezpieczeństwo

- **Hashowanie haseł** - bcrypt z konfigurowalnymi rundami
- **Walidacja danych** - Zod schemas dla weryfikacji typów
- **Prepared statements** - ochrona przed SQL injection
- **Kontrola sesji** - WebSocket-based session management

## Logowanie

System wykorzystuje **Winston** do logowania z następującymi funkcjami:
- **Rotacja plików** - automatyczne tworzenie nowych plików co dzień
- **Poziomy logów** - info, error, debug
- **Format JSON** - strukturalne logi z timestampami
- **Maksymalny rozmiar** - 20MB na plik, przechowywanie przez 14 dni


---

## Licencja

Projekt jest dostępny na licencji GPL3.


## Kontakt

W przypadku pytań lub sugestii, skorzystaj z sekcji kontaktowej w aplikacji lub otwórz issue w repozytorium.

---
