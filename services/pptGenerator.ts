
import PptxGenJS from "pptxgenjs";
import { PresentationData, SelectedService } from "../types";
import { CATEGORIES } from "../constants";

export const downloadPPT = (data: PresentationData, clientName: string) => {
  const pres = new PptxGenJS();
  
  pres.layout = "LAYOUT_16x9";
  
  const BG_COLOR = "09090b";
  const TEXT_COLOR = "FFFFFF";
  const ACCENT_COLOR = "74fbae";
  const SUBTEXT_COLOR = "a1a1aa";
  const BORDER_COLOR = "27272a";
  const CARD_BG = "18181b";

  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: BG_COLOR },
    objects: [
      { text: { text: "BUILD ON GROWTH", options: { x: 0.5, y: 0.3, fontSize: 14, color: TEXT_COLOR, bold: true, fontFace: "Arial Black" } } },
      { rect: { x: 0.5, y: 0.55, w: 1.5, h: 0.05, fill: { color: ACCENT_COLOR } } }
    ]
  });

  data.slides.forEach((slide, index) => {
    const s = pres.addSlide({ masterName: "MASTER_SLIDE" });

    s.addText(`${clientName.toUpperCase()} | PROPOSTA ESTRATÉGICA`, {
      x: 0.5, y: "93%", w: "60%", fontSize: 9, color: SUBTEXT_COLOR, align: "left", fontFace: "Arial", bold: true
    });
    s.addText(`SLIDE ${index + 1}`, {
      x: "85%", y: "92%", w: "10%", fontSize: 9, color: ACCENT_COLOR, align: "right", fontFace: "Arial", bold: true
    });

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
    
    else if (slide.type === 'content') {
      s.addText(slide.title, {
        x: 0.5, y: 1.5, w: 3.2, fontSize: 28, color: ACCENT_COLOR, bold: true, fontFace: "Arial Black", italic: true
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 2.8, w: 3.2, fontSize: 13, color: SUBTEXT_COLOR, italic: true
        });
      }
      s.addShape(pres.ShapeType.line, { x: 4.2, y: 1.2, w: 0, h: 4.2, line: { color: BORDER_COLOR, width: 1.5 } });

      slide.content.forEach((point, i) => {
        s.addText(point, {
          x: 4.6, y: 1.5 + (i * 0.8), w: 4.8, fontSize: 16, color: TEXT_COLOR, fontFace: "Arial",
          bullet: { code: "25CF" }
        });
      });
    }

    else if (slide.type === 'service_list') {
      s.addText("ENGRENAGENS", { x: 0.5, y: 0.8, fontSize: 24, color: TEXT_COLOR, bold: true, fontFace: "Arial Black", italic: true });
      let colX = 0.5;
      CATEGORIES.forEach(cat => {
        const items = slide.servicesList?.filter(i => i.category === cat.id);
        if (items && items.length > 0) {
            s.addShape(pres.ShapeType.rect, { x: colX, y: 1.8, w: 2.9, h: 0.4, fill: { color: CARD_BG }, line: { color: BORDER_COLOR, width: 1 } });
            s.addText(cat.title, { x: colX, y: 1.8, w: 2.9, h: 0.4, fontSize: 9, color: ACCENT_COLOR, bold: true, align: "center", valign: "middle" });
            items.forEach((item, k) => {
                s.addText(item.name, { x: colX + 0.1, y: 2.35 + (k * 0.4), w: 2.7, fontSize: 10, color: TEXT_COLOR, fontFace: "Arial", bold: true, bullet: { code: "25AA" } });
            });
            colX += 3.15;
        }
      });
    }

    else if (slide.type === 'budget') {
      s.addText("PROPOSTA COMERCIAL", { x: 0.5, y: 1.0, fontSize: 28, color: ACCENT_COLOR, bold: true, fontFace: "Arial Black", italic: true });
      s.addText("DETALHAMENTO DE INVESTIMENTO", { x: 0.5, y: 1.4, fontSize: 12, color: SUBTEXT_COLOR, italic: true });

      const tableData: any[][] = [
        [
          { text: "SERVIÇO", options: { bold: true, color: ACCENT_COLOR, fill: { color: CARD_BG }, fontSize: 10, align: "left" } },
          { text: "VALOR", options: { bold: true, color: ACCENT_COLOR, fill: { color: CARD_BG }, fontSize: 10, align: "right" } }
        ]
      ];

      slide.servicesList?.forEach(svc => {
        tableData.push([
          { text: svc.name.toUpperCase(), options: { fontSize: 10, color: TEXT_COLOR, bold: false, fill: { color: BG_COLOR }, align: "left" } },
          { text: `R$ ${svc.price || '0,00'}`, options: { fontSize: 11, color: TEXT_COLOR, align: "right", bold: true, fill: { color: BG_COLOR } } }
        ]);
      });

      const totalValue = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        (slide.servicesList || []).reduce<number>((acc, curr) => {
          const val = parseFloat(curr.price?.replace(/\./g, '').replace(',', '.') || '0');
          return acc + (isNaN(val) ? 0 : val);
        }, 0)
      );

      tableData.push([
        { text: "INVESTIMENTO TOTAL", options: { bold: true, color: ACCENT_COLOR, fontSize: 14, fill: { color: BG_COLOR }, align: "left" } },
        { text: `R$ ${totalValue}`, options: { bold: true, color: ACCENT_COLOR, fontSize: 16, align: "right", fill: { color: BG_COLOR } } }
      ]);

      s.addTable(tableData, { x: 0.5, y: 2.0, w: 9.0, colW: [7.0, 2.0], border: { type: "solid", color: BORDER_COLOR, pt: 1 } });
    }

    else if (slide.type === 'closing') {
        s.addText(slide.title, { x: 1.0, y: 2.2, w: "80%", fontSize: 38, color: TEXT_COLOR, bold: true, align: "center", fontFace: "Arial Black", italic: true });
        s.addText("contato@buildongrowth.com", { x: 3.4, y: 5.35, w: 3.2, fontSize: 13, color: ACCENT_COLOR, align: "center", fontFace: "Courier New" });
    }
  });

  pres.writeFile({ fileName: `PROPOSTA_${clientName.replace(/\s+/g, '_').toUpperCase()}.pptx` });
};
