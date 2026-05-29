"use client"

import { useState, useRef } from "react"
import { Attachment } from "@/lib/types"
import { useUploadAttachment, useDeleteAttachment } from "@/features/system/hooks/use-attachments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Image as ImageIcon, Trash2, UploadCloud, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface AttachmentsListProps {
    attachments?: Attachment[]
    attachableType: string
    attachableId: number
}

export function AttachmentsList({ attachments = [], attachableType, attachableId }: AttachmentsListProps) {
    const uploadMutation = useUploadAttachment()
    const deleteMutation = useDeleteAttachment()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        await handleUpload(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        
        const file = e.dataTransfer.files?.[0]
        if (!file) return

        await handleUpload(file)
    }

    const handleUpload = async (file: File) => {
        // Quick validation
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large. Maximum size is 10MB.")
            return
        }

        try {
            await uploadMutation.mutateAsync({
                file,
                attachable_type: attachableType,
                attachable_id: attachableId
            })
            toast.success("File uploaded successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to upload file")
        }
    }

    const handleDelete = async (attachment: Attachment) => {
        if (!confirm(`Are you sure you want to delete ${attachment.original_name}?`)) return

        try {
            await deleteMutation.mutateAsync({
                id: attachment.id,
                attachable_type: attachableType,
                attachable_id: attachableId
            })
            toast.success("File deleted")
        } catch (error) {
            toast.error("Failed to delete file")
        }
    }

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />
        if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
        return <FileText className="h-8 w-8 text-muted-foreground" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Documents & Attachments</CardTitle>
                <CardDescription>
                    Upload manuals, photos, or external certificates related to this item.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Zone */}
                <div 
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:bg-muted/50'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    
                    {uploadMutation.isPending ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, Images, or Office Docs (Max 10MB)</p>
                        </>
                    )}
                </div>

                {/* File List */}
                {attachments.length > 0 ? (
                    <div className="space-y-3 mt-6">
                        {attachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    {getFileIcon(file.mime_type)}
                                    <div className="flex flex-col truncate">
                                        <a 
                                            href={file.url.startsWith('http') ? file.url : `${process.env.NEXT_PUBLIC_API_URL}/${file.url.replace(/^\//, '')}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-sm font-medium hover:underline truncate"
                                            title={file.original_name}
                                        >
                                            {file.original_name}
                                        </a>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <span>{formatBytes(file.size)}</span>
                                            <span>•</span>
                                            <span>Uploaded {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href={file.url} download={file.original_name} target="_blank" rel="noreferrer">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(file)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-4 border rounded-md bg-muted/20 text-muted-foreground text-sm mt-6">
                        No attachments found.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
