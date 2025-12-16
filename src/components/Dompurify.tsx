'use client'
import DOMPurify from 'isomorphic-dompurify'
export default function Dompurify({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
}