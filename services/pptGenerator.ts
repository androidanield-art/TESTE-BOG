import PptxGenJS from "pptxgenjs";
import { PresentationData } from "../types";
import { CATEGORIES } from "../constants";

export const downloadPPT = (data: PresentationData, clientName: string) => {
  const pres = new PptxGenJS();
  
  pres.layout = "LAYOUT_16x9";
  
  const BG_COLOR = "09090b";
  const TEXT_COLOR = "FFFFFF";
  const ACCENT_COLOR = "74fbae";
  const SUBTEXT_COLOR = "a1a1aa";
  const BORDER_COLOR = "27272a";
  const CARD_BG = "121214";

  // Master Slide Definition
  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: BG_COLOR },
    objects: [
      { rect: { x: 0.4, y: 0.4, w: 1.2, h: 0.03, fill: { color: ACCENT_COLOR } } },
      { text: { text: "BUILD ON GROWTH", options: { x: 0.4, y: 0.15, fontSize: 10, color: SUBTEXT_COLOR, bold: true, fontFace: "Inter", charSpacing: 2 } } }
    ]
  });

  data.slides.forEach((slide, index) => {
    const s = pres.addSlide({ masterName: "MASTER_SLIDE" });

    // Footer Info
    s.addText(`${clientName.toUpperCase()} // ECOSSISTEMA ESTRATÉGICO`, {
      x: 0.4, y: "93%", w: "60%", fontSize: 8, color: SUBTEXT_COLOR, align: "left", fontFace: "Inter", bold: true, charSpacing: 1
    });

    if (slide.type === 'cover') {
      // Background Accent Blur (Approximation)
      s.addShape(pres.ShapeType.ellipse, { x: 7.0, y: -1.0, w: 4.0, h: 4.0, fill: { color: ACCENT_COLOR, transparency: 90 } });
      
      s.addText("ESTRATÉGIA DE CRESCIMENTO", { x: 0.5, y: 2.0, fontSize: 12, color: ACCENT_COLOR, bold: true, charSpacing: 5, fontFace: "Inter" });
      s.addText("ECOSSISTEMA", { 
        x: 0.4, y: 2.4, w: 9.0, fontSize: 72, color: TEXT_COLOR, bold: true, fontFace: "Impact", italic: true 
      });
      s.addText("DE GROWTH", { 
        x: 0.4, y: 3.4, w: 9.0, fontSize: 72, color: SUBTEXT_COLOR, bold: true, fontFace: "Impact", italic: true 
      });
      
      if (slide.subtitle) {
        s.addShape(pres.ShapeType.line, { x: 0.5, y: 4.8, w: 0, h: 0.8, line: { color: ACCENT_COLOR, width: 3 } });
        s.addText(slide.subtitle, { x: 0.7, y: 4.8, w: 6.0, fontSize: 18, color: SUBTEXT_COLOR, italic: true, fontFace: "Inter" });
      }
    } 
    
    else if (slide.type === 'content') {
      s.addText(slide.title, { 
        x: 0.5, y: 1.5, w: 3.5, fontSize: 32, color: ACCENT_COLOR, bold: true, fontFace: "Impact", italic: true, lineSpacing: 28 
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, { x: 0.5, y: 3.2, w: 3.5, fontSize: 14, color: SUBTEXT_COLOR, italic: true, fontFace: "Inter" });
      }
      
      s.addShape(pres.ShapeType.line, { x: 4.2, y: 1.2, w: 0, h: 4.2, line: { color: BORDER_COLOR, width: 1 } });
      
      slide.content.forEach((point, i) => {
        const yPos = 1.5 + (i * 0.9);
        // Manual Bullet to match web design perfectly (Green circle)
        s.addShape(pres.ShapeType.ellipse, { x: 4.45, y: yPos + 0.12, w: 0.08, h: 0.08, fill: { color: ACCENT_COLOR } });
        s.addText(point, { 
          x: 4.65, y: yPos, w: 5.0, fontSize: 18, color: TEXT_COLOR, fontFace: "Inter" 
        });
      });
    }

    else if (slide.type === 'service_list') {
      s.addText("A ARQUITETURA DO ECOSSISTEMA", { x: 0.5, y: 0.8, fontSize: 28, color: TEXT_COLOR, bold: true, fontFace: "Impact", italic: true });
      
      let colX = 0.5;
      const categoriesToRender = CATEGORIES.filter(cat => slide.servicesList?.some(i => i.category === cat.id));
      const colWidth = 9.0 / Math.max(categoriesToRender.length, 1);

      categoriesToRender.forEach(cat => {
        const items = slide.servicesList?.filter(i => i.category === cat.id);
        if (items && items.length > 0) {
            // Category Header Box
            s.addShape(pres.ShapeType.rect, { x: colX, y: 1.8, w: colWidth - 0.2, h: 0.4, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 } });
            s.addText(cat.title, { 
              x: colX, y: 1.8, w: colWidth - 0.2, h: 0.4, fontSize: 9, color: ACCENT_COLOR, bold: true, align: "center", valign: "middle", fontFace: "Inter" 
            });
            
            items.forEach((item, k) => {
                const itemY = 2.4 + (k * 0.45);
                s.addShape(pres.ShapeType.ellipse, { x: colX + 0.05, y: itemY + 0.08, w: 0.04, h: 0.04, fill: { color: ACCENT_COLOR } });
                s.addText(item.name, { 
                  x: colX + 0.15, y: itemY, w: colWidth - 0.4, fontSize: 11, color: TEXT_COLOR, bold: true, fontFace: "Inter" 
                });
            });
            colX += colWidth;
        }
      });
    }

    else if (slide.type === 'closing') {
        s.addText(slide.title, { 
          x: 1.0, y: 2.2, w: "80%", fontSize: 48, color: TEXT_COLOR, bold: true, align: "center", fontFace: "Impact", italic: true, charSpacing: 2 
        });
        s.addText(slide.subtitle || "", { x: 1.0, y: 3.8, w: "80%", fontSize: 20, color: SUBTEXT_COLOR, align: "center", fontFace: "Inter", italic: true });
        
        s.addShape(pres.ShapeType.rect, { x: 3.5, y: 5.2, w: 3.0, h: 0.8, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 }, rectRadius: 0.2 });
        s.addText("contato@buildongrowth.com", { 
          x: 3.5, y: 5.2, w: 3.0, h: 0.8, fontSize: 14, color: ACCENT_COLOR, align: "center", valign: "middle", fontFace: "Courier New", bold: true 
        });
    }
  });

  pres.writeFile({ fileName: `ESTRATEGIA_${clientName.replace(/\s+/g, '_').toUpperCase()}.pptx` });
};