"use client";

import React, { useEffect, useState } from "react";
import { useEcho } from "@/lib/providers/echo-provider";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";

interface AnomalyData {
  gateway_id: string;
  status: string;
  confidence: number;
  spectrogram_b64: string | null;
  detected_at: string;
}

export default function AnomalyMonitor({ tenantId }: { tenantId: string }) {
  const { echo } = useEcho();
  const [anomaly, setAnomaly] = useState<AnomalyData | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!echo || !tenantId) return;

    console.log(`AnomalyMonitor connecting to IoT channel: tenant.${tenantId}.iot`)
    const channel = echo.channel(`tenant.${tenantId}.iot`);

    channel.listen(".anomaly.detected", (data: AnomalyData) => {
      console.log("🚨 Anomalia Crítica Detectada via AI:", data);
      setAnomaly(data);
      setShowAlert(true);
      
      // Auto-hide alert after 1 minute for critical issues
      const timer = setTimeout(() => setShowAlert(false), 60000);
      return () => clearTimeout(timer);
    });

    return () => {
      channel.stopListening(".anomaly.detected");
    };
  }, [echo, tenantId]);

  if (!showAlert || !anomaly) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-sm animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="relative overflow-hidden rounded-xl border-2 border-red-500 bg-card p-0 shadow-2xl ring-4 ring-red-500/20">
        <div className="bg-red-500 px-4 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 animate-pulse" />
            <span className="font-black text-sm tracking-wider uppercase">Alerta Preditivo IA</span>
          </div>
          <button 
            onClick={() => setShowAlert(false)}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-xl font-bold text-red-600 mb-1 leading-tight">
            {anomaly.status.replace(/_/g, ' ').toUpperCase()}
          </h3>
          
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Confiança:</span>
            <span className="text-lg font-mono font-bold text-foreground">
              {(anomaly.confidence * 100).toFixed(2)}%
            </span>
          </div>

          {anomaly.spectrogram_b64 && (
            <div className="mb-4 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assinatura de Vibração (Mel Spectrogram)</p>
              <div className="relative h-40 w-full overflow-hidden rounded-md border bg-black shadow-inner">
                <img 
                  src={`data:image/png;base64,${anomaly.spectrogram_b64}`} 
                  alt="Espectrograma da Falha" 
                  className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="destructive" 
              size="sm" 
              className="font-bold uppercase tracking-tighter"
              onClick={() => {
                // Aqui iria a navegação para os detalhes da máquina
                console.log("Navegar para gateway:", anomaly.gateway_id);
              }}
            >
              Analisar Ativo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="font-semibold uppercase tracking-tighter"
              onClick={() => setShowAlert(false)}
            >
              Ignorar
            </Button>
          </div>
          
          <p className="mt-3 text-[9px] text-center text-muted-foreground">
            Detectado em {new Date(anomaly.detected_at).toLocaleString()}
          </p>
        </div>
        
        {/* Barra de progresso para o auto-hide */}
        <div className="h-1 bg-red-500/20 w-full">
          <div className="h-full bg-red-500 animate-shrink-width" style={{ animationDuration: '60s' }} />
        </div>
      </div>
    </div>
  );
}
