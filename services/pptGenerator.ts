import PptxGenJS from "pptxgenjs";
import { PresentationData, SelectedService } from "../types";
import { CATEGORIES } from "../constants";

export const downloadPPT = (data: PresentationData, clientName: string) => {
  const pres = new PptxGenJS();
  
  // Set Slide Layout
  pres.layout = "LAYOUT_16x9";
  
  // Define colors to match the Dark Web UI
  const BG_COLOR = "09090b"; // Zinc 950
  const TEXT_COLOR = "FFFFFF";
  const ACCENT_COLOR = "4ade80"; // Neon Green
  const SUBTEXT_COLOR = "a1a1aa"; // Zinc 400
  const BORDER_COLOR = "27272a"; // Zinc 800

  // Common background for all slides
  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: BG_COLOR },
    objects: [
      // Logo text
      {
        text: { 
          text: "BUILD ON GROWTH", 
          options: { x: 0.5, y: 0.3, fontSize: 14, color: TEXT_COLOR, bold: true, fontFace: "Arial" } 
        }
      },
      // Green accent line
      {
        rect: { x: 0.5, y: 0.55, w: 1.5, h: 0.05, fill: { color: ACCENT_COLOR } } 
      }
    ]
  });

  data.slides.forEach((slide, index) => {
    // Skip budget slide if it somehow exists in data (redundant safety)
    if (slide.type === 'budget') return;

    const s = pres.addSlide({ masterName: "MASTER_SLIDE" });

    // Footer with Page Number
    s.addText(`${clientName} | Slide ${index + 1}`, {
      x: 0.5,
      y: "92%",
      w: "90%",
      fontSize: 10,
      color: SUBTEXT_COLOR,
      align: "center",
      fontFace: "Arial"
    });

    // --- SLIDE TYPE: COVER ---
    if (slide.type === 'cover') {
      s.addText("PROPOSTA ESTRATÉGICA", {
        x: 0.5, y: 2.0, fontSize: 10, color: ACCENT_COLOR, bold: true, charSpacing: 3
      });
      s.addText(slide.title, {
        x: 0.5, y: 2.5, w: 9.0, // Expanded width
        fontSize: 44, color: TEXT_COLOR, bold: true, align: "left", fontFace: "Arial Black"
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 4.2, w: 8.5, // Expanded width
          fontSize: 20, color: SUBTEXT_COLOR, align: "left"
        });
        // Decorative side line
        s.addShape(pres.shapes.LINE, {
            x: 0.4, y: 4.2, w: 0, h: 0.8, line: { color: ACCENT_COLOR, width: 3 }
        });
      }
    } 
    
    // --- SLIDE TYPE: CONTENT ---
    else if (slide.type === 'content') {
      s.addText(slide.title, {
        x: 0.5, y: 1.2, w: 4.0, // Fixed width for left column
        fontSize: 28, color: ACCENT_COLOR, bold: true, fontFace: "Arial Black"
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 2.5, w: 4.0, // Fixed width
          fontSize: 14, color: SUBTEXT_COLOR
        });
      }
      
      // Vertical separator line
      s.addShape(pres.shapes.LINE, {
        x: 4.8, y: 1.5, w: 0, h: 4.0, line: { color: BORDER_COLOR, width: 1 }
      });

      // Content list - Adjusted X to right side
      slide.content.forEach((point, i) => {
        s.addText(point, {
          x: 5.2, y: 1.5 + (i * 0.9), w: 4.5, // Reduced width to fit slide
          fontSize: 16, color: TEXT_COLOR, 
          bullet: { code: "2022", color: ACCENT_COLOR }
        });
      });
    }

    // --- SLIDE TYPE: SERVICE LIST ---
    else if (slide.type === 'service_list') {
      s.addText(slide.title, { x: 0.5, y: 0.8, fontSize: 24, color: TEXT_COLOR, bold: true, fontFace: "Arial Black" });
      if (slide.subtitle) s.addText(slide.subtitle, { x: 0.5, y: 1.3, fontSize: 12, color: SUBTEXT_COLOR });

      // Columns for categories
      let colX = 0.5;
      const colWidth = 3.0; // Reduced column width slightly to fit 3 cols comfortably
      
      CATEGORIES.forEach(cat => {
        const items = slide.servicesList?.filter(i => i.category === cat.id);
        if (items && items.length > 0) {
            // Category Header box
            s.addShape(pres.shapes.RECT, {
                x: colX, y: 1.8, w: colWidth, h: 0.4, 
                fill: { color: "18181b" }, line: { color: BORDER_COLOR }
            });
            s.addText(cat.title, { 
                x: colX, y: 1.8, w: colWidth, h: 0.4,
                fontSize: 10, color: ACCENT_COLOR, bold: true, align: "center", valign: "middle"
            });
            
            // Items
            items.forEach((item, k) => {
                s.addText(item.name, { 
                    x: colX, y: 2.3 + (k * 0.4), w: colWidth,
                    fontSize: 10, color: TEXT_COLOR, bullet: { code: "25AA", color: "52525b" }
                });
            });
            colX += 3.2; // Move to next column
        }
      });
    }

    // --- SLIDE TYPE: CLOSING ---
    else if (slide.type === 'closing') {
        s.addText(slide.title, { x: 1.0, y: 2.5, w: "80%", fontSize: 36, color: TEXT_COLOR, bold: true, align: "center", fontFace: "Arial Black" });
        if(slide.subtitle) {
            s.addText(slide.subtitle, { x: 2.0, y: 3.8, w: "60%", fontSize: 16, color: SUBTEXT_COLOR, align: "center" });
        }
        
        // Contact Box
        s.addShape(pres.shapes.RECT, {
            x: 3.5, y: 5.0, w: 3.0, h: 1.2,
            fill: { color: "18181b" }, line: { color: BORDER_COLOR }
        });
        s.addText("CONTATO DIRETO", { x: 3.5, y: 5.2, w: 3.0, fontSize: 8, color: SUBTEXT_COLOR, align: "center", bold: true });
        s.addText("contato@buildongrowth.com", { x: 3.5, y: 5.6, w: 3.0, fontSize: 12, color: ACCENT_COLOR, align: "center" });
    }
  });

  pres.writeFile({ fileName: `Proposta_${clientName.replace(/\s+/g, '_') || 'Growth'}.pptx` });
};