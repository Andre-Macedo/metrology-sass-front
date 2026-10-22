import { describe, it, expect } from 'vitest'
import {
  MOCK_PLANT_ASSETS,
  SCENARIOS_DICTIONARY,
  SKF_6204_KINEMATICS,
  generateSyntheticFFT,
  generate30DaysTrend,
} from './tractian-mock-data'

describe('Tractian Vibration Physics & Mock Engine', () => {
  it('should have complete metadata for all plant assets', () => {
    expect(MOCK_PLANT_ASSETS.length).toBeGreaterThanOrEqual(4)
    for (const asset of MOCK_PLANT_ASSETS) {
      expect(asset.id).toBeDefined()
      expect(asset.tag).toBeDefined()
      expect(asset.name).toBeDefined()
      expect(asset.nominalRpm).toBeGreaterThan(0)
      expect(asset.healthScore).toBeGreaterThanOrEqual(0)
      expect(asset.healthScore).toBeLessThanOrEqual(100)
    }
  })

  it('should accurately calculate bearing kinematics for SKF 6204', () => {
    expect(SKF_6204_KINEMATICS.ballCount).toBe(8)
    expect(SKF_6204_KINEMATICS.bpfo).toBeCloseTo(104.2, 1)
    expect(SKF_6204_KINEMATICS.bpfi).toBeCloseTo(149.8, 1)
  })

  it('should generate calibrated FFT spectrum points with physical peaks without microphone', () => {
    const healthyFFT = generateSyntheticFFT('healthy')
    expect(healthyFFT.length).toBeGreaterThan(100)
    expect(healthyFFT[0].frequency).toBe(0)

    // Check dominant 1X peak at ~29.2 Hz for imbalance scenario
    const imbalanceFFT = generateSyntheticFFT('imbalance')
    const oneXPoint = imbalanceFFT.find((p) => Math.abs(p.frequency - 29.17) < 2)
    expect(oneXPoint).toBeDefined()
    expect(oneXPoint?.radialX).toBeGreaterThan(1.0) // Strong 1X peak in imbalance

    // Check bearing defect scenario BPFO peak (~104.2 Hz)
    const bearingDefectFFT = generateSyntheticFFT('bearing_defect')
    const bpfoPoint = bearingDefectFFT.find((p) => Math.abs(p.frequency - 104.2) < 2)
    expect(bpfoPoint).toBeDefined()
    expect(bpfoPoint?.radialX).toBeGreaterThan(2.0) // Prominent BPFO peak

    // Check mechanical looseness 0.5X sub-harmonic peak (~14.58 Hz)
    const loosenessFFT = generateSyntheticFFT('mechanical_looseness')
    const halfXPoint = loosenessFFT.find((p) => Math.abs(p.frequency - 14.58) < 2)
    expect(halfXPoint).toBeDefined()
    expect(halfXPoint?.radialX).toBeGreaterThan(0.5)
  })

  it('should generate 30 days of consistent historical and operational trend data', () => {
    const trend = generate30DaysTrend('healthy')
    expect(trend).toHaveLength(30)
    for (const day of trend) {
      expect(day.date).toBeDefined()
      expect(day.velocityRms).toBeGreaterThan(0)
      expect(day.bearingTempC).toBeGreaterThan(20)
      expect(day.runningHours + day.stoppedHours).toBeCloseTo(24, 1)
    }
  })
})
