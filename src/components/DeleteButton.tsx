'use client'

import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  userId: string
  onDelete?: () => void
  className?: string
  children?: React.ReactNode
  resourceType?: 'user' | 'article'
}

export default function DeleteButton({ userId, onDelete, className, children, resourceType = 'user' }: DeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    const confirmMessage = resourceType === 'article' 
      ? 'Are you sure you want to delete this article?' 
      : 'Are you sure you want to delete this user?'
    
    if (confirm(confirmMessage)) {
      try {
        const endpoint = resourceType === 'article' 
          ? `/api/articles/${userId}` 
          : `/api/users/${userId}`
        
        const response = await fetch(endpoint, { method: 'DELETE' })
        if (response.ok) {
          if (onDelete) {
            onDelete()
          } else {
            router.refresh()
          }
        }
      } catch (error) {
        console.error(`Failed to delete ${resourceType}:`, error)
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className={className || "text-red-600 hover:text-red-900"}
    >
      {children || 'Delete'}
    </button>
  )
} 