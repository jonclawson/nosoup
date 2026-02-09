import styles from './ArticleFields.module.css' 
import Dompurify from './Dompurify';

export default function CodeField({ article, field }: { article: any, field: any }) {
  return <>
          {article && article?.author?.role === 'admin' ? (
            // <div dangerouslySetInnerHTML={{ __html: field.value }} />
            <iframe src={`/api/code/${field.id}`} 
            allow="microphone *; speech-recognition *; on-device-speech-recognition *"
            className={styles['article-fields__code-iframe']} />
            ) : (
              <Dompurify html={field.value } />
            )}
          </>;
}