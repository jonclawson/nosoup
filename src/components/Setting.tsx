'use client';
import React, { useEffect } from 'react';
import ContentEdit from './ContentEdit';
import SkeletonLine from './SkeletonLine';
import { useStateContext } from '@/contexts/StateContext';
import { useSession } from 'next-auth/react';

export default function Setting({ title, type, setting, children }: { title?: string, type?: string, setting: string, children: React.ReactNode }) {
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

    if (type === 'show') {
      // make the input look like a 10px eye icon that changes color when checked

      const show = value?.toString() === 'true' || value == null
      return (
        <>
          { session?.user && !!session?.user.role && session?.user.role === 'admin' && (
            <label htmlFor={`setting-${setting}`} className="relative inline-block w-0 h-10" title={title}>
            <input
            id={`setting-${setting}`}
            type="checkbox"
            checked={show}
            onChange={(e) => handleOnChange(e.target.checked)}
            className="absolute w-0 h-10 opacity-0 cursor-pointer"
            />
              <span className={`absolute cursor-pointer top-0 left-0 w-4 h-4 rounded-full flex items-center justify-center ${show ? 'bg-blue-500 text-white' : 'border border-blue-500 text-blue-500'}`} aria-hidden="true">
                {show ? (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2 12s4.5-6.5 10-6.5S22 12 22 12s-4.5 6.5-10 6.5S2 12 2 12z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2 12s4.5-6.5 10-6.5S22 12 22 12s-4.5 6.5-10 6.5S2 12 2 12z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </span>
            </label>
          )}
          {show && children}
          </>
        )
    }

    return (
      <>
      <ContentEdit type={type} onChange={handleOnChange}>
        {value || children}
      </ContentEdit>
      {!!value && !!session?.user && !!session?.user.role && session?.user.role === 'admin' && 
      <button
        title={"Reset Setting" + (title ? `: ${title}` : '')}
        type="button"
        onClick={() => handleDelete()}
        className="inline-flex cursor-pointer items-center justify-center w-5 h-5 rounded-full border border-blue-500 bg-white text-blue-500 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        &times;
      </button>}
      </>
    )
}