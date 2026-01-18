
import { SelectedService, PresentationData, PresentationSlide } from "../types";

export const generateStaticPresentation = (
  services: SelectedService[],
  clientName: string,
  projectName: string
): PresentationData => {
  
  // Slide 1: Capa (Eco de Growth Orientado a Vendas)
  const slide1: PresentationSlide = {
    id: 'slide-1',
    type: 'cover',
    title: 'ECOSSISTEMA DE GROWTH',
    subtitle: 'Marketing, vendas, dados e tecnologia operando de forma integrada e personalizada à visão do empreendedor.',
    content: []
  };

  // Slide 2: O Problema (O marketing não é o vilão)
  const slide2: PresentationSlide = {
    id: 'slide-2',
    type: 'content',
    title: 'O PROBLEMA NUNCA FOI O MARKETING',
    subtitle: 'E não está no seu time.',
    content: [
      "Empresas já investem em marketing e vendas. Canais e ferramentas existem.",
      "Mas tudo opera sem a visão do empreendedor (o 'jeito do dono').",
      "O plano de crescimento vira esforço sem direção e sem escala.",
      "Isso gera frustração profunda tanto no empreendedor quanto nas equipes."
    ]
  };

  // Slide 3: A Solução (Visão & Cultura)
  const slide3: PresentationSlide = {
    id: 'slide-3',
    type: 'content',
    title: 'A SOLUÇÃO: ECOSSISTEMA MODELADO',
    subtitle: 'Orientado à visão e à cultura do gestor com apoio de IA conversacional.',
    content: [
      "Marca & Posicionamento: Conexão com o propósito real.",
      "Aquisição & Demanda: Tráfego qualificado para o seu perfil.",
      "Conversão & Vendas: Máquina comercial previsível.",
      "Tecnologia & Dados: Infraestrutura que viabiliza o crescimento sustentável.",
      "O crescimento acontece quando a solução é especializada na forma como você decide."
    ]
  };

  // Slide 4: Engrenagens (Serviços Selecionados)
  const slide4: PresentationSlide = {
    id: 'slide-4',
    type: 'service_list',
    title: 'AS ENGRENAGENS DO SEU ECOSSISTEMA',
    subtitle: 'Diagnosticamos a cultura e o negócio para construir uma entrega única e hiper personalizada.',
    content: [],
    servicesList: services 
  };

  // Slide 5: Etapas (Como implementamos)
  const slide5: PresentationSlide = {
    id: 'slide-5',
    type: 'content',
    title: 'COMO O ECOSSISTEMA É IMPLEMENTADO',
    subtitle: 'Simples e prático de entender em 3 etapas fundamentais.',
    content: [
      "01. Diagnóstico do Ecossistema: Análise de marca, jornada, dados e tecnologia.",
      "02. Arquitetura do Crescimento: Definição da jornada ideal, prioridades e métricas.",
      "03. Implementação Inicial: Primeira alavanca rodando de ponta a ponta.",
      "Não entregamos apenas planos. Entregamos o ecossistema funcionando."
    ]
  };

  // Slide 6: O Impacto (Antes vs Depois)
  const slide6: PresentationSlide = {
    id: 'slide-6',
    type: 'content',
    title: 'O IMPACTO DA ESTRUTURAÇÃO',
    subtitle: 'O resultado vem da especialização da entrega no seu negócio.',
    content: [
      "ANTES: Marketing desconectado da visão; Leads sem contexto; Vendas queimando capital.",
      "DEPOIS: Jornada clara e conectada à 'visão do dono'; Marketing e vendas alinhados.",
      "DEPOIS: Automações e dados que dão subsídios reais para o time converter.",
      "DEPOIS: Crescimento e conhecimento replicáveis e sustentáveis."
    ]
  };

  // Slide 7: Fechamento
  const slide7: PresentationSlide = {
    id: 'slide-7',
    type: 'closing',
    title: 'ORGANIZE ANTES DE ESCALAR.',
    subtitle: 'Crescimento sustentável nasce de um ecossistema bem estruturado. Vamos implementar o seu jeito de fazer no seu negócio?',
    content: []
  };

  return {
    title: `Estratégia BuildOn - ${clientName}`,
    slides: [slide1, slide2, slide3, slide4, slide5, slide6, slide7]
  };
};
