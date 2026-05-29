'use client'

import React, { useState } from 'react'
import { 
    MessageSquare, 
    Plus, 
    Search, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useSupport } from '@/lib/hooks/use-support'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function SupportPage() {
    const { tickets, isLoading, createTicket, isCreating } = useSupport()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [search, setSearch] = useState('')

    // Form State
    const [subject, setSubject] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('medium')
    const [category, setCategory] = useState('technical')

    const filteredTickets = tickets.filter(t => 
        t.subject.toLowerCase().includes(search.toLowerCase())
    )

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault()
        createTicket({ subject, description, priority, category }, {
            onSuccess: () => {
                toast.success("Chamado aberto com sucesso!")
                setIsCreateModalOpen(false)
                setSubject('')
                setDescription('')
            }
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Aberto</Badge>
            case 'in_progress': return <Badge variant="outline" className="bg-info/10 text-info border-info/20">Em Atendimento</Badge>
            case 'resolved': return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Resolvido</Badge>
            case 'closed': return <Badge variant="secondary">Fechado</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Suporte Técnico</h1>
                    <p className="text-muted-foreground">Gerencie seus chamados e solicitações de auxílio.</p>
                </div>
                
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-fit">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Chamado
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleCreateTicket}>
                            <DialogHeader>
                                <DialogTitle>Abrir Novo Chamado</DialogTitle>
                                <DialogDescription>
                                    Descreva o problema ou dúvida técnica. Nossa equipe responderá em breve.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">Assunto</Label>
                                    <Input 
                                        id="subject" 
                                        placeholder="Ex: Erro ao gerar certificado de paquímetro" 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Prioridade</Label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Baixa</SelectItem>
                                                <SelectItem value="medium">Média</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                                <SelectItem value="urgent">Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Categoria</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="technical">Técnica / Metrologia</SelectItem>
                                                <SelectItem value="bug">Erro no Sistema</SelectItem>
                                                <SelectItem value="billing">Financeiro</SelectItem>
                                                <SelectItem value="feature">Sugestão</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descrição detalhada</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Conte-nos o que está acontecendo..." 
                                        className="min-h-[120px]"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? "Enviando..." : "Abrir Chamado"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar chamados..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                            <p className="text-muted-foreground">Nenhum chamado encontrado.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Assunto</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Prioridade</TableHead>
                                    <TableHead>Aberto em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">
                                            {ticket.subject}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(ticket.status)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize">{ticket.priority}</span>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
