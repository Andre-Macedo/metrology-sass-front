"use client"

import { PageHeader } from "@/components/layout/page-header"
import { SignaturePad } from "@/components/ui/signature-pad"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/lib/hooks/use-auth"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api/client"

const uploadSignature = async (dataUrl: string) => {
    // 1. Convert Base64 to Blob
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], "signature.png", { type: "image/png" })

    // 2. Prepare FormData
    const formData = new FormData()
    formData.append('signature', file)

    // 3. Send Request (Manual fetch to handle FormData properly)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    // We moved the route to /system/profile/signature
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/system/profile/signature`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Do NOT set Content-Type here; browser sets it with boundary for FormData
            'Accept': 'application/json',
        },
        body: formData
    })

    if (!response.ok) {
        throw new Error('Upload failed')
    }

    return await response.json()
}

export default function ProfilePage() {
    const { user, refetch } = useAuth()
    
    // UI State
    const [loadingSignature, setLoadingSignature] = useState(false)
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

    // Form States
    const [profileData, setProfileData] = useState({ name: '', email: '' })
    const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' })

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name || '', email: user.email || '' })
        }
    }, [user])

    const handleSaveSignature = async (dataUrl: string) => {
        try {
            setLoadingSignature(true)
            await uploadSignature(dataUrl)
            toast.success("Signature saved successfully!")
            if (refetch) refetch() // Refresh user data
        } catch (error) {
            console.error(error)
            toast.error("Failed to save signature.")
        } finally {
            setLoadingSignature(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsUpdatingProfile(true)
            await apiClient.put('/system/profile', profileData)
            toast.success('Profile updated successfully.')
            if (refetch) refetch()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile.')
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsUpdatingPassword(true)
            await apiClient.put('/system/profile/password', passwordData)
            toast.success('Password updated successfully.')
            setPasswordData({ current_password: '', password: '', password_confirmation: '' })
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password. Check if current password is correct.')
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Your Profile"
                description="Manage your account settings and preferences."
            />

            <Tabs defaultValue="general" className="w-full max-w-4xl">
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="signature">Digital Signature</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <form onSubmit={handleUpdateProfile}>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your account's profile information and email address.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        id="name" 
                                        value={profileData.name} 
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        value={profileData.email} 
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit" disabled={isUpdatingProfile}>
                                    {isUpdatingProfile ? 'Saving...' : 'Save'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <form onSubmit={handleUpdatePassword}>
                            <CardHeader>
                                <CardTitle>Update Password</CardTitle>
                                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input 
                                        id="current_password" 
                                        type="password" 
                                        value={passwordData.current_password} 
                                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        value={passwordData.password} 
                                        onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input 
                                        id="password_confirmation" 
                                        type="password" 
                                        value={passwordData.password_confirmation} 
                                        onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? 'Saving...' : 'Save'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="signature">
                    <Card>
                        <CardHeader>
                            <CardTitle>Digital Signature</CardTitle>
                            <CardDescription>
                                This rubric will be visually embedded in PDF certificates you sign as a Technician or Approver.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SignaturePad
                                onSave={handleSaveSignature}
                                loading={loadingSignature}
                                existingSignatureUrl={user?.signature_image_path ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${user.signature_image_path}` : null}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
