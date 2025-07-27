import cron from 'node-cron';
import userInsights from './spendingInsightTask.js';

// Schedule to run at 8:00 AM on the 1st of every month
cron.schedule('* * * * *', async () => {
  console.log('Running monthly spending insights generation...');
  
  try {
    const result = await userInsights();
    console.log('Insights generation completed:', {
      totalUsers: result.totalUsers,
      processed: result.processed,
      successful: result.success,
      failed: result.failed
    });
  } catch (error) {
    console.error('Failed to generate spending insights:', error);
  }
});

console.log('Scheduled monthly spending insights job (runs at 8:00 AM on the 1st of each month)');