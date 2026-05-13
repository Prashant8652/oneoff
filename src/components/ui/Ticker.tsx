// src/components/ui/Ticker.tsx
interface TickerProps {
  items: string[]
}

export function Ticker({ items }: TickerProps) {
  const doubled = [...items, ...items]

  return (
    <div className="bg-white text-black py-3 overflow-hidden whitespace-nowrap">
      <div className="inline-flex animate-ticker">
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-[0.65rem] tracking-widest uppercase px-12">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
