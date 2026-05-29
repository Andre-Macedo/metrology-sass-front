import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { apiClient } from './api/client'
import { toast } from 'sonner'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function downloadFile(endpoint: string, filename: string) {
  const toastId = toast.loading('Generating document...', {
    description: 'Please wait while we prepare your file.'
  })

  try {
    const blob = await apiClient.getBlob(endpoint)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    toast.success('Download started!', {
      id: toastId,
      description: `File ${filename} ready.`
    })
  } catch (error) {
    console.error('Failed to download file:', error)
    toast.error('Download failed', {
      id: toastId,
      description: 'There was an error generating your document.'
    })
    throw error
  }
}
