import { GoogleGenAI, Type } from "@google/genai";
import { SelectedService, PresentationData } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePresentationContent = async (
  services: SelectedService[],
  clientName: string,
  projectName: string
): Promise<PresentationData | null> => {
  const ai = createClient();
  if (!ai) return null;

  const serviceList = services.map(s => `- ${s.name} (${s.description})`).join('\n');

  const prompt = `
    Atue como um Consultor Sênior de Estratégia e Growth da "Build on Growth".
    Filosofia: "O problema não é marketing, é falta de sistema. Crescimento sem sistema vira esforço, não escala."
    
    Contexto: Estamos apresentando uma proposta comercial de ALTO NÍVEL para o cliente "${clientName}", projeto "${projectName}".
    
    Serviços Escolhidos (Contexto para sua estratégia):
    ${serviceList}

    Gere uma apresentação estratégica de 4 slides (o 5º slide de escopo será gerado automaticamente pelo sistema, não gere ele).
    
    Estrutura dos 4 slides JSON:
    1. Capa: Título de impacto orientado a resultado, Subtítulo que instiga.
    2. O Cenário (Diagnóstico): Foque que ferramentas isoladas não geram receita previsível. A dor é a desconexão.
    3. A Estratégia (Solução): Como a unificação de Growth, Branding e Tech cria um ecossistema.
    4. O Plano de Ação (Metodologia): Etapas macro (ex: Diagnóstico > Implementação > Escala).

    Tom de voz: Executivo, direto, sofisticado, focado em ROI, LTV e Escalabilidade. Evite "marketinguês" barato.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["cover", "content", "closing"] },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  content: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "3 to 4 short, punchy bullet points."
                  }
                },
                required: ["type", "title", "content"]
              }
            }
          },
          required: ["title", "slides"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const parsed = JSON.parse(text);
    
    // Add IDs for editing
    parsed.slides = parsed.slides.map((s: any) => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9)
    }));

    return parsed as PresentationData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};