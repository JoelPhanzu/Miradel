'use client'

import { animate, inView } from 'motion'
import { useEffect } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const
const SEEN = 'data-revealed'

/**
 * Apparition douce au défilement de tous les éléments marqués `data-reveal` (bibliothèque motion) :
 * opacité 0 → 1, déplacement vertical 24 px → 0, 0,55 s, une seule fois, léger décalage entre
 * les éléments d'une même liste. Mouvement vertical uniquement (aucun débordement horizontal).
 * Rien n'est masqué si l'utilisateur réduit les animations, ni pour les éléments déjà visibles
 * à l'arrivée sur la page (pas de clignotement).
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stops: (() => void)[] = []

    const prepare = (el: HTMLElement) => {
      if (el.hasAttribute(SEEN)) return
      el.setAttribute(SEEN, '')
      // Déjà à l'écran : on n'y touche pas.
      if (el.getBoundingClientRect().top < window.innerHeight) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(24px)'
      const siblings = el.parentElement
        ? Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal'))
        : []
      const delay = Math.min(Math.max(siblings.indexOf(el), 0), 5) * 0.08
      stops.push(
        inView(
          el,
          () => {
            animate(el, { opacity: 1, y: 0 }, { duration: 0.55, ease: EASE, delay }).then(() => {
              // État final rendu au CSS : l'élément reste visible quoi qu'il arrive.
              el.style.removeProperty('opacity')
              el.style.removeProperty('transform')
            })
          },
          { amount: 0.15 },
        ),
      )
    }

    const scan = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(prepare)
    scan(document)

    // Contenus arrivés après coup (chargement en flux, navigation entre pages).
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return
          if (n.hasAttribute('data-reveal')) prepare(n)
          scan(n)
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      stops.forEach((stop) => stop())
    }
  }, [])

  return null
}
