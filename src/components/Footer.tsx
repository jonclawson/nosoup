'use client';
import Setting from "./Setting";
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__container}>
        <Setting setting="footer_text" loading="footer">
          &copy; {new Date().getFullYear()} NoSoup. All rights reserved.
        </Setting>
      </div>
    </footer>
  )
}