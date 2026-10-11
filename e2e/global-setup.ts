import { execSync } from 'node:child_process'

/** Base de test prête : contenus de départ et compte administrateur (SEED_OWNER_*). */
export default function globalSetup() {
  execSync('npm run db:seed', { stdio: 'inherit' })
}
