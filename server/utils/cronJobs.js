import cron from 'node-cron';
import { runAutomatedFeeReminders } from '../services/feeAutomationService.js';

/**
 * Configure all scheduled tasks
 */
export const initCronJobs = () => {
  console.log('[Cron] Initializing scheduled tasks...');

  // 1. Fee Reminder Job - Runs every day at 10:00 AM
  // Schedule: '0 10 * * *'
  // For testing/demo: every 30 minutes in a dev environment might be too frequent,
  // let's stick to daily as per requirement.
  cron.schedule('0 10 * * *', async () => {
    console.log('[Cron] Running daily fee reminder job...');
    const result = await runAutomatedFeeReminders();
    console.log(`[Cron] Fee reminder job completed. Processed: ${result.processed || 0}`);
  });

  // 2. Weekly Report (Example)
  // cron.schedule('0 0 * * 0', () => { ... });

  console.log('[Cron] Scheduled tasks initialized.');
};

export default initCronJobs;
