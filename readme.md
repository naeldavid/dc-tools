# My Discord Tools

> **!!! Disclaimer:** Selfbots and unofficial API usage are against Discord ToS. Use these tools at your own risk. I am not responsible for any bans or account actions.

A comprehensive toolkit for Discord automation including quest auto-completion and badge management with clean CLI interfaces and browser scripts.

## Tools Included

### 1. Quest Auto-Completion Bot

Automated bot for completing Discord Quests with live progress tracking and Orb-only filtering.

### 2. Browser Scripts

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
cd dc-tools
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Tokens

Create a new file named `.env` in the bot folder, then add your Discord tokens:

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

## How It Works

1. **Automatically detects all tokens** in your `.env` file (any variable starting with `TOKEN-`)
1. **Prompts you to select** which account to use from the available options
1. **Fetches all available Discord quests** from the selected account
1. **Filters quests** to only include those that reward Orbs (skips decorations, tokens, etc.)
1. **Automatically enrolls** in filtered quests
1. **Completes quest tasks** by spoofing video watch time or game activity
1. **Live progress tracking** with real-time countdown timers

## Browser Scripts

The `browser-scripts/` directory contains ready-to-use scripts that run directly in your browser console:

1. HypeSquad Badge Spoofing
2. Token Extraction

## Project Structure

```bash
quest-tool/
├── src/                    # Quest bot source code
│   ├── client.ts          # Discord client wrapper
│   ├── quest.ts           # Quest logic
│   ├── questManager.ts    # Quest management
│   ├── badge.ts           # Badge utilities
│   └── interface.ts       # TypeScript interfaces
├── browser-scripts/       # Browser console scripts
│   ├── badge-scripts.md   # HypeSquad badge management
│   └── get-token.md       # Token extraction guide
├── bot.ts                 # Main bot entry point
├── .env                   # Discord tokens (create this)
└── package.json           # Project dependencies
```

## 🙏 Credits

> [discord.js](https://github.com/discordjs/discord.js)
