# My Discord Tools

> **!!! Disclaimer:** Selfbots and unofficial API usage are against Discord ToS. Use these tools at your own risk. I am not responsible for any bans or account actions.

A comprehensive toolkit for Discord automation including quest auto-completion, voice channel management, and badge management with clean CLI interfaces and browser scripts.

## Tools Included

### 1. Quest Auto-Completion Bot

Automated bot for completing Discord Quests with live progress tracking and Orb-only filtering.

### 2. Voice Channel Bot Controller

Multi-account voice channel controller for joining and managing multiple Discord accounts in voice channels simultaneously.

### 3. Activity Spoofer (NEW!)

Terminal-based activity spoofer that simulates playing any game from Discord's detectable games list across multiple accounts.

### 4. Browser Scripts

Ready-to-use browser console scripts for:

- **HypeSquad Badge Spoofing** - Add or remove HypeSquad house badges
- **Token Extraction** - Safely get your Discord token

## Quest Bot Features

- **Clean CLI Interface:** Uses organized tables and ASCII art
- **Live Countdown:** Displays remaining quest time in real-time
- **Orb-Only Filter:** Automatically filters and completes only quests that reward Orbs
- **Multi-Account Support:** Easily switch between multiple Discord accounts
- **Smart Quest Detection:** Supports both legacy and v2 Discord quest API formats
- **Fast & Lightweight:** Built with TypeScript & modern Node.js

## Voice Channel Bot Features

- **Token Selection:** Choose which bot accounts to use from your .env file
- **Server Selection:** Enter any Discord server ID
- **Voice Channel Listing:** Automatically lists all voice channels in the server
- **Multi-Account Control:** Join voice channels with multiple accounts simultaneously
- **Clean Disconnect:** Easily disconnect all accounts with a single command
- **Continuous Loop:** Quickly switch between servers and channels without restarting

## Activity Spoofer Features

- **7000+ Games:** Access Discord's complete detectable games database
- **Multi-Account Support:** Control activity across multiple accounts simultaneously
- **Favorites System:** Mark frequently used games for quick access
- **Smart Search:** Quickly find games with fuzzy search
- **Auto-Caching:** Cache games list locally to reduce API calls (48-hour default)
- **Interactive TUI:** Clean terminal interface with tables and pagination
- **No Processes:** Works purely through Discord's Rich Presence API (no fake executables)

## Installation & Setup

> [!NOTE]
> **Requirements:**
>
> - **[Node.js](https://nodejs.org/) 18.0.0 or newer**
> - **[Git](https://git-scm.com/)**

## Quest Bot: Installation & Usage

### 1. Clone Repository

```bash
git clone https://github.com/naeldavid/dc-tools.git
cd dc-tools/quest-tool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Tokens

Create a new file named `.env` in the quest-tool folder, then add your Discord tokens:

```env
TOKEN-1=YOUR_FIRST_DISCORD_TOKEN_HERE
TOKEN-2=YOUR_SECOND_DISCORD_TOKEN_HERE
TOKEN-MAIN=ANOTHER_TOKEN_HERE
TOKEN-ALT=YET_ANOTHER_TOKEN_HERE
```

> **Add as many accounts as you want!** Just follow the format `TOKEN-NAME=your_token_here`. The bot will automatically detect all tokens and let you choose which one to use.

### 4. Run Script

```bash
npm start
```

---

## Voice Channel Bot: Installation & Usage

### 1. Navigate to bot-vc folder

```bash
cd dc-tools/bot-vc
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Tokens

Create a new file named `.env` in the bot-vc folder, then add your Discord tokens:

```env
TOKEN1=YOUR_FIRST_DISCORD_TOKEN_HERE
TOKEN2=YOUR_SECOND_DISCORD_TOKEN_HERE
TOKEN3=YOUR_THIRD_DISCORD_TOKEN_HERE
```

> **Add as many tokens as you need!** Just follow the format `TOKENx=your_token_here`.

### 4. Run Script

```bash
npm start
```

### 5. Usage Flow

1. **Select Tokens:** Choose which tokens to use (individual or all)
2. **Enter Server ID:** Input the Discord server ID
3. **Select Voice Channel:** Choose from the list of available voice channels
4. **Join:** All selected accounts will join the voice channel
5. **Press Enter to Disconnect:** When ready, press Enter to disconnect all accounts
6. **Loop:** Returns to step 2, or type "exit" to quit

---

## Activity Spoofer: Installation & Usage

### 1. Navigate to activity-spoofer folder

```bash
cd dc-tools/activity-spoofer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Tokens

Create a new file named `.env` in the activity-spoofer folder, then add your Discord tokens:

```env
ACCOUNT-1=YOUR_FIRST_DISCORD_TOKEN_HERE
ACCOUNT-2=YOUR_SECOND_DISCORD_TOKEN_HERE
ACCOUNT-MAIN=YOUR_MAIN_TOKEN_HERE

# Optional: Cache expiry in hours (default: 48)
CACHE_EXPIRY_HOURS=48
```

> **Add as many accounts as you want!** Just follow the format `ACCOUNT-NAME=your_token_here`.

### 4. Run Script

```bash
npm start
```

### 5. Usage Flow

1. **Select Accounts:** Choose which accounts to use (individual or all)
2. **Main Menu:** View current status of all accounts
3. **Set Activity:** Browse and select a game from 7000+ options
4. **Game Browser:** Search, filter by favorites, paginate through games
5. **Activity Applied:** All selected accounts will show "Playing [Game]"
6. **Clear Activity:** Remove the game status when done

### Game Browser Commands

- `[number]` - Select game by number
- `s [term]` - Search games (e.g., `s minecraft`)
- `f [number]` - Toggle favorite for quick access
- `fav` - Show favorites only
- `all` - Show all games
- `n` / `p` - Next/Previous page
- `r` - Refresh game list from Discord API
- `b` - Back to main menu

---

## How Quest Bot Works

1. **Automatically detects all tokens** in your `.env` file (any variable starting with `TOKEN-`)
1. **Prompts you to select** which account to use from the available options
1. **Fetches all available Discord quests** from the selected account
1. **Filters quests** to only include those that reward Orbs (skips decorations, tokens, etc.)
1. **Automatically enrolls** in filtered quests
1. **Completes quest tasks** by spoofing video watch time or game activity
1. **Live progress tracking** with real-time countdown timers

## How Activity Spoofer Works

1. **Fetches detectable games** from Discord's API (7000+ games including non-games)
2. **Caches locally** to reduce API calls (configurable expiry, default 48 hours)
3. **Sets Rich Presence** via discord.js-selfbot to set activity status
4. **Discord displays** the game activity on your profile without needing the game installed
5. **No fake processes** - works purely through Discord's presence API
6. **Multi-account control** - manage activities across all your accounts simultaneously

## Browser Scripts

The `browser-scripts/` directory contains ready-to-use scripts that run directly in your browser console:

1. HypeSquad Badge Spoofing
2. Token Extraction

## Project Structure

```bash
dc-tools/
├── quest-tool/            # Quest auto-completion bot
│   ├── src/              # Quest bot source code
│   │   ├── client.ts     # Discord client wrapper
│   │   ├── quest.ts      # Quest logic
│   │   ├── questManager.ts # Quest management
│   │   └── interface.ts  # TypeScript interfaces
│   ├── bot.ts            # Main bot entry point
│   ├── .env              # Discord tokens (create this)
│   └── package.json      # Project dependencies
├── bot-vc/               # Voice channel bot controller
│   ├── bot.ts            # Main VC bot script
│   ├── .env              # Discord tokens (create this)
│   └── package.json      # Project dependencies
├── activity-spoofer/     # Activity/presence spoofer
│   ├── bot.ts            # Main TUI script
│   ├── .env              # Discord tokens (create this)
│   ├── games.cache.json  # Auto-generated games cache
│   ├── favorites.json    # Auto-generated favorites list
│   └── package.json      # Project dependencies
└── browser-scripts/      # Browser console scripts
    ├── badge-scripts.md  # HypeSquad badge management
    └── get-token.md      # Token extraction guide
```

## 🙏 Credits

> [discord.js](https://github.com/discordjs/discord.js)
