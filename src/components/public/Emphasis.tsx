/**
 * Met en valeur (couleur d'accent) les mots entourés d'astérisques : « un *métier* ».
 * Permet à la gérante de mettre un mot en valeur depuis l'admin sans HTML.
 */
export function Emphasis({ text, onDark }: { text: string; onDark?: boolean }) {
  // Orange vif sur fond bleu marine ; orange foncé sur fond clair (contraste AA).
  const color = onDark ? 'text-orange' : 'text-ochre'
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <em key={i} className={`${color} not-italic`}>
        {part.slice(1, -1)}
      </em>
    ) : (
      part
    ),
  )
}
