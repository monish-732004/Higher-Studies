import { Fragment } from 'react'

/** Renders **bold** and *italic* markup from content strings as real HTML. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <strong key={i} className="font-semibold text-white">
            {p.slice(2, -2)}
          </strong>
        ) : p.startsWith('*') && p.endsWith('*') && p.length > 2 ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}
