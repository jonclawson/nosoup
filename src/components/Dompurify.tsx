// 'use client'
// import DOMPurify from 'isomorphic-dompurify'
// export default function Dompurify({ html }: { html: string }) {
//   return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
// }
'use client'
import { useEffect, useState } from 'react'

export default function Dompurify({ html }: { html: string }) {
  const [sanitized, setSanitized] = useState<string>(html)

  useEffect(() => {
    let mounted = true
    import('dompurify')
      .then((mod) => {
        const createDOMPurify = (mod.default || mod)
        const purifier = (typeof window !== 'undefined') ? createDOMPurify(window as unknown as Window) : null
        const safe = purifier ? purifier.sanitize(html) : html
        if (mounted) setSanitized(safe)
      })
      .catch(() => {
        if (mounted) setSanitized(html)
      })
    return () => { mounted = false }
  }, [html])

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}