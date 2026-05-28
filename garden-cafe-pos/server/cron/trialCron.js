const cron = require('node-cron');
const { runTrialProcessing } = require('../services/trialService');

/**
 * Start the trial processing cron job.
 * Runs daily at 2:00 AM Nepal Time (20:15 UTC previous day)
 *
 * Cron pattern: minute hour day month dayOfWeek
 *  "15 20 * * *"  = 8:15 PM UTC daily = 2:00 AM NPT (UTC+5:45)
 */
function startTrialCron() {
  console.log('[TRIAL CRON] 🕐 Scheduling trial processing for 2:00 AM Nepal Time daily');

  cron.schedule(
    '15 20 * * *',
    async () => {
      console.log('\n[TRIAL CRON] ⏰ Daily run triggered');
      await runTrialProcessing();
    },
    {
      timezone: 'UTC'  // Server runs in UTC
    }
  );

  console.log('[TRIAL CRON] ✅ Cron job started successfully');
}

/**
 * Run trial processing immediately (for testing/manual trigger)
 */
async function runTrialNow() {
  console.log('[TRIAL CRON] 🚀 Manual trigger');
  return await runTrialProcessing();
}

module.exports = {
  startTrialCron,
  runTrialNow
};