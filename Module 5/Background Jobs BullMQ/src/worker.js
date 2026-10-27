'use strict';
const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { transporter } = require('./email');
// Jobs inherit attempts/backoff from the Queue's defaultJobOptions.
const worker = new Worker('email', async (job) => {
  if (job.name !== 'otp') throw new Error(`Unsupported email job: ${job.name}`);
  await transporter.sendMail({
    from: process.env.SMTP_USER || 'no-reply@example.com',
    to: job.data.to,
    subject: 'Your verification code',
    text: `Your verification code is ${job.data.otp}. It expires in 10 minutes.`,
  });
}, { connection });
worker.on('completed', (job) => console.log(`Email job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Email job ${job?.id} failed: ${err.message}`));
worker.on('error', (err) => console.error(`Email worker error: ${err.message}`));
module.exports = { worker };
