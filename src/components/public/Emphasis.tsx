/**
 * Met en valeur (orange) les mots entourés d'astérisques : « un *métier* ».
 * Permet à la gérante de mettre un mot en valeur depuis l'admin sans HTML.
 * `highlightLast` : sans astérisque, le dernier mot est mis en valeur (présentation seule,
 * le texte n'est pas modifié).
 */
export function Emphasis({
  text,
  onDark,
  highlightLast,
}: {
  text: string
  onDark?: boolean
  highlightLast?: boolean
}) {
  // Orange vif sur fond bleu marine ; orange foncé sur fond clair (contraste AA).
  const color = onDark ? 'text-orange-400' : 'text-orange-700'
  let source = text
  if (highlightLast && !/\*[^*]+\*/.test(text)) {
    const i = text.trimEnd().lastIndexOf(' ')
    if (i > 0) source = `${text.slice(0, i + 1)}*${text.slice(i + 1).trim()}*`
  }
  return source.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <em key={i} className={`${color} not-italic`}>
        {part.slice(1, -1)}
      </em>
    ) : (
      part
    ),
  )
}
