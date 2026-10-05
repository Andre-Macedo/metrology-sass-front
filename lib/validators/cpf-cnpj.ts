/**
 * Validação oficial de CPF e CNPJ pelo algoritmo Módulo 11 da Receita Federal do Brasil.
 */

export function isValidCpf(cpf: string): boolean {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(clean.charAt(i), 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(clean.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(clean.charAt(i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(clean.charAt(10), 10);
}

export function isValidCnpj(cnpj: string): boolean {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(clean)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(clean.charAt(i), 10) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(clean.charAt(12), 10) !== digit1) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(clean.charAt(i), 10) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    return parseInt(clean.charAt(13), 10) === digit2;
}

/**
 * Valida se a string é um CPF válido (11 dígitos) ou CNPJ válido (14 dígitos).
 * Retorna true se vazio/nulo (para campos opcionais).
 */
export function isValidCpfCnpj(value?: string | null): boolean {
    if (!value || value.trim() === '') return true;
    const clean = value.replace(/\D/g, '');
    if (clean.length === 11) return isValidCpf(clean);
    if (clean.length === 14) return isValidCnpj(clean);
    return false;
}
