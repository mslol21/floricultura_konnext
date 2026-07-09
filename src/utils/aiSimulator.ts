import type { Product, BusinessConfig } from '../types';

// Simula atraso na resposta da IA
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiSimulator = {
  // 1. Gerador de Descrição de Produtos
  async generateProductDescription(productName: string, categoryName: string, tone: string): Promise<string> {
    await delay(1200);

    const intros = {
      romantic: `Surpreenda quem você ama com o maravilhoso ${productName}. `,
      commercial: `Garanta agora o seu ${productName}, a escolha ideal para qualquer ocasião! `,
      elegant: `Apresentamos o sofisticado ${productName}, uma verdadeira obra de arte floral. `,
      minimal: `Simplicidade e beleza natural: conheça o ${productName}. `,
    };

    const bodies = {
      romantic: `Cada flor foi selecionada manualmente com muito carinho para transmitir amor, ternura e afeto. Perfeito para comemorações especiais, aniversários de namoro ou simplesmente para dizer "eu te amo" com a delicadeza que só as flores da categoria ${categoryName} possuem.`,
      commercial: `Com excelente durabilidade e frescor garantido, este produto se destaca pela qualidade impecável. Traga mais vida, cores e aroma para o seu dia a dia com a beleza vibrante das nossas opções de ${categoryName}. Preço imperdível e entrega garantida!`,
      elegant: `Composto por folhagens nobres e flores selecionadas pelo seu caimento e vigor, este arranjo de ${categoryName} exala refinamento. Ideal para decorar salas de estar, escritórios ou presentear pessoas de bom gosto que apreciam a alta floricultura.`,
      minimal: `Design clean com foco na beleza essencial de cada flor de ${categoryName}. Sem excessos, apenas frescor, cor e elegância natural dispostos de forma a trazer calma e aconchego para qualquer ambiente moderno.`,
    };

    const callToActions = [
      ` Adicione ao carrinho e finalize seu pedido facilmente via WhatsApp hoje mesmo!`,
      ` Compre agora e personalize seu cartão de dedicatória no checkout.`,
      ` Estoque limitado. Garanta o seu e agende sua entrega personalizada!`,
    ];

    const intro = intros[tone as keyof typeof intros] || intros.commercial;
    const body = bodies[tone as keyof typeof bodies] || bodies.commercial;
    const cta = callToActions[Math.floor(Math.random() * callToActions.length)];

    return `${intro}${body}${cta}`;
  },

  // 2. Otimizador de Título para SEO
  async optimizeTitleSEO(productName: string, categoryName: string): Promise<string> {
    await delay(600);
    const keywords = ['Premium', 'Luxo', 'Artesanal', 'Exclusivo', 'Natural', 'Fresco'];
    const selectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];

    // Se o nome já tem alguma das palavras, evita duplicar
    if (productName.toLowerCase().includes('premium') || productName.toLowerCase().includes('luxo')) {
      return `${productName} - Ideal para Presente | ${categoryName}`;
    }

    return `${productName} ${selectedKeyword} - Ideal para Presente`;
  },

  // 3. Sugestão de Categorias
  async suggestCategory(productName: string, categories: { id: string, name: string }[]): Promise<string> {
    await delay(500);
    const nameLower = productName.toLowerCase();

    if (nameLower.includes('buquê') || nameLower.includes('rosas') || nameLower.includes('flores')) {
      const found = categories.find(c => c.name.toLowerCase().includes('buquê') || c.name.toLowerCase().includes('rosa'));
      if (found) return found.id;
    }
    if (nameLower.includes('orquídea') || nameLower.includes('planta') || nameLower.includes('vaso')) {
      const found = categories.find(c => c.name.toLowerCase().includes('planta') || c.name.toLowerCase().includes('orquíd') || c.name.toLowerCase().includes('vaso'));
      if (found) return found.id;
    }
    if (nameLower.includes('cesta') || nameLower.includes('café') || nameLower.includes('chocolate')) {
      const found = categories.find(c => c.name.toLowerCase().includes('cesta'));
      if (found) return found.id;
    }
    if (nameLower.includes('suculenta') || nameLower.includes('cacto') || nameLower.includes('mini')) {
      const found = categories.find(c => c.name.toLowerCase().includes('suculenta') || c.name.toLowerCase().includes('cacto'));
      if (found) return found.id;
    }

    // Default para a primeira categoria
    return categories.length > 0 ? categories[0].id : '';
  },

  // 4. Gerador de Post de Instagram
  async generateInstagramPost(productName: string, price: number | null, promoPrice: number | null, hashtags: string[]): Promise<string> {
    await delay(800);
    const currentPriceText = promoPrice !== null 
      ? `De R$ ${price?.toFixed(2)} por APENAS R$ ${promoPrice.toFixed(2)}! 😱🔥` 
      : (price !== null ? `Por apenas R$ ${price.toFixed(2)} ✨` : `Preço sob consulta no WhatsApp 📲`);

    const captionTemplates = [
      `🌸 AMOR EM FORMA DE FLORES! 🌸\n\nOlha só a delicadeza do nosso *${productName}*. Uma composição impecável feita com flores selecionadas para encher o dia de alguém especial de alegria e perfume! 🥰\n\n💰 ${currentPriceText}\n\n🛍️ Faça seu pedido com facilidade diretamente em nosso catálogo online e finalize pelo WhatsApp. Link na bio!\n\n${hashtags.join(' ')}`,
      
      `✨ Elegância que transforma qualquer ambiente! ✨\n\nO *${productName}* é perfeito para decorar seu lar ou surpreender aquela pessoa querida com um presente marcante e sofisticado. 🌿🌹\n\n💸 ${currentPriceText}\n\n🚗 Entregamos com todo carinho e rapidez na sua região. Compre online sem complicação pelo link da bio!\n\n${hashtags.join(' ')}`,
      
      `Qual a sua desculpa para não mimar quem você ama hoje? ❤️\n\nNossa sugestão é o clássico e irresistível *${productName}*. Um arranjo vibrante, fresco e duradouro, montado por floristas profissionais! 💐\n\n💵 ${currentPriceText}\n\n👉 Clique no link da bio, monte seu carrinho em 1 minuto e combine a entrega pelo WhatsApp. Rápido e prático!\n\n${hashtags.join(' ')}`
    ];

    return captionTemplates[Math.floor(Math.random() * captionTemplates.length)];
  },

  // 5. Sugestão de Hashtags
  async suggestHashtags(productName: string, categoryName: string): Promise<string[]> {
    await delay(400);
    const defaults = ['#floricultura', '#decoracao', '#flores', '#presentescriativos', '#instaflowers'];
    const itemTag = `#${productName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const categoryTag = `#${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    return [categoryTag, itemTag, ...defaults];
  },

  // 6. Remoção de Fundo Simulada (Processamento de Imagem com Canvas)
  async removeBackground(imageBase64: string): Promise<string> {
    await delay(2000); // Simula IA recortando a imagem

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageBase64);
          return;
        }

        // Configura tamanho do canvas idêntico ao da imagem original
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenha a imagem original
        ctx.drawImage(img, 0, 0);

        // Algoritmo de "Remoção de Fundo": Criamos uma máscara circular suave no centro da imagem
        // (Simula um foco de IA recortando o objeto principal e deixando o resto transparente)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.42;

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Limpa e aplica transparência fora do raio do objeto central
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > radius) {
              const idx = (y * canvas.width + x) * 4;
              // Transparência progressiva nas bordas (feather/suavização)
              if (dist > radius + 25) {
                data[idx + 3] = 0; // Transparência total
              } else {
                const ratio = (dist - radius) / 25;
                data[idx + 3] = Math.max(0, Math.floor(255 * (1 - ratio)));
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => resolve(imageBase64);
      img.src = imageBase64;
    });
  },

  // 7. Geração de Banners Automática com Canvas
  async generateBannerImage(campaign: string, storeName: string, primaryColor: string): Promise<string> {
    await delay(1500);

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 450;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('/florist_banner.png');
        return;
      }

      // 1. Fundo com Gradiente Elegante
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(1, '#0b160b'); // Tom bem escuro
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Elementos gráficos artísticos de IA (Círculos flutuantes translúcidos e linhas)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(1000, 225, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(1000, 225, 100 + i * 40, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Título da Campanha
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(campaign.toUpperCase(), 100, 180);

      // 4. Subtítulo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '22px sans-serif';
      ctx.fillText(`Coleção especial da nossa floricultura para celebrar momentos únicos.`, 100, 230);
      ctx.fillText(`Arranjos frescos criados por floristas renomados.`, 100, 265);

      // 5. Selo de Loja
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(100, 310, 280, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(storeName, 120, 342);

      // 6. Elemento decorativo floral simulado à direita (Desenho simples de uma tulipa/flor minimalista)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(980, 320);
      ctx.quadraticCurveTo(980, 180, 1020, 140);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(1020, 140, 30, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();

      resolve(canvas.toDataURL('image/png'));
    });
  },

  // 8. FAQ Bot de Atendimento IA (Cliente e Admin auto-responder)
  getFAQResponse(question: string, config: BusinessConfig, products: Product[]): string {
    const q = question.toLowerCase().trim();

    if (q.includes('taxa') || q.includes('entrega') || q.includes('frete') || q.includes('delivery')) {
      return `Olá! Nós realizamos entregas em toda a região. A nossa taxa de entrega padrão é de R$ ${config.deliveryFee.toFixed(2)}. Ao fechar o seu pedido no carrinho, você pode inserir o seu endereço para que possamos organizar o envio com todo o carinho!`;
    }

    if (q.includes('endereço') || q.includes('onde fica') || q.includes('localização') || q.includes('loja física')) {
      return `Nossa floricultura está localizada em: ${config.address}. Você também pode optar por fazer o seu pedido online no catálogo e selecionar a opção 'Retirar na Loja' para economizar na taxa de entrega!`;
    }

    if (q.includes('horário') || q.includes('funcionamento') || q.includes('abre') || q.includes('fecha')) {
      return `Nossos horários de atendimento são: ${config.workingHours}. Fora desse horário, você ainda pode navegar pelo nosso catálogo e montar seu carrinho para ser atendido assim que reabrirmos!`;
    }

    if (q.includes('preço') || q.includes('quanto custa') || q.includes('valor')) {
      // Procura produtos em promoção
      const promoProducts = products.filter(p => p.promoPrice !== null && p.active).slice(0, 2);
      if (promoProducts.length > 0) {
        const listText = promoProducts.map(p => `• ${p.name}: De R$ ${p.price?.toFixed(2)} por R$ ${p.promoPrice?.toFixed(2)}!`).join('\n');
        return `Temos opções incríveis a partir de preços excelentes! Algumas de nossas promoções desta semana são:\n${listText}\n\nConfira todos os itens no nosso grid de produtos logo atrás deste chat!`;
      }
      return `Nossos preços variam conforme os arranjos. Temos opções para todos os orçamentos, desde mudinhas de suculentas por valores acessíveis até buquês premium luxuosos. Navegue pelas nossas abas de categorias para ver os valores atualizados!`;
    }

    if (q.includes('pagamento') || q.includes('cartão') || q.includes('pix') || q.includes('dinheiro')) {
      return `Aceitamos pagamentos via PIX (com envio do comprovante), cartões de crédito e débito, além de dinheiro em caso de retirada física na loja. Os detalhes de pagamento são finalizados na conversa do WhatsApp!`;
    }

    if (q.includes('ola') || q.includes('olá') || q.includes('oi') || q.includes('bom dia') || q.includes('boa tarde') || q.includes('boa noite')) {
      return `Olá! Seja muito bem-vindo ao assistente inteligente da ${config.name}! 🌸 Como posso te ajudar hoje? Pergunte-me sobre taxas de entrega, horários, endereço ou produtos em destaque!`;
    }

    // Default fallback - faz busca de produtos
    const matchedProducts = products.filter(p => q.split(' ').some(word => word.length > 3 && p.name.toLowerCase().includes(word) && p.active)).slice(0, 2);
    if (matchedProducts.length > 0) {
      const matchText = matchedProducts.map(p => `• ${p.name} (${p.price ? `R$ ${p.price.toFixed(2)}` : 'Sob Consulta'})`).join('\n');
      return `Encontrei esses produtos que podem te interessar no nosso estoque:\n${matchText}\n\nVocê pode clicar nos cards para ver os detalhes e fotos! Gostaria de tirar alguma outra dúvida?`;
    }

    return `Entendi sua dúvida! Nós enviamos todos os pedidos diretamente no WhatsApp para garantir um atendimento personalizado. Você pode adicionar as flores que deseja no carrinho e clicar em 'Enviar Pedido' para falar conosco, ou nos chamar pelo botão flutuante do WhatsApp!`;
  }
};
