import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  useDraggable,
  useDroppable,
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
import { generatePresentationContent } from './services/geminiService';
import { Plus, Trash2, Sparkles, GripVertical, CheckCircle2, LayoutTemplate, Printer, ArrowLeft, Edit3, Save, Rocket, Palette, Cpu, BrainCircuit } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ service, isOverlay = false }: { service: ServiceItem; isOverlay?: boolean }) => {
  return (
    <div
      className={cn(
        "group relative flex items-center justify-between p-3 mb-2 bg-white border border-zinc-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-black transition-all shadow-sm",
        isOverlay && "shadow-xl rotate-2 scale-105 border-black z-50 cursor-grabbing"
      )}
    >
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-black">{service.name}</h4>
        <p className="text-xs text-zinc-500 line-clamp-1">{service.description}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus className="w-4 h-4 text-zinc-400" />
      </div>
    </div>
  );
};

interface SortableCanvasItemProps {
  service: SelectedService;
  onRemove: (id: string) => void;
}
const SortableCanvasItem: React.FC<SortableCanvasItemProps> = ({
  service,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.uniqueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const category = CATEGORIES.find((c) => c.id === service.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-start gap-3 p-4 bg-white border border-zinc-200 rounded-xl shadow-sm mb-3 group transition-all",
        isDragging && "opacity-30",
        "hover:shadow-md hover:border-zinc-300"
      )}
    >
      <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("w-2 h-2 rounded-full", category?.color.split(' ')[0])}></span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
            {category?.title}
          </span>
        </div>
        <h3 className="text-base font-bold text-zinc-900">{service.name}</h3>
        <p className="text-sm text-zinc-500">{service.description}</p>
      </div>

      <button
        onClick={() => onRemove(service.uniqueId)}
        className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

interface DraggableSidebarItemProps { 
  service: ServiceItem; 
  onAdd: () => void; 
}
const DraggableSidebarItem: React.FC<DraggableSidebarItemProps> = ({ service, onAdd }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: service.id,
    data: { service }
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={cn("touch-none", isDragging && "opacity-50")}>
       <div
          className="group relative flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg cursor-grab hover:border-black hover:shadow-md transition-all"
          onClick={() => onAdd()}
        >
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-black">{service.name}</h4>
          </div>
          <Plus className="w-4 h-4 text-zinc-300 group-hover:text-black" />
        </div>
    </div>
  );
}

interface DroppableCanvasProps { 
  items: SelectedService[]; 
  onRemove: (id: string) => void; 
}
const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ items, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "flex-1 p-8 overflow-y-auto transition-colors duration-300",
        isOver ? "bg-zinc-100/50" : ""
      )}
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center">
           <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-12 flex flex-col items-center max-w-md text-center bg-white/50">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                <Plus className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">Construa seu Sistema</h3>
              <p className="text-zinc-500">
                Arraste os serviços da esquerda para cá. O PDF gerado será baseado na combinação exata que você criar.
              </p>
           </div>
        </div>
      ) : (
        <SortableContext 
          items={items.map(i => i.uniqueId)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="max-w-4xl mx-auto space-y-4 pb-20">
            {items.map((item) => (
               <SortableCanvasItem key={item.uniqueId} service={item} onRemove={onRemove} />
            ))}
            
            <div className="mt-8 pt-8 border-t border-dashed border-zinc-300 flex justify-center text-zinc-500">
               <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-100">
                 <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
                 <span className="font-medium">Pacote pronto para gerar apresentação</span>
               </div>
            </div>
          </div>
        </SortableContext>
      )}
    </div>
  );
}

// --- Presentation Components & Logic ---

interface PresentationViewProps {
  data: PresentationData;
  clientName: string;
  projectName: string;
  onClose: () => void;
  onUpdateData: (newData: PresentationData) => void;
}

const PresentationView: React.FC<PresentationViewProps> = ({ data, clientName, projectName, onClose, onUpdateData }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handlePrint = () => {
    setIsEditing(false); // Force view mode before print
    setTimeout(() => {
        window.print();
    }, 100);
  };

  const updateSlide = (slideIndex: number, field: keyof PresentationSlide, value: any) => {
    const newSlides = [...data.slides];
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      [field]: value
    };
    onUpdateData({ ...data, slides: newSlides });
  };

  const updateContent = (slideIndex: number, contentIndex: number, value: string) => {
    const newSlides = [...data.slides];
    const newContent = [...newSlides[slideIndex].content];
    newContent[contentIndex] = value;
    newSlides[slideIndex].content = newContent;
    onUpdateData({ ...data, slides: newSlides });
  };

  const BrandLogo = () => (
    <div className="flex items-center text-2xl tracking-tight select-none">
      <span className="font-normal text-white">Build</span>
      <span className="font-bold text-white ml-1">on</span>
      <span className="font-bold text-[#4ade80] ml-1 bg-white/5 px-2 py-0.5 rounded">Growth</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto print:overflow-visible font-sans animate-in fade-in duration-300">
      
      {/* UI Controls - Hidden on Print */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none print:hidden">
         <div className="pointer-events-auto">
            <button onClick={onClose} className="flex items-center gap-2 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 backdrop-blur px-4 py-2 rounded-full transition-all border border-white/10">
               <ArrowLeft className="w-4 h-4" />
               Voltar
            </button>
         </div>
         <div className="pointer-events-auto flex gap-4">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg backdrop-blur border",
                isEditing 
                  ? "bg-white text-black border-white hover:bg-zinc-200"
                  : "bg-black/50 text-white border-white/20 hover:bg-black/80 hover:border-white/50"
              )}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? "Salvar Edições" : "Editar Conteúdo"}
            </button>

            <button 
              onClick={handlePrint}
              disabled={isEditing}
              className="flex items-center gap-2 bg-[#4ade80] text-black px-6 py-3 rounded-full font-bold hover:bg-[#22c55e] transition-all shadow-lg hover:shadow-[#4ade80]/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
         </div>
      </div>

      {/* Presentation Container */}
      <div className="max-w-[297mm] mx-auto min-h-screen bg-zinc-950 print:block">
        <style>
          {`
            @media print {
              @page {
                size: landscape;
                margin: 0;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background-color: #09090b !important; 
              }
              ::-webkit-scrollbar { display: none; }
            }
          `}
        </style>

        {data.slides.map((slide, index) => (
          <div 
            key={slide.id || index} 
            className="relative w-full aspect-[16/9] bg-zinc-950 text-white flex flex-col p-16 print:break-after-always print:h-screen print:w-screen print:page-break-after-always overflow-hidden border-b border-zinc-900 print:border-none"
          >
            {/* Header */}
            <div className="absolute top-12 left-16">
               <BrandLogo />
            </div>

            {/* Footer */}
            <div className="absolute bottom-12 left-16 right-16 flex justify-between items-end border-t border-zinc-800 pt-4 text-zinc-500 text-xs uppercase tracking-widest font-semibold">
               <div>
                  <p className="text-white mb-1">{projectName}</p>
                  <p>{clientName}</p>
               </div>
               <div>
                  {index + 1} / {data.slides.length}
               </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 flex flex-col justify-center mt-8">
               
               {slide.type === 'cover' && (
                 <div className="max-w-4xl">
                    {isEditing ? (
                        <textarea
                            value={slide.title}
                            onChange={(e) => updateSlide(index, 'title', e.target.value)}
                            className="w-full text-7xl font-bold leading-tight tracking-tight mb-8 bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-[#4ade80] resize-none"
                            rows={2}
                        />
                    ) : (
                        <h1 className="text-7xl font-bold leading-tight tracking-tight mb-8 text-white">
                            {slide.title}
                        </h1>
                    )}
                    
                    {isEditing ? (
                         <textarea
                            value={slide.subtitle}
                            onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                            className="w-full text-3xl font-light leading-relaxed bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 text-[#4ade80] focus:outline-none focus:border-[#4ade80] resize-none"
                            rows={2}
                        />
                    ) : (
                        slide.subtitle && (
                            <p className="text-3xl text-[#4ade80] font-light max-w-2xl leading-relaxed">
                                {slide.subtitle}
                            </p>
                        )
                    )}
                    <div className="mt-16 inline-flex items-center gap-3 px-4 py-2 border border-zinc-800 rounded-full text-zinc-400 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></div>
                      Apresentação Estratégica
                    </div>
                 </div>
               )}

               {(slide.type === 'content' || slide.type === 'closing') && (
                 <div className="grid grid-cols-12 gap-12 h-full mt-16">
                    <div className="col-span-4 border-r border-zinc-800 pr-12">
                       {isEditing ? (
                          <textarea
                             value={slide.title}
                             onChange={(e) => updateSlide(index, 'title', e.target.value)}
                             className="w-full text-5xl font-bold text-[#4ade80] leading-none mb-6 bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-[#4ade80] resize-none"
                             rows={2}
                          />
                       ) : (
                          <h2 className="text-5xl font-bold text-[#4ade80] leading-none mb-6">
                            {slide.title}
                          </h2>
                       )}
                       
                       {isEditing ? (
                          <textarea
                             value={slide.subtitle}
                             onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                             className="w-full text-xl text-zinc-400 leading-relaxed bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-[#4ade80] resize-none"
                             rows={4}
                          />
                       ) : (
                          slide.subtitle && (
                            <p className="text-xl text-zinc-400 leading-relaxed">
                              {slide.subtitle}
                            </p>
                          )
                       )}
                    </div>
                    <div className="col-span-8 flex flex-col justify-center pl-4">
                       <ul className="space-y-8">
                         {slide.content.map((point, i) => (
                           <li key={i} className="flex items-start gap-6 group">
                              <span className="mt-2 w-3 h-3 min-w-[12px] rounded-sm bg-zinc-800 group-hover:bg-[#4ade80] transition-colors duration-500" />
                              {isEditing ? (
                                <textarea
                                  value={point}
                                  onChange={(e) => updateContent(index, i, e.target.value)}
                                  className="w-full text-2xl bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-[#4ade80] resize-none"
                                  rows={2}
                                />
                              ) : (
                                <p className="text-2xl text-zinc-200 font-light leading-relaxed group-hover:text-white transition-colors duration-300">
                                    {point}
                                </p>
                              )}
                           </li>
                         ))}
                       </ul>
                    </div>
                 </div>
               )}

               {slide.type === 'service_list' && (
                 <div className="h-full flex flex-col mt-4">
                    <div className="mb-8">
                       <h2 className="text-4xl font-bold text-white mb-2">Escopo do Projeto</h2>
                       <p className="text-zinc-500">Serviços selecionados para construção do sistema.</p>
                    </div>
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                        {slide.servicesList?.map((s) => {
                             const cat = CATEGORIES.find(c => c.id === s.category);
                             const Icon = cat?.icon as any || Rocket; // Fallback icon handling if needed, though raw ReactNodes are tricky to re-render from pure data sometimes. We'll reuse the category lookup.
                             
                             return (
                                <div key={s.uniqueId} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className={cn("p-1.5 rounded-md", cat?.color)}>
                                            {/* Render Icon logic: since we don't store the component in JSON, look it up */}
                                            {cat?.id === 'growth' && <Rocket className="w-4 h-4" />}
                                            {cat?.id === 'branding' && <Palette className="w-4 h-4" />}
                                            {cat?.id === 'tech' && <Cpu className="w-4 h-4" />}
                                            {cat?.id === 'strategy' && <BrainCircuit className="w-4 h-4" />}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                            {cat?.title.split(' ')[0]}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-white leading-tight">{s.name}</h3>
                                    <p className="text-sm text-zinc-400 line-clamp-2">{s.description}</p>
                                </div>
                             )
                        })}
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


// --- Main App ---

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<ServiceItem | null>(null);
  
  // Inputs
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');

  // Right side state (Canvas)
  const [cartItems, setCartItems] = useState<SelectedService[]>([]);
  
  // Proposal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find if it's a sidebar item
    const sidebarItem = SERVICES.find(s => s.id === active.id);
    if (sidebarItem) {
      setActiveDragItem(sidebarItem);
      return;
    }

    // Find if it's a cart item
    const cartItem = cartItems.find(s => s.uniqueId === active.id);
    if (cartItem) {
      setActiveDragItem(cartItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragItem(null);

    if (!over) return;

    // Dropping a Sidebar Item into the Canvas
    if (SERVICES.find(s => s.id === active.id) && over.id === 'canvas-droppable') {
      const serviceToAdd = SERVICES.find(s => s.id === active.id);
      if (serviceToAdd) {
        addServiceToCart(serviceToAdd);
      }
      return;
    }

    // Reordering Items in Canvas
    if (active.id !== over.id) {
      setCartItems((items) => {
        const oldIndex = items.findIndex((item) => item.uniqueId === active.id);
        const newIndex = items.findIndex((item) => item.uniqueId === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addServiceToCart = (service: ServiceItem) => {
    const newItem: SelectedService = {
      ...service,
      uniqueId: `${service.id}-${Date.now()}`
    };
    setCartItems((prev) => [...prev, newItem]);
  };

  const removeServiceFromCart = (uniqueId: string) => {
    setCartItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  // --- Generation Logic ---
  const handleGeneratePresentation = async () => {
    if (cartItems.length === 0) return;
    if (!clientName || !projectName) {
      alert("Por favor, preencha o nome do cliente e do projeto.");
      return;
    }
    
    setIsGenerating(true);

    try {
      const data = await generatePresentationContent(cartItems, clientName, projectName);
      if (!data) {
        throw new Error("Dados não foram gerados corretamente.");
      }
      
      // Programmatically append the Service List Slide
      const serviceSlide: PresentationSlide = {
        id: 'scope-slide',
        type: 'service_list',
        title: 'Escopo do Projeto',
        content: [],
        servicesList: cartItems
      };

      setPresentationData({
        ...data,
        slides: [...data.slides, serviceSlide]
      });
      setShowPresentation(true);
    } catch (e: any) {
      console.error(e);
      alert(`Erro: ${e.message}\n\nVerifique o console (F12) para mais detalhes.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-screen w-full bg-zinc-50 text-zinc-900 overflow-hidden font-sans">
          
          {/* LEFT SIDEBAR */}
          <aside className="w-[360px] flex flex-col border-r border-zinc-200 bg-white h-full shadow-lg z-10 shrink-0">
            <div className="p-6 border-b border-zinc-100">
              <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
                <LayoutTemplate className="w-6 h-6" />
                Service Builder
              </h1>
              <p className="text-xs text-zinc-500 mt-2">
                Arraste os serviços para montar a proposta.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-3 px-1 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b border-dashed border-zinc-100">
                    <div className={cn("p-1.5 rounded-md", category.color)}>
                      {category.icon}
                    </div>
                    <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-800">
                      {category.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-2">
                    {SERVICES.filter(s => s.category === category.id).map((service) => (
                      <DraggableSidebarItem key={service.id} service={service} onAdd={() => addServiceToCart(service)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* RIGHT SIDEBAR: Canvas / Workspace */}
          <main className="flex-1 flex flex-col h-full relative bg-zinc-50">
            
            {/* Canvas Header */}
            <header className="h-auto py-4 border-b border-zinc-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between px-8 gap-4 shadow-sm z-20">
              
              <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Cliente</label>
                  <input 
                    type="text" 
                    placeholder="Nome da Empresa/Cliente"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Projeto</label>
                  <input 
                    type="text" 
                    placeholder="Nome do Projeto (Ex: Growth 360)"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-zinc-900">{cartItems.length} serviços</p>
                    <p className="text-xs text-zinc-500">selecionados</p>
                </div>

                <button
                  onClick={handleGeneratePresentation}
                  disabled={cartItems.length === 0 || isGenerating || !clientName || !projectName}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md",
                    (cartItems.length === 0 || !clientName || !projectName)
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-zinc-800 hover:scale-105 active:scale-95"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-[#4ade80]" />
                      <span className="text-[#4ade80]">Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Apresentação
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Drop Zone */}
            <div className="flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden flex flex-col">
              <DroppableCanvas items={cartItems} onRemove={removeServiceFromCart} />
            </div>

          </main>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragItem ? (
            <SidebarItem service={activeDragItem} isOverlay />
          ) : null}
        </DragOverlay>

      </DndContext>

      {/* Full Screen Presentation Overlay */}
      {showPresentation && presentationData && (
        <PresentationView 
          data={presentationData} 
          clientName={clientName}
          projectName={projectName}
          onClose={() => setShowPresentation(false)} 
          onUpdateData={setPresentationData}
        />
      )}
    </>
  );
}