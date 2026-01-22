import { handleDownload } from "@/lib/handle-downloads";
import ArticleFields from "./ArticleFields";
import ArticleTags from "./ArticleTags";
import Dompurify from "./Dompurify";
import type { Article } from "@/lib/types";
import styles from './Article.module.css'

export default function ArticleView({article}: { article: Article }) {
  return (
          <article className={`${styles['article__container']} ${article?.published ? styles['article__container--published'] : styles['article__container--draft']}`}>
            <div className={styles['article__header']}>
              <h1 className={styles['article__title']}>
                {article?.title}
              </h1>
              <div className={styles['article__meta']}>
                <span>By {article?.author?.name}</span>
                <span className={styles['article__meta__dot']}>•</span>
                <span>{new Date(article?.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className={styles['article__divider']}>
              <div className={styles['article__body-container']}>
                <div className={styles['article__fields']}>
                  <ArticleFields article={article} />
                </div>
                <div className={styles['article__body']} onClick={handleDownload}>
                  <Dompurify html={article?.body || ''} />
                </div>
              </div>
              <ArticleTags article={article} />
            </div>
          </article>
  )
}