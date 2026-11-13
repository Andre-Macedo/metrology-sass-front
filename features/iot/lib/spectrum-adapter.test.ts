import { describe, expect, it } from 'vitest'
import { buildSpectrumSeriesFromApi, type NodeSpectrumApiResponse } from './spectrum-adapter'

describe('buildSpectrumSeriesFromApi', () => {
  it('maps real FFT bins and bearing kinematic match indications from API response', () => {
    const mockResponse: NodeSpectrumApiResponse = {
      node_id: 'NODE_01',
      machine_id: 'M1',
      has_cached_spectrum: true,
      rpm_source: 'accelerometer_fft',
      spectrum: {
        sample_rate: 800,
        fft_x: [0.01, 0.02, 0.9, 0.04, 0.03],
        fft_y: [0.01, 0.01, 0.5, 0.02, 0.01],
        peaks: [{ frequency_hz: 200, amplitude: 0.9 }],
      },
      bearing_kinematics: {
        bearing_name: 'NSK 6203 ZZ Custom',
        rpm: 1800,
        shaft_frequency_hz: 30,
        bpfo_hz: 91.56,
        bpfi_hz: 148.44,
        bsf_hz: 60.12,
        ftf_hz: 11.45,
        harmonics: {
          bpfi_sidebands: [118.44, 178.44],
        },
      },
      matched_peaks: [
        {
          frequency_hz: 91.6,
          amplitude: 0.45,
          fault_match: 'BPFO',
          expected_hz: 91.56,
          deviation_percent: 0.04,
        },
      ],
    }

    const result = buildSpectrumSeriesFromApi(mockResponse)

    expect(result.points).toHaveLength(5)
    expect(result.points[0].frequency).toBe(0)
    expect(result.points[2].frequency).toBe(200)
    expect(result.points[2].radialX).toBe(0.9)
    expect(result.dominantPeaks).toHaveLength(1)
    expect(result.dominantPeaks[0].label).toContain('Indicação: BPFO')
  })
})
