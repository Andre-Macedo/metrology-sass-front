import { describe, it, expect } from 'vitest';
import {
    calculateMaxDeviation,
    calculateHysteresis,
    evaluateConformity
} from './metrology-math';

describe('Metrology Math Utilities', () => {
    describe('calculateMaxDeviation', () => {
        it('deve calcular o maior desvio absoluto em relação ao valor nominal', () => {
            const nominal = 25.00;
            const readings = [25.01, 25.02, 24.99];
            // Desvios: |25.01-25| = 0.01, |25.02-25| = 0.02, |24.99-25| = 0.01
            expect(calculateMaxDeviation(nominal, readings)).toBeCloseTo(0.02, 4);
        });

        it('deve lidar com leituras vazias retornando zero', () => {
            expect(calculateMaxDeviation(10.0, [])).toBe(0);
        });

        it('deve converter strings numéricas corretamente', () => {
            expect(calculateMaxDeviation(50.0, ['50.05', 49.98])).toBeCloseTo(0.05, 4);
        });
    });

    describe('calculateHysteresis', () => {
        it('deve calcular a maior diferença absoluta entre ciclos de subida e descida', () => {
            const up = [0, 2.50, 5.01, 7.52, 10.00];
            const down = [0.01, 2.53, 5.05, 7.50, 10.01];
            // Diferenças: |0 - 0.01| = 0.01, |2.50 - 2.53| = 0.03, |5.01 - 5.05| = 0.04, |7.52 - 7.50| = 0.02, |10 - 10.01| = 0.01
            expect(calculateHysteresis(up, down)).toBe(0.04);
        });

        it('deve retornar zero para arrays vazios', () => {
            expect(calculateHysteresis([], [1, 2, 3])).toBe(0);
            expect(calculateHysteresis([1, 2], [])).toBe(0);
        });
    });

    describe('evaluateConformity (ILAC-G8 Decision Rule)', () => {
        const mpe = 0.05; // MPE = 0.05 mm
        const uncertainty = 0.01; // U = 0.01 mm
        const guardBand = 1.0; // w = 1.0 => Limite aceitação segura = 0.05 - 0.01 = 0.04

        it('deve aprovar (pass) quando o desvio está abaixo do limite de aceitação segura', () => {
            expect(evaluateConformity(0.03, mpe, uncertainty, guardBand)).toBe('pass');
            expect(evaluateConformity(-0.035, mpe, uncertainty, guardBand)).toBe('pass');
        });

        it('deve classificar como condicional quando o desvio cai na banda de guarda', () => {
            // Entre 0.04 e 0.05 está na zona de risco/banda de guarda
            expect(evaluateConformity(0.045, mpe, uncertainty, guardBand)).toBe('conditional');
            expect(evaluateConformity(-0.049, mpe, uncertainty, guardBand)).toBe('conditional');
        });

        it('deve reprovar (fail) quando o desvio ultrapassa o MPE', () => {
            expect(evaluateConformity(0.055, mpe, uncertainty, guardBand)).toBe('fail');
            expect(evaluateConformity(-0.06, mpe, uncertainty, guardBand)).toBe('fail');
        });

        it('deve usar regra binária simples quando a incerteza for zero', () => {
            expect(evaluateConformity(0.049, mpe, 0)).toBe('pass');
            expect(evaluateConformity(0.051, mpe, 0)).toBe('fail');
        });
    });
});
