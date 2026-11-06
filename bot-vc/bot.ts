import { Client } from 'discord.js-selfbot-v13';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import * as dotenv from 'dotenv';
import { createInterface } from 'readline';

dotenv.config();

interface BotClient {
  client: Client;
  token: string;
  name: string;
  connection?: VoiceConnection;
  shouldReconnect?: boolean;
  reconnectChannelId?: string;
  reconnectGuildId?: string;
}

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

function getServersFromEnv(): { name: string; id: string }[] {
  const servers: { name: string; id: string }[] = [];
  
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('SERVER')) {
      const id = process.env[key];
      if (id) {
        servers.push({ name: key, id });
      }
    }
  });
  
  return servers;
}

async function selectServers(availableServers: { name: string; id: string }[]): Promise<string | null> {
  if (availableServers.length === 0) {
    return null;
  }
  
  console.log('\n=== Available Servers ===');
  availableServers.forEach((s, index) => {
    console.log(`${index + 1}. ${s.name} (${s.id})`);
  });
  console.log(`${availableServers.length + 1}. Enter manually`);
  
  const answer = await question('\nSelect server (number or "manual"): ');
  
  if (answer.toLowerCase().trim() === 'manual' || answer.trim() === `${availableServers.length + 1}`) {
    return null;
  }
  
  const index = parseInt(answer.trim()) - 1;
  if (index >= 0 && index < availableServers.length) {
    return availableServers[index].id;
  }
  
  return null;
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
      console.log(`✓ ${name} logged in successfully as ${client.user?.tag}`);
      
      clients.push({ client, token, name });
    } catch (error) {
      console.error(`✗ ${name} failed to login:`, error);
    }
  }
  
  return clients;
}

async function getVoiceChannels(client: Client, guildId: string) {
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();
  
  const voiceChannels: any[] = [];
  channels.forEach((channel: any) => {
    if (channel && (channel.type === 'GUILD_VOICE' || channel.type === 2)) {
      voiceChannels.push(channel);
    }
  });
  
  return voiceChannels;
}

async function setupReconnection(botClient: BotClient, channelId: string, guildId: string): Promise<void> {
  if (!botClient.connection) return;
  
  botClient.shouldReconnect = true;
  botClient.reconnectChannelId = channelId;
  botClient.reconnectGuildId = guildId;
  
  botClient.connection.on('stateChange', async (oldState, newState) => {
    // Check if disconnected
    if (newState.status === 'disconnected' || newState.status === 'destroyed') {
      if (botClient.shouldReconnect && botClient.reconnectChannelId && botClient.reconnectGuildId) {
        console.log(`🔄 ${botClient.name} disconnected, attempting to reconnect...`);
        
        // Wait a bit before reconnecting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const guild = botClient.client.guilds.cache.get(botClient.reconnectGuildId);
          if (!guild) {
            console.error(`✗ ${botClient.name} - Cannot reconnect: guild not found`);
            return;
          }
          
          const newConnection = joinVoiceChannel({
            channelId: botClient.reconnectChannelId,
            guildId: botClient.reconnectGuildId,
            adapterCreator: guild.voiceAdapterCreator as any,
            selfDeaf: false,
            selfMute: false,
          });
          
          botClient.connection = newConnection;
          console.log(`✓ ${botClient.name} reconnected successfully`);
          
          // Setup reconnection again for the new connection
          setupReconnection(botClient, botClient.reconnectChannelId, botClient.reconnectGuildId);
        } catch (error: any) {
          console.error(`✗ ${botClient.name} failed to reconnect:`, error.message || error);
          
          // Retry after a longer delay if failed
          if (botClient.shouldReconnect) {
            console.log(`⏳ ${botClient.name} will retry in 10 seconds...`);
            setTimeout(() => {
              if (botClient.shouldReconnect && botClient.reconnectChannelId && botClient.reconnectGuildId) {
                setupReconnection(botClient, botClient.reconnectChannelId, botClient.reconnectGuildId);
              }
            }, 10000);
          }
        }
      }
    }
  });
}

async function joinVC(botClients: BotClient[], channelId: string, guildId: string): Promise<void> {
  console.log('\n=== Joining Voice Channel ===');
  
  for (let i = 0; i < botClients.length; i++) {
    const botClient = botClients[i];
    
    try {
      const guild = botClient.client.guilds.cache.get(guildId);
      if (!guild) {
        console.error(`✗ ${botClient.name} - Guild not found (account may not be in this server)`);
        continue;
      }

      // Check if channel exists and is accessible
      const channel = guild.channels.cache.get(channelId);
      if (!channel) {
        console.error(`✗ ${botClient.name} - Channel not found or not accessible`);
        continue;
      }

      const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: guild.voiceAdapterCreator as any,
        selfDeaf: false,
        selfMute: false,
      });
      
      botClient.connection = connection;
      console.log(`${botClient.name} joined the voice channel`);
      
      // Setup automatic reconnection
      await setupReconnection(botClient, channelId, guildId);
      
      // Add delay between joins to avoid bot detection
      if (i < botClients.length - 1) {
        const delay = Math.floor(Math.random() * 3000) + 2000; // Random 2-5 second delay
        console.log(`⏳ Waiting ${(delay/1000).toFixed(1)}s before next account...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error: any) {
      // Better error messages for common issues
      if (error.message?.includes('Missing Permissions') || error.message?.includes('CONNECT')) {
        console.error(`✗ ${botClient.name} - No permission to join this channel`);
      } else if (error.message?.includes('VOICE_STATE_UPDATE')) {
        console.error(`✗ ${botClient.name} - Cannot update voice state (may be rate limited)`);
      } else if (error.message?.includes('Invalid Session')) {
        console.error(`✗ ${botClient.name} - Invalid session (try restarting the bot)`);
      } else {
        console.error(`✗ ${botClient.name} failed to join:`, error.message || error);
      }
    }
  }
  
  console.log('\nAuto-reconnect enabled! Accounts will automatically rejoin if disconnected.');
}

async function disconnectAll(botClients: BotClient[]): Promise<void> {
  console.log('\n=== Disconnecting from Voice Channel ===');
  
  for (const botClient of botClients) {
    try {
      // Disable auto-reconnect
      botClient.shouldReconnect = false;
      
      if (botClient.connection) {
        botClient.connection.destroy();
        botClient.connection = undefined;
        console.log(` ${botClient.name} disconnected`);
      }
    } catch (error) {
      console.error(`✗ ${botClient.name} failed to disconnect:`, error);
    }
  }
}

async function mainLoop(botClients: BotClient[]): Promise<void> {
  // Get available servers from .env
  const availableServers = getServersFromEnv();
  
  while (true) {
    try {
      let guildId: string;
      
      // Check if there are servers in .env
      if (availableServers.length > 0) {
        const selectedServer = await selectServers(availableServers);
        if (selectedServer) {
          guildId = selectedServer;
        } else {
          // User chose manual entry
          const manualId = await question('\nEnter Server ID (or "exit" to quit): ');
          if (manualId.toLowerCase() === 'exit') {
            console.log('\nShutting down...');
            break;
          }
          guildId = manualId;
        }
      } else {
        // No servers in .env, ask for manual entry
        const manualId = await question('\nEnter Server ID (or "exit" to quit): ');
        if (manualId.toLowerCase() === 'exit') {
          console.log('\nShutting down...');
          break;
        }
        guildId = manualId;
      }
      
      // Fetch voice channels
      console.log('\n=== Fetching Voice Channels ===');
      const voiceChannels = await getVoiceChannels(botClients[0].client, guildId);
      
      if (voiceChannels.length === 0) {
        console.log('No voice channels found in this server.');
        continue;
      }
      
      // List voice channels
      console.log('\n=== Voice Channels ===');
      
      // Sort channels by extracting number from name
      const sortedChannels = voiceChannels.sort((a, b) => {
        const extractNumber = (name: string) => {
          const match = name.match(/(\d+)/);
          return match ? parseInt(match[1]) : 999999;
        };
        return extractNumber(a.name) - extractNumber(b.name);
      });
      
      sortedChannels.forEach((channel, index) => {
        console.log(`${index + 1}. ${channel.name}`);
      });
      
      // Select voice channel
      const channelAnswer = await question('\nSelect voice channel number: ');
      const channelIndex = parseInt(channelAnswer) - 1;
      
      if (channelIndex < 0 || channelIndex >= voiceChannels.length) {
        console.log('Invalid selection.');
        continue;
      }
      
      const selectedChannel = voiceChannels[channelIndex];
      
      // Join voice channel
      await joinVC(botClients, selectedChannel.id, guildId);
      
      // Wait for user input to disconnect
      await question('\nPress Enter to disconnect accounts...');
      
      // Disconnect all
      await disconnectAll(botClients);
      
    } catch (error) {
      console.error('\nError occurred:', error);
      console.log('Returning to main menu...\n');
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║           Discord VC Control           ║');
  console.log('╚════════════════════════════════════════╝');
  
  // Get available tokens
  const availableTokens = getTokensFromEnv();
  
  if (availableTokens.length === 0) {
    console.log('\n❌ No accounts found in .env file!');
    console.log('Please add accounts in the format: ACCOUNT=your_token_here');
    process.exit(1);
  }
  
  // Select tokens to use
  const selectedTokens = await selectTokens(availableTokens);
  
  if (selectedTokens.length === 0) {
    console.log('\n❌ No accounts selected!');
    process.exit(1);
  }
  
  // Initialize clients
  const botClients = await initializeClients(selectedTokens);
  
  if (botClients.length === 0) {
    console.log('\n❌ No clients could be initialized!');
    process.exit(1);
  }
  
  console.log(`\n${botClients.length} client(s) ready!`);
  
  // Start main loop
  await mainLoop(botClients);
  
  // Cleanup
  console.log('\n=== Cleaning Up ===');
  for (const botClient of botClients) {
    if (botClient.connection) {
      botClient.connection.destroy();
    }
    await botClient.client.destroy();
    console.log(`✓ ${botClient.name} logged out`);
  }
  
  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});
