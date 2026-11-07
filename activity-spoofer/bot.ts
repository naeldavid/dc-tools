import { Client } from 'discord.js-selfbot-v13';
import * as dotenv from 'dotenv';
import { createInterface } from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

dotenv.config();

interface BotClient {
  client: Client;
  token: string;
  name: string;
  currentActivity?: string;
}

interface Game {
  id: string;
  name: string;
  executables?: Executable[];
  aliases?: string[];
}

interface Executable {
  name: string;
  os?: string;
}

interface GameCache {
  timestamp: Date;
  games: Game[];
}

const DISCORD_GAMES_API = 'https://discord.com/api/v9/games/detectable';
const DISCORD_NON_GAMES_API = 'https://discord.com/api/v9/applications/non-games/detectable';
const CACHE_FILE = path.join(__dirname, 'games.cache.json');
const GAMES_LIST_FILE = path.join(__dirname, 'games-list.txt');
const CACHE_EXPIRY_HOURS = parseInt(process.env.CACHE_EXPIRY_HOURS || '48');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

function getTokensFromEnv(): { name: string; token: string }[] {
  const tokens: { name: string; token: string }[] = [];
  
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('ACCOUNT')) {
      const token = process.env[key];
      if (token) {
        tokens.push({ name: key, token });
      }
    }
  });
  
  return tokens;
}

async function selectTokens(availableTokens: { name: string; token: string }[]): Promise<{ name: string; token: string }[]> {
  console.log('\n=== Available Accounts ===');
  availableTokens.forEach((t, index) => {
    console.log(`${index + 1}. ${t.name}`);
  });
  console.log(`${availableTokens.length + 1}. All accounts`);
  
  const answer = await question('\nSelect accounts (comma-separated numbers or "all"): ');
  
  if (answer.toLowerCase().trim() === 'all' || answer.trim() === `${availableTokens.length + 1}`) {
    return availableTokens;
  }
  
  const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
  return indices
    .filter(i => i >= 0 && i < availableTokens.length)
    .map(i => availableTokens[i]);
}

async function initializeClients(selectedTokens: { name: string; token: string }[]): Promise<BotClient[]> {
  console.log('\n=== Initializing Clients ===');
  const clients: BotClient[] = [];
  
  for (const { name, token } of selectedTokens) {
    try {
      const client = new Client();
      
      await client.login(token);
      console.log(`✓ ${name} logged in as ${client.user?.tag}`);
      
      clients.push({ client, token, name });
    } catch (error: any) {
      console.error(`✗ ${name} failed to login: ${error.message}`);
    }
  }
  
  return clients;
}

function readCache(): GameCache | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    
    const data = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cache: GameCache = JSON.parse(data);
    cache.timestamp = new Date(cache.timestamp);
    
    const hoursSinceCache = (Date.now() - cache.timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCache > CACHE_EXPIRY_HOURS) {
      return null;
    }
    
    return cache;
  } catch {
    return null;
  }
}

function writeCache(games: Game[]): void {
  const cache: GameCache = {
    timestamp: new Date(),
    games
  };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function fetchGames(forceRefresh: boolean = false): Promise<{ games: Game[]; fromCache: boolean }> {
  if (!forceRefresh) {
    const cache = readCache();
    if (cache) {
      return { games: cache.games, fromCache: true };
    }
  }
  
  console.log(chalk.cyan('Fetching games from Discord API...'));
  
  try {
    const [gamesResponse, nonGamesResponse] = await Promise.all([
      fetch(DISCORD_GAMES_API, {
        headers: { 'User-Agent': 'ActivitySpoofer/1.0.0' }
      }),
      fetch(DISCORD_NON_GAMES_API, {
        headers: { 'User-Agent': 'ActivitySpoofer/1.0.0' }
      })
    ]);
    
    const games: Game[] = await gamesResponse.json();
    
    if (nonGamesResponse.ok) {
      const nonGames: Game[] = await nonGamesResponse.json();
      games.push(...nonGames);
    }
    
    // Filter games that have executables
    const validGames = games.filter(game => 
      game.executables && game.executables.length > 0
    );
    
    writeCache(validGames);
    console.log(chalk.green(`✓ Fetched ${validGames.length} games from API`));
    
    return { games: validGames, fromCache: false };
  } catch (error: any) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }
}

function writeGamesList(games: Game[]): void {
  const lines: string[] = [
    '╔══════════════════════════════════════════════════════════════════════════════════╗',
    '║                             Discord App List by ID                               ║',
    '╚══════════════════════════════════════════════════════════════════════════════════╝',
    '',
    `Total Games: ${games.length}`,
    'Search : Control+F',
    'Format: [App ID] - Game Name',
    '══════════════════════════════════════════════════════════════════════════════════',
    ''
  ];

  games.forEach(game => {
    lines.push(`[${game.id}] - ${game.name}`);
  });

  fs.writeFileSync(GAMES_LIST_FILE, lines.join('\n'));
}

function openGamesListFile(): void {
  const isWindows = process.platform === 'win32';
  const command = isWindows 
    ? `notepad "${GAMES_LIST_FILE}"` 
    : process.platform === 'darwin'
    ? `open "${GAMES_LIST_FILE}"`
    : `xdg-open "${GAMES_LIST_FILE}" 2>/dev/null || cat "${GAMES_LIST_FILE}"`;
  
  exec(command, (error: Error | null) => {
    // Silently ignore - file might open or not, user can open manually
  });
}

async function selectGameByAppId(games: Game[]): Promise<Game | null> {
  const appId = await question(chalk.yellow('\nEnter App ID (or "exit" to quit): '));
  
  if (appId.toLowerCase().trim() === 'exit') {
    return null;
  }
  
  const game = games.find(g => g.id === appId.trim());
  
  if (!game) {
    console.log(chalk.red(`✗ App ID "${appId}" not found in games list`));
    return null;
  }
  
  return game;
}

async function setActivity(botClients: BotClient[], game: Game): Promise<void> {
  console.log('\n' + chalk.cyan('=== Setting Activity ==='));
  
  for (const botClient of botClients) {
    try {
      await botClient.client.user?.setActivity(game.name, {
        type: 'PLAYING'
      });
      
      botClient.currentActivity = game.name;
      console.log(chalk.green(`✓ ${botClient.name} - Now playing "${game.name}"`));
    } catch (error: any) {
      console.error(chalk.red(`✗ ${botClient.name} - Failed: ${error.message}`));
    }
  }
}

async function clearActivity(botClients: BotClient[]): Promise<void> {
  for (const botClient of botClients) {
    try {
      await botClient.client.user?.setPresence({ activities: [] });
      botClient.currentActivity = undefined;
      console.log(chalk.green(`✓ ${botClient.name} - Activity cleared`));
    } catch (error: any) {
      console.error(chalk.red(`✗ ${botClient.name} - Failed: ${error.message}`));
    }
  }
}

async function mainLoop(botClients: BotClient[], games: Game[]): Promise<void> {
  console.clear();
  console.log(chalk.white(figlet.textSync("rwb's act-spoofer", { font: 'Slant' })));
  console.log(chalk.bold.green('\nTOOL RUNNING...\n'));
  
  console.log(chalk.cyan('Logged in accounts:'));
  botClients.forEach(bc => {
    console.log(chalk.white(`  • ${bc.name}: ${bc.client.user?.tag}`));
  });
  
  console.log(chalk.gray(`\n${games.length} games available`));
  console.log(chalk.yellow(`\nOpening games list file...`));
  
  // Generate and open games list file
  writeGamesList(games);
  openGamesListFile();
  
  console.log(chalk.gray(`File location: ${GAMES_LIST_FILE}\n`));
  
  while (true) {
    const selectedGame = await selectGameByAppId(games);
    
    if (!selectedGame) {
      console.log('\n' + chalk.cyan('Shutting down...'));
      break;
    }
    
    console.log(chalk.cyan(`\nSelected: ${selectedGame.name} (${selectedGame.id})`));
    await setActivity(botClients, selectedGame);
    console.log('');
  }
}

async function main() {
  console.clear();
  console.log(chalk.white(figlet.textSync("rwb's act-spoofer", { font: 'Slant' })));
  
  // Get available tokens
  const availableTokens = getTokensFromEnv();
  
  if (availableTokens.length === 0) {
    console.log(chalk.red('❌ No accounts found in .env file!'));
    console.log(chalk.yellow('Please add accounts in the format: ACCOUNT-NAME=your_token_here'));
    process.exit(1);
  }
  
  // Select tokens to use
  const selectedTokens = await selectTokens(availableTokens);
  
  if (selectedTokens.length === 0) {
    console.log(chalk.red('❌ No accounts selected!'));
    process.exit(1);
  }
  
  // Initialize clients
  const botClients = await initializeClients(selectedTokens);
  
  if (botClients.length === 0) {
    console.log(chalk.red('❌ No clients could be initialized!'));
    process.exit(1);
  }
  
  // Fetch games
  let games: Game[];
  try {
    const result = await fetchGames();
    games = result.games;
    if (result.fromCache) {
      console.log(chalk.gray(`Loaded ${games.length} games from cache`));
    }
  } catch (error: any) {
    console.log(chalk.red(`❌ Failed to fetch games: ${error.message}`));
    process.exit(1);
  }
  
  console.log(chalk.green(`\n✓ ${botClients.length} client(s) ready with ${games.length} games available!`));
  await question(chalk.gray('Press Enter to continue...'));
  
  // Start main loop
  await mainLoop(botClients, games);
  
  // Cleanup
  console.log('\n' + chalk.cyan('Cleaning up...'));
  for (const botClient of botClients) {
    try {
      await botClient.client.destroy();
      console.log(chalk.green(`✓ ${botClient.name} logged out`));
    } catch (error: any) {
      console.error(chalk.red(`✗ ${botClient.name} - ${error.message}`));
    }
  }
  
  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  rl.close();
  process.exit(1);
});
