/**
 * Affiche en italique les mots entourés d'astérisques : « faite avec *soin* ».
 * Permet à la gérante de mettre un mot en valeur depuis l'admin sans HTML.
 */
export function Emphasis({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <em key={i} className="italic">
        {part.slice(1, -1)}
      </em>
    ) : (
      part
    ),
  )
}
