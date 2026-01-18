import { SelectedService, PresentationData, PresentationSlide } from "../types";

export const generateStaticPresentation = (
  services: SelectedService[],
  clientName: string,
  projectName: string
): PresentationData => {
  
  // Slide 1: Capa
  const slide1: PresentationSlide = {
    id: 'slide-1',
    type: 'cover',
    title: 'ECOSSISTEMA DE GROWTH',
    subtitle: 'Marketing, vendas, dados e tecnologia operando como um ecossistema integrado, hiper personalizado e orientado à receita.',
    content: []
  };

  // Slide 2: O Problema
  const slide2: PresentationSlide = {
    id: 'slide-2',
    type: 'content',
    title: 'O PROBLEMA NUNCA FOI O MARKETING',
    subtitle: 'E não está no time.',
    content: [
      "Empresas já investem em marketing e vendas. Canais e ferramentas existem.",
      "Mas tudo opera sem a visão do empreendedor.",
      "O plano de crescimento vira esforço sem direção.",
      "Não escala e gera frustração tanto no empreendedor quanto nos times."
    ]
  };

  // Slide 3: Visão do Ecossistema
  const slide3: PresentationSlide = {
    id: 'slide-3',
    type: 'content',
    title: 'VISÃO DE ECOSSISTEMA',
    subtitle: 'Orientado a dados e modelado à cultura do gestor com apoio de IA.',
    content: [
      "Marca & Posicionamento: Clareza na mensagem.",
      "Aquisição de Demanda: Tráfego qualificado.",
      "Conversão & Vendas: Processos previsíveis.",
      "Tecnologia & Automação: Eficiência operacional.",
      "O crescimento acontece quando todas essas camadas operam juntas."
    ]
  };

  // Slide 4: Engrenagens
  const slide4: PresentationSlide = {
    id: 'slide-4',
    type: 'service_list',
    title: 'AS ENGRENAGENS DO ECOSSISTEMA',
    subtitle: 'Não entregamos algo engessado. Diagnosticamos o negócio e entendemos a cultura para uma entrega única.',
    content: [],
    servicesList: services 
  };

  // Slide 5: Implementação
  const slide5: PresentationSlide = {
    id: 'slide-5',
    type: 'content',
    title: 'COMO É IMPLEMENTADO',
    subtitle: 'Simples e prático de entender em 3 etapas.',
    content: [
      "01. Diagnóstico do Ecossistema: Marca, jornada, dados e tecnologia.",
      "02. Arquitetura do Crescimento: Jornada ideal, prioridades e métricas.",
      "03. Implementação Inicial: Primeira alavanca rodando de ponta a ponta.",
      "Não entregamos planos. Entregamos o ecossistema funcionando."
    ]
  };

  // Slide 6: Impacto (Antes/Depois)
  const slide6: PresentationSlide = {
    id: 'slide-6',
    type: 'content',
    title: 'O IMPACTO REAL',
    subtitle: 'A transformação de um ecossistema bem estruturado.',
    content: [
      "ANTES: Marketing desconectado da visão do dono.",
      "ANTES: Leads sem contexto e vendas queimando capital.",
      "DEPOIS: Jornada clara e conectada à visão do dono.",
      "DEPOIS: Marketing e vendas alinhados ao propósito.",
      "DEPOIS: Crescimento e conhecimento replicáveis."
    ]
  };

  // Slide 7: Fechamento
  const slide7: PresentationSlide = {
    id: 'slide-7',
    type: 'closing',
    title: 'ANTES DE ESCALAR, ORGANIZE.',
    subtitle: 'Crescimento sustentável não nasce de campanhas isoladas. Vamos implementar este ecossistema no seu negócio?',
    content: []
  };

  return {
    title: `Estratégia - ${clientName}`,
    slides: [slide1, slide2, slide3, slide4, slide5, slide6, slide7]
  };
};