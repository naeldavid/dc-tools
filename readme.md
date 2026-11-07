# My Discord Tools

> **!!! Disclaimer:** Selfbots and unofficial API usage are against Discord ToS. Use these tools at your own risk. I am not responsible for any bans or account actions.

A comprehensive toolkit for Discord automation including quest auto-completion, voice channel management, and badge management with clean CLI interfaces and browser scripts.

## Tools Included

### 1. quest-tool

Automated bot for completing Discord Quests with live progress tracking and Orb-only filtering.

### 2. bot-vc

Multi-account voice channel controller for joining and managing multiple Discord accounts in voice channels simultaneously.

### 3. activity-spoofer

Terminal-based activity spoofer that simulates playing any game from Discord's detectable games list across multiple accounts.

### 4. browser-scripts

Ready-to-use browser console scripts for:

- **HypeSquad Badge Spoofing** - Add or remove HypeSquad house badges
- **Token Extraction** - Safely extract your Discord token

## Quest Bot Features

- **Live Countdown:** Displays remaining quest time in real-time
- **Orb-Only Filter:** Automatically filters and completes only quests that reward Orbs
- **Multi-Account Support:** Works on multiple Discord accounts simultaneously
- **Quest Detection:** Supports both legacy and v2 Discord quest API formats

## Voice Channel Bot Features

- **Token Selection:** Choose which bot accounts to use from your .env file
- **Server Selection:** Enter any Discord server ID or select from saved servers
- **Voice Channel Listing:** Automatically lists all voice channels in the server
- **Multi-Account Control:** Join voice channels with multiple accounts simultaneously
- **Auto-Reconnect:** Automatically reconnects if disconnected from voice channel
- **Continuous Loop:** Quickly switch between servers and channels without restarting

## Activity Spoofer Features

- **All Supported Games:** Discord's complete detectable games database
- **Multi-Account Support:** Control activity across multiple accounts simultaneously
- **Simple App ID Selection:** Browse games by ID from an auto-generated list file
- **Auto-Caching:** Cache games list locally to reduce API calls (48-hour default)
- **No Processes:** Works purely through Discord's Rich Presence API (no fake executables)

## Installation & Setup

> [!NOTE]
> **Requirements:**
>
> - **[Node.js](https://nodejs.org/) 18.0.0 or newer**
> - **[Git](https://git-scm.com/)**

## quest-tool: Installation & Usage

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

> **Add as many accounts as you want** Just follow the format `TOKEN-NAME=your_token_here`. The bot will automatically detect all tokens and let you choose which ones to use.

### 4. Run Script

```bash
npm start
```

---

## bot-vc: Installation & Usage

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
ACCOUNT-1=YOUR_FIRST_DISCORD_TOKEN_HERE
ACCOUNT-2=YOUR_SECOND_DISCORD_TOKEN_HERE
ACCOUNT-MAIN=YOUR_MAIN_TOKEN_HERE
```

> **Add as many tokens as you want** Just follow the format `ACCOUNT-NAME=your_token_here`.

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

## activity-spoofer: Installation & Usage

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
2. **Games List Opens:** A text file with all supported games opens automatically
3. **Search Games:** Use Ctrl+F in the file to find games by name
4. **Enter App ID:** Copy the App ID from the list and enter it
5. **Activity Applied:** All selected accounts will show "Playing [Game]"
6. **Repeat:** Enter another App ID or type "exit" to quit

---

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
│   │   ├── interface.ts  # TypeScript interfaces
│   │   └── constants.ts  # Configuration constants
│   ├── bot.ts            # Main bot entry point
│   ├── .env              # Discord tokens (create this)
│   ├── package.json      # Project dependencies
│   └── quest.json        # Quest data file
├── bot-vc/               # Voice channel bot controller
│   ├── bot.ts            # Main VC bot script
│   ├── .env              # Discord tokens (create this)
│   └── package.json      # Project dependencies
├── activity-spoofer/     # Activity/presence spoofer
│   ├── bot.ts            # Main spoofer script
│   ├── .env              # Discord tokens (create this)
│   ├── games.cache.json  # Auto-generated games cache
│   ├── games-list.txt    # Auto-generated searchable games list
│   └── package.json      # Project dependencies
└── browser-scripts/      # Browser console scripts
    ├── badge-scripts.md  # HypeSquad badge management
    └── get-token.md      # Token extraction guide
```

## 🙏 Credits

> [discord.js](https://github.com/discordjs/discord.js)
