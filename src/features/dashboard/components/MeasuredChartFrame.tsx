import type { ReactNode } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'

type ChartSize = {
  height: number
  width: number
}

type MeasuredChartFrameProps = {
  children: (size: ChartSize) => ReactNode
  className?: string
}

function getElementSize(element: HTMLDivElement): ChartSize {
  const rect = element.getBoundingClientRect()

  return {
    height: Math.floor(rect.height),
    width: Math.floor(rect.width),
  }
}

function isValidChartSize(size: ChartSize) {
  return size.width > 0 && size.height > 0
}

export function MeasuredChartFrame({
  children,
  className,
}: MeasuredChartFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<ChartSize | null>(null)

  useLayoutEffect(() => {
    const element = frameRef.current

    if (!element) {
      return undefined
    }

    function updateSize() {
      if (!element) {
        return
      }

      const nextSize = getElementSize(element)

      setSize((currentSize) => {
        if (
          currentSize?.height === nextSize.height &&
          currentSize.width === nextSize.width
        ) {
          return currentSize
        }

        return nextSize
      })
    }

    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      ref={frameRef}
      className={cn('grid w-full min-w-0 place-items-center', className)}
    >
      {size && isValidChartSize(size) ? (
        children(size)
      ) : (
        <p className="text-sm text-muted-foreground">Carregando gráfico...</p>
      )}
    </div>
  )
}
