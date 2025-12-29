'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SkeletonLine from "./SkeletonLine";

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
        console.log('Menu Tabs:', data);
        setMenuTabs(data);
      } catch (error) {
        console.error('Error fetching menu tabs:', error);
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
      <div className="flex items-center space-x-4">
        {menuTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.link}
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            {tab.name}
          </Link>
        ))}
      </div>
    )
}