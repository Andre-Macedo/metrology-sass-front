import { describe, it, expect } from 'vitest'
import { isValidCpf, isValidCnpj, isValidCpfCnpj } from './cpf-cnpj'

describe('Validador Oficial de CPF e CNPJ (Módulo 11)', () => {
    describe('isValidCpf', () => {
        it('deve validar CPFs matematicamente válidos', () => {
            // CPFs válidos conhecidos com dígitos verificadores corretos
            expect(isValidCpf('52998224725')).toBe(true)
            expect(isValidCpf('529.982.247-25')).toBe(true)
        })

        it('deve rejeitar CPFs com dígitos repetidos', () => {
            expect(isValidCpf('11111111111')).toBe(false)
            expect(isValidCpf('00000000000')).toBe(false)
        })

        it('deve rejeitar CPFs com dígitos verificadores incorretos', () => {
            expect(isValidCpf('52998224720')).toBe(false)
            expect(isValidCpf('12345678901')).toBe(false)
        })
    })

    describe('isValidCnpj', () => {
        it('deve validar CNPJs matematicamente válidos', () => {
            // CNPJ válido conhecido (ex: Banco do Brasil)
            expect(isValidCnpj('00000000000191')).toBe(true)
            expect(isValidCnpj('00.000.000/0001-91')).toBe(true)
        })

        it('deve rejeitar CNPJs com dígitos repetidos', () => {
            expect(isValidCnpj('11111111111111')).toBe(false)
            expect(isValidCnpj('22222222222222')).toBe(false)
        })

        it('deve rejeitar CNPJs com dígitos verificadores incorretos', () => {
            expect(isValidCnpj('00000000000190')).toBe(false)
            expect(isValidCnpj('12345678000199')).toBe(false)
        })
    })

    describe('isValidCpfCnpj (polimórfico)', () => {
        it('deve aceitar campos nulos ou vazios (opcionais)', () => {
            expect(isValidCpfCnpj('')).toBe(true)
            expect(isValidCpfCnpj(null)).toBe(true)
            expect(isValidCpfCnpj(undefined)).toBe(true)
        })

        it('deve aceitar CPF válido ou CNPJ válido', () => {
            expect(isValidCpfCnpj('52998224725')).toBe(true)
            expect(isValidCpfCnpj('00000000000191')).toBe(true)
        })

        it('deve rejeitar entradas com quantidade de dígitos incompatível', () => {
            expect(isValidCpfCnpj('12345')).toBe(false)
            expect(isValidCpfCnpj('123456789012')).toBe(false)
        })
    })
})
