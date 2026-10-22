import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Fait échouer le build si three.js est téléchargé avec le chunk d'entrée (lui ou
 * un chunk qu'il importe statiquement) : la vitrine ne doit pas payer le moteur 3D
 * de l'espace client. Cf. docs/02-frontend.md#découpage-du-bundle.
 */
function keepThreeOutOfEntry(): Plugin {
  return {
    name: 'keep-three-out-of-entry',
    apply: 'build',
    generateBundle(_, bundle) {
      const entries = Object.values(bundle).filter((file) => file.type === 'chunk' && file.isEntry)
      const seen = new Set<string>()
      const queue = entries.map((chunk) => chunk.fileName)
      while (queue.length) {
        const chunk = bundle[queue.pop()!]
        if (chunk?.type !== 'chunk' || seen.has(chunk.fileName)) continue
        seen.add(chunk.fileName)
        const three = chunk.moduleIds.find((id) => /[\\/]node_modules[\\/]three(-stdlib)?[\\/]/.test(id))
        if (three) {
          this.error(`three.js est chargé dès l'entrée (${chunk.fileName} ← ${three}). Importer la page ou le composant 3D via lazy().`)
        }
        queue.push(...chunk.imports)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // base: command === 'build' ? '/Le-creuset/' : '/',
  base: '/',
  plugins: [react(), tailwindcss(), keepThreeOutOfEntry()],
});
