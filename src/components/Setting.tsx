'use client';
import React, { useEffect } from 'react';
import ContentEdit from './ContentEdit';
import SkeletonLine from './SkeletonLine';
import { useStateContext } from '@/contexts/StateContext';
import { useSession } from 'next-auth/react';

export default function Setting({ type, setting, children }: { type?: string, setting: string, children: React.ReactNode }) {
  const { data: session } = useSession();
  const [value, setValue] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const { getSetting, setSetting } = useStateContext();

    useEffect(() => {
      async function fetchSetting() {
        try {
          const response = await fetch(`/api/settings/${setting}`)
          const data = await response.json()
          if (data?.value) {
            setValue(data.value)
            setSetting(setting, data.value)
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
        setSetting(setting, newValue)
        if (!response.ok) {
          console.error('Failed to update setting')
        }
      } catch (error) {
        console.error('Error updating setting:', error)
      }
    }

    const handleDelete = async () => {
      try {
        const response = await fetch(`/api/settings/${setting}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setValue(null)
          setSetting(setting, null)
        } else {
          console.error('Failed to delete setting')
        }
      } catch (error) {
        console.error('Error deleting setting:', error)
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
      {!!value && !!session?.user &&     
      <button
        type="button"
        onClick={() => handleDelete()}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        &times;
      </button>}
      </>
    )
}