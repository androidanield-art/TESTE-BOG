import React, { useState } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CATEGORIES, SERVICES } from './constants';
import { SelectedService, ServiceItem, PresentationData } from './types';
import { generateStaticPresentation } from './services/presentationGenerator';
import { downloadPPT } from './services/pptGenerator';
import { Logo } from './Logo';
import { Plus, Trash2, GripVertical, Printer, ArrowLeft, ShieldCheck, Box, X, Calculator, Sparkles, Presentation, FileText, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(...inputs));
}

const SidebarItem: React.FC<{ service: ServiceItem; isOverlay?: boolean }> = ({ service, isOverlay = false }) => (
  <div className={cn(
    "group flex items-center justify-between p-3 mb-2 rounded-lg cursor-grab active:cursor-grabbing transition-all border",
    isOverlay 
      ? "bg-zinc-900 border-[#74fbae] shadow-[0_0_15px_rgba(116,251,174,0.3)] scale-105 z-50" 
      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
  )}>
    <div>
      <h4 className={cn("text-sm font-semibold transition-colors", isOverlay ? "text-white" : "text-zinc-300 group-hover:text-white")}>{service.name}</h4>
      <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400">{service.description}</p>
    </div>
    <Plus className={cn("w-4 h-4 transition-colors", isOverlay ? "text-[#74fbae]" : "text-zinc-600 group-hover:text-[#74fbae]")} />
  </div>
);

const SortableCanvasItem: React.FC<{ 
  service: SelectedService; 
  onRemove: (id: string) => void; 
}> = ({ service, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.uniqueId });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const cat = CATEGORIES.find(c => c.id === service.category);

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "relative flex items-center gap-3 p-4 rounded-xl border mb-3 group transition-all",
      isDragging ? "opacity-30 border-[#74fbae] bg-zinc-900" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-lg"
    )}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("w-1.5 h-1.5 rounded-full", cat?.id === 'branding' ? 'bg-indigo-500' : cat?.id === 'growth' ? 'bg-emerald-500' : 'bg-zinc-500')} />
          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">{cat?.title}</span>
        </div>
        <h3 className="text-sm font-bold text-zinc-200">{service.name}</h3>
      </div>
      <button onClick={() => onRemove(service.uniqueId)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const DraggableItem: React.FC<{ service: ServiceItem }> = ({ service }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: service.id });
  return <div ref={setNodeRef} {...listeners} {...attributes} className="mb-2"><SidebarItem service={service} /></div>;
};

const DroppableZone: React.FC<{ 
  items: SelectedService[]; 
  onRemove: (id: string) => void; 
}> = ({ items, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-droppable' });
  return (
    <div ref={setNodeRef} className={cn(
      "max-w-3xl mx-auto min-h-[600px] border-2 border-dashed rounded-3xl p-8 transition-all duration-300 relative",
      isOver ? "bg-zinc-900/30 border-[#74fbae] shadow-[inset_0_0_20px_rgba(116,251,174,0.05)]" : "border-zinc-800"
    )}>
      {items.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 pointer-events-none">
           <Box className="w-16 h-16 mb-4 opacity-20" />
           <p className="font-medium text-sm">Arraste os módulos para construir o ecossistema</p>
        </div>
      ) : (
        <SortableContext items={items.map(i => i.uniqueId)} strategy={verticalListSortingStrategy}>
          {items.map(i => <SortableCanvasItem key={i.uniqueId} service={i} onRemove={onRemove} />)}
        </SortableContext>
      )}
    </div>
  );
};

const BudgetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: SelectedService[];
  onConfirm: (itemsWithPrices: SelectedService[]) => void;
  onGenerateDoc: () => void;
}> = ({ isOpen, onClose, items, onConfirm, onGenerateDoc }) => {
  const [prices, setPrices] = useState<Record<string, string>>({});

  const handlePriceChange = (id: string, value: string) => {
    setPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const itemsWithPrices = items.map(item => ({
      ...item,
      price: prices[item.uniqueId] || item.price || '0,00'
    }));
    onConfirm(itemsWithPrices);
    onClose();
  };

  const total = items.reduce((acc, item) => {
    const priceStr = prices[item.uniqueId] || item.price || '0';
    const val = parseFloat(priceStr.replace(/\./g, '').replace(',', '.') || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#74fbae]" />
            Valores de Investimento
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map(item => (
            <div key={item.uniqueId} className="flex items-center justify-between p-4 bg-zinc-950/30 border border-zinc-800 rounded-lg">
              <div className="flex-1 pr-4">
                <p className="text-sm font-semibold text-zinc-200">{item.name}</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                <input 
                  type="text"
                  placeholder="0,00"
                  className="bg-zinc-900 border border-zinc-700 rounded-md py-2 pl-9 pr-3 text-right text-white focus:outline-none focus:border-[#74fbae] w-32 font-mono"
                  value={prices[item.uniqueId] || item.price || ''}
                  onChange={(e) => handlePriceChange(item.uniqueId, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 rounded-b-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Estimado</p>
              <p className="text-2xl font-bold text-[#74fbae]">R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(total)}</p>
            </div>
            <div className="flex gap-3">
                <button onClick={handleSave} className="bg-zinc-800 text-white px-6 py-2.5 rounded-full font-bold hover:bg-zinc-700 transition-all text-xs">
                    Salvar Dados
                </button>
                <button onClick={() => { handleSave(); onGenerateDoc(); }} className="bg-[#74fbae] text-black px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-all text-xs flex items-center gap-2 shadow-lg">
                    <FileText className="w-4 h-4" /> Gerar Proposta Comercial
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- VISUALIZAÇÃO DO ORÇAMENTO (DOCUMENTO COMERCIAL) ---
const BudgetDocumentView: React.FC<{ 
  items: SelectedService[], 
  client: string, 
  project: string, 
  onClose: () => void 
}> = ({ items, client, project, onClose }) => {
  const total = items.reduce((acc, item) => {
    const val = parseFloat((item.price || '0').replace(/\./g, '').replace(',', '.') || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="fixed inset-0 z-[120] bg-zinc-950 overflow-y-auto animate-fade-in p-8">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-start no-print">
            <button onClick={onClose} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={() => window.print()} className="bg-[#74fbae] text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                <Printer className="w-5 h-5" /> Imprimir Orçamento (PDF)
            </button>
        </div>

        <div className="bg-white text-zinc-900 p-16 rounded-sm shadow-2xl min-h-[1100px] flex flex-col font-serif print:shadow-none print:p-8">
            <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-8 mb-12">
                <Logo className="h-10 w-auto invert" />
                <div className="text-right">
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Proposta Comercial</h1>
                    <p className="text-sm text-zinc-500">#{new Date().getFullYear()}-{(Math.random()*1000).toFixed(0)}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12 text-sm italic">
                <div>
                    <p className="font-bold text-xs uppercase not-italic text-zinc-400 mb-1">Cliente</p>
                    <p className="text-lg font-bold not-italic">{client || '---'}</p>
                    <p className="text-zinc-600">Projeto: {project || '---'}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-xs uppercase not-italic text-zinc-400 mb-1">Emissão</p>
                    <p className="font-bold not-italic">{new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="text-zinc-600">Validade: 07 dias corridos</p>
                </div>
            </div>

            <div className="flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-zinc-900">
                            <th className="py-4 font-black uppercase text-xs">Item / Ecossistema</th>
                            <th className="py-4 font-black uppercase text-xs text-right">Investimento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={item.uniqueId} className="border-b border-zinc-100">
                                <td className="py-6">
                                    <p className="font-bold text-base">{item.name}</p>
                                    <p className="text-xs text-zinc-500 italic max-w-md">{item.description}</p>
                                </td>
                                <td className="py-6 text-right font-mono font-bold">
                                    R$ {item.price || '0,00'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-zinc-900">
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <div>
                            <p className="font-black text-xs uppercase mb-2">Condições de Pagamento</p>
                            <ul className="text-xs space-y-1 text-zinc-600">
                                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-zinc-900" /> 50% de entrada no aceite da proposta</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-zinc-900" /> 50% na entrega da arquitetura do ecossistema</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-zinc-900" /> Faturamento via NF-e (Serviços)</li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-xs uppercase text-zinc-400 mb-1">Total Geral</p>
                        <p className="text-5xl font-black tracking-tighter">R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(total)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-20 text-[10px] text-zinc-400 uppercase text-center tracking-[0.3em] border-t border-zinc-100 pt-8">
                Build on Growth Ecosystems © {new Date().getFullYear()}
            </div>
        </div>
      </div>
    </div>
  );
}

// --- VISUALIZAÇÃO DA APRESENTAÇÃO (ESTRATÉGICA - SEM VALORES) ---
const PresentationView: React.FC<{ data: PresentationData, clientName: string, projectName: string, onClose: () => void }> = ({ data, clientName, projectName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto animate-fade-in">
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-[110] no-print bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={onClose} className="flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900/90 backdrop-blur px-5 py-2.5 rounded-full border border-zinc-800 transition-all">
          <ArrowLeft className="w-4 h-4" /> Sair
        </button>
        <div className="flex gap-4">
           <button 
            onClick={() => downloadPPT(data, clientName)}
            className="flex items-center gap-2 bg-zinc-900/90 text-white px-6 py-2.5 rounded-full font-bold hover:bg-zinc-800 transition-all border border-zinc-700 shadow-lg"
          >
            <Presentation className="w-4 h-4" /> Baixar PPT (Estratégico)
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#74fbae] text-black px-7 py-2.5 rounded-full font-bold hover:scale-105 transition-all">
            <Printer className="w-4 h-4" /> Imprimir Slides
          </button>
        </div>
      </div>

      <div className="mx-auto pt-24 pb-12 px-4 max-w-6xl space-y-12">
        {data.slides.map((slide, index) => (
          <div key={slide.id || index} className="relative w-full aspect-[16/9] bg-[#09090b] text-white flex flex-col p-16 print:p-12 print-slide overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#74fbae]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-10 left-12"><Logo className="h-8 w-auto" /></div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10">
              {slide.type === 'cover' && (
                <div className="max-w-4xl">
                  <h1 className="text-[80px] font-black leading-[0.85] mb-8 text-white tracking-tighter uppercase italic">
                    Ecossistema<br/><span className="text-zinc-600">de Growth</span>
                  </h1>
                  <p className="text-xl text-zinc-400 font-light border-l-4 border-[#74fbae] pl-6 italic">{slide.subtitle}</p>
                </div>
              )}

              {slide.type === 'content' && (
                <div className="grid grid-cols-12 gap-12 h-full items-center">
                  <div className="col-span-5 border-r border-zinc-800/50 pr-12">
                    <h2 className="text-4xl font-black text-[#74fbae] leading-tight mb-6 uppercase italic">{slide.title}</h2>
                    <p className="text-lg text-zinc-500 font-light italic">{slide.subtitle}</p>
                  </div>
                  <div className="col-span-7">
                    <ul className="space-y-6">
                      {slide.content.map((point, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#74fbae] shrink-0" />
                          <p className="text-xl text-zinc-200 font-light tracking-tight">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {slide.type === 'service_list' && (
                <div className="h-full flex flex-col pt-8">
                    <h2 className="text-4xl font-black text-white mb-8 uppercase italic">As Engrenagens do Ecossistema</h2>
                    <div className="grid grid-cols-3 gap-6">
                         {CATEGORIES.map(cat => {
                             const items = slide.servicesList?.filter(s => s.category === cat.id);
                             if (!items || items.length === 0) return null;
                             return (
                                 <div key={cat.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
                                     <h3 className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-3">{cat.title}</h3>
                                     <ul className="space-y-2">
                                         {items.map(s => (
                                             <li key={s.uniqueId} className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                                 <span className="w-1 h-1 bg-[#74fbae] rounded-full" /> {s.name}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             )
                         })}
                    </div>
                </div>
              )}

              {slide.type === 'closing' && (
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">{slide.title}</h2>
                    <p className="text-2xl text-zinc-400 font-light mb-12 italic">{slide.subtitle}</p>
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl min-w-[350px]">
                        <p className="text-2xl text-[#74fbae] font-mono mb-1">contato@buildongrowth.com</p>
                    </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [cartItems, setCartItems] = useState<SelectedService[]>([]);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [showBudgetDoc, setShowBudgetDoc] = useState(false);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<ServiceItem | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const sidebarItem = SERVICES.find(s => s.id === active.id);
    if (sidebarItem) setActiveDragItem(sidebarItem);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    const sidebarItem = SERVICES.find(s => s.id === active.id);
    if (sidebarItem && over.id === 'canvas-droppable') {
      setCartItems(prev => [...prev, { ...sidebarItem, uniqueId: `${sidebarItem.id}-${Date.now()}`, price: '0,00' }]);
      return;
    } 

    if (active.id !== over.id) {
      setCartItems(items => {
        const oldIndex = items.findIndex(i => i.uniqueId === active.id);
        const newIndex = items.findIndex(i => i.uniqueId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleGeneratePresentation = () => {
    if (cartItems.length === 0 || !clientName || !projectName) {
        alert("Preencha cliente, projeto e selecione serviços.");
        return;
    }
    setPresentationData(generateStaticPresentation(cartItems, clientName, projectName));
    setShowPresentation(true);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen font-sans overflow-hidden bg-[#09090b] text-zinc-100">
        <aside className="w-80 flex flex-col border-r border-zinc-800 bg-[#0c0c0e] z-10 print:hidden">
          <div className="p-8 border-b border-zinc-800">
            <Logo className="h-10 w-auto" />
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <h3 className="text-[10px] font-black text-zinc-500 mb-4 tracking-widest uppercase opacity-50">{cat.title}</h3>
                {SERVICES.filter(s => s.category === cat.id).map(s => (
                  <DraggableItem key={s.id} service={s} />
                ))}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative print:hidden">
          <header className="h-24 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl flex items-center px-12 justify-between z-20">
            <div className="flex gap-8">
              <div className="w-64">
                <p className="text-[9px] font-bold text-[#74fbae] uppercase mb-1 tracking-widest">Cliente</p>
                <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-transparent border-b border-zinc-800 focus:border-[#74fbae] outline-none pb-1 text-white placeholder-zinc-800" placeholder="Nome..." />
              </div>
              <div className="w-64">
                <p className="text-[9px] font-bold text-[#74fbae] uppercase mb-1 tracking-widest">Projeto</p>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-transparent border-b border-zinc-800 focus:border-[#74fbae] outline-none pb-1 text-white placeholder-zinc-800" placeholder="Projeto..." />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsBudgetOpen(true)} 
                    disabled={cartItems.length === 0} 
                    className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:text-[#74fbae] hover:border-[#74fbae] transition-all disabled:opacity-20"
                >
                    <Calculator className="w-4 h-4" /> Calculadora & Proposta
                </button>
                <button 
                    onClick={handleGeneratePresentation} 
                    disabled={cartItems.length === 0} 
                    className="bg-[#74fbae] text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-20 shadow-lg"
                >
                    <Sparkles className="w-4 h-4" /> Apresentação Estratégica
                </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
            <DroppableZone items={cartItems} onRemove={id => setCartItems(p => p.filter(i => i.uniqueId !== id))} />
          </div>
        </main>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragItem ? <SidebarItem service={activeDragItem} isOverlay /> : null}
      </DragOverlay>

      <BudgetModal 
        isOpen={isBudgetOpen} 
        onClose={() => setIsBudgetOpen(false)} 
        items={cartItems} 
        onConfirm={setCartItems} 
        onGenerateDoc={() => setShowBudgetDoc(true)}
      />

      {showBudgetDoc && (
          <BudgetDocumentView 
            items={cartItems} 
            client={clientName} 
            project={projectName} 
            onClose={() => setShowBudgetDoc(false)} 
          />
      )}

      {showPresentation && presentationData && (
        <PresentationView data={presentationData} clientName={clientName} projectName={projectName} onClose={() => setShowPresentation(false)} />
      )}
    </DndContext>
  );
}