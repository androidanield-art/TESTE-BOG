

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
import { Plus, Trash2, GripVertical, Printer, ArrowLeft, DollarSign, ShieldCheck, Box, X, Calculator, CheckCircle2, FileVideo, Sparkles, Presentation, MoreHorizontal, ReceiptText } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
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
            {/* Fix: use Intl.NumberFormat instead of toLocaleString with arguments */}
            <p className="text-2xl font-bold text-[#4ade80]">R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)}</p>
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
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto print:static print:overflow-visible print:bg-black print-container animate-fade-in">
      
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-[110] no-print bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <button onClick={onClose} className="pointer-events-auto flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900/90 backdrop-blur px-5 py-2.5 rounded-full border border-zinc-800 transition-all hover:border-zinc-600 shadow-xl">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Canvas
        </button>
        <div className="pointer-events-auto flex gap-4">
           <button 
            onClick={() => downloadPPT(data, clientName)}
            className="flex items-center gap-2 bg-zinc-900/90 text-white px-6 py-2.5 rounded-full font-bold hover:bg-zinc-800 transition-all border border-zinc-700 shadow-lg"
          >
            <Presentation className="w-4 h-4" /> Exportar PPT
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#4ade80] text-black px-7 py-2.5 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,222,128,0.4)]">
            <Printer className="w-4 h-4" /> Gerar PDF (Imprimir)
          </button>
        </div>
      </div>

      <div className="mx-auto print:w-full print:m-0">
        {data.slides.map((slide, index) => (
          <div key={slide.id || index} className="relative w-full aspect-[16/9] bg-[#09090b] text-white flex flex-col p-20 print:p-12 print-slide overflow-hidden border-b border-zinc-900 print:border-none shadow-inner">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4ade80]/5 rounded-full blur-[140px] pointer-events-none opacity-60" />
            
            <div className="absolute top-10 left-16"><BrandLogo /></div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10 px-12">
              {slide.type === 'cover' && (
                <div className="max-w-4xl">
                  <div className="inline-block px-4 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-full text-[#4ade80] text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
                    Proposta Estratégica
                  </div>
                  <h1 className="text-[100px] font-black leading-[0.85] mb-10 text-white tracking-tighter uppercase italic">
                    Ecossistema<br/><span className="text-zinc-600">de Growth</span>
                  </h1>
                  <p className="text-2xl text-zinc-400 font-light max-w-2xl border-l-4 border-[#4ade80] pl-8 leading-relaxed italic">
                    {slide.subtitle}
                  </p>
                </div>
              )}

              {slide.type === 'content' && (
                <div className="grid grid-cols-12 gap-20 h-full items-center">
                  <div className="col-span-5 border-r border-zinc-800/50 pr-16 flex flex-col justify-center min-h-[400px]">
                    <h2 className="text-5xl font-black text-[#4ade80] leading-[1] mb-8 uppercase break-words tracking-tighter">{slide.title}</h2>
                    <p className="text-xl text-zinc-500 leading-relaxed font-light italic">{slide.subtitle}</p>
                  </div>
                  <div className="col-span-7 flex flex-col justify-center">
                    <ul className="space-y-8">
                      {slide.content.map((point, i) => (
                        <li key={i} className="flex items-start gap-6 group">
                          <div className="mt-3.5 w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.5)] shrink-0" />
                          <p className="text-3xl text-zinc-200 font-extralight leading-tight group-hover:text-white transition-colors tracking-tight">
                            {point}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {slide.type === 'service_list' && (
                <div className="h-full flex flex-col pt-12">
                    <div className="mb-12">
                        <h2 className="text-5xl font-black text-white mb-3 uppercase tracking-tighter italic">Engrenagens</h2>
                        <p className="text-xl text-zinc-400 font-light max-w-2xl italic">{slide.subtitle}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8">
                         {CATEGORIES.map(cat => {
                             const items = slide.servicesList?.filter(s => s.category === cat.id);
                             if (!items || items.length === 0) return null;
                             return (
                                 <div key={cat.id} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[32px] flex flex-col gap-6 backdrop-blur-sm transition-all hover:border-[#4ade80]/30 shadow-2xl">
                                     <div className="flex items-center gap-4 mb-2 border-b border-zinc-800 pb-5">
                                        <div className={cn("p-2 rounded-xl bg-zinc-950 border border-zinc-800 shadow-lg", 
                                            cat.id === 'growth' ? 'text-emerald-400' : 
                                            cat.id === 'branding' ? 'text-indigo-400' : 'text-zinc-400'
                                        )}>
                                            {cat.icon}
                                        </div>
                                        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-500">{cat.title}</h3>
                                     </div>
                                     <ul className="space-y-3.5">
                                         {items.map(s => (
                                             <li key={s.uniqueId} className="flex items-start gap-3 text-zinc-300">
                                                 <span className="mt-2 w-1.5 h-1.5 bg-zinc-700 rounded-full shrink-0 group-hover:bg-[#4ade80]" />
                                                 <span className="text-base font-semibold leading-snug group-hover:text-white">{s.name}</span>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             )
                         })}
                    </div>
                </div>
              )}

              {slide.type === 'budget' && (
                <div className="h-full flex flex-col pt-8">
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <h2 className="text-5xl font-black text-[#4ade80] mb-2 uppercase tracking-tighter italic">Proposta Comercial</h2>
                      <p className="text-xl text-zinc-400 font-light italic">{slide.subtitle}</p>
                    </div>
                    <div className="bg-[#4ade80] text-black px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">
                      Documento Oficial
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-[32px] backdrop-blur-md shadow-2xl flex flex-col">
                    <div className="grid grid-cols-12 gap-4 p-6 border-b border-zinc-800 bg-zinc-950/40 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-7">Módulo / Serviço</div>
                      <div className="col-span-4 text-right">Investimento (BRL)</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                      {slide.servicesList?.map((service, idx) => (
                        <div key={service.uniqueId} className="grid grid-cols-12 gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors items-center border border-transparent hover:border-zinc-800">
                          <div className="col-span-1 text-center text-zinc-600 font-mono">{String(idx + 1).padStart(2, '0')}</div>
                          <div className="col-span-7">
                            <p className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{service.name}</p>
                            <p className="text-[10px] text-zinc-500 font-light italic">{service.description}</p>
                          </div>
                          <div className="col-span-4 text-right font-mono text-lg text-white font-bold">
                            R$ {service.price || '0,00'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-8 border-t border-zinc-800 bg-zinc-950/60 flex justify-between items-center">
                      <div className="space-y-1">
                        {slide.content.map((note, i) => (
                          <p key={i} className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck className="w-3 h-3 text-[#4ade80]" /> {note}
                          </p>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em] mb-1">Investimento Total</p>
                        <p className="text-5xl font-black text-[#4ade80] tracking-tighter">
                          {/* Fix: use Intl.NumberFormat instead of toLocaleString with arguments */}
                          R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                            slide.servicesList?.reduce((acc, curr) => {
                              const val = parseFloat(curr.price?.replace(/\./g, '').replace(',', '.') || '0');
                              return acc + (isNaN(val) ? 0 : val);
                            }, 0) || 0
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.type === 'closing' && (
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <h2 className="text-8xl font-black text-white mb-10 tracking-tighter max-w-5xl leading-[0.9] uppercase italic">
                        {slide.title}
                    </h2>
                    <p className="text-3xl text-zinc-400 font-light mb-16 max-w-3xl leading-relaxed italic">
                        {slide.subtitle}
                    </p>
                    <div className="text-left bg-zinc-900/60 border border-zinc-800 p-10 rounded-[40px] min-w-[450px] shadow-2xl backdrop-blur-md">
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] mb-5 font-bold">Contato Estratégico</p>
                        <p className="text-3xl text-[#4ade80] font-mono mb-2 tracking-tighter">contato@buildongrowth.com</p>
                        <p className="text-white text-xl font-medium">Build on Growth Ecosystems</p>
                    </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-10 left-16 right-16 flex justify-between text-zinc-700 text-[11px] uppercase tracking-[0.3em] font-bold border-t border-zinc-900/50 pt-8">
              <span className="text-zinc-500">{projectName} <span className="mx-2 text-zinc-800">|</span> {clientName}</span>
              <span className="text-[#4ade80] bg-[#4ade80]/5 px-3 py-1 rounded-full border border-[#4ade80]/10">Slide {index + 1}</span>
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
          <div className="p-8 border-b border-zinc-800">
            <h1 className="text-2xl font-black italic tracking-tighter text-white">BUILD<span className="text-[#4ade80]">ON</span></h1>
            <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Ecosystem Builder</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-10 no-scrollbar">
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <h3 className="text-[10px] font-black text-zinc-500 mb-4 tracking-[0.2em] uppercase flex items-center gap-2">
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
          <header className="h-28 border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-xl flex items-center px-12 justify-between z-20">
            <div className="flex gap-10">
              <div className="w-72">
                <p className="text-[10px] font-bold text-[#4ade80] uppercase mb-2 tracking-[0.2em]">Cliente</p>
                <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-transparent text-xl font-medium border-b border-zinc-800 focus:border-[#4ade80] outline-none pb-2 text-white placeholder-zinc-800 transition-all" placeholder="Nome da empresa..." />
              </div>
              <div className="w-72">
                <p className="text-[10px] font-bold text-[#4ade80] uppercase mb-2 tracking-[0.2em]">Projeto</p>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-transparent text-xl font-medium border-b border-zinc-800 focus:border-[#4ade80] outline-none pb-2 text-white placeholder-zinc-800 transition-all" placeholder="Nome do projeto..." />
              </div>
            </div>
            
            <div className="flex items-center gap-5">
                <button onClick={handleOpenBudget} disabled={cartItems.length === 0} className="flex items-center gap-2 px-5 py-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all disabled:opacity-20" title="Definir valores">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Orçamento</span>
                </button>
                <button onClick={handleGeneratePresentation} disabled={cartItems.length === 0} className="group relative bg-[#4ade80] text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-[#3ecf70] transition-all hover:scale-105 shadow-[0_0_30px_rgba(74,222,128,0.2)] disabled:opacity-20">
                    <Sparkles className="w-5 h-5" />
                    Gerar Ecossistema
                </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-16 relative z-0 no-scrollbar">
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
