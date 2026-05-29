export interface User {
    id: number
    name: string
    email: string
    roles?: { id: number; name: string }[]
    role_name?: string
    created_at: string
}

export interface UserFormData {
    name: string
    email: string
    password?: string
    role?: string
}

export interface Supplier {
    id: number
    name: string
    trade_name?: string
    cnpj?: string
    email?: string
    phone?: string
    contact_person?: string
    address?: string
    status: string
    is_manufacturer: boolean
    is_calibration_provider: boolean
    is_maintenance_provider: boolean
    rbc_code?: string
    accreditation_valid_until?: string
    accredited_instrument_types?: {
        instrument_type_id: number;
        instrument_type_name: string;
        range?: string;
        uncertainty?: string;
    }[]
    created_at: string
}

export interface SupplierFormData {
    name: string
    trade_name?: string
    cnpj?: string
    email?: string
    phone?: string
    contact_person?: string
    address?: string
    status: string
    is_manufacturer: boolean
    is_calibration_provider: boolean
    is_maintenance_provider: boolean
    rbc_code?: string
    accreditation_valid_until?: string
}

export interface Station {
    id: number
    name: string
    location?: string
    hostname?: string
    ip_address?: string
    type: string
    status: string
    instruments_count?: number
    created_at: string
}

export interface StationFormData {
    name: string
    location?: string
    hostname?: string
    ip_address?: string
    type: string
    status: string
}
