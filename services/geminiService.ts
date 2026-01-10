import { GoogleGenAI, Type } from "@google/genai";
import { SelectedService, PresentationData } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  
  // Debug log (will show in browser console F12)
  console.log("Checking API Key...", apiKey ? "Key exists (starts with " + apiKey.substring(0, 4) + ")" : "Key is MISSING");

  if (!apiKey || apiKey.includes("cole_sua_chave_aqui")) {
    throw new Error("API_KEY não encontrada. Crie o arquivo .env na raiz com sua chave.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePresentationContent = async (
  services: SelectedService[],
  clientName: string,
  projectName: string
): Promise<PresentationData> => { // Changed return type to throw error instead of null
  
  let ai;
  try {
    ai = createClient();
  } catch (e: any) {
    console.error("Client Init Error:", e);
    throw e;
  }

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
    if (!text) throw new Error("A IA retornou uma resposta vazia.");
    
    const parsed = JSON.parse(text);
    
    // Add IDs for editing
    parsed.slides = parsed.slides.map((s: any) => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9)
    }));

    return parsed as PresentationData;
  } catch (error: any) {
    console.error("Gemini API Error Full Details:", error);
    // Extract a more meaningful error message if possible
    const message = error.message || "Erro desconhecido na API Gemini";
    throw new Error(`Erro na IA: ${message}`);
  }
};