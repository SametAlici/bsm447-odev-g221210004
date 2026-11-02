import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const START_DATE = '2026-11-05';
export const END_DATE = '2026-11-19';

export function turkeyDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export function inWindow(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= START_DATE && date <= END_DATE;
}

export function decideRun({ date, event, dryRun, ref }) {
  const dry = event === 'workflow_dispatch' && dryRun === 'true';
  return { date, dryRun: dry, shouldRun: ref === 'refs/heads/main' && (dry || inWindow(date)) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const decision = decideRun({
    date: turkeyDate(), event: process.env.GITHUB_EVENT_NAME,
    dryRun: process.env.INPUT_DRY_RUN, ref: process.env.GITHUB_REF,
  });
  const output = `date=${decision.date}\ndry_run=${decision.dryRun}\nshould_run=${decision.shouldRun}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Türkiye tarihi: ${decision.date}; dry-run: ${decision.dryRun}; çalıştır: ${decision.shouldRun}\n`);
  console.log(output);
}
