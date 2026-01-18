import PptxGenJS from "pptxgenjs";
import { PresentationData, SelectedService } from "../types";
import { CATEGORIES } from "../constants";

export const downloadPPT = (data: PresentationData, clientName: string) => {
  const pres = new PptxGenJS();
  
  // 16:9 Aspect Ratio
  pres.layout = "LAYOUT_16x9";
  
  // Theme Variables
  const BG_COLOR = "09090b";
  const TEXT_COLOR = "FFFFFF";
  const ACCENT_COLOR = "4ade80";
  const SUBTEXT_COLOR = "a1a1aa";
  const BORDER_COLOR = "27272a";
  const CARD_BG = "18181b";

  // Master Slide Definition
  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: BG_COLOR },
    objects: [
      { text: { text: "BUILD ON GROWTH", options: { x: 0.5, y: 0.3, fontSize: 14, color: TEXT_COLOR, bold: true, fontFace: "Arial Black" } } },
      { rect: { x: 0.5, y: 0.55, w: 1.5, h: 0.05, fill: { color: ACCENT_COLOR } } }
    ]
  });

  data.slides.forEach((slide, index) => {
    // We don't export the budget configuration slide
    if (slide.type === 'budget') return;

    const s = pres.addSlide({ masterName: "MASTER_SLIDE" });

    // Slide Number & Context Footer
    s.addText(`${clientName.toUpperCase()} | PROPOSTA ESTRATÉGICA`, {
      x: 0.5, y: "93%", w: "60%", fontSize: 9, color: SUBTEXT_COLOR, align: "left", fontFace: "Arial", bold: true
    });
    s.addText(`SLIDE ${index + 1}`, {
      x: "85%", y: "92%", w: "10%", fontSize: 9, color: ACCENT_COLOR, align: "right", fontFace: "Arial", bold: true
    });

    // --- COVER SLIDE ---
    if (slide.type === 'cover') {
      s.addText("PROPOSTA ESTRATÉGICA", { 
        x: 0.6, y: 1.8, fontSize: 11, color: ACCENT_COLOR, bold: true, charSpacing: 4, fontFace: "Arial" 
      });
      s.addText("ECOSSISTEMA", { 
        x: 0.5, y: 2.3, w: 9.0, fontSize: 64, color: TEXT_COLOR, bold: true, align: "left", fontFace: "Arial Black", italic: true
      });
      s.addText("DE GROWTH", { 
        x: 0.5, y: 3.2, w: 9.0, fontSize: 64, color: SUBTEXT_COLOR, bold: true, align: "left", fontFace: "Arial Black", italic: true
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, { 
          x: 0.8, y: 4.5, w: 6.5, fontSize: 18, color: SUBTEXT_COLOR, align: "left", italic: true, fontFace: "Arial"
        });
        s.addShape(pres.ShapeType.line, { 
          x: 0.6, y: 4.5, w: 0, h: 0.8, line: { color: ACCENT_COLOR, width: 4 } 
        });
      }
    } 
    
    // --- CONTENT SLIDE ---
    else if (slide.type === 'content') {
      // Left Column (Title)
      s.addText(slide.title, {
        x: 0.5, y: 1.5, w: 3.2, fontSize: 28, color: ACCENT_COLOR, bold: true, fontFace: "Arial Black", italic: true
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 2.8, w: 3.2, fontSize: 13, color: SUBTEXT_COLOR, italic: true
        });
      }
      
      // Vertical Separator
      s.addShape(pres.ShapeType.line, { 
        x: 4.2, y: 1.2, w: 0, h: 4.2, line: { color: BORDER_COLOR, width: 1.5 } 
      });

      // Right Column (List Items)
      slide.content.forEach((point, i) => {
        s.addText(point, {
          x: 4.6, y: 1.5 + (i * 0.8), w: 4.8, fontSize: 16, color: TEXT_COLOR, fontFace: "Arial",
          bullet: { code: "25CF" } // Solid Circle
        });
      });
    }

    // --- SERVICE LIST (ECOSYSTEM GEARS) ---
    else if (slide.type === 'service_list') {
      s.addText("ENGRENAGENS", { 
        x: 0.5, y: 0.8, fontSize: 24, color: TEXT_COLOR, bold: true, fontFace: "Arial Black", italic: true 
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, { 
          x: 0.5, y: 1.25, fontSize: 12, color: SUBTEXT_COLOR, italic: true 
        });
      }

      let colX = 0.5;
      const colWidth = 2.9;
      
      CATEGORIES.forEach(cat => {
        const items = slide.servicesList?.filter(i => i.category === cat.id);
        if (items && items.length > 0) {
            // Category Box Header
            s.addShape(pres.ShapeType.rect, { 
              x: colX, y: 1.8, w: colWidth, h: 0.4, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 } 
            });
            s.addText(cat.title, { 
              x: colX, y: 1.8, w: colWidth, h: 0.4, fontSize: 9, color: ACCENT_COLOR, bold: true, align: "center", valign: "middle", charSpacing: 2
            });
            
            // Service items list
            items.forEach((item, k) => {
                s.addText(item.name, { 
                  x: colX + 0.1, y: 2.35 + (k * 0.4), w: colWidth - 0.2, fontSize: 10, color: TEXT_COLOR, fontFace: "Arial", bold: true,
                  bullet: { code: "25AA" } // Small Square
                });
            });
            colX += 3.15; // Shift to next column
        }
      });
    }

    // --- CLOSING SLIDE ---
    else if (slide.type === 'closing') {
        s.addText(slide.title, { 
          x: 1.0, y: 2.2, w: "80%", fontSize: 38, color: TEXT_COLOR, bold: true, align: "center", fontFace: "Arial Black", italic: true 
        });
        if(slide.subtitle) {
            s.addText(slide.subtitle, { 
              x: 2.0, y: 3.5, w: "60%", fontSize: 16, color: SUBTEXT_COLOR, align: "center", italic: true 
            });
        }
        
        // Contact Card in PPT
        s.addShape(pres.ShapeType.rect, { 
          x: 3.4, y: 4.8, w: 3.2, h: 1.0, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 2 } 
        });
        s.addText("CONTATO ESTRATÉGICO", { 
          x: 3.4, y: 5.0, w: 3.2, fontSize: 8, color: SUBTEXT_COLOR, align: "center", bold: true, charSpacing: 3 
        });
        s.addText("contato@buildongrowth.com", { 
          x: 3.4, y: 5.35, w: 3.2, fontSize: 13, color: ACCENT_COLOR, align: "center", fontFace: "Courier New" 
        });
    }
  });

  // Export File
  const fileName = `ECOSSISTEMA_${clientName.replace(/\s+/g, '_').toUpperCase() || 'GROWTH'}.pptx`;
  pres.writeFile({ fileName });
};