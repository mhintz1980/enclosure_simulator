import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am your AI Ventilation & Acoustics Co-Pilot. Adjust parameters on the left to see live calculations. I can audit your current configuration against Caterpillar cooling standards and Price Industries acoustics.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback((text: string, designMetrics?: any, optimizationFocus?: string, setHeatLoad?: (v: number) => void, setCombustionAirflow?: (v: number) => void) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    setTimeout(() => {
      let responseContent = `Calculated response audit: The total system static pressure drop is currently ${designMetrics?.totalSystemPressureDrop?.toFixed(1) ?? 'N/A'} Pa.`;

      const query = text.toLowerCase();
      if (query.includes('retrieve') || query.includes('perkins') || query.includes('cummins')) {
        responseContent = `Successfully retrieved technical specifications: Heat Load has been set to 110 kW and Combustion/Radiator Airflow has been set to 8.5 m³/s.`;
        setHeatLoad?.(110);
        setCombustionAirflow?.(8.5);
      } else if (query.includes('audit') || query.includes('check') || query.includes('verify')) {
        responseContent = `Engineering Audit Report: Ambient temperature is 32.5°C. Design Airflow is ${designMetrics?.designAirflow?.toFixed(1) ?? 'N/A'} m³/s. Status is currently [${designMetrics?.status ?? 'N/A'}]. ${designMetrics?.statusMsg ?? ''}`;
      } else if (query.includes('solve') || query.includes('height') || query.includes('pressure')) {
        responseContent = `Optimization focus is set to [${optimizationFocus ?? 'N/A'}]. Intake height resolved to ${designMetrics?.intakeMetrics?.ductHeight?.toFixed(2) ?? 'N/A'}m and Discharge height resolved to ${designMetrics?.dischargeMetrics?.ductHeight?.toFixed(2) ?? 'N/A'}m.`;
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