import Link from "next/link"

export default function TokenNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
      <div className="text-center space-y-2">
        <span className="text-orange-500 font-bold text-3xl tracking-widest">BLINK</span>
        <p className="text-gray-500 dark:text-neutral-500 text-sm font-mono">ACESSO NÃO AUTORIZADO</p>
      </div>

      <div className="p-6 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-center space-y-3 max-w-sm w-full mx-4">
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Este link de acesso é inválido ou expirou.
        </p>
        <p className="text-xs text-gray-400 dark:text-neutral-600">
          Verifique o link recebido pela Blink ou entre em contato com a equipe do projeto.
        </p>
      </div>

      <Link
        href="/"
        className="text-xs text-orange-500 hover:underline font-mono"
      >
        ← VOLTAR
      </Link>
    </div>
  )
}
