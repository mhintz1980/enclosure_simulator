import { useState, useCallback, useRef, useEffect } from 'react';
import { ENGINE_PRESETS } from '../utils/constants';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Pump Enclosure Design Co-Pilot. Adjust parameters on the left to see live calculations. I can help review your silencer sizing, estimate noise at distance, and check thermal balance for your pump package configuration.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback((
    text: string,
    designMetrics?: any,
    optimizationFocus?: string,
    setEngineHeat?: (v: number) => void,
    setRadiatorAirflow?: (v: number) => void
  ) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    setTimeout(() => {
      let responseContent = `Current design status: Total system pressure drop is ${designMetrics?.totalSystemPressureDrop?.toFixed(1) ?? 'N/A'} Pa. Total heat load: ${designMetrics?.totalHeatLoad?.toFixed(1) ?? 'N/A'} kW.`;

      const query = text.toLowerCase();

      // Engine spec retrieval
      if (query.includes('retrieve') || query.includes('fetch')) {
        const matchedEngine = ENGINE_PRESETS.find(p =>
          query.includes(p.model.toLowerCase()) || query.includes(p.manufacturer.toLowerCase())
        );
        if (matchedEngine) {
          responseContent = `Found specs for ${matchedEngine.manufacturer} ${matchedEngine.model}: Rated ${matchedEngine.ratedPower} kW, heat rejection ${matchedEngine.heatRejection} kW, radiator airflow ${matchedEngine.radiatorAirflow} m³/s (${matchedEngine.cooling}-cooled, ${matchedEngine.cylinders}-cyl). Values auto-applied.`;
          setEngineHeat?.(matchedEngine.heatRejection);
          setRadiatorAirflow?.(matchedEngine.radiatorAirflow);
        } else {
          responseContent = `Could not find an exact match in the database. Available engines: ${ENGINE_PRESETS.map(p => `${p.manufacturer} ${p.model}`).join(', ')}. Try selecting one from the Quick Start panel or entering engine heat and airflow manually.`;
        }
      }
      // Audit / check
      else if (query.includes('audit') || query.includes('check') || query.includes('verify') || query.includes('review')) {
        responseContent = `Engineering Review:\n• Ambient: 32.5°C\n• Design Airflow: ${designMetrics?.designAirflow?.toFixed(2) ?? 'N/A'} m³/s\n• Total Heat Load: ${designMetrics?.totalHeatLoad?.toFixed(1) ?? 'N/A'} kW\n• System ΔP: ${designMetrics?.totalSystemPressureDrop?.toFixed(1) ?? 'N/A'} Pa\n• Status: [${designMetrics?.status ?? 'N/A'}]\n• ${designMetrics?.statusMsg ?? ''}\n\nVibration: ${designMetrics?.vibrationAssessment?.risk ?? 'N/A'} risk — ${designMetrics?.vibrationAssessment?.message ?? ''}`;
      }
      // Noise questions
      else if (query.includes('noise') || query.includes('sound') || query.includes('db') || query.includes('decibel')) {
        const noiseData = designMetrics?.noiseResults;
        if (noiseData) {
          const pointsStr = noiseData.attenuatedPoints?.map((p: any) => `${p.distance}m: ${p.spl} dB(A)`).join(', ') ?? 'N/A';
          responseContent = `Noise Estimation (with silencers): ${pointsStr}. Source SWL: ${noiseData.sourceSWL} dB, Directivity Q=${noiseData.directivityQ}.`;
        }
      }
      // Tortuous path / silencer questions
      else if (query.includes('tortuous') || query.includes('baffle') || query.includes('silencer') || query.includes('path')) {
        responseContent = `Tortuous path silencers work by forcing air through a serpentine route between parallel baffles. Each turn absorbs and reflects sound energy. The tradeoff is pressure drop — thicker baffles with narrower airways give more noise reduction but restrict airflow more. Your current intake profile uses ${designMetrics?.intakeMetrics?.selectedProfile?.baffleThickness ?? '?'}mm baffles with ${designMetrics?.intakeMetrics?.selectedProfile?.airwayWidth ?? '?'}mm airways (${designMetrics?.intakeMetrics?.selectedProfile?.openArea ?? '?'}% open area).`;
      }
      // Vacuum pump questions
      else if (query.includes('vacuum') || query.includes('vac pump')) {
        responseContent = `Vacuum pumps share the same enclosure cooling airflow. Their heat rejection adds directly to the total heat load, increasing the required cooling airflow. Oil-cooled rotary vane pumps add extra heat from the oil cooler. Make sure to account for this when sizing your silencer openings.`;
      }
      // Solve / height / pressure
      else if (query.includes('solve') || query.includes('height') || query.includes('pressure')) {
        responseContent = `Optimization is set to [${optimizationFocus ?? 'N/A'}]. Intake duct height: ${designMetrics?.intakeMetrics?.ductHeight?.toFixed(2) ?? 'N/A'}m, Discharge duct height: ${designMetrics?.dischargeMetrics?.ductHeight?.toFixed(2) ?? 'N/A'}m. Total system ΔP: ${designMetrics?.totalSystemPressureDrop?.toFixed(1) ?? 'N/A'} Pa.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
      setIsLoading(false);
    }, 800);
  }, []);

  return {
    messages,
    isLoading,
    chatEndRef,
    sendMessage,
    setMessages,
  };
}