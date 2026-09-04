"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UncertaintyBudgetItem } from "@/lib/types"
import { useTranslations } from "next-intl"
import { Plus, Trash2, Save } from "lucide-react"
import { calculateStandardUncertainty, calculateExpandedUncertainty, DISTRIBUTIONS } from "@/features/calibrations/utils/gum"

import { DialogTrigger } from "@/components/ui/dialog"

interface UncertaintyBudgetModalProps {
    budget: UncertaintyBudgetItem[]
    kFactor: string | number
    isOpen?: boolean
    onClose?: () => void
    onSave?: (newBudget: UncertaintyBudgetItem[], newExpandedUncertainty: number) => void
    trigger?: React.ReactNode
    expandedUncertainty?: number
}

export function UncertaintyBudgetModal({
    budget: initialBudget,
    kFactor,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onSave,
    trigger
}: UncertaintyBudgetModalProps) {
    const t = useTranslations('Metrology.uncertainty_budget')
    const commonT = useTranslations('Common')

    const [budget, setBudget] = useState<UncertaintyBudgetItem[]>([])
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen

    const onClose = () => {
        if (externalOnClose) externalOnClose()
        setInternalIsOpen(false)
    }

    // Sync with initial props when opened
    useEffect(() => {
        if (isOpen && initialBudget) {
            // Map to add an 'isCustom' flag if not present
            setBudget(initialBudget.map(b => ({ ...b, isCustom: (b as any).isCustom || false })))
        }
    }, [isOpen, initialBudget])

    if (!budget || budget.length === 0) return null

    // Real-time calculation using shared utility
    const { combined: combinedUncertainty, expanded: expandedUncertainty } = calculateExpandedUncertainty(budget as any, Number(kFactor) || 2)

    const handleAddSource = () => {
        const newSource: UncertaintyBudgetItem & { isCustom: boolean } = {
            source: 'New Custom Source',
            value: 0,
            divisor: DISTRIBUTIONS['Rectangular'], 
            distribution: 'Rectangular',
            standard_uncertainty: 0,
            isCustom: true
        }
        setBudget([...budget, newSource])
    }

    const handleUpdateSource = (index: number, field: keyof UncertaintyBudgetItem, val: string | number) => {
        const updated = [...budget]
        let currentItem = { ...updated[index] }
        
        // @ts-ignore
        currentItem[field] = val

        // Recalculate standard uncertainty if value or distribution changes
        if (field === 'value' || field === 'distribution') {
            const v = Number(currentItem.value) || 0
            const dist = (field === 'distribution' ? val : currentItem.distribution) as keyof typeof DISTRIBUTIONS
            
            currentItem.divisor = DISTRIBUTIONS[dist] || 1.732
            currentItem.standard_uncertainty = calculateStandardUncertainty(v, dist)
        }

        updated[index] = currentItem
        setBudget(updated)
    }

    const handleRemoveSource = (index: number) => {
        setBudget(budget.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        if (onSave) {
            // Clean up the isCustom flag before saving
            const cleanBudget = budget.map(({ isCustom, ...rest }: any) => rest)
            onSave(cleanBudget, expandedUncertainty)
        }
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) onClose()
            else setInternalIsOpen(true)
        }}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('title')} (GUM Dynamic Calculator)</DialogTitle>
                    <DialogDescription>
                        {t('description')} Add custom sources to refine your uncertainty budget.
                    </DialogDescription>
                </DialogHeader>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.source')}</TableHead>
                                <TableHead className="w-32">{t('table.value')}</TableHead>
                                <TableHead className="w-40">{t('table.distribution')}</TableHead>
                                <TableHead className="text-right">{t('table.divisor')}</TableHead>
                                <TableHead className="text-right">{t('table.standard_uncertainty')} (ui)</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budget.map((item: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {item.isCustom ? (
                                            <Input 
                                                value={item.source} 
                                                onChange={(e) => handleUpdateSource(index, 'source', e.target.value)} 
                                                className="h-8 text-sm"
                                            />
                                        ) : (
                                            <span className="font-medium">{item.source}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.isCustom ? (
                                            <Input 
                                                type="number"
                                                step="any"
                                                value={item.value} 
                                                onChange={(e) => handleUpdateSource(index, 'value', e.target.value)} 
                                                className="h-8 text-sm"
                                            />
                                        ) : (
                                            <span>{Number(item.value).toFixed(5)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.isCustom ? (
                                            <Select 
                                                value={item.distribution} 
                                                onValueChange={(val) => handleUpdateSource(index, 'distribution', val)}
                                            >
                                                <SelectTrigger className="h-8 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Normal">Normal</SelectItem>
                                                    <SelectItem value="Rectangular">Rectangular</SelectItem>
                                                    <SelectItem value="Triangular">Triangular</SelectItem>
                                                    <SelectItem value="U-Shaped">U-Shaped</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span>{item.distribution}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">{Number(item.divisor).toFixed(3)}</TableCell>
                                    <TableCell className="text-right font-mono bg-muted/20">
                                        {Number(item.standard_uncertainty).toFixed(6)}
                                    </TableCell>
                                    <TableCell>
                                        {item.isCustom && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveSource(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Summary Rows */}
                            <TableRow className="bg-slate-50 font-medium border-t-2">
                                <TableCell colSpan={4} className="text-right">{t('table.combined_uncertainty')} (uc)</TableCell>
                                <TableCell className="text-right font-mono text-blue-600">
                                    {combinedUncertainty.toFixed(6)}
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            <TableRow className="bg-slate-50 font-bold">
                                <TableCell colSpan={4} className="text-right">
                                    {t('table.expanded_uncertainty', { k: kFactor })} (U)
                                </TableCell>
                                <TableCell className="text-right font-mono text-green-700 text-lg">
                                    {expandedUncertainty.toFixed(5)}
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    
                    <div className="p-2 bg-muted/30 border-t flex justify-start">
                        <Button variant="outline" size="sm" onClick={handleAddSource}>
                            <Plus className="mr-2 h-4 w-4" /> Add Custom Source
                        </Button>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground mt-2 space-y-3 bg-muted/10 p-4 rounded border border-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2 flex items-center justify-between">
                            <div>
                                <p className="font-medium">{t('methodology.U_title')}</p>
                                <div className="font-mono text-xs bg-muted/30 p-2 rounded flex items-center gap-2 w-fit mt-1">
                                    <span>{t('methodology.U_formula')}</span>
                                    <span className="text-muted-foreground">→</span>
                                    <span>{combinedUncertainty.toFixed(5)} × {kFactor} = <strong>{expandedUncertainty.toFixed(5)}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>{commonT('cancel')}</Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Budget & Apply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
