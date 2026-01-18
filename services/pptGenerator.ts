
import PptxGenJS from "pptxgenjs";
import { PresentationData, SelectedService } from "../types";
import { CATEGORIES } from "../constants";

export const downloadPPT = (data: PresentationData, clientName: string) => {
  const pres = new PptxGenJS();
  
  pres.layout = "LAYOUT_16x9";
  
  const BG_COLOR = "09090b";
  const TEXT_COLOR = "FFFFFF";
  const ACCENT_COLOR = "4ade80";
  const SUBTEXT_COLOR = "a1a1aa";
  const BORDER_COLOR = "27272a";

  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: BG_COLOR },
    objects: [
      { text: { text: "BUILD ON GROWTH", options: { x: 0.5, y: 0.3, fontSize: 14, color: TEXT_COLOR, bold: true, fontFace: "Arial" } } },
      { rect: { x: 0.5, y: 0.55, w: 1.5, h: 0.05, fill: { color: ACCENT_COLOR } } }
    ]
  });

  data.slides.forEach((slide, index) => {
    if (slide.type === 'budget') return;

    const s = pres.addSlide({ masterName: "MASTER_SLIDE" });

    s.addText(`${clientName} | Slide ${index + 1}`, {
      x: 0.5, y: "92%", w: "90%", fontSize: 10, color: SUBTEXT_COLOR, align: "center", fontFace: "Arial"
    });

    if (slide.type === 'cover') {
      s.addText("PROPOSTA ESTRATÉGICA", { x: 0.5, y: 2.0, fontSize: 10, color: ACCENT_COLOR, bold: true, charSpacing: 3 });
      s.addText(slide.title, { x: 0.5, y: 2.5, w: 8.5, fontSize: 40, color: TEXT_COLOR, bold: true, align: "left", fontFace: "Arial Black" });
      if (slide.subtitle) {
        s.addText(slide.subtitle, { x: 0.5, y: 4.0, w: 8.0, fontSize: 18, color: SUBTEXT_COLOR, align: "left" });
        // Fix: Use ShapeType on the instance
        s.addShape(pres.ShapeType.line, { x: 0.4, y: 4.0, w: 0, h: 0.7, line: { color: ACCENT_COLOR, width: 3 } });
      }
    } 
    
    else if (slide.type === 'content') {
      // Ajuste de largura do título para evitar invasão na coluna da direita
      s.addText(slide.title, {
        x: 0.5, y: 1.2, w: 3.5,
        fontSize: 24, color: ACCENT_COLOR, bold: true, fontFace: "Arial Black"
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 2.3, w: 3.5,
          fontSize: 13, color: SUBTEXT_COLOR
        });
      }
      
      // Fix: Use ShapeType on the instance
      s.addShape(pres.ShapeType.line, { x: 4.5, y: 1.5, w: 0, h: 4.0, line: { color: BORDER_COLOR, width: 1 } });

      slide.content.forEach((point, i) => {
        s.addText(point, {
          x: 4.9, y: 1.5 + (i * 0.8), w: 4.8,
          fontSize: 15, color: TEXT_COLOR, 
          // Fix: color property is not allowed inside bullet object, bullets inherit text color
          bullet: { code: "2022" }
        });
      });
    }

    else if (slide.type === 'service_list') {
      s.addText(slide.title, { x: 0.5, y: 0.8, fontSize: 22, color: TEXT_COLOR, bold: true, fontFace: "Arial Black" });
      if (slide.subtitle) s.addText(slide.subtitle, { x: 0.5, y: 1.25, fontSize: 11, color: SUBTEXT_COLOR });

      let colX = 0.5;
      const colWidth = 2.8;
      
      CATEGORIES.forEach(cat => {
        const items = slide.servicesList?.filter(i => i.category === cat.id);
        if (items && items.length > 0) {
            // Fix: Use ShapeType on the instance
            s.addShape(pres.ShapeType.rect, { x: colX, y: 1.7, w: colWidth, h: 0.35, fill: { color: "18181b" }, line: { color: BORDER_COLOR } });
            s.addText(cat.title, { x: colX, y: 1.7, w: colWidth, h: 0.35, fontSize: 9, color: ACCENT_COLOR, bold: true, align: "center", valign: "middle" });
            
            items.forEach((item, k) => {
                // Fix: color property is not allowed inside bullet object, using text color for bullet
                s.addText(item.name, { x: colX, y: 2.2 + (k * 0.35), w: colWidth, fontSize: 9, color: TEXT_COLOR, bullet: { code: "25AA" } });
            });
            colX += 3.1;
        }
      });
    }

    else if (slide.type === 'closing') {
        s.addText(slide.title, { x: 1.0, y: 2.3, w: "80%", fontSize: 32, color: TEXT_COLOR, bold: true, align: "center", fontFace: "Arial Black" });
        if(slide.subtitle) {
            s.addText(slide.subtitle, { x: 2.0, y: 3.5, w: "60%", fontSize: 14, color: SUBTEXT_COLOR, align: "center" });
        }
        
        // Fix: Use ShapeType on the instance
        s.addShape(pres.ShapeType.rect, { x: 3.5, y: 4.8, w: 3.0, h: 1.0, fill: { color: "18181b" }, line: { color: BORDER_COLOR } });
        s.addText("CONTATO DIRETO", { x: 3.5, y: 4.95, w: 3.0, fontSize: 8, color: SUBTEXT_COLOR, align: "center", bold: true });
        s.addText("contato@buildongrowth.com", { x: 3.5, y: 5.3, w: 3.0, fontSize: 11, color: ACCENT_COLOR, align: "center" });
    }
  });

  pres.writeFile({ fileName: `BuildOnGrowth_${clientName.replace(/\s+/g, '_') || 'Ecosystem'}.pptx` });
};
