"use client"

import Image from "next/image"

/**
 * Logo da Blink — usa truque CSS para mostrar a versão correta em cada tema:
 * - Light mode: logo preta visível, branca escondida
 * - Dark mode:  logo branca visível, preta escondida
 *
 * Evita flash/hidratação do `useTheme` (que precisa de `mounted` flag).
 */
export function BlinkLogo({ height = 28 }: { height?: number }) {
  return (
    <div className="relative" style={{ height }}>
      {/* preta: aparece no light */}
      <Image
        src="/blink-logo-light.png"
        alt="Blink"
        width={height * 3}
        height={height}
        priority
        className="block dark:hidden h-full w-auto object-contain"
        style={{ height }}
      />
      {/* branca: aparece no dark */}
      <Image
        src="/blink-logo-dark.png"
        alt="Blink"
        width={height * 3}
        height={height}
        priority
        className="hidden dark:block h-full w-auto object-contain"
        style={{ height }}
      />
    </div>
  )
}
