'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const INTERVAL_MS = 6000

/**
 * Photos de fond du bandeau d'accueil, en fondu enchaîné.
 * Sobriété (connexions payantes) : seule la première photo est chargée avec la page ;
 * chaque suivante est préparée (cachée) un cycle avant de s'afficher. Pas d'animation si le
 * téléphone demande de réduire les mouvements.
 */
export function HeroSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(1)

  useEffect(() => {
    if (images.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const warm = window.setTimeout(() => setMounted(2), INTERVAL_MS / 2)
    const timer = window.setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % images.length
        setMounted((m) => Math.min(images.length, Math.max(m, next + 2)))
        return next
      })
    }, INTERVAL_MS)
    return () => {
      window.clearTimeout(warm)
      window.clearInterval(timer)
    }
  }, [images.length])

  return (
    // Décor : le message du bandeau est porté par le titre.
    <div className="absolute inset-0 -z-10" aria-hidden>
      {images.slice(0, mounted).map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          className={`object-cover object-center transition-opacity duration-[1500ms] md:object-right ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}
