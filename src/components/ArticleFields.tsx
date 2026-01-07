'use client'
import type { Article, Field, Author } from '@/lib/types'
import Dompurify from './Dompurify';
import styles from './ArticleFields.module.css' 

export default function ArticleFields({ article }: { article: Article | null }) {
  return  <>
            {article?.fields && article.fields.length > 0 && article.fields.map((field) => (
              <div key={field.id}>
                {
                    (() => {
                    switch (field.type) {
                      case 'image':
                        return field.value && <img src={field.value} alt="" className={styles['article-fields__image']} />
                      case 'code':
                        return <div className={styles['article-fields__code']}>
                                {article && article?.author?.role === 'admin' ? (
                                  <div dangerouslySetInnerHTML={{ __html: field.value }} />
                                  ) : (
                                    <Dompurify html={field.value } />
                                  )}
                              </div>
                      case 'link':
                        return <a href={field.value} className={styles['article-fields__link']}>{field.value}</a>
                      default:
                        return ''
                  }
                })()
              }
              </div>
            ))}
        </>;
}