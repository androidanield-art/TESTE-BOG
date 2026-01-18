import React from 'react';
import { Rocket, Palette, Cpu, BrainCircuit, BarChart3, Target, Zap } from 'lucide-react';
import { CategoryDefinition, ServiceItem } from './types';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'branding',
    title: 'BRANDING',
    icon: <Palette className="w-5 h-5" />,
    color: 'bg-zinc-800 text-white',
    description: 'Clareza e experiência do usuário'
  },
  {
    id: 'growth',
    title: 'GROWTH C.V.',
    icon: <Target className="w-5 h-5" />,
    color: 'bg-black text-white',
    description: 'Aquisição e conversão'
  },
  {
    id: 'tech',
    title: 'TECNOLOGIA C.V.',
    icon: <Cpu className="w-5 h-5" />,
    color: 'bg-zinc-600 text-white',
    description: 'Infraestrutura que viabiliza o growth'
  },
  {
    id: 'strategy',
    title: 'ESTRATÉGIA',
    icon: <BrainCircuit className="w-5 h-5" />,
    color: 'bg-zinc-400 text-white',
    description: 'Diagnóstico e Processos'
  }
];

export const SERVICES: ServiceItem[] = [
  // BRANDING
  { id: 'brand-1', name: 'Diagnóstico de Marca & Jornada', category: 'branding', description: 'Análise profunda da percepção atual' },
  { id: 'brand-2', name: 'Proposta de Valor', category: 'branding', description: 'Definição do diferencial competitivo real' },
  { id: 'brand-3', name: 'Posicionamento', category: 'branding', description: 'Ocupação de espaço na mente do cliente' },
  { id: 'brand-4', name: 'Rebranding', category: 'branding', description: 'Renovação estratégica da identidade' },
  { id: 'brand-5', name: 'Storytelling Corporativo', category: 'branding', description: 'Narrativas que conectam com a visão do dono' },

  // GROWTH C.V.
  { id: 'growth-1', name: 'Mídia Paga', category: 'growth', description: 'Tráfego qualificado orientado a ROI' },
  { id: 'growth-2', name: 'SEO Estratégico', category: 'growth', description: 'Posicionamento orgânico de autoridade' },
  { id: 'growth-3', name: 'Funis de Venda', category: 'growth', description: 'Arquitetura de conversão de ponta a ponta' },
  { id: 'growth-4', name: 'Máquina de Vendas', category: 'growth', description: 'Processos comerciais previsíveis' },
  { id: 'growth-5', name: 'Dados & Performance', category: 'growth', description: 'Análise contínua para otimização de lucro' },

  // TECNOLOGIA C.V.
  { id: 'tech-1', name: 'Landing Pages & Sites', category: 'tech', description: 'Infraestrutura de alta conversão' },
  { id: 'tech-2', name: 'Automações com IA', category: 'tech', description: 'Eficiência operacional com inteligência' },
  { id: 'tech-3', name: 'Integrações com CRM', category: 'tech', description: 'Fluxo contínuo entre marketing e vendas' },
  { id: 'tech-4', name: 'Rastreamento & Dashboards', category: 'tech', description: 'Visibilidade total da jornada do dado' },
  { id: 'tech-5', name: 'Agentes de IA Conversacional', category: 'tech', description: 'Atendimento e vendas 24/7 personalizados' }
];