import os
import subprocess

# Diccionario de SVGs limpios por tipo de producto (codificados como data URI)
def get_svg_uri(svg_content):
    import urllib.parse
    cleaned = " ".join(svg_content.split())
    return "data:image/svg+xml;utf8," + urllib.parse.quote(cleaned)

IMAGES = {
    'aceite': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FEF9E7"/><path d="M28 12h8v5h-8z" fill="#7D6608"/><path d="M26 17h12l4 8v24a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V25l4-8z" fill="#F9E79F" stroke="#B7950B" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 31h12v14H26z" fill="#F4D03F" rx="2"/><circle cx="32" cy="38" r="3.5" fill="#27AE60"/><path d="M34 35c1.5-2 3-1 3 0s-3 3-3 0z" fill="#2ECC71"/></svg>'''),
    'arroz': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EAFAF1"/><path d="M16 32c0 10 7 18 16 18s16-8 16-18H16z" fill="#FFFFFF" stroke="#27AE60" stroke-width="2.5"/><path d="M18 32c2-8 8-12 14-12s12 4 14 12H18z" fill="#A9DFBF"/><circle cx="28" cy="26" r="1.5" fill="#FFFFFF"/><circle cx="34" cy="25" r="1.5" fill="#FFFFFF"/><circle cx="31" cy="29" r="1.5" fill="#FFFFFF"/><path d="M38 18l12-6M40 22l12-6" stroke="#E67E22" stroke-width="2.5" stroke-linecap="round"/></svg>'''),
    'tomate': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FDEDEC"/><circle cx="32" cy="35" r="14" fill="#E74C3C" stroke="#C0392B" stroke-width="2.5"/><path d="M32 21v-4M29 22l-4-3M35 22l4-3M30 24l-3 3M34 24l3 3" stroke="#27AE60" stroke-width="2.5" stroke-linecap="round"/><circle cx="27" cy="32" r="2" fill="#F1948A"/></svg>'''),
    'pasta': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FEF9E7"/><rect x="22" y="16" width="20" height="34" rx="4" fill="#FAD7A0" stroke="#E67E22" stroke-width="2.5"/><path d="M27 22v22M32 22v22M37 22v22" stroke="#D35400" stroke-width="2" stroke-linecap="round"/><rect x="22" y="29" width="20" height="8" fill="#E67E22"/></svg>'''),
    'huevos': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FEF5E7"/><ellipse cx="26" cy="34" rx="9" ry="12" fill="#FAD7A0" stroke="#D35400" stroke-width="2.5"/><ellipse cx="38" cy="34" rx="9" ry="12" fill="#FFFFFF" stroke="#E67E22" stroke-width="2.5"/><circle cx="38" cy="35" r="4.5" fill="#F39C12"/></svg>'''),
    'cafe': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#F5EEF8"/><rect x="20" y="16" width="24" height="34" rx="3" fill="#6E2C00" stroke="#4A235A" stroke-width="2.5"/><path d="M25 16l3-4h8l3 4" fill="#873600"/><circle cx="32" cy="33" r="6" fill="#F5B041"/><path d="M30 33c1-2 3-2 4 0s-3 3-4 0z" fill="#6E2C00"/></svg>'''),
    'leche': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EBF5FB"/><path d="M26 14h12l4 7H22l4-7z" fill="#AED6F1"/><path d="M22 21h20v28a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V21z" fill="#FFFFFF" stroke="#3498DB" stroke-width="2.5" stroke-linejoin="round"/><rect x="22" y="30" width="20" height="12" fill="#5DADE2"/><path d="M32 32c-3 3-2 6 0 8 2-2 3-5 0-8z" fill="#FFFFFF"/></svg>'''),
    'atun': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#E8F8F5"/><ellipse cx="32" cy="25" rx="17" ry="6" fill="#A3E4D7" stroke="#117864" stroke-width="2.5"/><path d="M15 25v16c0 3.3 7.6 6 17 6s17-2.7 17-6V25" fill="#D1F2EB" stroke="#117864" stroke-width="2.5"/><ellipse cx="32" cy="41" rx="17" ry="6" fill="#1ABC9C"/><path d="M26 33c3-1.5 9-1.5 12 0-3 2-9 2-12 0z" fill="#FFFFFF"/></svg>'''),
    'yogur': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EBF5FB"/><path d="M20 22h24l-3 26H23l-3-26z" fill="#FFFFFF" stroke="#2980B9" stroke-width="2.5" stroke-linejoin="round"/><rect x="18" y="19" width="28" height="4" rx="2" fill="#5DADE2"/><path d="M21 31h22l-1 9H22l-1-9z" fill="#D4E6F1"/><path d="M37 14l8-4" stroke="#BDC3C7" stroke-width="3" stroke-linecap="round"/></svg>'''),
    'pollo': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FEF9E7"/><ellipse cx="36" cy="30" rx="13" ry="10" fill="#E59866" stroke="#BA4A00" stroke-width="2.5" transform="rotate(-15 36 30)"/><path d="M24 37l-7 7" stroke="#BDC3C7" stroke-width="4.5" stroke-linecap="round"/><circle cx="16" cy="45" r="2.5" fill="#BDC3C7"/><circle cx="19" cy="47" r="2.5" fill="#BDC3C7"/></svg>'''),
    'salmon': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FDEDEC"/><path d="M16 34c4-12 24-14 32-4 1 8-10 14-22 13l-10-9z" fill="#F1948A" stroke="#C0392B" stroke-width="2.5"/><path d="M22 28c3 4 8 7 14 8M27 25c3 4 7 7 13 8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/><path d="M16 34l-5 4v-8l5 4z" fill="#C0392B"/></svg>'''),
    'patatas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FEF5E7"/><ellipse cx="32" cy="34" rx="15" ry="11" fill="#DC7633" stroke="#BA4A00" stroke-width="2.5" transform="rotate(8 32 34)"/><circle cx="26" cy="32" r="1" fill="#7E5109"/><circle cx="36" cy="30" r="1" fill="#7E5109"/><circle cx="34" cy="38" r="1" fill="#7E5109"/></svg>'''),
    'cebolla': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#F4ECF7"/><path d="M32 18c-9 7-13 16-11 22 2 6 9 9 15 7 6-2 9-9 7-15l-11-14z" fill="#D7BDE2" stroke="#8E44AD" stroke-width="2.5"/><path d="M32 18v-5M33 16l3-4" stroke="#27AE60" stroke-width="2.5" stroke-linecap="round"/></svg>'''),
    'ajos': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#F8F9F9"/><path d="M32 20c-7 5-11 13-9 19 2 6 8 8 13 7 5-1 8-6 7-12l-11-14z" fill="#FFFFFF" stroke="#7F8C8D" stroke-width="2.5"/><path d="M32 20v-4" stroke="#A6ACAF" stroke-width="2.5" stroke-linecap="round"/><path d="M30 26c-3 4-4 9-2 13M34 26c3 4 4 9 2 13" stroke="#BDC3C7" stroke-width="1.5"/></svg>'''),
    'helado': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FADBD8"/><path d="M22 30h20l-3 18H25l-3-18z" fill="#FAD7A0" stroke="#D35400" stroke-width="2.5"/><circle cx="32" cy="25" r="9" fill="#E74C3C" stroke="#C0392B" stroke-width="2.5"/><circle cx="28" cy="22" r="1.5" fill="#FFFFFF"/><circle cx="36" cy="23" r="1" fill="#78281F"/></svg>'''),
    'detergente': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#E8F8F5"/><rect x="26" y="12" width="12" height="5" rx="1" fill="#117864"/><path d="M24 17h16l4 8v22a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V25l4-8z" fill="#48C9B0" stroke="#117864" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="36" r="6" fill="#FFFFFF"/><circle cx="32" cy="36" r="3" fill="#1ABC9C"/><circle cx="41" cy="22" r="1.5" fill="#FFFFFF"/><circle cx="43" cy="26" r="2" fill="#FFFFFF"/></svg>'''),
    'suavizante': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EBF5FB"/><rect x="27" y="13" width="10" height="5" rx="1" fill="#2E86C1"/><path d="M26 18h12c2 4 4 7 4 11v17a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V29c0-4 2-7 4-11z" fill="#85C1E9" stroke="#1B4F72" stroke-width="2.5"/><circle cx="32" cy="38" r="4" fill="#FFFFFF"/><circle cx="32" cy="38" r="1.5" fill="#F4D03F"/></svg>'''),
    'pastillas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EAF2F8"/><rect x="18" y="24" width="28" height="18" rx="4" fill="#3498DB" stroke="#21618C" stroke-width="2.5"/><rect x="18" y="33" width="28" height="9" rx="1" fill="#FFFFFF"/><circle cx="32" cy="33" r="5" fill="#E74C3C"/><path d="M42 16l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" fill="#F1C40F"/></svg>'''),
    'fregasuelos': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#E8F6F3"/><rect x="28" y="12" width="8" height="6" fill="#148F77"/><path d="M24 18h16l3 9v21a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3V27l3-9z" fill="#58D68D" stroke="#196F3D" stroke-width="2.5"/><path d="M32 30v12M28 36h8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>'''),
    'bayetas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FEF9E7"/><path d="M22 22h22l-4 24H18l4-24z" fill="#F9E79F" stroke="#F39C12" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 26h22l-4 24H22l4-24z" fill="#85C1E9" stroke="#2980B9" stroke-width="2.5" stroke-linejoin="round"/></svg>'''),
    'papel': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#F4F6F7"/><ellipse cx="32" cy="22" rx="13" ry="6" fill="#EAEDED" stroke="#7F8C8D" stroke-width="2.5"/><path d="M19 22v22c0 3.3 5.8 6 13 6s13-2.7 13-6V22" fill="#FFFFFF" stroke="#7F8C8D" stroke-width="2.5"/><ellipse cx="32" cy="22" rx="4" ry="2" fill="#7F8C8D"/><path d="M45 32c4 2 4 9 0 12" stroke="#BDC3C7" stroke-width="2"/></svg>'''),
    'limpiacristales': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EBF5FB"/><path d="M26 20h8l-3-6h-7l2 6z" fill="#2980B9"/><path d="M21 16l-5 3v3h5" stroke="#2980B9" stroke-width="2" stroke-linecap="round"/><path d="M25 20h14l3 8v20a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V28l3-8z" fill="#85C1E9" stroke="#1F618D" stroke-width="2.5"/><path d="M28 29l8 14" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>'''),
    'vaqueros': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EBF5FB"/><path d="M20 18h24l3 30-8 1-7-16-7 16-8-1 3-30z" fill="#2E86C1" stroke="#1B4F72" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 22h24M32 22v10" stroke="#F39C12" stroke-width="1.5"/><path d="M23 25c2 4 6 4 8 0" stroke="#F39C12" stroke-width="1.5"/></svg>'''),
    'camisa': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#F2F4F4"/><path d="M24 16l8 6 8-6 8 8-4 6-4-3v21H24V27l-4 3-4-6 8-8z" fill="#FFFFFF" stroke="#2C3E50" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 22v26" stroke="#BDC3C7" stroke-width="1.5"/><circle cx="32" cy="28" r="1" fill="#E67E22"/><circle cx="32" cy="35" r="1" fill="#E67E22"/><circle cx="32" cy="42" r="1" fill="#E67E22"/></svg>'''),
    'jersey': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EAECEE"/><path d="M25 18c4 3 10 3 14 0l10 9-4 6-5-3v18H24V30l-5 3-4-6 10-9z" fill="#7F8C8D" stroke="#34495E" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 43h16M28 26v12M36 26v12" stroke="#BDC3C7" stroke-width="1.5" stroke-linecap="round"/></svg>'''),
    'vestido': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FADBD8"/><path d="M26 16h12l-2 12 11 20H17l11-20-2-12z" fill="#EC7063" stroke="#922B21" stroke-width="2.5" stroke-linejoin="round"/><circle cx="28" cy="36" r="1.5" fill="#FFFFFF"/><circle cx="36" cy="40" r="1.5" fill="#FFFFFF"/><circle cx="32" cy="44" r="1.5" fill="#FFFFFF"/></svg>'''),
    'abrigo': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EDBB99"/><path d="M24 16l8 8 8-8 8 8-3 6-4-2v22H23V28l-4 2-3-6 8-8z" fill="#BA4A00" stroke="#6E2C00" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 24v26" stroke="#6E2C00" stroke-width="2"/><circle cx="35" cy="32" r="1.5" fill="#D35400"/><circle cx="35" cy="40" r="1.5" fill="#D35400"/></svg>'''),
    'zapatillas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EAEDED"/><path d="M16 38l6-14 10 4 16 5 2 7H16v-2z" fill="#34495E" stroke="#1A252F" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 44h36v3a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2v-3z" fill="#E74C3C"/><path d="M28 26l3 7M33 28l3 6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>'''),
    'blazer': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#D4E6F1"/><path d="M24 16l8 8 8-8 8 8-3 6-4-2v22H23V28l-4 2-3-6 8-8z" fill="#1F618D" stroke="#154360" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 24v26" stroke="#154360" stroke-width="2"/><circle cx="35" cy="32" r="1.5" fill="#F4D03F"/><circle cx="35" cy="40" r="1.5" fill="#F4D03F"/></svg>'''),
    'vajilla': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EBF5FB"/><ellipse cx="32" cy="42" rx="18" ry="6" fill="#D4E6F1" stroke="#2C3E50" stroke-width="2.5"/><ellipse cx="32" cy="35" rx="16" ry="5.5" fill="#EBF5FB" stroke="#2C3E50" stroke-width="2.5"/><ellipse cx="32" cy="28" rx="14" ry="5" fill="#FFFFFF" stroke="#2C3E50" stroke-width="2.5"/><ellipse cx="32" cy="28" rx="8" ry="2.5" fill="#EAEDED"/></svg>'''),
    'copas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#F4ECF7"/><path d="M24 16h16l-2 14c-1 5-5 8-6 8s-5-3-6-8l-2-14z" fill="#D7BDE2" stroke="#6C3483" stroke-width="2.5"/><path d="M32 38v10M25 48h14" stroke="#6C3483" stroke-width="2.5" stroke-linecap="round"/><path d="M26 24h12" stroke="#8E44AD" stroke-width="1.5"/></svg>'''),
    'cuberteria': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EAEDED"/><path d="M24 16v12a3 3 0 0 0 3 3v17M21 16v8M27 16v8" stroke="#5D6D7E" stroke-width="2" stroke-linecap="round"/><path d="M37 16c4 3 5 10 1 15v17" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round"/></svg>'''),
    'sarten': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FADBD8"/><ellipse cx="28" cy="34" rx="14" ry="8" fill="#5D6D7E" stroke="#1A252F" stroke-width="2.5"/><path d="M40 32l12-8" stroke="#BA4A00" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="28" cy="34" rx="9" ry="5" fill="#2C3E50"/></svg>'''),
    'bombillas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FEF9E7"/><path d="M24 26a10 10 0 1 1 16 0c-1 3-3 6-4 9h-8c-1-3-3-6-4-9z" fill="#F9E79F" stroke="#B7950B" stroke-width="2.5"/><rect x="28" y="38" width="8" height="6" rx="1" fill="#7F8C8D"/><path d="M30 46h4" stroke="#7F8C8D" stroke-width="2" stroke-linecap="round"/><path d="M30 26l2-4 2 4" stroke="#F39C12" stroke-width="1.5" stroke-linecap="round"/></svg>'''),
    'pilas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FCF3CF"/><rect x="29" y="14" width="6" height="4" rx="1" fill="#7F8C8D"/><rect x="22" y="18" width="20" height="30" rx="3" fill="#2C3E50" stroke="#17202A" stroke-width="2.5"/><rect x="22" y="18" width="20" height="10" fill="#D35400"/><path d="M32 34v6M29 37h6" stroke="#2ECC71" stroke-width="2" stroke-linecap="round"/></svg>'''),
    'botiquin': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FDEDEC"/><rect x="18" y="22" width="28" height="24" rx="4" fill="#FFFFFF" stroke="#C0392B" stroke-width="2.5"/><path d="M26 22v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke="#C0392B" stroke-width="2"/><path d="M32 28v12M26 34h12" stroke="#E74C3C" stroke-width="3.5" stroke-linecap="round"/></svg>'''),
    'herramientas': get_svg_uri('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#EAECEE"/><rect x="18" y="24" width="28" height="22" rx="3" fill="#D35400" stroke="#935116" stroke-width="2.5"/><path d="M27 24v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" stroke="#2C3E50" stroke-width="2.5"/><path d="M18 32h28" stroke="#2C3E50" stroke-width="2"/><circle cx="32" cy="32" r="2.5" fill="#BDC3C7"/></svg>'''),
}

MATCHERS = [
    ('Aceite', 'aceite'),
    ('Arroz', 'arroz'),
    ('Tomate', 'tomate'),
    ('Pasta', 'pasta'),
    ('Huevos', 'huevos'),
    ('Café', 'cafe'),
    ('Leche', 'leche'),
    ('Atún', 'atun'),
    ('Yogur', 'yogur'),
    ('Pollo', 'pollo'),
    ('salmón', 'salmon'),
    ('Patatas', 'patatas'),
    ('Cebolla', 'cebolla'),
    ('Ajos', 'ajos'),
    ('Helado', 'helado'),
    ('Detergente', 'detergente'),
    ('Suavizante', 'suavizante'),
    ('lavavajillas', 'pastillas'),
    ('Fregasuelos', 'fregasuelos'),
    ('Bayetas', 'bayetas'),
    ('Papel higiénico', 'papel'),
    ('Limpiacristales', 'limpiacristales'),
    ('Vaqueros', 'vaqueros'),
    ('Camisa', 'camisa'),
    ('Jersey', 'jersey'),
    ('Vestido', 'vestido'),
    ('Abrigo', 'abrigo'),
    ('Zapatillas', 'zapatillas'),
    ('blazer', 'blazer'),
    ('Vajilla', 'vajilla'),
    ('Copas', 'copas'),
    ('Cubertería', 'cuberteria'),
    ('Sartén', 'sarten'),
    ('Bombillas', 'bombillas'),
    ('Pilas', 'pilas'),
    ('Botiquín', 'botiquin'),
    ('herramientas', 'herramientas'),
]

sql_statements = []
for name_fragment, img_key in MATCHERS:
    data_uri = IMAGES[img_key]
    sql_statements.append(f"UPDATE items SET image_data = '{data_uri}' WHERE household_id = 7 AND name ILIKE '%{name_fragment}%';")

sql_script = "\n".join(sql_statements)
with open('scripts/update-images.sql', 'w', encoding='utf-8') as f:
    f.write(sql_script)

print("Generated scripts/update-images.sql with", len(sql_statements), "updates.")
