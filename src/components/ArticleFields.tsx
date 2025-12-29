'use client'
import type { Article, Field, Author } from '@/lib/types'
import Dompurify from './Dompurify';

export default function ArticleFields({ article }: { article: Article | null }) {
  return  <>
            {article?.fields && article.fields.length > 0 && article.fields.map((field) => (
              <div key={field.id}>
                {
                    (() => {
                    switch (field.type) {
                      case 'image':
                        return field.value && <img src={field.value} alt="" className="mb-4" />
                      case 'code':
                        return <div className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">
                                {article && article?.author?.role === 'admin' ? (
                                  <div dangerouslySetInnerHTML={{ __html: field.value }} />
                                  ) : (
                                    <Dompurify html={field.value } />
                                  )}
                              </div>
                      case 'link':
                        return <a href={field.value} className="text-blue-600 hover:text-blue-900 mb-4 block">{field.value}</a>
                      default:
                        return ''
                  }
                })()
              }
              </div>
            ))}
        </>;
}