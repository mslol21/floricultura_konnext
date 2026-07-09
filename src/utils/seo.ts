import type { Product, BusinessConfig } from '../types';

export const updateSEOMetaTags = (product?: Product | null, config?: BusinessConfig) => {
  if (!config) return;

  const head = document.head;

  // Title
  const title = product 
    ? `${product.name} | ${config.name}`
    : `${config.name} | Catálogo Online & Pedidos via WhatsApp`;
  document.title = title;

  // Description
  const description = product 
    ? product.description.substring(0, 160) 
    : `Encontre os melhores buquês premium, orquídeas e presentes na ${config.name}. Faça seu pedido de forma simples e receba direto em casa pelo WhatsApp!`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  // Função auxiliar para atualizar ou criar meta tags
  const setMeta = (property: string, content: string, isName = false) => {
    const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      if (isName) {
        element.setAttribute('name', property);
      } else {
        element.setAttribute('property', property);
      }
      head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Open Graph (Facebook / WhatsApp)
  setMeta('og:title', title);
  setMeta('og:description', description);
  const imageUrl = product && product.images[0] ? product.images[0] : (config.logo || '/favicon.svg');
  setMeta('og:image', imageUrl);
  setMeta('og:url', window.location.href);

  // Twitter Cards
  setMeta('twitter:card', 'summary_large_image', true);
  setMeta('twitter:title', title, true);
  setMeta('twitter:description', description, true);
  setMeta('twitter:image', imageUrl, true);

  // Schema.org Product (Structured Data JSON-LD)
  let schemaScript = document.getElementById('schema-product');
  if (schemaScript) {
    schemaScript.remove();
  }

  if (product) {
    schemaScript = document.createElement('script');
    schemaScript.setAttribute('id', 'schema-product');
    schemaScript.setAttribute('type', 'application/ld+json');
    
    const price = product.promoPrice !== null ? product.promoPrice : product.price;
    const isOutOfStock = product.stock === 0;

    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images,
      "description": product.description,
      "sku": product.id,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "BRL",
        "price": price || 0,
        "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };

    schemaScript.innerHTML = JSON.stringify(jsonLd, null, 2);
    head.appendChild(schemaScript);
  }
};
