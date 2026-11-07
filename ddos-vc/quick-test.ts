import { VCDDoSAttacker } from './attack';
import chalk from 'chalk';

async function quickTest() {
  console.log(chalk.green('Testing VC DDoS tool compilation and basic functionality...\n'));

  // Create a minimal test configuration
  const testConfig = {
    targetGuildId: '123456789012345678',
    targetChannelId: '987654321098765432',
    attackType: 'mixed' as const,
    threads: 1,
    requestsPerThread: 5,
    delayBetweenRequests: 10,
    useProxyList: false
  };

  try {
    // Test instantiation
    const attacker = new VCDDoSAttacker(testConfig);
    console.log(chalk.green('✓ Tool instantiated successfully'));
    
    // Test stats
    const stats = attacker.getStats();
    console.log(chalk.green('✓ Stats system working'));
    console.log(chalk.gray(`  Start time: ${stats.startTime}`));
    
    // Test utility methods
    const randomAgent = attacker['getRandomUserAgent']();
    console.log(chalk.green(`✓ User agent generation working: ${randomAgent.substring(0, 30)}...`));
    
    const randomEndpoint = attacker['getRandomEndpoint']();
    console.log(chalk.green(`✓ Endpoint generation working: ${randomEndpoint}`));
    
    console.log(chalk.green('\n✅ All tests passed! Tool is ready for use.'));
    console.log(chalk.yellow('\nTo start an attack:'));
    console.log(chalk.cyan('  npm start'));
    console.log(chalk.yellow('\nTo run a safe test:'));
    console.log(chalk.cyan('  npm test'));
    
  } catch (error: any) {
    console.error(chalk.red('❌ Test failed:'), error.message);
    console.error(chalk.red('Stack trace:'), error.stack);
  }
}

// Run the test
if (require.main === module) {
  quickTest().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export { quickTest };