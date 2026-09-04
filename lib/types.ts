export type InstrumentStatus = 'active' | 'expired' | 'in_calibration' | 'rejected' | 'inactive' | 'due' | 'lost' | 'maintenance' | 'scrapped';

export interface Material {
    id: string; // ULID
    name: string;
    cte: number;
    category?: string;
    tenant_id?: string;
}

export interface Attachment {
    id: string; // ULID
    file_name: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
    created_at: string;
}

export interface InstrumentType {
    id: string; // ULID
    name: string;
    calibration_frequency_months: number;
    decision_rule: 'simple' | 'uncertainty_accounted' | 'guard_band';
    guard_band_multiplier: number;
}

export interface Station {
    id: string; // ULID
    parent_id?: string;
    name: string;
    type: 'plant' | 'department' | 'sector' | 'workstation' | 'storage';
    location?: string;
    description?: string;
    full_path?: string; // Accessor from backend
    is_active: boolean;
}

export interface Instrument {
    id: string; // ULID
    name: string;
    serial_number?: string;
    manufacturer: string;
    model: string;
    instrument_type_id?: string; // ULID
    instrument_type?: InstrumentType;
    status: InstrumentStatus;
    last_calibration_date: string;
    next_calibration_date: string;
    calibration_due: string; // Backend direct field
    current_station_id?: string; // ULID
    station?: Station;
    range?: string;
    measuring_range?: string;
    resolution?: string;
    image_url?: string;
    material_id?: string; // ULID
    material?: Material;
    mpe_value?: number;
    mpe?: string;
    guard_band_multiplier_override?: number;
    attachments?: Attachment[];
}

export type CalibrationResult = 'pass' | 'fail' | 'conditional_pass' | 'unknown' | 'approved' | 'rejected';

export interface Calibration {
    id: string; // ULID
    calibrated_item_id: string;
    calibrated_item_type: string;
    calibrated_item?: {
        id: string;
        name: string;
        type: string;
        model: string;
        serial_number: string;
        manufacturer: string;
        mpe?: string;
        mpe_value?: number;
        resolution?: string;
        range?: string;
    };
    calibrated_item_name?: string;
    instrument_id?: string;
    instrument_name?: string;
    date: string;
    calibration_date: string; // Backend direct field
    technician: string;
    result: CalibrationResult;
    next_due_date: string;
    decision_rule?: string;
    certificate_url?: string;
    deviation?: number;
    as_found_deviation?: number;
    as_left_deviation?: number;
    uncertainty?: number;
    k_factor?: number;
    temperature?: number;
    humidity?: number;
    notes?: string;
    checklist_template_id?: string;
    conformity_statement?: string;
    as_found_result?: string;
    as_left_result?: string;
    procedure_snapshot?: {
        instrument: {
            name: string;
            serial_number: string;
            mpe: string;
            mpe_value: number;
            resolution: string;
            range: string;
            decision_rule: string;
        };
        template: {
            id: string;
            name: string;
            version: number;
            items: any[];
        } | null;
        timestamp: string;
    };
    checklist_items?: CalibrationChecklistItem[];
    uncertainty_budget?: UncertaintyBudgetItem[];
}

export interface UncertaintyBudgetItem {
    source: string;
    value: number;
    divisor: number;
    distribution: string;
    standard_uncertainty: number;
    sensitivity_coefficient?: number;
    degrees_of_freedom?: number | string;
}

export interface CalibrationChecklistItem {
    id?: string; // ULID
    step: string;
    question_type: 'numeric' | 'boolean' | 'text';
    template_item_id?: string;
    nominal_value: number;
    error?: number;
    as_found_readings: (number | string)[];
    as_left_readings?: (number | string)[];
    readings?: any;
    readings_formatted?: string;
    adjusted?: boolean;
    result: string;
    uncertainty?: string;
    notes?: string;
    standard_id?: string;
    reference_standard_id?: string;
    reference_standard?: any;
}

export interface Certificate {
    id: string;
    calibration_id: string;
    instrument_name?: string;
    issue_date: string;
    hash?: string;
    pdf_url: string;
    status: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: 'trial' | 'active' | 'suspended' | 'canceled';
    plan_id?: string;
}

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
}

export interface MaintenanceRecord {
    id: string;
    instrument_id: string;
    type: 'preventive' | 'corrective' | 'adjustment';
    date: string;
    description: string;
    findings?: string;
    parts_replaced?: any;
    cost?: number;
    technician_id?: string;
    technician_name?: string;
    supplier_id?: string;
    supplier_name?: string;
    status: string;
}

export interface IoTGateway {
    id: string;
    tenant_id: string;
    station_id?: string;
    name: string;
    device_id: string;
    status: string;
    last_at?: string;
    created_at: string;
    updated_at: string;
}

export interface IoTNode {
    id: string;
    tenant_id: string;
    gateway_id: string;
    machine_id: string;
    name: string;
    node_id: string;
    status: string;
    gateway?: IoTGateway;
    machine?: {
        id: string;
        name: string;
    };
    created_at: string;
    updated_at: string;
}
