'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Eye, Download, FileCheck, ShieldCheck, Ban } from 'lucide-react'
import { Certificate } from '@/lib/types'
import { fetchCertificates } from '@/lib/api/calibrations'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function StandardCertificatesPage() {
    const [data, setData] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    useEffect(() => {
        async function load() {
            try {
                // TODO: Filter by 'standard' type
                const result = await fetchCertificates()
                setData(result)
            } catch (error) {
                console.error("Failed to load certificates", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filteredData = data.filter((cert) => {
        const matchesSearch =
            cert.instrument_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.calibration_id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = statusFilter === 'all' || cert.status === statusFilter
        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Standard Certificates"
                description="Calibration certificates for reference standards"
            />

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search certificates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="valid">Valid</SelectItem>
                            <SelectItem value="revoked">Revoked</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Certificate ID</TableHead>
                            <TableHead>Calibration ID</TableHead>
                            <TableHead>Standard</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Digital Hash</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No certificates found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((cert) => (
                                <TableRow key={cert.id}>
                                    <TableCell className="font-mono text-sm font-bold">{cert.id}</TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">{cert.calibration_id}</TableCell>
                                    <TableCell>{cert.instrument_name}</TableCell>
                                    <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <code className="bg-muted px-2 py-1 rounded text-xs">
                                            {cert.hash}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        {cert.status === 'valid' ? (
                                            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950">
                                                <ShieldCheck className="mr-1 h-3 w-3" /> Valid
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                <Ban className="mr-1 h-3 w-3" /> Revoked
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" /> Download
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
