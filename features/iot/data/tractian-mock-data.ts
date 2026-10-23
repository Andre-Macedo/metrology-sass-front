/**
 * Tractian-Grade Mock Data & Industrial Vibration Physics Engine
 * Simula ativos industriais, cinemática de rolamentos, espectros FFT (0-1000 Hz),
 * tendências térmicas e diagnósticos prescritivos com base na norma ISO 20816-3.
 * 
 * NOTA: O microfone/áudio foi descontinuado do hardware físico (sonda torre agora utiliza
 * sensores duplos de temperatura digital 1-Wire DS18B20 + acelerômetro triaxial MPU6050).
 */

export interface BearingKinematics {
  model: string
  ballCount: number
  ballDiameterMm: number
  pitchDiameterMm: number
  contactAngleDeg: number
  bpfo: number // Ball Pass Frequency Outer Race (Hz)
  bpfi: number // Ball Pass Frequency Inner Race (Hz)
  bsf: number  // Ball Spin Frequency (Hz)
  ftf: number  // Fundamental Train Frequency / Gaiola (Hz)
}

export interface PlantAsset {
  id: string
  tag: string
  name: string
  plant: string
  sector: string
  sensorNodeId: string
  monitoringPoint: string
  nominalPowerKw: number
  nominalRpm: number
  isoClass: string
  bearing: BearingKinematics
  healthScore: number
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  operatingState: 'running' | 'stopped' | 'alarm'
  velocityRms: number // mm/s
  temperatureC: number
  hoursRunningTotal: number
  scenarioId: ScenarioKey
}

export type ScenarioKey = 
  | 'healthy'
  | 'imbalance'
  | 'misalignment'
  | 'bearing_defect'
  | 'mechanical_looseness'

export interface FFTPeak {
  frequencyHz: number
  order: string
  amplitudeG: number
  label?: string
}

export interface FFTSpectrumPoint {
  frequency: number // Hz
  radialX: number   // g (ou mm/s)
  radialY: number   // g
  axialZ: number    // g
}

export interface TimeWaveformPoint {
  timeMs: number    // milissegundos
  radialX: number   // g (aceleração instantânea)
  radialY: number   // g
  axialZ: number    // g
}

export interface DiagnosticInsight {
  rootCause: string
  classification: 'healthy' | 'caution' | 'warning' | 'danger'
  isoZone: 'A' | 'B' | 'C' | 'D'
  isoZoneLabel: string
  confidencePercent: number
  mlModel: 'XGBoost Specialist v2' | 'Multimodal Incremental Mod3'
  urgency: 'Nenhuma' | 'Em até 30 dias' | 'Em até 14 dias' | 'Em até 7 dias' | 'Imediata (< 24h)'
  summary: string
  prescriptions: string[]
  suggestedWorkOrder: {
    title: string
    category: 'Mecânica' | 'Lubrificação' | 'Elétrica' | 'Preditiva'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    estimatedHours: number
  }
}

export interface ScenarioData {
  id: ScenarioKey
  label: string
  tagline: string
  healthScore: number
  isoZone: 'A' | 'B' | 'C' | 'D'
  operatingRpm: number
  runningHours: number
  triaxialVelocityRms: {
    radialX: number
    radialY: number
    axialZ: number
    global: number
  }
  triaxialAccelG: {
    radialX: number
    radialY: number
    axialZ: number
    peakToPeak: number
    kurtosis: number
    crestFactor: number
  }
  temperature: {
    bearingContactC: number
    ambientC: number
    deltaTC: number
    trendRatePerDayC: number
    warningThresholdC: number
    criticalThresholdC: number
  }
  insights: DiagnosticInsight
  dominantPeaks: FFTPeak[]
}

// Cinemática do Rolamento SKF 6204-2Z (padrão de bancada M1)
export const SKF_6204_KINEMATICS: BearingKinematics = {
  model: 'SKF 6204-2Z (Folga C3)',
  ballCount: 8,
  ballDiameterMm: 7.94,
  pitchDiameterMm: 33.5,
  contactAngleDeg: 0,
  bpfo: 104.2, // ~3.57x RPM a 1750 RPM
  bpfi: 149.8, // ~5.14x RPM a 1750 RPM
  bsf: 67.8,   // ~2.32x RPM a 1750 RPM
  ftf: 11.2,   // ~0.38x RPM a 1750 RPM
}

// Catálogo de Ativos da Planta
export const MOCK_PLANT_ASSETS: PlantAsset[] = [
  {
    id: 'MTR-01',
    tag: 'BANCADA-M1-DE',
    name: 'Motor WEG W22 2.2kW (3.0 CV) - Bancada Metrológica M1',
    plant: 'Unidade Industrial Joinville',
    sector: 'Laboratório de Metrologia & Ensaios',
    sensorNodeId: 'NODE-TESTBENCH-01',
    monitoringPoint: 'Mancal Dianteiro DE (Acoplamento)',
    nominalPowerKw: 2.2,
    nominalRpm: 1750,
    isoClass: 'ISO 20816-3 Grupo 2 (Base Rígida)',
    bearing: SKF_6204_KINEMATICS,
    healthScore: 96,
    status: 'healthy',
    operatingState: 'running',
    velocityRms: 0.88,
    temperatureC: 38.4,
    hoursRunningTotal: 1840,
    scenarioId: 'healthy',
  },
  {
    id: 'MTR-02',
    tag: 'BOMBA-CENT-02',
    name: 'Bomba Centrífuga de Alimentação KSB Meganorm 50-200',
    plant: 'Unidade Industrial Joinville',
    sector: 'Utilidades & Tratamento de Água',
    sensorNodeId: 'NODE-PUMP-02',
    monitoringPoint: 'Mancal NDE Traseiro',
    nominalPowerKw: 7.5,
    nominalRpm: 1765,
    isoClass: 'ISO 20816-3 Grupo 2 (Base Rígida)',
    bearing: SKF_6204_KINEMATICS,
    healthScore: 64,
    status: 'warning',
    operatingState: 'running',
    velocityRms: 3.75,
    temperatureC: 56.2,
    hoursRunningTotal: 4120,
    scenarioId: 'imbalance',
  },
  {
    id: 'MTR-03',
    tag: 'COMP-PARAF-01',
    name: 'Compressor Rotativo Parafuso Atlas Copco GA 30',
    plant: 'Unidade Industrial Joinville',
    sector: 'Casa de Compressores',
    sensorNodeId: 'NODE-COMP-01',
    monitoringPoint: 'Mancal Acoplamento Primário',
    nominalPowerKw: 30.0,
    nominalRpm: 2980,
    isoClass: 'ISO 20816-3 Grupo 1 (Base Rígida)',
    bearing: SKF_6204_KINEMATICS,
    healthScore: 28,
    status: 'critical',
    operatingState: 'alarm',
    velocityRms: 6.20,
    temperatureC: 84.5,
    hoursRunningTotal: 7890,
    scenarioId: 'bearing_defect',
  },
  {
    id: 'MTR-04',
    tag: 'EXAUST-CALD-04',
    name: 'Exaustor de Tiragem Induzida de Caldeira Fläkt Woods',
    plant: 'Unidade Industrial Joinville',
    sector: 'Geração de Vapor',
    sensorNodeId: 'NODE-EXH-04',
    monitoringPoint: 'Mancal Bipartido Pillow Block',
    nominalPowerKw: 15.0,
    nominalRpm: 1180,
    isoClass: 'ISO 20816-3 Grupo 2 (Base Flexível)',
    bearing: SKF_6204_KINEMATICS,
    healthScore: 52,
    status: 'warning',
    operatingState: 'running',
    velocityRms: 4.15,
    temperatureC: 63.8,
    hoursRunningTotal: 5340,
    scenarioId: 'misalignment',
  },
]

// Biblioteca de Cenários Preditivos Industriais
export const SCENARIOS_DICTIONARY: Record<ScenarioKey, ScenarioData> = {
  healthy: {
    id: 'healthy',
    label: 'Operação Normal / Saudável',
    tagline: 'Linha de base ideal de fábrica com vibração contida e baixa temperatura.',
    healthScore: 98,
    isoZone: 'A',
    operatingRpm: 1750,
    runningHours: 1840,
    triaxialVelocityRms: {
      radialX: 0.72,
      radialY: 0.65,
      axialZ: 0.45,
      global: 0.88,
    },
    triaxialAccelG: {
      radialX: 0.28,
      radialY: 0.24,
      axialZ: 0.16,
      peakToPeak: 0.95,
      kurtosis: 2.92,
      crestFactor: 3.1,
    },
    temperature: {
      bearingContactC: 38.4,
      ambientC: 24.2,
      deltaTC: 14.2,
      trendRatePerDayC: +0.1,
      warningThresholdC: 70.0,
      criticalThresholdC: 85.0,
    },
    insights: {
      rootCause: 'Ativo Operando em Condições Ideais (ISO 20816-3 Zona A)',
      classification: 'healthy',
      isoZone: 'A',
      isoZoneLabel: 'Zona A - Excelente (Nova ou Recém-revisada)',
      confidencePercent: 99.4,
      mlModel: 'XGBoost Specialist v2',
      urgency: 'Nenhuma',
      summary: 'Os níveis globais de velocidade RMS (0.88 mm/s) e aceleração estão muito abaixo dos limites de advertência. Regime de película hidrodinâmica estável e temperatura compatível com lubrificação padrão.',
      prescriptions: [
        'Manter plano regular de rotinas de engraxamento periódico (próximo em 1.500h).',
        'Nenhuma ação corretiva ou inspeção física requerida no momento.',
      ],
      suggestedWorkOrder: {
        title: 'Inspeção Preventiva Periódica - Bancada M1',
        category: 'Preditiva',
        priority: 'low',
        estimatedHours: 1.0,
      },
    },
    dominantPeaks: [
      { frequencyHz: 29.17, order: '1.0X', amplitudeG: 0.22, label: 'Rotação Fundamental' },
      { frequencyHz: 58.33, order: '2.0X', amplitudeG: 0.08, label: 'Harmônico Residual' },
      { frequencyHz: 100.0, order: 'Rede', amplitudeG: 0.05, label: 'Frequência de Linha (2x 60Hz - Residual)' },
    ],
  },

  imbalance: {
    id: 'imbalance',
    label: 'Desbalanceamento Dinâmico de Rotor',
    tagline: 'Vibração excessiva concentrada na rotação fundamental (1X RPM) com aumento radial.',
    healthScore: 62,
    isoZone: 'C',
    operatingRpm: 1750,
    runningHours: 2150,
    triaxialVelocityRms: {
      radialX: 3.75,
      radialY: 3.42,
      axialZ: 0.95,
      global: 3.82,
    },
    triaxialAccelG: {
      radialX: 1.85,
      radialY: 1.62,
      axialZ: 0.42,
      peakToPeak: 4.82,
      kurtosis: 3.12,
      crestFactor: 3.4,
    },
    temperature: {
      bearingContactC: 54.8,
      ambientC: 24.5,
      deltaTC: 30.3,
      trendRatePerDayC: +1.2,
      warningThresholdC: 70.0,
      criticalThresholdC: 85.0,
    },
    insights: {
      rootCause: 'Desbalanceamento Dinâmico no Rotor (Pico Severo em 1.0X RPM)',
      classification: 'warning',
      isoZone: 'C',
      isoZoneLabel: 'Zona C - Alerta de Manutenção Preventiva',
      confidencePercent: 96.4,
      mlModel: 'XGBoost Specialist v2',
      urgency: 'Em até 14 dias',
      summary: 'Força centrífuga periódica em 29.17 Hz gerando sobrecarga cíclica sobre as pistas dos rolamentos. Harmônicos 2X e 3X baixos, o que descarta desalinhamento como fonte primária.',
      prescriptions: [
        'Inspecionar hélice de ventilação ou rotor para verificar acúmulo de partículas ou oxidação irregular.',
        'Verificar fixação e integridade do parafuso de trava da chaveta no acoplamento.',
        'Agendar balanceamento dinâmico em 1 plano com analisador de vibrações de campo.',
      ],
      suggestedWorkOrder: {
        title: 'Balanceamento Dinâmico em Campo - Motor M1',
        category: 'Mecânica',
        priority: 'medium',
        estimatedHours: 3.5,
      },
    },
    dominantPeaks: [
      { frequencyHz: 29.17, order: '1.0X', amplitudeG: 1.82, label: 'Desbalanceamento (1X RPM dominante)' },
      { frequencyHz: 58.33, order: '2.0X', amplitudeG: 0.18, label: 'Harmônico secundário' },
      { frequencyHz: 87.50, order: '3.0X', amplitudeG: 0.09, label: 'Harmônico terciário' },
    ],
  },

  misalignment: {
    id: 'misalignment',
    label: 'Desalinhamento Angular e Paralelo',
    tagline: 'Forte componente axial Z com harmônicos 1X e 2X proeminentes no acoplamento.',
    healthScore: 54,
    isoZone: 'C',
    operatingRpm: 1750,
    runningHours: 3410,
    triaxialVelocityRms: {
      radialX: 3.10,
      radialY: 2.85,
      axialZ: 3.65, // Elevadíssimo no eixo axial
      global: 4.25,
    },
    triaxialAccelG: {
      radialX: 1.25,
      radialY: 1.12,
      axialZ: 1.95,
      peakToPeak: 5.40,
      kurtosis: 3.35,
      crestFactor: 3.6,
    },
    temperature: {
      bearingContactC: 67.4,
      ambientC: 25.0,
      deltaTC: 42.4,
      trendRatePerDayC: +2.4,
      warningThresholdC: 70.0,
      criticalThresholdC: 85.0,
    },
    insights: {
      rootCause: 'Desalinhamento Mecânico Combinado (Angular + Paralelo)',
      classification: 'warning',
      isoZone: 'C',
      isoZoneLabel: 'Zona C - Restrição Operacional e Alerta',
      confidencePercent: 94.1,
      mlModel: 'XGBoost Specialist v2',
      urgency: 'Em até 7 dias',
      summary: 'Força de flexão axial cíclica em 29.2 Hz e 58.33 Hz sobre o eixo. Atrito elevado no acoplamento flexível refletido no aquecimento anormal de 67.4 °C (próximo ao alarme de 70 °C).',
      prescriptions: [
        'Realizar alinhamento de precisão a laser entre os eixos do motor e da bancada (tolerância < 0.05 mm).',
        'Checar o estado do inserto elástico (aranha de poliuretano/borracha) do acoplamento mecânico.',
        'Verificar folga de pé manco (soft foot) nos parafusos de base antes do reaperto com torquímetro.',
      ],
      suggestedWorkOrder: {
        title: 'Alinhamento a Laser de Eixos & Checagem de Acoplamento',
        category: 'Mecânica',
        priority: 'high',
        estimatedHours: 4.0,
      },
    },
    dominantPeaks: [
      { frequencyHz: 29.17, order: '1.0X', amplitudeG: 1.15, label: 'Componente 1X' },
      { frequencyHz: 58.33, order: '2.0X', amplitudeG: 1.68, label: 'Desalinhamento (2X RPM dominante)' },
      { frequencyHz: 87.50, order: '3.0X', amplitudeG: 0.65, label: 'Harmônico 3X' },
    ],
  },

  bearing_defect: {
    id: 'bearing_defect',
    label: 'Defeito Severo de Rolamento (Pista Externa - BPFO)',
    tagline: 'Impactos impulsivos em alta frequência (104.2 Hz) com elevação térmica crítica.',
    healthScore: 24,
    isoZone: 'D',
    operatingRpm: 1750,
    runningHours: 4890,
    triaxialVelocityRms: {
      radialX: 5.95,
      radialY: 5.20,
      axialZ: 2.10,
      global: 5.95,
    },
    triaxialAccelG: {
      radialX: 3.85,
      radialY: 3.40,
      axialZ: 1.45,
      peakToPeak: 12.8,
      kurtosis: 5.82, // Curtose altíssima por impactos na pista
      crestFactor: 5.9,
    },
    temperature: {
      bearingContactC: 84.1, // Alarme crítico acima de 70°C
      ambientC: 25.5,
      deltaTC: 58.6,
      trendRatePerDayC: +6.5,
      warningThresholdC: 70.0,
      criticalThresholdC: 85.0,
    },
    insights: {
      rootCause: 'Fadiga por Spalling na Pista Externa do Rolamento DE (BPFO)',
      classification: 'danger',
      isoZone: 'D',
      isoZoneLabel: 'Zona D - Perigo / Parada Obrigatória Imediata',
      confidencePercent: 98.7,
      mlModel: 'XGBoost Specialist v2',
      urgency: 'Imediata (< 24h)',
      summary: 'Vibração global de 5.95 mm/s viola severamente o limite da Zona D (4.5 mm/s da ISO 20816-3). Assinatura espectral com múltiplos harmônicos de BPFO (104.2 Hz, 208.4 Hz, 312.6 Hz) e bandas laterais de modulação por rotação.',
      prescriptions: [
        'PARADA OPERACIONAL IMEDIATA: Não operar o ativo para evitar colapso catastrófico e dano ao eixo.',
        'Substituir rolamento dianteiro SKF 6204-2Z e inspecionar concentricidade do alojamento na carcaça.',
        'Coletar amostra de graxa degradada para análise ferrografica / contaminação por partículas.',
      ],
      suggestedWorkOrder: {
        title: 'Troca Emergencial de Rolamento DE - SKF 6204 C3',
        category: 'Mecânica',
        priority: 'urgent',
        estimatedHours: 5.0,
      },
    },
    dominantPeaks: [
      { frequencyHz: 29.17, order: '1.0X', amplitudeG: 0.72, label: 'Rotação' },
      { frequencyHz: 104.2, order: 'BPFO', amplitudeG: 2.85, label: 'Pista Externa (BPFO 1X)' },
      { frequencyHz: 208.4, order: '2xBPFO', amplitudeG: 1.95, label: 'Harmônico BPFO (2X)' },
      { frequencyHz: 312.6, order: '3xBPFO', amplitudeG: 1.15, label: 'Harmônico BPFO (3X)' },
      { frequencyHz: 75.0, order: 'Modulação', amplitudeG: 0.58, label: 'Bandas laterais (BPFO - 1X)' },
    ],
  },

  mechanical_looseness: {
    id: 'mechanical_looseness',
    label: 'Folga Mecânica Estrutural & Base Solta',
    tagline: 'Sub-harmônicos de 0.5X e múltiplos picos de ordens com instabilidade de fixação.',
    healthScore: 42,
    isoZone: 'C',
    operatingRpm: 1750,
    runningHours: 3890,
    triaxialVelocityRms: {
      radialX: 3.95,
      radialY: 3.60,
      axialZ: 1.40,
      global: 3.95,
    },
    triaxialAccelG: {
      radialX: 2.10,
      radialY: 1.85,
      axialZ: 0.85,
      peakToPeak: 6.80,
      kurtosis: 4.15,
      crestFactor: 4.2,
    },
    temperature: {
      bearingContactC: 52.4,
      ambientC: 24.6,
      deltaTC: 27.8,
      trendRatePerDayC: +1.1,
      warningThresholdC: 70.0,
      criticalThresholdC: 85.0,
    },
    insights: {
      rootCause: 'Folga Mecânica Tipo B/C (Parafusos de Base Afrouxados ou Folga no Mancal)',
      classification: 'warning',
      isoZone: 'C',
      isoZoneLabel: 'Zona C - Alerta de Intervenção Mecânica',
      confidencePercent: 95.2,
      mlModel: 'XGBoost Specialist v2',
      urgency: 'Em até 7 dias',
      summary: 'Presença de sub-harmônico truncado em 0.5X RPM (14.58 Hz) associado a uma rica série de múltiplos harmônicos (1X, 2X, 3X, 4X, 5X). Indica resposta não-linear por perda de rigidez estática nos parafusos de ancoragem.',
      prescriptions: [
        'Inspecionar e reapertar os parafusos de ancoragem da bancada com torquímetro calibrado.',
        'Verificar tolerância de folga interna entre a carcaça do mancal e a pista externa do rolamento.',
        'Realizar checagem de pé manco (soft foot) com relógio comparador em cada sapata.',
      ],
      suggestedWorkOrder: {
        title: 'Reaperto de Base e Checagem de Folga no Alojamento do Mancal',
        category: 'Mecânica',
        priority: 'high',
        estimatedHours: 2.5,
      },
    },
    dominantPeaks: [
      { frequencyHz: 14.58, order: '0.5X', amplitudeG: 0.95, label: 'Sub-harmônico de Folga (0.5X)' },
      { frequencyHz: 29.17, order: '1.0X', amplitudeG: 1.45, label: 'Rotação (1X)' },
      { frequencyHz: 58.33, order: '2.0X', amplitudeG: 1.10, label: 'Harmônico 2X' },
      { frequencyHz: 87.50, order: '3.0X', amplitudeG: 0.78, label: 'Harmônico 3X' },
      { frequencyHz: 116.67, order: '4.0X', amplitudeG: 0.55, label: 'Harmônico 4X' },
    ],
  },
}

/**
 * Gerador determinístico de números pseudo-aleatórios (Mulberry32)
 * Garante que SSR (Node.js) e Client Hydration (Browser) gerem os mesmos valores,
 * eliminando erros de React Hydration Mismatch.
 */
function createSeededRandom(seed: number) {
  let s = Math.floor(seed) >>> 0
  return function next(): number {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
  }
  return hash >>> 0
}

/**
 * Gera um espectro FFT sintético realista de 0 a 1000 Hz baseado no cenário selecionado.
 */
export function generateSyntheticFFT(scenarioKey: ScenarioKey): FFTSpectrumPoint[] {
  const scenario = SCENARIOS_DICTIONARY[scenarioKey]
  const rpm = scenario.operatingRpm
  const fRot = rpm / 60 // ~29.17 Hz
  const bpfo = SKF_6204_KINEMATICS.bpfo // 104.2 Hz

  const rng = createSeededRandom(hashString(`fft-${scenarioKey}`))

  const points: FFTSpectrumPoint[] = []
  const stepHz = 2.5 // Resolução de 400 pontos até 1000 Hz
  const maxFreq = 1000

  // Função geradora de picos gaussianos físicos
  const peak = (f: number, center: number, amp: number, width = 4.0): number => {
    return amp * Math.exp(-Math.pow(f - center, 2) / (2 * Math.pow(width, 2)))
  }

  for (let f = 0; f <= maxFreq; f += stepHz) {
    // Ruído de fundo realista (fundo 1/f e ruído branco) com PRNG determinístico
    const baseNoise = 0.03 + 0.015 * rng() + (f < 100 ? (100 - f) * 0.0004 : 0)
    let rx = baseNoise
    let ry = baseNoise * 0.9
    let az = baseNoise * 0.7

    // Injeção de componentes síncronos fundamentais
    // 1X RPM (29.17 Hz)
    const rotAmp = scenario.id === 'imbalance' ? 1.82 : scenario.id === 'misalignment' ? 1.15 : scenario.id === 'mechanical_looseness' ? 1.45 : 0.22
    rx += peak(f, fRot, rotAmp, 3.5)
    ry += peak(f, fRot, rotAmp * 0.9, 3.5)
    az += peak(f, fRot, scenario.id === 'misalignment' ? 1.45 : rotAmp * 0.3, 3.5)

    // 2X RPM (58.33 Hz)
    const twoXAmp = scenario.id === 'misalignment' ? 1.68 : scenario.id === 'imbalance' ? 0.25 : scenario.id === 'mechanical_looseness' ? 1.10 : 0.08
    rx += peak(f, 2 * fRot, twoXAmp, 3.5)
    ry += peak(f, 2 * fRot, twoXAmp * 0.85, 3.5)
    az += peak(f, 2 * fRot, scenario.id === 'misalignment' ? 1.95 : twoXAmp * 0.4, 3.5)

    // 3X RPM (87.50 Hz)
    const threeXAmp = scenario.id === 'misalignment' ? 0.65 : scenario.id === 'mechanical_looseness' ? 0.78 : 0.05
    rx += peak(f, 3 * fRot, threeXAmp, 3.5)
    az += peak(f, 3 * fRot, threeXAmp * 0.9, 3.5)

    // Frequência de Linha Elétrica (120 Hz e 60 Hz)
    rx += peak(f, 60.0, 0.06, 2.0)
    rx += peak(f, 120.0, 0.08, 2.0)

    // Injeção de Falha de Rolamento (BPFO)
    if (scenario.id === 'bearing_defect') {
      // BPFO fundamental (104.2 Hz)
      rx += peak(f, bpfo, 2.85, 4.0)
      ry += peak(f, bpfo, 2.50, 4.0)
      az += peak(f, bpfo, 0.85, 4.0)

      // 2x BPFO (208.4 Hz)
      rx += peak(f, 2 * bpfo, 1.95, 4.0)
      ry += peak(f, 2 * bpfo, 1.65, 4.0)

      // 3x BPFO (312.6 Hz)
      rx += peak(f, 3 * bpfo, 1.15, 4.5)

      // 4x BPFO (416.8 Hz)
      rx += peak(f, 4 * bpfo, 0.72, 5.0)

      // Bandas laterais de modulação por rotação (BPFO ± 1X, BPFO ± 2X)
      rx += peak(f, bpfo - fRot, 0.62, 3.0)
      rx += peak(f, bpfo + fRot, 0.65, 3.0)
      rx += peak(f, 2 * bpfo - fRot, 0.45, 3.0)
      rx += peak(f, 2 * bpfo + fRot, 0.48, 3.0)
    }

    // Injeção de Folga Mecânica (sub-harmônico e múltiplos)
    if (scenario.id === 'mechanical_looseness') {
      // 0.5X (14.58 Hz)
      rx += peak(f, 0.5 * fRot, 0.95, 2.5)
      ry += peak(f, 0.5 * fRot, 0.80, 2.5)

      // 4X (116.67 Hz)
      rx += peak(f, 4 * fRot, 0.55, 3.0)

      // 5X (145.83 Hz)
      rx += peak(f, 5 * fRot, 0.42, 3.0)
    }

    points.push({
      frequency: Number(f.toFixed(1)),
      radialX: Number(rx.toFixed(3)),
      radialY: Number(ry.toFixed(3)),
      axialZ: Number(az.toFixed(3)),
    })
  }

  return points
}

/**
 * Gera série temporal dos últimos 30 dias para análise de tendência histórica e horímetro.
 */
export interface TrendPoint {
  dayIndex: number
  date: string
  velocityRms: number
  bearingTempC: number
  ambientTempC: number
  runningHours: number
  stoppedHours: number
  anomalyScore: number
}

export function generate30DaysTrend(scenarioKey: ScenarioKey): TrendPoint[] {
  const scenario = SCENARIOS_DICTIONARY[scenarioKey]
  const list: TrendPoint[] = []

  const baseVel = scenario.triaxialVelocityRms.global
  const baseTemp = scenario.temperature.bearingContactC

  const rng = createSeededRandom(hashString(`trend-${scenarioKey}`))

  // Data âncora fixa baseada no dia corrente (normalizada em UTC para consistência SSR vs Cliente)
  const now = new Date()
  const baseTimestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseTimestamp - i * 86400000)

    // Simula degradação progressiva se o ativo estiver em falha
    const dayFactor = (30 - i) / 30
    let vRms = baseVel
    let bTemp = baseTemp

    const r1 = rng() - 0.5
    const r2 = rng() - 0.5
    const r3 = rng() - 0.5
    const r4 = rng() - 0.5

    if (scenario.id !== 'healthy') {
      // No passado estava mais perto do saudável
      vRms = 1.0 + (baseVel - 1.0) * Math.pow(dayFactor, 1.5) + r1 * 0.15
      bTemp = 40.0 + (baseTemp - 40.0) * Math.pow(dayFactor, 1.3) + r2 * 1.0
    } else {
      vRms = baseVel + r1 * 0.08
      bTemp = baseTemp + r2 * 1.2
    }

    // Horímetro típico industrial (20h rodando, 4h parado para limpeza)
    const runH = Math.min(24, Math.max(0, 19.5 + r3 * 3))
    const stopH = Number((24 - runH).toFixed(1))

    const dayStr = String(d.getUTCDate()).padStart(2, '0')
    const monthStr = String(d.getUTCMonth() + 1).padStart(2, '0')

    list.push({
      dayIndex: 30 - i,
      date: `${dayStr}/${monthStr}`,
      velocityRms: Number(Math.max(0.4, vRms).toFixed(2)),
      bearingTempC: Number(bTemp.toFixed(1)),
      ambientTempC: Number((23 + r4 * 2).toFixed(1)),
      runningHours: Number(runH.toFixed(1)),
      stoppedHours: stopH,
      anomalyScore: Number(Math.min(100, Math.max(0, (100 - scenario.healthScore) * dayFactor)).toFixed(0)),
    })
  }

  return list
}

/**
 * Gera forma de onda temporal (Time Waveform) de aceleração de 0 a 120 ms
 * evidenciando impactos periódicos e batimentos de forma sinusoidal pura ou distorcida.
 */
export function generateTimeWaveform(scenarioKey: ScenarioKey): TimeWaveformPoint[] {
  const scenario = SCENARIOS_DICTIONARY[scenarioKey]
  const fRot = scenario.operatingRpm / 60 // ~29.17 Hz
  const bpfo = SKF_6204_KINEMATICS.bpfo // 104.2 Hz

  const rng = createSeededRandom(hashString(`waveform-${scenarioKey}`))

  const points: TimeWaveformPoint[] = []
  const durationMs = 120 // ~3.5 voltas completas do eixo
  const stepMs = 0.5 // 240 pontos

  for (let t = 0; t <= durationMs; t += stepMs) {
    const tSec = t / 1000
    const noise = (rng() - 0.5) * 0.08

    let rx = 0
    let ry = 0
    let az = 0

    if (scenarioKey === 'healthy') {
      rx = 0.35 * Math.sin(2 * Math.PI * fRot * tSec) + noise
      ry = 0.30 * Math.cos(2 * Math.PI * fRot * tSec) + noise
      az = 0.18 * Math.sin(2 * Math.PI * fRot * tSec) + noise
    } else if (scenarioKey === 'imbalance') {
      // Onda senoidal pura de alta amplitude em 1X RPM
      rx = 2.45 * Math.sin(2 * Math.PI * fRot * tSec) + noise
      ry = 2.20 * Math.cos(2 * Math.PI * fRot * tSec) + noise
      az = 0.45 * Math.sin(2 * Math.PI * fRot * tSec) + noise
    } else if (scenarioKey === 'misalignment') {
      // Superposição de 1X e 2X RPM gerando duplo lóbulo
      rx = 1.45 * Math.sin(2 * Math.PI * fRot * tSec) + 1.85 * Math.sin(4 * Math.PI * fRot * tSec) + noise
      ry = 1.30 * Math.cos(2 * Math.PI * fRot * tSec) + 1.55 * Math.cos(4 * Math.PI * fRot * tSec) + noise
      az = 2.40 * Math.sin(4 * Math.PI * fRot * tSec) + noise
    } else if (scenarioKey === 'bearing_defect') {
      // Impactos periódicos agudos da passagem de esferas na pista externa (BPFO = 104.2 Hz => período = 9.6 ms)
      const bpfoPeriodSec = 1 / bpfo
      const impactPhase = (tSec % bpfoPeriodSec) / bpfoPeriodSec
      const impactDecay = Math.exp(-impactPhase * 18) * Math.sin(2 * Math.PI * 850 * tSec) // ressonância mecânica
      const impactAmp = 4.8 * impactDecay

      rx = 0.85 * Math.sin(2 * Math.PI * fRot * tSec) + impactAmp + noise * 1.5
      ry = 0.75 * Math.cos(2 * Math.PI * fRot * tSec) + impactAmp * 0.85 + noise * 1.5
      az = 0.35 * Math.sin(2 * Math.PI * fRot * tSec) + impactAmp * 0.4
    } else if (scenarioKey === 'mechanical_looseness') {
      // Forma de onda distorcida e truncada
      const halfX = 1.25 * Math.sin(Math.PI * fRot * tSec)
      const oneX = 1.85 * Math.sin(2 * Math.PI * fRot * tSec)
      const raw = halfX + oneX
      rx = (raw > 0 ? raw * 1.2 : raw * 0.6) + noise
      ry = 0.85 * rx
      az = 0.65 * Math.sin(2 * Math.PI * fRot * tSec)
    }

    points.push({
      timeMs: Number(t.toFixed(1)),
      radialX: Number(rx.toFixed(3)),
      radialY: Number(ry.toFixed(3)),
      axialZ: Number(az.toFixed(3)),
    })
  }

  return points
}
