import type { FFTPeak, FFTSpectrumPoint } from '@/features/iot/data/tractian-mock-data'

export interface IoTNodeOption {
  id: string
  node_id: string
  name: string
  status?: string
  machine?: {
    id: string
    name: string
    code?: string
  } | null
}

export interface BearingKinematicsPayload {
  bearing_name: string
  rpm: number
  shaft_frequency_hz: number
  bpfo_hz: number
  bpfi_hz: number
  bsf_hz: number
  ftf_hz: number
  orders?: {
    bpfo: number
    bpfi: number
    bsf: number
    ftf: number
  }
  harmonics?: {
    bpfo?: number[]
    bpfi?: number[]
    '1x_shaft'?: number[]
    bpfi_sidebands?: number[]
  }
}

export interface MatchedSpectralPeak {
  frequency_hz: number
  amplitude: number
  fault_match: string
  expected_hz: number
  deviation_percent: number
}

export interface NodeSpectrumApiResponse {
  node_id: string
  machine_id: string
  has_cached_spectrum: boolean
  rpm_source: string | null
  spectrum: {
    fft_x?: number[]
    fft_y?: number[]
    fft_z?: number[]
    sample_rate?: number
    rpm?: number | null
    rpm_source?: string | null
    timestamp?: string | null
    peaks?: Array<{ frequency_hz: number; amplitude: number }>
  } | null
  bearing_kinematics: BearingKinematicsPayload | null
  matched_peaks?: MatchedSpectralPeak[]
  available_presets?: string[]
}

export interface SpectrumPointBuildResult {
  points: FFTSpectrumPoint[]
  dominantPeaks: FFTPeak[]
}

export function buildSpectrumSeriesFromApi(response: NodeSpectrumApiResponse): SpectrumPointBuildResult {
  const fftX = Array.isArray(response.spectrum?.fft_x) ? response.spectrum!.fft_x! : []
  const fftY = Array.isArray(response.spectrum?.fft_y) ? response.spectrum!.fft_y! : []
  const fftZ = Array.isArray(response.spectrum?.fft_z) ? response.spectrum!.fft_z! : []
  const sampleRate = Number(response.spectrum?.sample_rate ?? 3200)
  const binCount = Math.max(fftX.length, fftY.length, fftZ.length)

  const points: FFTSpectrumPoint[] = []
  if (binCount >= 2 && sampleRate > 0) {
    const nyquistBins = binCount % 2 === 1 ? binCount - 1 : binCount
    const df = sampleRate / 2 / nyquistBins

    for (let i = 0; i < binCount; i++) {
      points.push({
        frequency: Number((i * df).toFixed(2)),
        radialX: Number(fftX[i] ?? 0),
        radialY: Number(fftY[i] ?? 0),
        axialZ: Number(fftZ[i] ?? 0),
      })
    }
  }

  const matched = Array.isArray(response.matched_peaks) ? response.matched_peaks : []
  const rawPeaks = Array.isArray(response.spectrum?.peaks) ? response.spectrum!.peaks! : []
  const shaftHz = Number(response.bearing_kinematics?.shaft_frequency_hz ?? 0)

  const dominantPeaks: FFTPeak[] = matched.length > 0
    ? matched.map((m) => ({
        frequencyHz: Number(m.frequency_hz),
        amplitudeG: Number(m.amplitude),
        label: `Indicação: ${m.fault_match} (esp. ${m.expected_hz} Hz)`,
        order: shaftHz > 0 ? `${(m.frequency_hz / shaftHz).toFixed(2)}X` : m.fault_match,
      }))
    : rawPeaks.slice(0, 6).map((p) => ({
        frequencyHz: Number(p.frequency_hz),
        amplitudeG: Number(p.amplitude),
        label: `Pico ${Number(p.frequency_hz).toFixed(1)} Hz`,
        order: shaftHz > 0 ? `${(p.frequency_hz / shaftHz).toFixed(2)}X` : 'PEAK',
      }))

  return { points, dominantPeaks }
}
