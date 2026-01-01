'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import SkeletonLine from "./SkeletonLine"
import { useDebounce } from "@/lib/debounce"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'NoSoup'

export default function SiteName() {
  const { data: session, status } = useSession()
  const [siteNameSetting, setSiteNameSetting] = useState<{key: string, value: string} | null>(null)
  const [siteName, setSiteName] = useState(SITE_NAME)
  const [editSiteName, setEditSiteName] = useState(false)
  const [siteLogoSetting, setSiteLogoSetting] = useState<{key: string, value: string} | null>(null)
  const [siteLogo, setSiteLogo] = useState<string | null>(null)
  const [editSiteLogo, setEditSiteLogo] = useState(false)
  const [loading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSiteName() {
      try {
        const response = await fetch('/api/settings/site_name')
        const data = await response.json()
        if (data?.value) {
          setSiteName(data.value)
          setSiteNameSetting(data)
          document.title = data.value
        }
      } catch (error) {
        console.error('Error fetching site name:', error)
        setError('Error fetching site name')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSiteName()
  }, [])

  useEffect(() => {
    async function fetchSiteLogo() {
      try {
        const response = await fetch('/api/settings/site_logo')
        const data = await response.json()
        if (data?.value) {
          setSiteLogo(data.value)
          setSiteLogoSetting(data)
        }
      } catch (error) {
        console.error('Error fetching site logo:', error)
      }
    }
    fetchSiteLogo()
  }, [])

  const submitSiteName = useDebounce(async (newSiteName: string) => {
    const formData = new FormData()
    formData.set('key', 'site_name')
    formData.set('value', newSiteName)
    try {
      const response = await fetch(`/api/settings/${siteNameSetting ? 'site_name' : ''}`, {
        method: siteNameSetting != null ? 'PUT' : 'POST',
        body: formData,
      })
      if (response.ok) {
        const data = await response.json()
        if (data?.value) {
          setSiteName(data.value)
          setSiteNameSetting(data)
          document.title = newSiteName
        }
      } else {
        console.error('Failed to update site name')
      }
    } catch (error) {
      console.error('Error updating site name:', error)
    }
  }, 300);

  const submitSiteLogo = async (newSiteLogo: string) => {
    const formData = new FormData()
    formData.set('key', 'site_logo')
    formData.set('value', newSiteLogo)
    try {
      const response = await fetch(`/api/settings/${siteLogoSetting ? 'site_logo' : ''}`, {
        method: siteLogoSetting != null ? 'PUT' : 'POST',
        body: formData,
      })
      if (response.ok) {
        setSiteLogo(newSiteLogo)
        setEditSiteLogo(false)
      } else {
        console.error('Failed to update site logo')
      }
    } catch (error) {
      console.error('Error updating site logo:', error)
    }
  }

  if (loading) {
    return <SkeletonLine  />
  }

  if (error) {
    return <span>{error}</span>
  }

  return <>
      { editSiteName && status === "authenticated" && session?.user?.name ? (
        <>
          <input
            type="text"
            name="siteName"
            defaultValue={siteName}
            className="border border-gray-300 rounded-md px-2 py-1"
            autoFocus
            onChange={(e) => submitSiteName(e.target.value)}
            onBlur={(e) => setEditSiteName(false)}
          />        
        </>
      ) : (   

      <Link href="/">
        {siteLogo ? (
          <img src={(siteLogo)} alt={siteName} className="h-8 inline-block mr-2" />
        ) : <span>{siteName}</span>}
      </Link>
      )}
      {status === "authenticated" && session?.user?.role === 'admin' && (
        <>
        <button onClick={() => setEditSiteName(!editSiteName)} className="mr-2" title="Edit Site Name">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block text-blue-600 hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <label htmlFor="siteLogoUpload" className="cursor-pointer text-sm text-blue-600 hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-4 3 3 5-5 3 3v1a1 1 0 01-1 1z" />
          </svg>
          <input
            id="siteLogoUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0]
                const reader = new FileReader()
                reader.onload = (event) => {
                  if (event.target?.result) {
                    setSiteLogo(event.target.result as string)
                    submitSiteLogo(event.target.result as string)
                  }
                }
                reader.readAsDataURL(file)
              }
            }}
          />  
        </label>
        </>
      )}
    </>
}
