/**
 * Funções de domínio puro para cálculos metrológicos conforme ISO GUM e ILAC-G8.
 */

/**
 * Calcula o desvio máximo absoluto entre um conjunto de leituras e o valor nominal.
 *
 * @param nominal Valor nominal de referência do ponto de calibração.
 * @param readings Array de leituras observadas pelo operador ou sensor.
 * @returns Maior desvio absoluto encontrado (|leitura - nominal|).
 */
export function calculateMaxDeviation(nominal: number, readings: (number | string)[]): number {
    if (!readings || readings.length === 0) return 0;

    return readings.reduce<number>((max, r) => {
        const val = typeof r === 'number' ? r : parseFloat(String(r));
        if (isNaN(val)) return max;
        const dev = Math.abs(val - nominal);
        return Math.max(max, dev);
    }, 0);
}

/**
 * Calcula a histerese máxima entre o ciclo de subida (ida) e o ciclo de descida (volta).
 * Histerese = max(|Leitura_Subida[i] - Leitura_Descida[i]|)
 *
 * @param upReadings Leituras do ciclo ascendente (ida).
 * @param downReadings Leituras do ciclo descendente (volta).
 * @returns Maior erro de histerese encontrado.
 */
export function calculateHysteresis(upReadings: number[], downReadings: number[]): number {
    if (!upReadings || !downReadings || upReadings.length === 0 || downReadings.length === 0) {
        return 0;
    }

    const minLength = Math.min(upReadings.length, downReadings.length);
    let maxHysteresis = 0;

    for (let i = 0; i < minLength; i++) {
        const up = upReadings[i] ?? 0;
        const down = downReadings[i] ?? 0;
        const diff = Math.abs(up - down);
        if (diff > maxHysteresis) {
            maxHysteresis = diff;
        }
    }

    return Math.round(maxHysteresis * 1000000) / 1000000;
}

/**
 * Avalia a conformidade metrológica conforme a regra de decisão ILAC-G8:09/2019.
 *
 * - pass: |desvio| <= MPE - g (onde g = banda de guarda = w * U).
 * - fail: |desvio| > MPE.
 * - conditional: MPE - g < |desvio| <= MPE (zona de dúvida/risco compartilhado).
 *
 * @param deviation Desvio máximo observado (mm, bar, °C, etc.).
 * @param mpe Erro Máximo Admissível do instrumento.
 * @param uncertainty Incerteza expandida U (opcional).
 * @param guardBandMultiplier Multiplicador de banda de guarda (padrão 1.0 se U fornecido).
 */
export function evaluateConformity(
    deviation: number,
    mpe: number,
    uncertainty: number = 0,
    guardBandMultiplier: number = 1.0
): 'pass' | 'fail' | 'conditional' {
    const absDev = Math.abs(deviation);
    const absMpe = Math.abs(mpe);

    if (absMpe <= 0) {
        return 'pass';
    }

    // Regra simples: sem incerteza associada
    if (uncertainty <= 0) {
        return absDev <= absMpe ? 'pass' : 'fail';
    }

    // Regra ILAC-G8 com Banda de Guarda:
    // Limite de aceitação segura (A) = MPE - (w * U)
    const guardBand = guardBandMultiplier * uncertainty;
    const safeAcceptanceLimit = Math.max(0, absMpe - guardBand);

    if (absDev <= safeAcceptanceLimit) {
        return 'pass';
    }

    if (absDev <= absMpe) {
        return 'conditional';
    }

    return 'fail';
}
