import { SelectedService, PresentationData, PresentationSlide } from "../types";
import { CATEGORIES } from "../constants";

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

  // Slide 3: A Solução
  const slide3: PresentationSlide = {
    id: 'slide-3',
    type: 'content',
    title: 'A SOLUÇÃO',
    subtitle: 'Um ecossistema de growth orientado a dados, modelado à visão e cultura do gestor.',
    content: [
      "Marca & Posicionamento",
      "Aquisição de Demanda",
      "Conversão & Vendas",
      "Tecnologia & Automação",
      "Dados & Otimização"
    ]
  };

  // Slide 4: Engrenagens (Dynamic Scope based on selection)
  // We group the selected services by category to show "Unique Delivery"
  const slide4: PresentationSlide = {
    id: 'slide-4',
    type: 'service_list',
    title: 'AS ENGRENAGENS DO ECOSSISTEMA',
    subtitle: 'Diagnóstico do negócio e entendimento da cultura para uma entrega única.',
    content: [],
    servicesList: services // Pass raw services, rendering will handle grouping
  };

  // Slide 5: Metodologia
  const slide5: PresentationSlide = {
    id: 'slide-5',
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

  // Slide 6: Impacto
  const slide6: PresentationSlide = {
    id: 'slide-6',
    type: 'content',
    title: 'O IMPACTO',
    subtitle: 'Marketing e vendas alinhados ao propósito da marca.',
    content: [
      "De: Marketing desconectado e leads sem contexto.",
      "Para: Jornada clara e conectada à 'visão do dono'.",
      "De: Vendas baseadas em queima de capital.",
      "Para: Automações e dados confiáveis para conversão.",
      "Resultado: Crescimento e conhecimento replicáveis."
    ]
  };

  // Slide 7: Fechamento
  const slide7: PresentationSlide = {
    id: 'slide-7',
    type: 'closing',
    title: 'ANTES DE ESCALAR, ORGANIZE.',
    subtitle: 'Vamos conversar sobre como implementar um ecossistema de growth no seu negócio?',
    content: []
  };

  return {
    title: `Proposta - ${clientName}`,
    slides: [slide1, slide2, slide3, slide4, slide5, slide6, slide7]
  };
};