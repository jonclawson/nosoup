'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SkeletonLine from "./SkeletonLine"
import styles from './MenuTabs.module.css';

export default function MenuTabs() {
  const [menuTabs, setMenuTabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname(); // Get the current pathname

  useEffect(() => {
    const fetchMenuTabs = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuTabs(data);
      } catch (error) {
        setError('Failed to load menu tabs');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuTabs();
  }, [pathname]);

  if (loading) {
    return <SkeletonLine />;
  }

  if (error) {
    return <div>{error}</div>;
  }

return (
      <div className={styles['menu-tabs']}>
        {menuTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.link}
            className={styles['menu-tabs__link']}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    )
}