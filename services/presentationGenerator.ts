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
    subtitle: 'Marketing, vendas, dados e tecnologia operando como um sistema único.',
    content: []
  };

  // Slide 2: O Problema
  const slide2: PresentationSlide = {
    id: 'slide-2',
    type: 'content',
    title: 'O PROBLEMA NUNCA FOI MARKETING',
    subtitle: 'E não está no time.',
    content: [
      "Empresas já investem em marketing e vendas, canais e ferramentas existem.",
      "Mas tudo opera sem a visão do empreendedor.",
      "O plano de crescimento vira esforço sem direção.",
      "Não escala e gera frustração tanto no empreendedor quanto nos times."
    ]
  };

  // Slide 3: Engrenagens
  const slide3: PresentationSlide = {
    id: 'slide-3',
    type: 'service_list',
    title: 'AS ENGRENAGENS DO ECOSSISTEMA',
    subtitle: 'Diagnóstico do negócio e entendimento da cultura para uma entrega única.',
    content: [],
    servicesList: services 
  };

  // Slide 4: Implementação
  const slide4: PresentationSlide = {
    id: 'slide-4',
    type: 'content',
    title: 'IMPLEMENTAÇÃO',
    subtitle: 'Simples e prático de entender em 3 etapas.',
    content: [
      "01. Diagnóstico do Ecossistema: Marca, jornada, dados e tecnologia.",
      "02. Arquitetura do Crescimento: Jornada ideal, prioridades e métricas.",
      "03. Implementação Inicial: Primeira alavanca rodando de ponta a ponta.",
      "Não entregamos planos. Entregamos o ecossistema funcionando."
    ]
  };

  // Slide 5: Fechamento (Sem orçamento)
  const slide5: PresentationSlide = {
    id: 'slide-5',
    type: 'closing',
    title: 'ANTES DE ESCALAR, ORGANIZE.',
    subtitle: 'Vamos conversar sobre como implementar esse ecossistema no seu negócio?',
    content: []
  };

  return {
    title: `Apresentação Estratégica - ${clientName}`,
    slides: [slide1, slide2, slide3, slide4, slide5]
  };
};