import type { ReactNode } from 'react'

/**
 * Rendu volontairement simple du texte saisi dans l'admin (aucun HTML accepté) :
 * paragraphes séparés par une ligne vide, « ## » / « ### » pour les titres, « - » pour les listes,
 * **gras**, *italique* et [liens](https://…). La mention [À COMPLÉTER] est mise en évidence.
 */
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern =
    /(\[À COMPLÉTER\]|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token === '[À COMPLÉTER]')
      parts.push(
        <span key={match.index} className="to-complete rounded px-1.5 py-0.5 text-sm">
          {token}
        </span>,
      )
    else if (token.startsWith('**'))
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>)
    else if (token.startsWith('*')) parts.push(<em key={match.index}>{token.slice(1, -1)}</em>)
    else {
      const label = token.slice(1, token.indexOf(']'))
      const href = match[2]
      const external = href.startsWith('http')
      parts.push(
        <a
          key={match.index}
          href={href}
          className="text-accent underline underline-offset-4"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>,
      )
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export function SimpleMarkdown({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return (
    <div className="space-y-5 text-lg leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null
        if (trimmed.startsWith('### '))
          return (
            <h3 key={i} className="font-display pt-4 text-2xl font-semibold">
              {inline(trimmed.slice(4))}
            </h3>
          )
        if (trimmed.startsWith('## '))
          return (
            <h2 key={i} className="font-display pt-6 text-3xl font-semibold">
              {inline(trimmed.slice(3))}
            </h2>
          )
        const lines = trimmed.split('\n')
        if (lines.every((l) => l.trim().startsWith('- ')))
          return (
            <ul key={i} className="marker:text-accent list-disc space-y-2 pl-6">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          )
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
