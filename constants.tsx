import React from 'react';
import { Rocket, Palette, Cpu, BrainCircuit } from 'lucide-react';
import { CategoryDefinition, ServiceItem } from './types';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'growth',
    title: 'Growth & Performance',
    icon: <Rocket className="w-5 h-5" />,
    color: 'bg-black text-white',
    description: 'Foco em Vendas e Aquisição'
  },
  {
    id: 'branding',
    title: 'Branding & Experiência',
    icon: <Palette className="w-5 h-5" />,
    color: 'bg-zinc-800 text-white',
    description: 'Foco em Marca e Cliente'
  },
  {
    id: 'tech',
    title: 'Tecnologias, Dados & IA',
    icon: <Cpu className="w-5 h-5" />,
    color: 'bg-zinc-600 text-white',
    description: 'Foco em Infraestrutura e Automação'
  },
  {
    id: 'strategy',
    title: 'Estratégia & Processos',
    icon: <BrainCircuit className="w-5 h-5" />,
    color: 'bg-zinc-400 text-white',
    description: 'Consultoria e Planejamento'
  }
];

export const SERVICES: ServiceItem[] = [
  // 1. Growth & Performance
  { id: 'growth-1', name: 'Growth Hacking', category: 'growth', description: 'Estratégias de crescimento rápido' },
  { id: 'growth-2', name: 'Tráfego Pago', category: 'growth', description: 'Ads em Meta, Google, LinkedIn' },
  { id: 'growth-3', name: 'SEO', category: 'growth', description: 'Search Engine Optimization' },
  { id: 'growth-4', name: 'Funis de Venda', category: 'growth', description: 'Arquitetura de conversão' },
  { id: 'growth-5', name: 'Máquina de vendas', category: 'growth', description: 'Processos de vendas previsíveis' },
  { id: 'growth-6', name: 'Estratégias de conversão', category: 'growth', description: 'CRO e otimização' },
  { id: 'growth-7', name: 'Otimização de campanhas', category: 'growth', description: 'Melhoria contínua de performance' },
  { id: 'growth-8', name: 'Remarketing', category: 'growth', description: 'Recuperação de leads' },
  { id: 'growth-9', name: 'Sellers as social media', category: 'growth', description: 'Vendedores como criadores' },
  { id: 'growth-10', name: 'Marketing para eventos', category: 'growth', description: 'Divulgação Digital/Físico' },

  // 2. Branding & Experiência
  { id: 'brand-1', name: 'Rebranding', category: 'branding', description: 'Renovação de identidade visual' },
  { id: 'brand-2', name: 'Storytelling', category: 'branding', description: 'Narrativas envolventes' },
  { id: 'brand-3', name: 'Mapeamento de Personas', category: 'branding', description: 'Definição do público ideal' },
  { id: 'brand-4', name: 'Marketing para social media', category: 'branding', description: 'Gestão de redes sociais' },
  { id: 'brand-5', name: 'Vídeos virais', category: 'branding', description: 'Produção de conteúdo de alto alcance' },
  { id: 'brand-6', name: 'Blogs', category: 'branding', description: 'Estratégia de conteúdo textual' },
  { id: 'brand-7', name: 'CS/CX', category: 'branding', description: 'Customer Success / Experience' },
  { id: 'brand-8', name: 'Design de Serviços WOW', category: 'branding', description: 'Experiências memoráveis' },

  // 3. Tecnologias, Dados & IA
  { id: 'tech-1', name: 'Automações com IA', category: 'tech', description: 'Inteligência Artificial aplicada' },
  { id: 'tech-2', name: 'Automações com agentes de IA', category: 'tech', description: 'Agentes autônomos' },
  { id: 'tech-3', name: 'Tracking de dados', category: 'tech', description: 'Integração com dashboards' },
  { id: 'tech-4', name: 'Integrações CRM', category: 'tech', description: 'Conexão de dados de vendas' },
  { id: 'tech-5', name: 'Otimização de servidores', category: 'tech', description: 'Infraestrutura e hospedagem' },
  { id: 'tech-6', name: 'Desenvolvimento E-commerces', category: 'tech', description: 'Lojas virtuais completas' },
  { id: 'tech-7', name: 'Criação de Landing page', category: 'tech', description: 'Páginas de alta conversão' },
  { id: 'tech-8', name: 'Desenvolvimento de APPs', category: 'tech', description: 'Aplicativos mobile/web' },

  // 4. Estratégia & Processos
  { id: 'strat-1', name: 'Diagnóstico de Jornadas', category: 'strategy', description: 'Análise do processo atual' },
  { id: 'strat-2', name: 'Desenvolvimento de Jornadas', category: 'strategy', description: 'Criação de novos fluxos' },
  { id: 'strat-3', name: 'Escopamento', category: 'strategy', description: 'Definição de escopo de projeto' },
  { id: 'strat-4', name: 'Aplicação de frameworks', category: 'strategy', description: 'Metodologias ágeis e estratégicas' },
];