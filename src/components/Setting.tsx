import React, { useEffect } from 'react';
import ContentEdit from './ContentEdit';
import SkeletonLine from './SkeletonLine';
export default function Setting({ type, setting, children }: { type?: string, setting: string, children: React.ReactNode }) {
  const [value, setValue] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

    useEffect(() => {
      async function fetchSetting() {
        try {
          const response = await fetch(`/api/settings/${setting}`)
          const data = await response.json()
          if (data?.value) {
            setValue(data.value)
          }
        } catch (error) {
          console.error('Error fetching setting:', error)
          setError('Error fetching setting')
        } finally {
          setIsLoading(false)
        }
      }
      fetchSetting()
    }, [])

    const handleOnChange = async (newValue: any) => {
      setValue(newValue)
      const formData = new FormData()
      formData.set('key', setting)
      formData.set('value', newValue)
      try {
        const response = await fetch(`/api/settings/${value ? setting : ''}`, {
          method: value ? 'PUT' : 'POST',
          body: formData,
        })
        if (!response.ok) {
          console.error('Failed to update setting')
        }
      } catch (error) {
        console.error('Error updating setting:', error)
      }
    }

    if (isLoading) {
      return //<SkeletonLine />
    }

    if (error) {      
      return <div>{error}</div>
    }

    return (
      <>
      <ContentEdit type={type} onChange={handleOnChange}>
        {value || children}
      </ContentEdit>
      </>
    )
}