'use client'
import type { Article, Field, Author } from '@/lib/types'
import Dompurify from './Dompurify';
import styles from './ArticleFields.module.css' 
import ImageField from './ImageField';

export default function ArticleFields({ article }: { article: Article | null }) {

  return  <>
            {article?.fields && article.fields.length > 0 && article.fields.map((field) => (
              <div key={field.id} className={`${styles['article-fields__field']} ${styles['article-fields__field--' + field.type]}`}>
                {
                    (() => {
                    switch (field.type) {
                      case 'image':
                        return field.value && <div className={styles['article-fields__image-container']}>
                          <ImageField
                            src={field.value}
                            alt=""
                            className={styles['article-fields__image']}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      case 'code':
                        return <div className={styles['article-fields__code']}>
                                {article && article?.author?.role === 'admin' ? (
                                  // <div dangerouslySetInnerHTML={{ __html: field.value }} />
                                  <iframe src={`/api/code/${field.id}`} className={styles['article-fields__code-iframe']} />
                                  ) : (
                                    <Dompurify html={field.value } />
                                  )}
                              </div>
                      case 'link':
                        try {
                          const linkData = JSON.parse(field.value || '{}');
                          if (linkData.url) {
                            return <a href={linkData.url} className={styles['article-fields__link']}>{linkData.title || linkData.url}</a>
                          }
                        } catch (e) {
                          return <a href={field.value} className={styles['article-fields__link']}>{field.value}</a>
                        }
                      default:
                        return ''
                  }
                })()
              }
              </div>
            ))}
        </>;
}