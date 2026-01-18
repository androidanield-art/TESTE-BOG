
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
import { SelectedService, ServiceItem, PresentationData, PresentationSlide } from './types';
import { generateStaticPresentation } from './services/presentationGenerator';
import { downloadPPT } from './services/pptGenerator';
import { Plus, Trash2, GripVertical, Printer, ArrowLeft, DollarSign, ShieldCheck, Box, X, Calculator, CheckCircle2, FileVideo, Sparkles, Presentation, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  // Fix: Ensure clsx is called with spread inputs for better compatibility
  return twMerge(clsx(...inputs));
}

const SidebarItem: React.FC<{ service: ServiceItem; isOverlay?: boolean }> = ({ service, isOverlay = false }) => (
  <div className={cn(
    "group flex items-center justify-between p-3 mb-2 rounded-lg cursor-grab active:cursor-grabbing transition-all border",
    isOverlay 
      ? "bg-zinc-900 border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.3)] scale-105 z-50" 
      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
  )}>
    <div>
      <h4 className={cn("text-sm font-semibold transition-colors", isOverlay ? "text-white" : "text-zinc-300 group-hover:text-white")}>{service.name}</h4>
      <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400">{service.description}</p>
    </div>
    <Plus className={cn("w-4 h-4 transition-colors", isOverlay ? "text-[#4ade80]" : "text-zinc-600 group-hover:text-[#4ade80]")} />
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
      isDragging ? "opacity-30 border-[#4ade80] bg-zinc-900" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-lg"
    )}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("w-1.5 h-1.5 rounded-full", cat?.color.includes('zinc-800') ? 'bg-indigo-500' : cat?.color.includes('black') ? 'bg-emerald-500' : 'bg-zinc-500')} />
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
      isOver ? "bg-zinc-900/30 border-[#4ade80] shadow-[inset_0_0_20px_rgba(74,222,128,0.05)]" : "border-zinc-800"
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
}> = ({ isOpen, onClose, items, onConfirm }) => {
  const [prices, setPrices] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handlePriceChange = (id: string, value: string) => {
    setPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const itemsWithPrices = items.map(item => ({
      ...item,
      price: prices[item.uniqueId] || item.price || '0,00'
    }));
    onConfirm(itemsWithPrices);
    onClose();
  };

  const total = Object.values(prices).reduce((acc: number, curr: string) => {
    const val = parseFloat(curr.replace(/\./g, '').replace(',', '.') || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#4ade80]" />
              Calculadora de Investimento
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Valores serão refletidos no slide de proposta comercial.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map(item => (
            <div key={item.uniqueId} className="flex items-center justify-between p-4 bg-zinc-950/30 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-sm font-semibold text-zinc-200">{item.name}</p>
                <p className="text-[10px] text-zinc-500">{item.description}</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                <input 
                  type="text"
                  placeholder="0,00"
                  className="bg-zinc-900 border border-zinc-700 rounded-md py-2 pl-9 pr-3 text-right text-white focus:outline-none focus:border-[#4ade80] w-32 font-mono"
                  value={prices[item.uniqueId] || item.price || ''}
                  onChange={(e) => handlePriceChange(item.uniqueId, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 rounded-b-2xl flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Total Estimado</p>
            <p className="text-2xl font-bold text-[#4ade80]">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-zinc-100 text-black px-8 py-3 rounded-full font-bold hover:bg-[#4ade80] transition-all hover:scale-105 flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Salvar Orçamento
          </button>
        </div>
      </div>
    </div>
  );
};

const PresentationView: React.FC<{ data: PresentationData, clientName: string, projectName: string, onClose: () => void }> = ({ data, clientName, projectName, onClose }) => {
  const BrandLogo = () => (
    <div className="flex items-center text-xl tracking-tight select-none z-10">
      <span className="font-normal text-white">Build</span>
      <span className="font-bold text-white ml-1">on</span>
      <span className="font-bold text-[#4ade80] ml-1 bg-white/10 px-2 py-0.5 rounded border border-white/5">Growth</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto print:bg-black print-container">
      
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-[110] no-print bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <button onClick={onClose} className="pointer-events-auto flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-full border border-zinc-800 transition-all hover:border-zinc-600">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="pointer-events-auto flex gap-4">
           <button 
            onClick={() => downloadPPT(data, clientName)}
            className="flex items-center gap-2 bg-white/10 text-white px-6 py-2 rounded-full font-bold hover:bg-white/20 transition-all border border-white/10 shadow-lg"
          >
            <Presentation className="w-4 h-4" /> Baixar PPT
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#4ade80] text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)]">
            <Printer className="w-4 h-4" /> Baixar PDF
          </button>
        </div>
      </div>

      <div className="max-w-[297mm] mx-auto print:max-w-none print:w-full">
        {data.slides.map((slide, index) => (
          <div key={slide.id || index} className="relative w-full aspect-[16/9] bg-[#09090b] text-white flex flex-col p-16 print:p-12 print-slide overflow-hidden border-b border-zinc-900 print:border-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4ade80]/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="absolute top-8 left-12"><BrandLogo /></div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10 px-8">
              {slide.type === 'cover' && (
                <div className="max-w-4xl">
                  <div className="inline-block px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full text-[#4ade80] text-[10px] font-bold uppercase tracking-widest mb-6">
                    Proposta Estratégica
                  </div>
                  <h1 className="text-7xl font-black leading-[1] mb-8 text-white tracking-tighter uppercase">
                    Ecossistema<br/><span className="text-zinc-600">de Growth</span>
                  </h1>
                  <p className="text-xl text-zinc-400 font-light max-w-2xl border-l-2 border-[#4ade80] pl-6 leading-relaxed">
                    {slide.subtitle}
                  </p>
                </div>
              )}

              {slide.type === 'content' && (
                <div className="grid grid-cols-12 gap-12 h-full items-center">
                  <div className="col-span-4 border-r border-zinc-800 pr-10 flex flex-col justify-center min-h-[300px]">
                    <h2 className="text-5xl font-black text-[#4ade80] leading-[1.1] mb-6 uppercase break-words">{slide.title}</h2>
                    <p className="text-lg text-zinc-500 leading-relaxed font-light">{slide.subtitle}</p>
                  </div>
                  <div className="col-span-8 flex flex-col justify-center pl-4">
                    <ul className="space-y-6">
                      {slide.content.map((point, i) => (
                        <li key={i} className="flex items-start gap-4 group">
                          <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-[#4ade80] transition-colors shrink-0" />
                          <p className="text-2xl text-zinc-300 font-extralight leading-snug group-hover:text-white transition-colors">
                            {point}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {slide.type === 'service_list' && (
                <div className="h-full flex flex-col pt-8">
                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">{slide.title}</h2>
                        <p className="text-lg text-zinc-400 font-light max-w-2xl">{slide.subtitle}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                         {CATEGORIES.map(cat => {
                             const items = slide.servicesList?.filter(s => s.category === cat.id);
                             if (!items || items.length === 0) return null;
                             return (
                                 <div key={cat.id} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4">
                                     <div className="flex items-center gap-3 mb-2 border-b border-zinc-800 pb-3">
                                        <div className={cn("p-1.5 rounded bg-zinc-950 border border-zinc-800", 
                                            cat.id === 'growth' ? 'text-emerald-400' : 
                                            cat.id === 'branding' ? 'text-indigo-400' : 'text-zinc-400'
                                        )}>
                                            {cat.icon}
                                        </div>
                                        <h3 className="font-bold text-[10px] uppercase tracking-widest text-zinc-500">{cat.title}</h3>
                                     </div>
                                     <ul className="space-y-2">
                                         {items.map(s => (
                                             <li key={s.uniqueId} className="flex items-start gap-2 text-zinc-300">
                                                 <span className="mt-2 w-1 h-1 bg-zinc-600 rounded-full shrink-0" />
                                                 <span className="text-sm font-medium leading-snug">{s.name}</span>
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
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter max-w-4xl leading-tight uppercase">
                        {slide.title}
                    </h2>
                    <p className="text-2xl text-zinc-400 font-light mb-12 max-w-2xl leading-relaxed">
                        {slide.subtitle}
                    </p>
                    <div className="text-left bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl min-w-[360px]">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 font-bold">Contato Direto</p>
                        <p className="text-xl text-[#4ade80] font-mono mb-1">contato@buildongrowth.com</p>
                        <p className="text-white text-md">Build on Growth Ecosystems</p>
                    </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-8 left-12 right-12 flex justify-between text-zinc-700 text-[10px] uppercase tracking-[0.2em] font-bold border-t border-zinc-900 pt-6">
              <span className="text-zinc-500">{projectName} — {clientName}</span>
              <span className="text-[#4ade80]">Slide {index + 1}</span>
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
    if (SERVICES.find(s => s.id === active.id) && over.id === 'canvas-droppable') {
      const service = SERVICES.find(s => s.id === active.id);
      if (service) setCartItems(prev => [...prev, { ...service, uniqueId: `${service.id}-${Date.now()}` }]);
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

  const handleOpenBudget = () => {
    if (cartItems.length === 0) { alert("Adicione serviços ao canvas primeiro."); return; }
    setIsBudgetOpen(true);
  };

  const handleBudgetConfirm = (itemsWithPrices: SelectedService[]) => {
      setCartItems(itemsWithPrices);
      setIsBudgetOpen(false);
  };

  const handleGeneratePresentation = () => {
    if (cartItems.length === 0 || !clientName || !projectName) {
        alert("Preencha cliente, projeto e selecione serviços.");
        return;
    }
    const baseData = generateStaticPresentation(cartItems, clientName, projectName);
    setPresentationData(baseData);
    setShowPresentation(true);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen font-sans overflow-hidden bg-[#09090b] text-zinc-100">
        <aside className="w-80 flex flex-col border-r border-zinc-800 bg-[#0c0c0e] z-10 print:hidden">
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-xl font-black italic tracking-tighter text-white">BUILD ON GROWTH</h1>
            <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ecosystem Builder</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <h3 className="text-[10px] font-black text-zinc-500 mb-3 tracking-[0.2em] uppercase flex items-center gap-2">
                    {cat.icon} {cat.title}
                </h3>
                {SERVICES.filter(s => s.category === cat.id).map(s => (
                  <DraggableItem key={s.id} service={s} />
                ))}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative print:hidden">
          <header className="h-24 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md flex items-center px-10 justify-between z-20">
            <div className="flex gap-8">
              <div className="w-64">
                <p className="text-[9px] font-bold text-[#4ade80] uppercase mb-1 tracking-widest">Empresa Cliente</p>
                <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-transparent text-lg font-medium border-b border-zinc-800 focus:border-[#4ade80] outline-none pb-1 text-white placeholder-zinc-700 transition-colors" placeholder="Digite o nome..." />
              </div>
              <div className="w-64">
                <p className="text-[9px] font-bold text-[#4ade80] uppercase mb-1 tracking-widest">Projeto</p>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-transparent text-lg font-medium border-b border-zinc-800 focus:border-[#4ade80] outline-none pb-1 text-white placeholder-zinc-700 transition-colors" placeholder="Digite o projeto..." />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={handleOpenBudget} disabled={cartItems.length === 0} className="flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-30" title="Definir valores">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-medium">Orçamento</span>
                </button>
                <button onClick={handleGeneratePresentation} disabled={cartItems.length === 0} className="group relative bg-[#4ade80] text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#3ecf70] transition-all hover:scale-105 shadow-[0_0_20px_rgba(74,222,128,0.2)] disabled:opacity-30">
                    <Sparkles className="w-5 h-5" />
                    Gerar Ecossistema
                </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-12 relative z-0 no-scrollbar">
            <DroppableZone items={cartItems} onRemove={id => setCartItems(p => p.filter(i => i.uniqueId !== id))} />
          </div>
        </main>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragItem ? <SidebarItem service={activeDragItem} isOverlay /> : null}
      </DragOverlay>

      <BudgetModal isOpen={isBudgetOpen} onClose={() => setIsBudgetOpen(false)} items={cartItems} onConfirm={handleBudgetConfirm} />

      {showPresentation && presentationData && (
        <PresentationView data={presentationData} clientName={clientName} projectName={projectName} onClose={() => setShowPresentation(false)} />
      )}
    </DndContext>
  );
}
