'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { 
  ScenarioData, 
  generateSyntheticFFT, 
  generateTimeWaveform, 
  SKF_6204_KINEMATICS,
  FFTPeak 
} from '@/features/iot/data/tractian-mock-data'
import { 
  BarChart2, 
  Crosshair, 
  Magnet, 
  Maximize2, 
  MoveHorizontal, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  Tag, 
  Target, 
  Waves,
  Zap
} from 'lucide-react'

interface SpectrumStudioProps {
  scenario: ScenarioData
}

type CursorToolMode = 'harmonics' | 'sidebands' | 'single'

export function SpectrumStudio({ scenario }: SpectrumStudioProps) {
  // Modo de Domínio: Espectro FFT ou Forma de Onda no Tempo
  const [domainMode, setDomainMode] = useState<'fft' | 'time_waveform'>('fft')

  // Ferramenta de Cursor Ativa (Harmônicos, Bandas Laterais ou Cursor Único)
  const [cursorTool, setCursorTool] = useState<CursorToolMode>('harmonics')

  // Faixa de zoom da FFT (200 Hz, 500 Hz ou 1000 Hz)
  const [zoomRange, setZoomRange] = useState<number>(1000)

  // Configuração dos canais visíveis (triaxial ortogonal)
  const [showRadialX, setShowRadialX] = useState(true)
  const [showRadialY, setShowRadialY] = useState(true)
  const [showAxialZ, setShowAxialZ] = useState(false)

  // Modos de sobreposição adicionais
  const [showBearingFrequencies, setShowBearingFrequencies] = useState(
    scenario.id === 'bearing_defect'
  )
  const [amplitudeUnit, setAmplitudeUnit] = useState<'accel_g' | 'velocity_mms'>('accel_g')

  // Frequência Fundamental 1X (Arrastável / Interativa)
  const nominal1X = useMemo(() => {
    return Number((scenario.operatingRpm / 60).toFixed(2)) // ~29.17 Hz
  }, [scenario.operatingRpm])

  const [fundamentalFreq, setFundamentalFreq] = useState<number>(nominal1X)
  const [harmonicCount, setHarmonicCount] = useState<number>(6) // Quantidade de linhas harmônicas
  const [isDraggingFundamental, setIsDraggingFundamental] = useState<boolean>(false)
  const [magneticSnap, setMagneticSnap] = useState<boolean>(true)

  // Ferramenta de Bandas Laterais (fc ± n*Δf)
  const [sidebandCenter, setSidebandCenter] = useState<number>(SKF_6204_KINEMATICS.bpfo) // 104.2 Hz
  const [sidebandDelta, setSidebandDelta] = useState<number>(nominal1X) // 29.17 Hz
  const [isDraggingSideband, setIsDraggingSideband] = useState<boolean>(false)

  // Cursor Interativo de Pico Selecionado
  const [pinnedPeak, setPinnedPeak] = useState<FFTPeak | null>(null)

  // Referência do container do gráfico para cálculo de coordenadas do mouse
  const chartWrapperRef = useRef<HTMLDivElement>(null)

  // Quando o cenário ou a rotação mudar, reseta a fundamental para o novo nominal
  useEffect(() => {
    setFundamentalFreq(nominal1X)
    setSidebandDelta(nominal1X)
  }, [nominal1X])

  // Frequências de Falha do Rolamento
  const bpfo = SKF_6204_KINEMATICS.bpfo // 104.2 Hz
  const bpfi = SKF_6204_KINEMATICS.bpfi // 149.8 Hz

  // Gera os 400 pontos de espectro sintético físico
  const rawSpectrumData = useMemo(() => {
    return generateSyntheticFFT(scenario.id)
  }, [scenario.id])

  // Filtra dados para a faixa de zoom selecionada
  const zoomedSpectrumData = useMemo(() => {
    return rawSpectrumData.filter((pt) => pt.frequency <= zoomRange)
  }, [rawSpectrumData, zoomRange])

  // Converte aceleração g para velocidade mm/s se o usuário alternar unidade
  const spectrumData = useMemo(() => {
    if (amplitudeUnit === 'accel_g') return zoomedSpectrumData

    return zoomedSpectrumData.map((pt) => {
      const f = pt.frequency || 1
      const factor = 9806.65 / (2 * Math.PI * f * 1000)
      return {
        ...pt,
        radialX: Number(Math.min(pt.radialX * factor, 15).toFixed(3)),
        radialY: Number(Math.min(pt.radialY * factor, 15).toFixed(3)),
        axialZ: Number(Math.min(pt.axialZ * factor, 15).toFixed(3)),
      }
    })
  }, [zoomedSpectrumData, amplitudeUnit])

  // Gera a forma de onda no tempo (0 a 120 ms)
  const timeWaveformData = useMemo(() => {
    return generateTimeWaveform(scenario.id)
  }, [scenario.id])

  /**
   * Converte uma coordenada X em pixels para frequência (Hz) no gráfico
   */
  const convertClientXToFreq = useCallback((clientX: number): number => {
    if (!chartWrapperRef.current) return fundamentalFreq

    const rect = chartWrapperRef.current.getBoundingClientRect()
    // Margens internas do gráfico Recharts: left 45px, right 25px
    const chartLeft = rect.left + 45
    const chartRight = rect.right - 25
    const chartWidth = chartRight - chartLeft

    if (chartWidth <= 0) return fundamentalFreq

    const relativeX = clientX - chartLeft
    const fraction = Math.max(0, Math.min(1, relativeX / chartWidth))
    let calculatedFreq = fraction * zoomRange

    // Snap Magnético: se estiver perto de um pico físico (limiar de 3.5 Hz), gruda nele!
    if (magneticSnap) {
      const snapThreshold = Math.max(2.5, zoomRange * 0.015)
      for (const p of scenario.dominantPeaks) {
        if (Math.abs(calculatedFreq - p.frequencyHz) <= snapThreshold) {
          return Number(p.frequencyHz.toFixed(2))
        }
      }

      // Procura picos locais nos dados brutos
      for (const pt of rawSpectrumData) {
        if (pt.radialX > 0.4 && Math.abs(calculatedFreq - pt.frequency) <= snapThreshold) {
          return Number(pt.frequency.toFixed(2))
        }
      }
    }

    return Number(calculatedFreq.toFixed(1))
  }, [zoomRange, magneticSnap, fundamentalFreq, scenario.dominantPeaks, rawSpectrumData])

  /**
   * Manipulador de arraste do cursor de fundamental 1X
   */
  const handlePointerDownFundamental = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDraggingFundamental(true)
  }

  const handlePointerMoveFundamental = (e: React.PointerEvent) => {
    if (!isDraggingFundamental) return
    const newFreq = convertClientXToFreq(e.clientX)
    if (newFreq > 2) {
      setFundamentalFreq(newFreq)
    }
  }

  const handlePointerUpFundamental = (e: React.PointerEvent) => {
    if (isDraggingFundamental) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      setIsDraggingFundamental(false)
    }
  }

  /**
   * Manipulador de arraste da distância delta de bandas laterais
   */
  const handlePointerDownSideband = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDraggingSideband(true)
  }

  const handlePointerMoveSideband = (e: React.PointerEvent) => {
    if (!isDraggingSideband) return
    const targetFreq = convertClientXToFreq(e.clientX)
    const newDelta = Math.abs(targetFreq - sidebandCenter)
    if (newDelta > 5) {
      setSidebandDelta(Number(newDelta.toFixed(1)))
    }
  }

  const handlePointerUpSideband = (e: React.PointerEvent) => {
    if (isDraggingSideband) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      setIsDraggingSideband(false)
    }
  }

  /**
   * Clique direto no canvas do gráfico para reposicionar o cursor onde o usuário clicou
   */
  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Apenas se não estiver no meio de um arraste
    if (isDraggingFundamental || isDraggingSideband) return
    const clickedFreq = convertClientXToFreq(e.clientX)
    if (clickedFreq > 2) {
      if (cursorTool === 'harmonics') {
        setFundamentalFreq(clickedFreq)
      } else if (cursorTool === 'sidebands') {
        setSidebandCenter(clickedFreq)
      }
    }
  }

  /**
   * Snap automático no pico de maior aceleração do espectro
   */
  const handleSnapHighestPeak = () => {
    let highestFreq = nominal1X
    let maxAmp = 0

    for (const pt of rawSpectrumData) {
      if (pt.frequency > 5 && pt.radialX > maxAmp) {
        maxAmp = pt.radialX
        highestFreq = pt.frequency
      }
    }

    setFundamentalFreq(Number(highestFreq.toFixed(2)))
  }

  // Lista dos harmônicos calculados em tempo real (1X, 2X, 3X, ...)
  const activeHarmonics = useMemo(() => {
    const list = []
    for (let k = 1; k <= harmonicCount; k++) {
      const f = Number((k * fundamentalFreq).toFixed(1))
      if (f <= zoomRange) {
        list.push({ order: k, frequency: f })
      }
    }
    return list
  }, [fundamentalFreq, harmonicCount, zoomRange])

  // Posição percentual do cursor 1X na largura do gráfico (para posicionamento do peg/handle de arraste)
  const fundamentalPct = Math.min(Math.max((fundamentalFreq / zoomRange) * 100, 0), 100)
  const sidebandHandlePct = Math.min(Math.max(((sidebandCenter + sidebandDelta) / zoomRange) * 100, 0), 100)

  return (
    <Card className="border-border/80 shadow-sm select-none">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">
                Spectrum Studio & Pente Harmônico Interativo
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                {domainMode === 'fft' ? `0 a ${zoomRange} Hz` : '0 a 120 ms'}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Pente de harmônicos e bandas laterais arrastável com snap magnético idêntico à plataforma Tractian
            </CardDescription>
          </div>

          {/* Alternância de Modo (FFT vs Forma de Onda) e Unidade */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Toggle FFT / Tempo */}
            <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDomainMode('fft')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-colors ${
                  domainMode === 'fft'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5 text-primary" />
                <span>Espectro FFT</span>
              </button>
              
              <button
                type="button"
                onClick={() => setDomainMode('time_waveform')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-colors ${
                  domainMode === 'time_waveform'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Waves className="h-3.5 w-3.5 text-cyan-500" />
                <span>Forma de Onda (Tempo)</span>
              </button>
            </div>

            {/* Alternância g vs mm/s (apenas no modo FFT) */}
            {domainMode === 'fft' && (
              <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAmplitudeUnit('accel_g')}
                  className={`rounded px-2 py-1 font-medium transition-colors ${
                    amplitudeUnit === 'accel_g'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Acel (g)
                </button>
                <button
                  type="button"
                  onClick={() => setAmplitudeUnit('velocity_mms')}
                  className={`rounded px-2 py-1 font-medium transition-colors ${
                    amplitudeUnit === 'velocity_mms'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Vel (mm/s)
                </button>
              </div>
            )}

          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* Barra de Ferramentas do Analista (Estilo Tractian Studio) */}
        {domainMode === 'fft' && (
          <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/30 p-3 text-xs shadow-xs">
            
            {/* Linha 1: Seletores de Ferramentas de Cursor e Controles Físicos */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Modos do Cursor (Harmônicos, Bandas Laterais ou Pico Único) */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider mr-1">
                  Ferramenta:
                </span>
                
                <Button
                  size="sm"
                  variant={cursorTool === 'harmonics' ? 'default' : 'outline'}
                  onClick={() => setCursorTool('harmonics')}
                  className="h-7 text-xs gap-1.5 font-semibold"
                >
                  <Tag className="h-3 w-3" />
                  <span>Pente Harmônico (1X-{harmonicCount}X)</span>
                </Button>

                <Button
                  size="sm"
                  variant={cursorTool === 'sidebands' ? 'default' : 'outline'}
                  onClick={() => setCursorTool('sidebands')}
                  className="h-7 text-xs gap-1.5 font-semibold"
                >
                  <Target className="h-3 w-3" />
                  <span>Bandas Laterais (fc ± nΔf)</span>
                </Button>

                <Button
                  size="sm"
                  variant={cursorTool === 'single' ? 'default' : 'outline'}
                  onClick={() => setCursorTool('single')}
                  className="h-7 text-xs gap-1.5"
                >
                  <Crosshair className="h-3 w-3" />
                  <span>Cursor Livre</span>
                </Button>
              </div>

              {/* Botões de Ação de Engenharia e Snap Magnético */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMagneticSnap(!magneticSnap)}
                  className={`h-7 text-xs gap-1.5 font-medium ${
                    magneticSnap ? 'border-primary text-primary bg-primary/5' : 'text-muted-foreground'
                  }`}
                  title="Snap magnético atrai o cursor automaticamente para o pico físico mais próximo ao arrastar"
                >
                  <Magnet className="h-3.5 w-3.5" />
                  <span>Snap Magnético: {magneticSnap ? 'ON' : 'OFF'}</span>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSnapHighestPeak}
                  className="h-7 text-xs gap-1 font-semibold"
                  title="Encontra o pico de maior energia e ancora o pente harmônico nele instantaneamente"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Snap no Pico Máximo</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFundamentalFreq(nominal1X)}
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  title="Restaura a frequência nominal exata da rotação da máquina (1750 RPM => 29.17 Hz)"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Auto 1X RPM</span>
                </Button>
              </div>

            </div>

            {/* Linha 2: Ajuste Fino de Frequência, Rotação Estimada e Quantidade de Harmônicos */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-2 text-xs">
              
              {/* Leitura e Ajuste Fino da Frequência Fundamental */}
              {cursorTool === 'harmonics' ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-background rounded-md border border-border px-2 py-1 shadow-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">Fundamental 1X:</span>
                    <span className="font-mono text-sm font-bold text-amber-500">
                      {fundamentalFreq.toFixed(2)} Hz
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      ({Math.round(fundamentalFreq * 60)} RPM)
                    </span>
                  </div>

                  {/* Micro-ajustes de 0.1 Hz */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFundamentalFreq((prev) => Math.max(2, Number((prev - 0.1).toFixed(2))))}
                      className="h-6 w-7 p-0 font-mono text-xs"
                      title="Diminuir 0.1 Hz"
                    >
                      -
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFundamentalFreq((prev) => Number((prev + 0.1).toFixed(2)))}
                      className="h-6 w-7 p-0 font-mono text-xs"
                      title="Aumentar 0.1 Hz"
                    >
                      +
                    </Button>
                  </div>

                  {/* Seletor de quantidade de harmônicos */}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground pl-2 border-l border-border/60">
                    <span>Harmônicos:</span>
                    {[3, 5, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHarmonicCount(num)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          harmonicCount === num
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        {num}X
                      </button>
                    ))}
                  </div>
                </div>
              ) : cursorTool === 'sidebands' ? (
                /* Leitura e Ajuste de Bandas Laterais */
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-background rounded-md border border-border px-2 py-1 shadow-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">Centro (fc):</span>
                    <span className="font-mono text-sm font-bold text-rose-500">
                      {sidebandCenter.toFixed(1)} Hz
                    </span>
                    <span className="text-muted-foreground text-[11px] font-medium ml-2">Espaçamento (Δf):</span>
                    <span className="font-mono text-sm font-bold text-amber-500">
                      {sidebandDelta.toFixed(1)} Hz
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      ({(sidebandDelta / nominal1X).toFixed(2)}X RPM)
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSidebandCenter(bpfo)
                      setSidebandDelta(nominal1X)
                    }}
                    className="h-6 text-[10px]"
                  >
                    Alinhar BPFO ± 1X
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">
                  Clique em qualquer local do gráfico para posicionar o cursor de precisão.
                </div>
              )}

              {/* Dica de usabilidade interativa */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <MoveHorizontal className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>
                  {cursorTool === 'harmonics' 
                    ? 'Arraste a etiqueta amarela < 1X > no gráfico para mover todos os harmônicos'
                    : cursorTool === 'sidebands'
                      ? 'Arraste o peg < Δf > para abrir ou fechar o espaçamento das bandas'
                      : 'Clique em qualquer ponto para ler amplitude e frequência'}
                </span>
              </div>

            </div>

          </div>
        )}

        {/* Barra de Filtros de Eixos & Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3.5 py-2 text-xs">
          
          {/* Seletores de Traços de Eixos */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
              Canais:
            </span>

            {/* Radial X */}
            <label className="flex cursor-pointer items-center gap-1.5 font-medium text-foreground hover:opacity-80">
              <input
                type="checkbox"
                checked={showRadialX}
                onChange={(e) => setShowRadialX(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <span>Radial X (Horiz)</span>
            </label>

            {/* Radial Y */}
            <label className="flex cursor-pointer items-center gap-1.5 font-medium text-foreground hover:opacity-80">
              <input
                type="checkbox"
                checked={showRadialY}
                onChange={(e) => setShowRadialY(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Radial Y (Vert)</span>
            </label>

            {/* Axial Z */}
            <label className="flex cursor-pointer items-center gap-1.5 font-medium text-foreground hover:opacity-80">
              <input
                type="checkbox"
                checked={showAxialZ}
                onChange={(e) => setShowAxialZ(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Axial Z</span>
            </label>
          </div>

          {/* Zoom e Cinemática de Rolamento */}
          {domainMode === 'fft' ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Zoom:</span>
                <Button
                  size="sm"
                  variant={zoomRange === 200 ? 'default' : 'outline'}
                  onClick={() => setZoomRange(200)}
                  className="h-6 px-2 text-[10px]"
                >
                  200 Hz
                </Button>
                <Button
                  size="sm"
                  variant={zoomRange === 500 ? 'default' : 'outline'}
                  onClick={() => setZoomRange(500)}
                  className="h-6 px-2 text-[10px]"
                >
                  500 Hz
                </Button>
                <Button
                  size="sm"
                  variant={zoomRange === 1000 ? 'default' : 'outline'}
                  onClick={() => setZoomRange(1000)}
                  className="h-6 px-2 text-[10px]"
                >
                  1.000 Hz
                </Button>
              </div>

              <div className="flex items-center gap-2 border-l border-border/60 pl-3">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
                  <Switch
                    checked={showBearingFrequencies}
                    onCheckedChange={setShowBearingFrequencies}
                    className="scale-75"
                  />
                  <span className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-[11px]">
                    <Target className="h-3 w-3 text-rose-500" />
                    Rolamento SKF 6204
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground font-mono">
              Frequência de Amostragem: 2.000 Hz | Resolução: 0.5 ms
            </div>
          )}

        </div>

        {/* Gráfico Principal Interativo com Cursor Arrastável */}
        <div 
          ref={chartWrapperRef} 
          onClick={handleChartClick}
          className="relative h-[380px] w-full pt-1 cursor-crosshair"
        >
          {/* Peg / Handle Arrastável do Cursor 1X (Harmônico) */}
          {domainMode === 'fft' && cursorTool === 'harmonics' && fundamentalFreq <= zoomRange && (
            <div
              onPointerDown={handlePointerDownFundamental}
              onPointerMove={handlePointerMoveFundamental}
              onPointerUp={handlePointerUpFundamental}
              className={`absolute top-0 -translate-x-1/2 z-20 flex items-center gap-1 cursor-ew-resize select-none px-2 py-0.5 rounded shadow-lg font-mono text-[11px] font-black border transition-shadow ${
                isDraggingFundamental 
                  ? 'bg-amber-400 text-slate-950 border-amber-200 ring-2 ring-amber-400/50 scale-105' 
                  : 'bg-amber-500 text-slate-950 border-amber-300 hover:scale-105'
              }`}
              style={{
                left: `calc(45px + (100% - 70px) * ${fundamentalPct / 100})`,
              }}
              title="Clique e arraste horizontalmente para deslocar o pente de harmônicos"
            >
              <MoveHorizontal className="h-3 w-3" />
              <span>1X: {fundamentalFreq.toFixed(1)} Hz</span>
            </div>
          )}

          {/* Peg / Handle Arrastável de Bandas Laterais (fc + Δf) */}
          {domainMode === 'fft' && cursorTool === 'sidebands' && (sidebandCenter + sidebandDelta) <= zoomRange && (
            <div
              onPointerDown={handlePointerDownSideband}
              onPointerMove={handlePointerMoveSideband}
              onPointerUp={handlePointerUpSideband}
              className={`absolute top-0 -translate-x-1/2 z-20 flex items-center gap-1 cursor-ew-resize select-none px-2 py-0.5 rounded shadow-lg font-mono text-[11px] font-black border transition-shadow ${
                isDraggingSideband 
                  ? 'bg-rose-400 text-white border-rose-200 ring-2 ring-rose-400/50 scale-105' 
                  : 'bg-rose-600 text-white border-rose-400 hover:scale-105'
              }`}
              style={{
                left: `calc(45px + (100% - 70px) * ${sidebandHandlePct / 100})`,
              }}
              title="Clique e arraste para alterar o espaçamento das bandas laterais"
            >
              <MoveHorizontal className="h-3 w-3" />
              <span>+Δf: {sidebandDelta.toFixed(1)} Hz</span>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            {domainMode === 'fft' ? (
              <LineChart
                data={spectrumData}
                margin={{ top: 25, right: 25, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                
                <XAxis
                  dataKey="frequency"
                  type="number"
                  domain={[0, zoomRange]}
                  tickCount={zoomRange <= 200 ? 9 : 11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} Hz`}
                  className="text-[11px] font-mono fill-muted-foreground"
                />
                
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  className="text-[11px] font-mono fill-muted-foreground"
                  tickFormatter={(val) => val.toFixed(1)}
                />

                {/* Tooltip de Precisão Espectral */}
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    const freq = Number(label)
                    const order = (freq / fundamentalFreq).toFixed(2)

                    return (
                      <div className="rounded-lg border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-xs text-xs space-y-1.5 font-mono">
                        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-1 font-bold text-foreground">
                          <span>{freq.toFixed(1)} Hz</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                            {order}X RPM
                          </Badge>
                        </div>

                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground">{entry.name}:</span>
                            </div>
                            <span className="font-bold text-foreground">
                              {Number(entry.value).toFixed(3)} {amplitudeUnit === 'accel_g' ? 'g' : 'mm/s'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                {/* Overlays Dinâmicos do Pente Harmônico Arrastável (1X, 2X, 3X, 4X...) */}
                {cursorTool === 'harmonics' && activeHarmonics.map((h) => (
                  <ReferenceLine
                    key={h.order}
                    x={h.frequency}
                    stroke={h.order === 1 ? '#f59e0b' : '#d97706'}
                    strokeDasharray={h.order === 1 ? undefined : '4 4'}
                    strokeWidth={h.order === 1 ? 2.5 : 1.25}
                    label={{
                      value: `${h.order}X (${h.frequency} Hz)`,
                      position: 'insideTopLeft',
                      fill: '#f59e0b',
                      fontSize: 10,
                      fontWeight: h.order === 1 ? 800 : 600,
                    }}
                  />
                ))}

                {/* Overlays do Modo de Bandas Laterais (fc ± nΔf) */}
                {cursorTool === 'sidebands' && (
                  <>
                    {/* Frequência Central fc */}
                    {sidebandCenter <= zoomRange && (
                      <ReferenceLine
                        x={sidebandCenter}
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        label={{
                          value: `fc (${sidebandCenter} Hz)`,
                          position: 'insideTopLeft',
                          fill: '#ef4444',
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      />
                    )}
                    {/* Banda Lateral Superior: fc + Δf */}
                    {(sidebandCenter + sidebandDelta) <= zoomRange && (
                      <ReferenceLine
                        x={Number((sidebandCenter + sidebandDelta).toFixed(1))}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{
                          value: `+1Δf (${(sidebandCenter + sidebandDelta).toFixed(1)} Hz)`,
                          position: 'insideTopRight',
                          fill: '#f59e0b',
                          fontSize: 10,
                        }}
                      />
                    )}
                    {/* Banda Lateral Inferior: fc - Δf */}
                    {(sidebandCenter - sidebandDelta) >= 0 && (
                      <ReferenceLine
                        x={Number((sidebandCenter - sidebandDelta).toFixed(1))}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{
                          value: `-1Δf (${(sidebandCenter - sidebandDelta).toFixed(1)} Hz)`,
                          position: 'insideTopLeft',
                          fill: '#f59e0b',
                          fontSize: 10,
                        }}
                      />
                    )}
                  </>
                )}

                {/* Overlays de Defeitos de Rolamento Estáticos (BPFO / BPFI) */}
                {showBearingFrequencies && (
                  <>
                    {zoomRange >= bpfo && (
                      <ReferenceLine
                        x={bpfo}
                        stroke="#e11d48"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        label={{ value: `BPFO (${bpfo} Hz)`, position: 'insideTopRight', fill: '#e11d48', fontSize: 10, fontWeight: 800 }}
                      />
                    )}
                    {zoomRange >= 2 * bpfo && (
                      <ReferenceLine
                        x={2 * bpfo}
                        stroke="#e11d48"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{ value: `2x BPFO (${(2 * bpfo).toFixed(1)} Hz)`, position: 'insideTopRight', fill: '#e11d48', fontSize: 10 }}
                      />
                    )}
                    {zoomRange >= bpfi && (
                      <ReferenceLine
                        x={bpfi}
                        stroke="#8b5cf6"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        label={{ value: `BPFI (${bpfi} Hz)`, position: 'insideTopRight', fill: '#8b5cf6', fontSize: 10 }}
                      />
                    )}
                  </>
                )}

                {/* Cursor de Pico Selecionado */}
                {pinnedPeak && pinnedPeak.frequencyHz <= zoomRange && (
                  <ReferenceLine
                    x={pinnedPeak.frequencyHz}
                    stroke="#ec4899"
                    strokeWidth={2}
                    label={{ 
                      value: `[ALVO] ${pinnedPeak.frequencyHz} Hz (${pinnedPeak.amplitudeG}g)`, 
                      position: 'top', 
                      fill: '#ec4899', 
                      fontSize: 11, 
                      fontWeight: 800 
                    }}
                  />
                )}

                {/* Linhas de Dados Triaxiais */}
                {showRadialX && (
                  <Line
                    type="monotone"
                    dataKey="radialX"
                    name="Radial X (Horiz)"
                    stroke="#06b6d4"
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}

                {showRadialY && (
                  <Line
                    type="monotone"
                    dataKey="radialY"
                    name="Radial Y (Vert)"
                    stroke="#10b981"
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}

                {showAxialZ && (
                  <Line
                    type="monotone"
                    dataKey="axialZ"
                    name="Axial Z"
                    stroke="#3b82f6"
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            ) : (
              /* Modo Forma de Onda no Tempo (Aceleração vs Tempo - ms) */
              <LineChart
                data={timeWaveformData}
                margin={{ top: 15, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                
                <XAxis
                  dataKey="timeMs"
                  type="number"
                  domain={[0, 120]}
                  tickCount={13}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} ms`}
                  className="text-[11px] font-mono fill-muted-foreground"
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[-6, 6]}
                  className="text-[11px] font-mono fill-muted-foreground"
                  tickFormatter={(val) => `${val} g`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-xs text-xs space-y-1 font-mono">
                        <div className="font-bold text-foreground border-b border-border/60 pb-1">
                          Tempo: {Number(label).toFixed(1)} ms
                        </div>
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">{entry.name}:</span>
                            <span className="font-bold text-foreground">
                              {Number(entry.value).toFixed(3)} g
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                {showRadialX && (
                  <Line
                    type="monotone"
                    dataKey="radialX"
                    name="Radial X (Horiz)"
                    stroke="#06b6d4"
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}

                {showRadialY && (
                  <Line
                    type="monotone"
                    dataKey="radialY"
                    name="Radial Y (Vert)"
                    stroke="#10b981"
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}

                {showAxialZ && (
                  <Line
                    type="monotone"
                    dataKey="axialZ"
                    name="Axial Z"
                    stroke="#3b82f6"
                    strokeWidth={1.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Rodapé: Picos Dominantes Detectados com Clique Interativo */}
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Picos Espectrais Dominantes Detectados (Clique para Ancorar o Cursor):</span>
            </div>

            {pinnedPeak && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPinnedPeak(null)}
                className="h-6 text-[10px] text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Resetar Alvo</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {scenario.dominantPeaks.map((peak, idx) => {
              const isPinned = pinnedPeak?.frequencyHz === peak.frequencyHz
              const isHarmonicMatch = Math.abs(fundamentalFreq - peak.frequencyHz) < 1.0

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setPinnedPeak(isPinned ? null : peak)
                    setFundamentalFreq(Number(peak.frequencyHz.toFixed(2)))
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-md border p-2.5 text-xs transition-all ${
                    isPinned || isHarmonicMatch
                      ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                      : 'border-border/70 bg-muted/20 hover:border-primary/60 hover:bg-muted/40'
                  }`}
                  title="Clique para alinhar o pente harmônico diretamente sobre este pico"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={isPinned || isHarmonicMatch ? "default" : "secondary"} className={`font-mono text-[10px] font-bold ${
                      isPinned || isHarmonicMatch ? 'bg-amber-600 hover:bg-amber-600' : ''
                    }`}>
                      {peak.order}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground truncate max-w-[140px]">
                        {peak.label || `${peak.frequencyHz} Hz`}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {peak.frequencyHz} Hz ({(peak.frequencyHz / fundamentalFreq).toFixed(2)}X)
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-right font-black text-foreground">
                    {peak.amplitudeG.toFixed(2)} g
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
