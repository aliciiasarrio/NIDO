import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductImageService {
  /**
   * Obtiene la imagen de un producto. Si el producto ya tiene imageData personalizado,
   * se respeta. De lo contrario, genera un vector SVG estético, limpio y adaptado
   * a su nombre y categoría.
   */
  public getImage(
    product: { name?: string; categoryName?: string; imageData?: string | null } | string | null | undefined,
    fallbackCategory?: string
  ): string {
    if (!product) {
      return this.svgFallback('Alimentos');
    }

    if (typeof product === 'object' && product.imageData && product.imageData.trim().length > 0) {
      return product.imageData;
    }

    const name = typeof product === 'string' ? product : product.name || '';
    const cat = typeof product === 'object' ? product.categoryName || fallbackCategory || '' : fallbackCategory || '';

    return this.resolveSvgByNameAndCategory(name, cat);
  }

  private resolveSvgByNameAndCategory(name: string, category: string): string {
    const n = this.clean(name);
    const c = this.clean(category);

    // Alimentos
    if (n.includes('aceite')) return this.svgOil();
    if (n.includes('leche')) return this.svgMilk();
    if (n.includes('pasta') || n.includes('espagueti') || n.includes('macarron')) return this.svgPasta();
    if (n.includes('arroz')) return this.svgRice();
    if (n.includes('huevo')) return this.svgEggs();
    if (n.includes('cafe') || n.includes('café')) return this.svgCoffee();
    if (n.includes('atun') || n.includes('atún') || n.includes('bonito')) return this.svgTuna();
    if (n.includes('salmon') || n.includes('salmón') || n.includes('pescado')) return this.svgSalmon();
    if (n.includes('pollo') || n.includes('carne') || n.includes('pechuga')) return this.svgChicken();
    if (n.includes('tomate')) return this.svgTomato();
    if (n.includes('yogur')) return this.svgYogurt();
    if (n.includes('patata') || n.includes('papa')) return this.svgPotato();
    if (n.includes('cebolla')) return this.svgOnion();
    if (n.includes('ajo')) return this.svgGarlic();
    if (n.includes('helado')) return this.svgIceCream();
    if (n.includes('pan') || n.includes('madre') || n.includes('barra')) return this.svgBread();
    if (n.includes('manzana') || n.includes('fruta')) return this.svgApple();
    if (n.includes('lenteja') || n.includes('garbanzo') || n.includes('legumbre')) return this.svgLegumes();
    if (n.includes('avena') || n.includes('cereal')) return this.svgOats();

    // Limpieza
    if (n.includes('detergente') || (n.includes('jabon') && c.includes('limp'))) return this.svgDetergent();
    if (n.includes('suavizante')) return this.svgSoftener();
    if (n.includes('lavavajilla') || n.includes('pastilla')) return this.svgDishwasher();
    if (n.includes('fregasuelo') || n.includes('pino')) return this.svgFloorCleaner();
    if (n.includes('bayeta') || n.includes('microfibra') || n.includes('estropajo')) return this.svgCloths();
    if (n.includes('higienico') || n.includes('higiénico') || n.includes('papel')) return this.svgPaper();
    if (n.includes('cristal') || n.includes('spray')) return this.svgGlassCleaner();
    if (n.includes('basura') || n.includes('bolsa')) return this.svgTrashBags();

    // Ropa
    if (n.includes('vaquero') || n.includes('pantalon') || n.includes('pantalón') || n.includes('jean')) return this.svgJeans();
    if (n.includes('camisa') || n.includes('lino') || n.includes('camiseta')) return this.svgShirt();
    if (n.includes('jersey') || n.includes('sueter') || n.includes('suéter') || n.includes('sudadera') || n.includes('lana')) return this.svgSweater();
    if (n.includes('vestido')) return this.svgDress();
    if (n.includes('abrigo') || n.includes('chaqueta') || n.includes('blazer')) return this.svgCoat();
    if (n.includes('zapatill') || n.includes('zapato') || n.includes('calzado') || n.includes('bota') || n.includes('running')) return this.svgShoes();

    // Vajilla
    if (n.includes('vajilla') || n.includes('plato')) return this.svgPlates();
    if (n.includes('copa') || n.includes('vaso')) return this.svgGlasses();
    if (n.includes('cubiert') || n.includes('tenedor') || n.includes('cuchill')) return this.svgCutlery();
    if (n.includes('sarten') || n.includes('sartén') || n.includes('olla')) return this.svgPan();

    // Otros
    if (n.includes('bombill') || n.includes('led') || n.includes('luz')) return this.svgBulb();
    if (n.includes('pila') || n.includes('bateria') || n.includes('batería')) return this.svgBattery();
    if (n.includes('botiquin') || n.includes('botiquín') || n.includes('primeros auxilios')) return this.svgFirstAid();
    if (n.includes('herramienta') || n.includes('caja de herr')) return this.svgTools();

    // Fallback por Categoría
    if (c.includes('alim')) return this.svgApple();
    if (c.includes('limp')) return this.svgDetergent();
    if (c.includes('ropa')) return this.svgShirt();
    if (c.includes('vaji')) return this.svgPlates();
    return this.svgGenericBox();
  }

  private clean(s: string): string {
    if (!s) return '';
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  private toDataUri(svg: string): string {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
  }

  // --- SVG DEFINITIONS (64x64, Estilo Vectorial Moderno NIDO) ---

  private svgOil(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF9E7"/>
        <path d="M28 12h8v5h-8z" fill="#7D6608"/>
        <path d="M26 17h12l4 8v24a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V25l4-8z" fill="#F9E79F" stroke="#B7950B" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M26 31h12v14H26z" fill="#F4D03F" rx="2"/>
        <circle cx="32" cy="38" r="3.5" fill="#27AE60"/>
        <path d="M34 35c1.5-2 3-1 3 0s-3 3-3 0z" fill="#2ECC71"/>
      </svg>
    `);
  }

  private svgMilk(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EBF5FB"/>
        <path d="M26 14h12l4 7H22l4-7z" fill="#AED6F1"/>
        <path d="M22 21h20v28a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V21z" fill="#FFFFFF" stroke="#3498DB" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="22" y="30" width="20" height="12" fill="#5DADE2"/>
        <path d="M32 32c-3 3-2 6 0 8 2-2 3-5 0-8z" fill="#FFFFFF"/>
      </svg>
    `);
  }

  private svgPasta(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF9E7"/>
        <rect x="22" y="16" width="20" height="34" rx="4" fill="#FAD7A0" stroke="#E67E22" stroke-width="2.5"/>
        <path d="M27 22v22M32 22v22M37 22v22" stroke="#D35400" stroke-width="2" stroke-linecap="round"/>
        <rect x="22" y="29" width="20" height="8" fill="#E67E22"/>
      </svg>
    `);
  }

  private svgRice(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAFAF1"/>
        <path d="M16 32c0 10 7 18 16 18s16-8 16-18H16z" fill="#FFFFFF" stroke="#27AE60" stroke-width="2.5"/>
        <path d="M18 32c2-8 8-12 14-12s12 4 14 12H18z" fill="#A9DFBF"/>
        <circle cx="28" cy="26" r="1.5" fill="#FFFFFF"/>
        <circle cx="34" cy="25" r="1.5" fill="#FFFFFF"/>
        <circle cx="31" cy="29" r="1.5" fill="#FFFFFF"/>
        <path d="M38 18l12-6M40 22l12-6" stroke="#E67E22" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgEggs(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF5E7"/>
        <ellipse cx="26" cy="34" rx="9" ry="12" fill="#FAD7A0" stroke="#D35400" stroke-width="2.5"/>
        <ellipse cx="38" cy="34" rx="9" ry="12" fill="#FFFFFF" stroke="#E67E22" stroke-width="2.5"/>
        <circle cx="38" cy="35" r="4.5" fill="#F39C12"/>
      </svg>
    `);
  }

  private svgCoffee(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#F5EEF8"/>
        <rect x="20" y="16" width="24" height="34" rx="3" fill="#6E2C00" stroke="#4A235A" stroke-width="2.5"/>
        <path d="M25 16l3-4h8l3 4" fill="#873600"/>
        <circle cx="32" cy="33" r="6" fill="#F5B041"/>
        <path d="M30 33c1-2 3-2 4 0s-3 3-4 0z" fill="#6E2C00"/>
      </svg>
    `);
  }

  private svgTuna(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#E8F8F5"/>
        <ellipse cx="32" cy="25" rx="17" ry="6" fill="#A3E4D7" stroke="#117864" stroke-width="2.5"/>
        <path d="M15 25v16c0 3.3 7.6 6 17 6s17-2.7 17-6V25" fill="#D1F2EB" stroke="#117864" stroke-width="2.5"/>
        <ellipse cx="32" cy="41" rx="17" ry="6" fill="#1ABC9C"/>
        <path d="M26 33c3-1.5 9-1.5 12 0-3 2-9 2-12 0z" fill="#FFFFFF"/>
      </svg>
    `);
  }

  private svgSalmon(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FDEDEC"/>
        <path d="M16 34c4-12 24-14 32-4 1 8-10 14-22 13l-10-9z" fill="#F1948A" stroke="#C0392B" stroke-width="2.5"/>
        <path d="M22 28c3 4 8 7 14 8M27 25c3 4 7 7 13 8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        <path d="M16 34l-5 4v-8l5 4z" fill="#C0392B"/>
      </svg>
    `);
  }

  private svgChicken(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF9E7"/>
        <ellipse cx="36" cy="30" rx="13" ry="10" fill="#E59866" stroke="#BA4A00" stroke-width="2.5" transform="rotate(-15 36 30)"/>
        <path d="M24 37l-7 7" stroke="#BDC3C7" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="16" cy="45" r="2.5" fill="#BDC3C7"/>
        <circle cx="19" cy="47" r="2.5" fill="#BDC3C7"/>
      </svg>
    `);
  }

  private svgTomato(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FDEDEC"/>
        <circle cx="32" cy="35" r="14" fill="#E74C3C" stroke="#C0392B" stroke-width="2.5"/>
        <path d="M32 21v-4M29 22l-4-3M35 22l4-3M30 24l-3 3M34 24l3 3" stroke="#27AE60" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="27" cy="32" r="2" fill="#F1948A"/>
      </svg>
    `);
  }

  private svgYogurt(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EBF5FB"/>
        <path d="M20 22h24l-3 26H23l-3-26z" fill="#FFFFFF" stroke="#2980B9" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="18" y="19" width="28" height="4" rx="2" fill="#5DADE2"/>
        <path d="M21 31h22l-1 9H22l-1-9z" fill="#D4E6F1"/>
        <path d="M37 14l8-4" stroke="#BDC3C7" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgPotato(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF5E7"/>
        <ellipse cx="32" cy="34" rx="15" ry="11" fill="#DC7633" stroke="#BA4A00" stroke-width="2.5" transform="rotate(8 32 34)"/>
        <circle cx="26" cy="32" r="1" fill="#7E5109"/>
        <circle cx="36" cy="30" r="1" fill="#7E5109"/>
        <circle cx="34" cy="38" r="1" fill="#7E5109"/>
      </svg>
    `);
  }

  private svgOnion(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#F4ECF7"/>
        <path d="M32 18c-9 7-13 16-11 22 2 6 9 9 15 7 6-2 9-9 7-15l-11-14z" fill="#D7BDE2" stroke="#8E44AD" stroke-width="2.5"/>
        <path d="M32 18v-5M33 16l3-4" stroke="#27AE60" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgGarlic(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#F8F9F9"/>
        <path d="M32 20c-7 5-11 13-9 19 2 6 8 8 13 7 5-1 8-6 7-12l-11-14z" fill="#FFFFFF" stroke="#7F8C8D" stroke-width="2.5"/>
        <path d="M32 20v-4" stroke="#A6ACAF" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M30 26c-3 4-4 9-2 13M34 26c3 4 4 9 2 13" stroke="#BDC3C7" stroke-width="1.5"/>
      </svg>
    `);
  }

  private svgIceCream(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FADBD8"/>
        <path d="M22 30h20l-3 18H25l-3-18z" fill="#FAD7A0" stroke="#D35400" stroke-width="2.5"/>
        <circle cx="32" cy="25" r="9" fill="#E74C3C" stroke="#C0392B" stroke-width="2.5"/>
        <circle cx="28" cy="22" r="1.5" fill="#FFFFFF"/>
        <circle cx="36" cy="23" r="1" fill="#78281F"/>
      </svg>
    `);
  }

  private svgBread(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF9E7"/>
        <ellipse cx="32" cy="34" rx="17" ry="10" fill="#F5CBA7" stroke="#BA4A00" stroke-width="2.5" transform="rotate(-5 32 34)"/>
        <path d="M25 30l3 7M31 29l3 7M37 28l3 7" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgApple(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAFAF1"/>
        <path d="M32 23c-4-4-12-2-12 6 0 10 10 17 12 18 2-1 12-8 12-18 0-8-8-10-12-6z" fill="#2ECC71" stroke="#27AE60" stroke-width="2.5"/>
        <path d="M32 23v-5M33 18c2-2 5-2 6 0s-2 5-6 0z" fill="#27AE60" stroke="#27AE60" stroke-width="1.5"/>
      </svg>
    `);
  }

  private svgLegumes(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF5E7"/>
        <rect x="22" y="20" width="20" height="28" rx="4" fill="#FFFFFF" stroke="#B9770E" stroke-width="2.5"/>
        <rect x="20" y="16" width="24" height="5" rx="2" fill="#B9770E"/>
        <circle cx="28" cy="30" r="2.5" fill="#D35400"/>
        <circle cx="36" cy="32" r="2.5" fill="#D35400"/>
        <circle cx="30" cy="38" r="2.5" fill="#D35400"/>
        <circle cx="35" cy="41" r="2.5" fill="#D35400"/>
      </svg>
    `);
  }

  private svgOats(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF9E7"/>
        <rect x="22" y="16" width="20" height="34" rx="3" fill="#F9E79F" stroke="#F39C12" stroke-width="2.5"/>
        <path d="M32 26v12M28 30l4-4 4 4M28 36l4-4 4 4" stroke="#D68910" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  // --- LIMPIEZA ---

  private svgDetergent(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#E8F8F5"/>
        <rect x="26" y="12" width="12" height="5" rx="1" fill="#117864"/>
        <path d="M24 17h16l4 8v22a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V25l4-8z" fill="#48C9B0" stroke="#117864" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="32" cy="36" r="6" fill="#FFFFFF"/>
        <circle cx="32" cy="36" r="3" fill="#1ABC9C"/>
        <circle cx="41" cy="22" r="1.5" fill="#FFFFFF"/>
        <circle cx="43" cy="26" r="2" fill="#FFFFFF"/>
      </svg>
    `);
  }

  private svgSoftener(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EBF5FB"/>
        <rect x="27" y="13" width="10" height="5" rx="1" fill="#2E86C1"/>
        <path d="M26 18h12c2 4 4 7 4 11v17a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V29c0-4 2-7 4-11z" fill="#85C1E9" stroke="#1B4F72" stroke-width="2.5"/>
        <circle cx="32" cy="38" r="4" fill="#FFFFFF"/>
        <circle cx="32" cy="38" r="1.5" fill="#F4D03F"/>
      </svg>
    `);
  }

  private svgDishwasher(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAF2F8"/>
        <rect x="18" y="24" width="28" height="18" rx="4" fill="#3498DB" stroke="#21618C" stroke-width="2.5"/>
        <rect x="18" y="33" width="28" height="9" rx="1" fill="#FFFFFF"/>
        <circle cx="32" cy="33" r="5" fill="#E74C3C"/>
        <path d="M42 16l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" fill="#F1C40F"/>
      </svg>
    `);
  }

  private svgFloorCleaner(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#E8F6F3"/>
        <rect x="28" y="12" width="8" height="6" fill="#148F77"/>
        <path d="M24 18h16l3 9v21a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3V27l3-9z" fill="#58D68D" stroke="#196F3D" stroke-width="2.5"/>
        <path d="M32 30v12M28 36h8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgCloths(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF9E7"/>
        <path d="M22 22h22l-4 24H18l4-24z" fill="#F9E79F" stroke="#F39C12" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M26 26h22l-4 24H22l4-24z" fill="#85C1E9" stroke="#2980B9" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>
    `);
  }

  private svgPaper(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#F4F6F7"/>
        <ellipse cx="32" cy="22" rx="13" ry="6" fill="#EAEDED" stroke="#7F8C8D" stroke-width="2.5"/>
        <path d="M19 22v22c0 3.3 5.8 6 13 6s13-2.7 13-6V22" fill="#FFFFFF" stroke="#7F8C8D" stroke-width="2.5"/>
        <ellipse cx="32" cy="22" rx="4" ry="2" fill="#7F8C8D"/>
        <path d="M45 32c4 2 4 9 0 12" stroke="#BDC3C7" stroke-width="2"/>
      </svg>
    `);
  }

  private svgGlassCleaner(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EBF5FB"/>
        <path d="M26 20h8l-3-6h-7l2 6z" fill="#2980B9"/>
        <path d="M21 16l-5 3v3h5" stroke="#2980B9" stroke-width="2" stroke-linecap="round"/>
        <path d="M25 20h14l3 8v20a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V28l3-8z" fill="#85C1E9" stroke="#1F618D" stroke-width="2.5"/>
        <path d="M28 29l8 14" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgTrashBags(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAECEE"/>
        <rect x="18" y="24" width="28" height="18" rx="4" fill="#5D6D7E" stroke="#2C3E50" stroke-width="2.5"/>
        <ellipse cx="46" cy="33" rx="2" ry="9" fill="#34495E"/>
        <path d="M23 24v18M28 24v18" stroke="#85929E" stroke-width="1.5"/>
      </svg>
    `);
  }

  // --- ROPA ---

  private svgJeans(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EBF5FB"/>
        <path d="M20 18h24l3 30-8 1-7-16-7 16-8-1 3-30z" fill="#2E86C1" stroke="#1B4F72" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M20 22h24M32 22v10" stroke="#F39C12" stroke-width="1.5"/>
        <path d="M23 25c2 4 6 4 8 0" stroke="#F39C12" stroke-width="1.5"/>
      </svg>
    `);
  }

  private svgShirt(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#F2F4F4"/>
        <path d="M24 16l8 6 8-6 8 8-4 6-4-3v21H24V27l-4 3-4-6 8-8z" fill="#FFFFFF" stroke="#2C3E50" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M32 22v26" stroke="#BDC3C7" stroke-width="1.5"/>
        <circle cx="32" cy="28" r="1" fill="#E67E22"/>
        <circle cx="32" cy="35" r="1" fill="#E67E22"/>
        <circle cx="32" cy="42" r="1" fill="#E67E22"/>
      </svg>
    `);
  }

  private svgSweater(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAECEE"/>
        <path d="M25 18c4 3 10 3 14 0l10 9-4 6-5-3v18H24V30l-5 3-4-6 10-9z" fill="#7F8C8D" stroke="#34495E" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M24 43h16M28 26v12M36 26v12" stroke="#BDC3C7" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgDress(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FADBD8"/>
        <path d="M26 16h12l-2 12 11 20H17l11-20-2-12z" fill="#EC7063" stroke="#922B21" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="28" cy="36" r="1.5" fill="#FFFFFF"/>
        <circle cx="36" cy="40" r="1.5" fill="#FFFFFF"/>
        <circle cx="32" cy="44" r="1.5" fill="#FFFFFF"/>
      </svg>
    `);
  }

  private svgCoat(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EDBB99"/>
        <path d="M24 16l8 8 8-8 8 8-3 6-4-2v22H23V28l-4 2-3-6 8-8z" fill="#BA4A00" stroke="#6E2C00" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M32 24v26" stroke="#6E2C00" stroke-width="2"/>
        <circle cx="35" cy="32" r="1.5" fill="#D35400"/>
        <circle cx="35" cy="40" r="1.5" fill="#D35400"/>
      </svg>
    `);
  }

  private svgShoes(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAEDED"/>
        <path d="M16 38l6-14 10 4 16 5 2 7H16v-2z" fill="#34495E" stroke="#1A252F" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M14 44h36v3a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2v-3z" fill="#E74C3C"/>
        <path d="M28 26l3 7M33 28l3 6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  // --- VAJILLA ---

  private svgPlates(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EBF5FB"/>
        <ellipse cx="32" cy="42" rx="18" ry="6" fill="#D4E6F1" stroke="#2C3E50" stroke-width="2.5"/>
        <ellipse cx="32" cy="35" rx="16" ry="5.5" fill="#EBF5FB" stroke="#2C3E50" stroke-width="2.5"/>
        <ellipse cx="32" cy="28" rx="14" ry="5" fill="#FFFFFF" stroke="#2C3E50" stroke-width="2.5"/>
        <ellipse cx="32" cy="28" rx="8" ry="2.5" fill="#EAEDED"/>
      </svg>
    `);
  }

  private svgGlasses(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#F4ECF7"/>
        <path d="M24 16h16l-2 14c-1 5-5 8-6 8s-5-3-6-8l-2-14z" fill="#D7BDE2" stroke="#6C3483" stroke-width="2.5"/>
        <path d="M32 38v10M25 48h14" stroke="#6C3483" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M26 24h12" stroke="#8E44AD" stroke-width="1.5"/>
      </svg>
    `);
  }

  private svgCutlery(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAEDED"/>
        <path d="M24 16v12a3 3 0 0 0 3 3v17M21 16v8M27 16v8" stroke="#5D6D7E" stroke-width="2" stroke-linecap="round"/>
        <path d="M37 16c4 3 5 10 1 15v17" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgPan(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FADBD8"/>
        <ellipse cx="28" cy="34" rx="14" ry="8" fill="#5D6D7E" stroke="#1A252F" stroke-width="2.5"/>
        <path d="M40 32l12-8" stroke="#BA4A00" stroke-width="4.5" stroke-linecap="round"/>
        <ellipse cx="28" cy="34" rx="9" ry="5" fill="#2C3E50"/>
      </svg>
    `);
  }

  // --- OTROS ---

  private svgBulb(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FEF9E7"/>
        <path d="M24 26a10 10 0 1 1 16 0c-1 3-3 6-4 9h-8c-1-3-3-6-4-9z" fill="#F9E79F" stroke="#B7950B" stroke-width="2.5"/>
        <rect x="28" y="38" width="8" height="6" rx="1" fill="#7F8C8D"/>
        <path d="M30 46h4" stroke="#7F8C8D" stroke-width="2" stroke-linecap="round"/>
        <path d="M30 26l2-4 2 4" stroke="#F39C12" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgBattery(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FCF3CF"/>
        <rect x="29" y="14" width="6" height="4" rx="1" fill="#7F8C8D"/>
        <rect x="22" y="18" width="20" height="30" rx="3" fill="#2C3E50" stroke="#17202A" stroke-width="2.5"/>
        <rect x="22" y="18" width="20" height="10" fill="#D35400"/>
        <path d="M32 34v6M29 37h6" stroke="#2ECC71" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgFirstAid(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#FDEDEC"/>
        <rect x="18" y="22" width="28" height="24" rx="4" fill="#FFFFFF" stroke="#C0392B" stroke-width="2.5"/>
        <path d="M26 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke="#C0392B" stroke-width="2"/>
        <path d="M32 28v12M26 34h12" stroke="#E74C3C" stroke-width="3.5" stroke-linecap="round"/>
      </svg>
    `);
  }

  private svgTools(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAECEE"/>
        <rect x="18" y="24" width="28" height="22" rx="3" fill="#D35400" stroke="#935116" stroke-width="2.5"/>
        <path d="M27 24v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" stroke="#2C3E50" stroke-width="2.5"/>
        <path d="M18 32h28" stroke="#2C3E50" stroke-width="2"/>
        <circle cx="32" cy="32" r="2.5" fill="#BDC3C7"/>
      </svg>
    `);
  }

  private svgGenericBox(): string {
    return this.toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#EAEDED"/>
        <path d="M18 25l14-7 14 7-14 7-14-7z" fill="#BDC3C7" stroke="#7F8C8D" stroke-width="2.5"/>
        <path d="M18 25v16l14 7V32l-14-7z" fill="#95A5A6" stroke="#7F8C8D" stroke-width="2.5"/>
        <path d="M46 25v16l-14 7V32l14-7z" fill="#7F8C8D" stroke="#7F8C8D" stroke-width="2.5"/>
      </svg>
    `);
  }

  private svgFallback(category: string): string {
    return this.resolveSvgByNameAndCategory('', category);
  }
}
