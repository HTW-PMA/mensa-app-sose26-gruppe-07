const { existsSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const appRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.dirname(appRoot);
const backendRoot = path.join(workspaceRoot, 'prolog-webserver-sose26-gruppe-07');
const backendEnv = path.join(backendRoot, '.env');
const startMetro = process.argv.includes('--start-metro');
const expoCli = path.join(appRoot, 'node_modules', 'expo', 'bin', 'cli');

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} ist fehlgeschlagen.`);
  }
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch('http://localhost:4000/health', {
        signal: AbortSignal.timeout(3_000),
      });
      if (response.ok) return response.json();
    } catch {
      // The backend may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error('Backend ist nicht erreichbar.');
}

async function main() {
  if (!existsSync(backendRoot)) {
    throw new Error(`Backend-Repository nicht gefunden: ${backendRoot}`);
  }
  if (!existsSync(backendEnv)) {
    throw new Error(
      'Backend-.env fehlt. Kopiere dort .env.example nach .env und setze MENSA_API_KEY.',
    );
  }

  console.log('1/3 Backend-Konfiguration pruefen ...');
  run('docker', ['compose', 'config', '--quiet'], backendRoot);

  console.log('2/3 Backend starten ...');
  run('docker', ['compose', 'up', '-d', '--build'], backendRoot);

  const health = await waitForHealth();
  if (health.status !== 'ok') throw new Error('Backend meldet keinen OK-Status.');
  if (health.mensaApiConfigured !== true) {
    throw new Error('Backend laeuft, aber MENSA_API_KEY wurde nicht geladen.');
  }

  console.log('3/3 Echten Mensa-Abruf pruefen ...');
  const response = await fetch(
    'http://localhost:4000/api/canteen?loadingtype=lazy',
    { signal: AbortSignal.timeout(30_000) },
  );
  if (!response.ok) {
    throw new Error(`Mensa-API-Pruefung fehlgeschlagen (HTTP ${response.status}).`);
  }
  const payload = await response.json();
  const canteens = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.canteens)
      ? payload.canteens
      : [];
  if (canteens.length < 1) {
    throw new Error('Mensa-API antwortet, liefert aber keine Mensen.');
  }

  console.log(`Praesentationscheck erfolgreich: ${canteens.length} Mensen verfuegbar.`);
  console.log('Der API-Key blieb ausschliesslich im Backend und wurde nicht ausgegeben.');

  if (startMetro) {
    console.log('Development-Server fuer den installierten Development Build starten ...');
    run(process.execPath, [expoCli, 'start', '--dev-client', '-c'], appRoot);
  }
}

main().catch((error) => {
  console.error(`Praesentationscheck fehlgeschlagen: ${error.message}`);
  process.exitCode = 1;
});
