const DAYS = [
  { iso: 1, short: 'L', name: 'lundi' },
  { iso: 2, short: 'M', name: 'mardi' },
  { iso: 3, short: 'M', name: 'mercredi' },
  { iso: 4, short: 'J', name: 'jeudi' },
  { iso: 5, short: 'V', name: 'vendredi' },
  { iso: 6, short: 'S', name: 'samedi' },
  { iso: 7, short: 'D', name: 'dimanche' },
]

/** « mardi », « mardi et jeudi », « lundi, mardi et jeudi ». */
export function weekdayNames(days: number[]): string {
  const names = DAYS.filter((d) => days.includes(d.iso)).map((d) => d.name)
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names.at(-1)}` : names[0]
}

/** Les sept jours de la semaine, ceux de l'offre mis en avant. */
export function WeekdayDots({ days, small }: { days: number[]; small?: boolean }) {
  return (
    <ol className="flex gap-1.5 sm:gap-2" aria-label={`Chaque ${weekdayNames(days)}`}>
      {DAYS.map((day) => {
        const on = days.includes(day.iso)
        return (
          <li
            key={day.iso}
            title={day.name}
            className={`flex items-center justify-center rounded-full font-semibold ${
              small ? 'size-8 text-xs' : 'size-10 text-sm sm:size-11'
            } ${on ? 'bg-accent text-accent-ink' : 'border-ink/15 text-ink-soft border'}`}
          >
            <span aria-hidden>{day.short}</span>
          </li>
        )
      })}
    </ol>
  )
}
