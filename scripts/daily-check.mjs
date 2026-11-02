import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { inWindow, turkeyDate } from './daily-window.mjs';

const started = new Date();
const date = turkeyDate(started);
const dryRun = process.env.DRY_RUN !== 'false';
if (!dryRun && (!inWindow(date) || process.env.GITHUB_REF !== 'refs/heads/main')) {
  throw new Error('Gerçek rapor yalnız 5-19 Kasım 2026 ve main üzerinde yazılabilir.');
}
if (process.env.REPORT_DATE && process.env.REPORT_DATE !== date) {
  throw new Error('Kontrol başlarken Türkiye tarihi değişti; eski güne rapor yazılmadı.');
}

const results = [];
const run = (name, command, args, timeout) => {
  const checkStarted = Date.now();
  console.log(`::group::${name}`);
  const result = spawnSync(command, args, {
    encoding: 'utf8', timeout, maxBuffer: 20 * 1024 * 1024,
    env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' },
  });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) console.error(result.error.message);
  console.log('::endgroup::');
  const passed = result.status === 0 && !result.error;
  results.push({ name, command: [command, ...args].join(' '), passed, seconds: ((Date.now() - checkStarted) / 1000).toFixed(1), detail: passed ? 'Başarılı' : `Başarısız (çıkış: ${result.status ?? result.error?.code ?? 'sinyal'})` });
  return passed;
};

const installed = run('Kilit dosyasından temiz bağımlılık kurulumu', 'npm', ['ci', '--no-audit', '--no-fund'], 5 * 60 * 1000);
const expoChecks = [
  ['Expo bağımlılık uyumu', ['expo', 'install', '--check'], 2 * 60 * 1000],
  ['Expo Doctor', ['--yes', 'expo-doctor@1.21.5'], 3 * 60 * 1000],
  ['Android JavaScript / Hermes export', ['expo', 'export', '--platform', 'android', '--output-dir', join(process.env.RUNNER_TEMP || tmpdir(), 'bsm447-android-export')], 6 * 60 * 1000],
];
for (const [name, args, timeout] of expoChecks) {
  if (installed) run(name, 'npx', args, timeout);
  else results.push({ name, command: `npx ${args.join(' ')}`, passed: false, seconds: '0', detail: 'Atlandı: npm ci başarısız' });
}

const apiStarted = Date.now();
try {
  async function json(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
    return response.json();
  }
  const water = await json('https://pokeapi.co/api/v2/type/water');
  assert.ok(Array.isArray(water.pokemon) && water.pokemon.length >= 10, 'Su türü listesi en az 10 kayıt içermeli');
  assert.ok(water.pokemon.every((item) => typeof item.pokemon?.name === 'string' && typeof item.pokemon?.url === 'string'), 'Liste adı ve adresi içermeli');
  const name = water.pokemon[0].pokemon.name;
  const detail = await json(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
  assert.equal(detail.name, name);
  assert.equal(typeof detail.sprites?.front_default, 'string');
  assert.equal(typeof detail.height, 'number');
  assert.equal(typeof detail.weight, 'number');
  assert.ok(Array.isArray(detail.stats) && detail.stats.length > 0 && detail.stats.every((stat) => typeof stat.base_stat === 'number' && typeof stat.stat?.name === 'string'));
  results.push({ name: 'Canlı PokeAPI su listesi ve ikinci detay isteği', command: 'GET type/water + GET pokemon/{name}', passed: true, seconds: ((Date.now() - apiStarted) / 1000).toFixed(1), detail: `${water.pokemon.length} su Pokémon'u; ${name} detay alanları doğrulandı` });
} catch (error) {
  results.push({ name: 'Canlı PokeAPI su listesi ve ikinci detay isteği', command: 'GET type/water + GET pokemon/{name}', passed: false, seconds: ((Date.now() - apiStarted) / 1000).toFixed(1), detail: String(error.message).replaceAll('|', '\\|').replaceAll('\n', ' ') });
}

const sourceSha = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const runUrl = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : 'Yerel doğrulama';
const report = `# ${date} - Otomatik günlük teknik kontrol\n\nBu rapor github-actions[bot] tarafından gerçek kontrol sonuçlarından üretilir. İnsan tarafından yapılan geliştirme veya cihaz testi kaydı değildir.\n\n- Başlangıç (UTC): ${started.toISOString()}\n- Kontrol edilen kaynak commit: \`${sourceSha}\`\n- Çalışma: ${runUrl}\n- Mod: ${dryRun ? 'Deneme; depoya commit atılmaz' : 'Günlük rapor'}\n\n| Kontrol | Sonuç | Süre (sn) | Açıklama |\n|---|---|---:|---|\n${results.map((result) => `| ${result.name} | ${result.passed ? 'GEÇTİ' : 'BAŞARISIZ'} | ${result.seconds} | ${result.detail} |`).join('\n')}\n\nKomutlar:\n\n${results.map((result) => `- \`${result.command}\``).join('\n')}\n\nAndroid export sonucu APK üretimi/kurulumu anlamına gelmez. Telefon/Expo Go uyumu, uygulamayı kapatıp açarak kayıt kalıcılığı, dokunma ve navigasyon davranışı bu çalışma tarafından doğrulanmaz. Tam komut çıktıları Actions günlüğündedir.\n`;
const directory = dryRun ? join(process.env.RUNNER_TEMP || tmpdir(), 'bsm447-daily-dry-run') : 'docs/daily-checks';
mkdirSync(directory, { recursive: true });
const reportPath = join(directory, `${date}.md`);
writeFileSync(reportPath, report);
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `report_path=${reportPath}\n`);
process.exitCode = results.every((result) => result.passed) ? 0 : 1;
