/* ==========================================================================
   VOID CREW — INTERATIVE STOREFRONT SYSTEM
   Lógica Comercial, FOMO, Bundles e Carrinho Simulado
   ========================================================================== */

// 1. BANCO DE DADOS DE PRODUTOS REAIS (6 MODELOS EXCLUSIVOS)
const PRODUCTS = [
  {
    id: "tiger",
    name: "VOID Tiger Oversized",
    colorText: "Preto Mineral",
    badge: "BEST SELLER",
    price: 109.90,
    oldPrice: 159.90,
    tagline: "VOID WAS NOT MADE TO FIT THE CROWD",
    images: [
      "assets/product-tiger-back.png",      // 1. BACK PRINT (Main Hero)
      "assets/product-tiger-front.png",     // 2. FRONT VIEW
      "assets/product-tiger-graphic.png",   // 3. Detail close-up
      "assets/campaign-tiger-gym.png",      // 4. Lifestyle/gym photo
      "assets/product-tiger-logo.png"       // 5. Fabric/detail shot
    ],
    description: "A peça central do nosso drop. Com estampa maciça nas costas apresentando o tigre de ferro, raios roxos vulcanizados e logotipo frontal em tipografia distressed. Modelagem robusta inspirada no streetwear clássico dos anos 90.",
    details: "• Algodão heavyweight 220g/m²\n• Fio penteado 30.1 premium\n• Modelagem oversized autêntica\n• Gola pesada de ribana canelada 3cm\n• Estampa maciça resistente em Silk Screen"
  },
  {
    id: "samurai",
    name: "VOID Samurai Oversized",
    colorText: "Preto Deep / Azul Neon",
    badge: "NEW DROP",
    price: 109.90,
    oldPrice: 159.90,
    tagline: "FROM WARRIOR TO WARRIOR",
    images: [
      "assets/product-samurai-back.png",    // 1. BACK PRINT (Main Hero)
      "assets/product-samurai-front.png",   // 2. FRONT VIEW
      "assets/product-samurai-graphic.png", // 3. Detail close-up
      "assets/product-samurai-real.jpg",    // 4. Lifestyle/gym photo
      "assets/product-samurai-logo.png"     // 5. Fabric/detail shot
    ],
    description: "Inspirada na armadura e disciplina dos antigos guerreiros samurais. A estampa traseira traz traços neo-tradicionais em azul néon contrastante com elementos tipográficos distressed nas mangas e peito. Caimento estruturado.",
    details: "• Tecido premium amaciado pré-encolhido\n• Gramatura robusta de 220g/m²\n• Modelagem com ombros caídos e mangas amplas\n• Gola de 3cm que não laceia\n• Estampa com toque zero de alta durabilidade"
  },
  {
    id: "monk",
    name: "VOID Monk Oversized",
    colorText: "Preto Coal / White Ink",
    badge: "LIMITED",
    price: 109.90,
    oldPrice: 159.90,
    tagline: "NOT MADE TO FIT / ONLY DISCIPLINE",
    images: [
      "assets/product-monk-back.png",       // 1. BACK PRINT (Main Hero)
      "assets/product-monk-front.png",      // 2. FRONT VIEW
      "assets/product-monk-graphic.png",    // 3. Detail close-up
      "assets/campaign-monk-gym.png",       // 4. Lifestyle/gym photo
      "assets/product-monk-logo.png"        // 5. Fabric/detail shot
    ],
    description: "Uma homenagem à estética minimalista e brutalista oriental. A arte traseira do monge da disciplina é impressa em Silk Screen de alta densidade na cor branca fria sobre fundo preto coal. Exclusividade pura.",
    details: "• 100% Algodão Heavyweight Penteado\n• Modelagem oversized quadrada (boxy fit)\n• Costuras reforçadas de ombro a ombro\n• Acabamento em ribana grossa de 3cm\n• Silk Screen industrial de longa durabilidade"
  },
  {
    id: "broccoli",
    name: "VOID Brocolis Oversized",
    colorText: "Preto Heavy / Green Neon",
    badge: "HEAVYWEIGHT",
    price: 109.90,
    oldPrice: 159.90,
    tagline: "BRÓCOLIS É O SEGREDO / STRONG",
    images: [
      "assets/product-broccoli-back.png",   // 1. BACK PRINT (Main Hero)
      "assets/product-broccoli-front.png",  // 2. FRONT VIEW
      "assets/product-broccoli-back.png",   // 3. Detail close-up
      "assets/campaign-broccoli-gym.png",   // 4. Lifestyle/gym photo
      "assets/product-broccoli-front.png"   // 5. Fabric/detail shot
    ],
    description: "Brócolis é a fonte de poder secreta da crew. Estampa irônica e agressiva com o brócolis em chamas néon verde nas costas e logo de metal distorcido no peitoral. Estilo e impacto brutais.",
    details: "• Algodão amaciado de alta costura\n• Caimento perfeito para treinos intensos\n• Modelagem oversized autêntica streetwear\n• Detalhes em Silk Screen de alta fixação\n• Tecido ultra robusto de alta durabilidade"
  },
  {
    id: "cat",
    name: "VOID Bad Cat Oversized",
    colorText: "Preto Shadow / Pink Neon",
    badge: "LIMITED",
    price: 109.90,
    oldPrice: 159.90,
    tagline: "BAD CAT / STRONG. FEMINE. HUNGRY.",
    images: [
      "assets/product-cat-back.png",        // 1. BACK PRINT (Main Hero)
      "assets/product-cat-front.png",       // 2. FRONT VIEW
      "assets/product-cat-back.png",        // 3. Detail close-up
      "assets/campaign-cat-gym.png",        // 4. Lifestyle/gym photo
      "assets/product-cat-front.png"        // 5. Fabric/detail shot
    ],
    description: "Visual rebelde e atitude com a estampa traseira do Bad Cat em contornos rosa néon sobrepostos. Uma modelagem oversized confortável com gola grossa que exala o espírito underground das ruas das grandes cidades.",
    details: "• Malha de algodão premium penteada 30.1\n• Gramatura robusta com caimento impecável\n• Gola de ribana pesada e reforçada de 3cm\n• Impressão de alta precisão que não desbota\n• Peça lavada e pré-encolhida de fábrica"
  },
  {
    id: "dragon",
    name: "VOID Dragon Oversized",
    colorText: "Off-White Creme",
    badge: "EXCLUSIVE",
    price: 109.90,
    oldPrice: 159.90,
    tagline: "DISCIPLINE IS POWER / 規律は力",
    images: [
      "assets/product-dragon-back.png",     // 1. BACK PRINT (Main Hero)
      "assets/product-dragon-front.png",    // 2. FRONT VIEW
      "assets/campaign-dragon-front.png",   // 3. Detail close-up
      "assets/campaign-tiger-gym.png",      // 4. Lifestyle/gym photo
      "assets/product-dragon-front.png"     // 5. Fabric/detail shot
    ],
    description: "O único modelo Off-White do drop. Apresenta o dragão da disciplina impressa nas costas em tinta vermelha e carvão com tipografia oriental. Perfeito para contraste visual na academia e no rolê urbano.",
    details: "• Tecido de algodão heavyweight encorpado Off-White\n• Ribana de gola de 3cm pesada e canelada\n• Estampa com tinta industrial de alta cobertura\n• Corte streetwear amplo e autêntico\n• Costuras laterais e ombros reforçados"
  }
];

// 2. CONFIGURAÇÕES DOS COMBOS COMERCIAIS
const COMBOS = {
  "1": {
    id: 1,
    name: "1 CAMISETA",
    price: 109.90,
    itemCount: 1,
    shippingFree: false,
    savingsText: "Sem frete grátis"
  },
  "2": {
    id: 2,
    name: "2 CAMISETAS (PACK)",
    price: 199.90,
    itemCount: 2,
    shippingFree: false,
    savingsText: "Economize R$ 19,90"
  },
  "3": {
    id: 3,
    name: "3 CAMISETAS + FRETE GRÁTIS",
    price: 269.90,
    itemCount: 3,
    shippingFree: true,
    savingsText: "Economize R$ 59,80 + Frete Grátis"
  }
};

// 3. ESTADO DA APLICAÇÃO (CARRINHO MULTI-ITEM)
let shoppingCart = []; 

// 4. SELETOR DE TAMANHOS SELECIONADOS POR PRODUTO
const selectedSizes = {};
PRODUCTS.forEach(p => {
  selectedSizes[p.id] = "M"; // Padrão: M
});

// 5. ELEMENTOS DOM PRINCIPAIS E INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initStockUrgency();
  renderCatalog();
  initCartEvents();
  initCarousel();
  initFaqAccordion();
  initToastsSystem();
  initMobileMenu();
});

// ==========================================================================
// K. MENU MOBILE HAMBÚRGUER — FULLSCREEN OVERLAY
// ==========================================================================
function initMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("mobileMenuOverlay");
  const closeBtn = document.getElementById("mobileMenuClose");
  if (!toggle || !overlay) return;

  window.openMobileMenu = function() {
    overlay.classList.add("open");
    toggle.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeMobileMenu = function() {
    overlay.classList.remove("open");
    toggle.classList.remove("active");
    document.body.style.overflow = "";
  };

  window.toggleMobileMenu = function() {
    if (overlay.classList.contains("open")) {
      window.closeMobileMenu();
    } else {
      window.openMobileMenu();
    }
  };

  toggle.addEventListener("click", window.toggleMobileMenu);
  if (closeBtn) closeBtn.addEventListener("click", window.closeMobileMenu);

  // Fechar ao clicar fora dos links
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) window.closeMobileMenu();
  });
}

// ==========================================================================
// C. RENDERIZAR O CATÁLOGO DINÂMICO DE PRODUTOS (SHOPIFY STYLE)
// ==========================================================================
function renderCatalog() {
  const catalogContainer = document.getElementById("productsCatalog");
  if (!catalogContainer) return;

  catalogContainer.innerHTML = PRODUCTS.map(p => {
    const backImage = p.images[0];
    const frontImage = p.images[1];
    return `
      <div class="product-card" id="product-${p.id}" onclick="openProductPage('${p.id}')">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <div class="product-card-thumb" title="Ver detalhes de ${p.name}">
          <img src="${frontImage}" alt="${p.name} Frente" class="front-img" id="thumb-front-${p.id}">
          <img src="${backImage}" alt="${p.name} Costas" class="back-img" id="thumb-back-${p.id}" style="opacity: 0;">
        </div>
        <div class="product-card-details">
          <h3 class="product-card-title">${p.name}</h3>
          <div class="product-card-pricing">
            <span class="product-old-price">R$ ${p.oldPrice.toFixed(2).replace('.', ',')}</span>
            <span class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="product-installments">6x de R$ ${(p.price / 6).toFixed(2).replace('.', ',')} s/juros</div>
          <button class="product-card-btn" onclick="addProductToCart('${p.id}'); event.stopPropagation();">+ ADD</button>
        </div>
      </div>
    `;
  }).join('');
}

window.selectSize = function(productId, size) {
  selectedSizes[productId] = size;
  const sizesContainer = document.getElementById(`sizes-${productId}`);
  if (sizesContainer) {
    const buttons = sizesContainer.querySelectorAll(".size-btn");
    buttons.forEach(btn => {
      btn.classList.toggle("active", btn.textContent === size);
    });
  }
};

window.toggleFlip = function(productId) {
  const frontImg = document.getElementById(`thumb-front-${productId}`);
  const backImg = document.getElementById(`thumb-back-${productId}`);
  if (!frontImg || !backImg) return;

  const isBackVisible = backImg.style.opacity === "1";
  if (isBackVisible) {
    backImg.style.opacity = "0";
    frontImg.style.opacity = "1";
  } else {
    backImg.style.opacity = "1";
    frontImg.style.opacity = "0";
  }
};

window.addProductToCart = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const size = selectedSizes[productId] || "M";
  const existingItem = shoppingCart.find(item => item.product.id === productId && item.size === size);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    shoppingCart.push({
      product: product,
      size: size,
      quantity: 1
    });
  }

  updateCartUI();
  window.openCart();
};

window.changeQuantity = function(productId, size, change) {
  const item = shoppingCart.find(item => item.product.id === productId && item.size === size);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    shoppingCart = shoppingCart.filter(item => !(item.product.id === productId && item.size === size));
  }
  updateCartUI();
};

window.removeItem = function(productId, size) {
  shoppingCart = shoppingCart.filter(item => !(item.product.id === productId && item.size === size));
  updateCartUI();
};

// ==========================================================================
// D. EVENTOS DO CARRINHO DE COMPRAS E MODAL DE SUCESSO
// ==========================================================================
function initCartEvents() {
  const cartTrigger = document.getElementById("cartTrigger");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModalOverlay = document.getElementById("checkoutModalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  window.openCart = () => {
    cartOverlay.classList.add("open");
    cartDrawer.classList.add("open");
  };
  window.closeCart = () => {
    cartOverlay.classList.remove("open");
    cartDrawer.classList.remove("open");
  };

  cartTrigger.addEventListener("click", window.openCart);
  cartClose.addEventListener("click", window.closeCart);
  cartOverlay.addEventListener("click", window.closeCart);

  checkoutBtn.addEventListener("click", () => {
    window.closeCart();

    const modalOrderId = document.getElementById("modalOrderId");
    if (modalOrderId) {
      modalOrderId.textContent = `#VOID-${Math.floor(Math.random() * 9000) + 1000}-2026`;
    }

    checkoutModalOverlay.classList.add("open");

    // Resetar Carrinho
    shoppingCart = [];
    updateCartUI();
  });

  modalCloseBtn.addEventListener("click", () => {
    checkoutModalOverlay.classList.remove("open");
  });
}

// ==========================================================================
// E. ATUALIZAR INTERFACE DO CARRINHO COM CÁLCULO DE DESCONTOS PROGRESSIVOS
// ==========================================================================
function updateCartUI() {
  const cartBadge = document.getElementById("cartBadge");
  const cartEmptyState = document.getElementById("cartEmptyState");
  const cartFilledState = document.getElementById("cartFilledState");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const freeShippingStatus = document.getElementById("freeShippingStatus");
  const freeShippingBar = document.getElementById("freeShippingBar");

  if (!cartBadge) return;

  const totalQuantity = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) {
    cartBadge.textContent = "0";
    cartEmptyState.style.display = "block";
    cartFilledState.style.display = "none";
    return;
  }

  // Preencher Badge
  cartBadge.textContent = totalQuantity;
  cartEmptyState.style.display = "none";
  cartFilledState.style.display = "flex";

  // Preencher itens no Carrinho
  cartItemsContainer.innerHTML = shoppingCart.map(item => `
    <div class="cart-item-card">
      <div class="cart-item-thumb">
        <img src="${item.product.images[1]}" alt="${item.product.name}">
      </div>
      <div class="cart-item-details">
        <span class="cart-item-title">${item.product.name}</span>
        <span class="cart-item-desc">Modelo: ${item.product.colorText} / Tam: ${item.size}</span>
        <div class="cart-item-qty-selector">
          <button class="qty-adjust-btn" onclick="changeQuantity('${item.product.id}', '${item.size}', -1)">-</button>
          <span class="qty-number">${item.quantity}</span>
          <button class="qty-adjust-btn" onclick="changeQuantity('${item.product.id}', '${item.size}', 1)">+</button>
        </div>
      </div>
      <div class="cart-item-price-box">
        <span class="cart-item-price">R$ ${(109.90 * item.quantity).toFixed(2).replace('.', ',')}</span>
        <button class="cart-item-remove-btn" onclick="removeItem('${item.product.id}', '${item.size}')" title="Excluir item">✕</button>
      </div>
    </div>
  `).join('');

  // 1 camiseta -> R$109,90
  // 2 camisetas -> R$199,90 (total)
  // 3+ camisetas -> R$269,90 (primeiras 3) + R$89,96 por camiseta adicional (baseada no valor R$269,90 / 3)
  let subtotal = 0;
  if (totalQuantity === 1) {
    subtotal = 109.90;
  } else if (totalQuantity === 2) {
    subtotal = 199.90;
  } else if (totalQuantity >= 3) {
    subtotal = 269.90 + (totalQuantity - 3) * 89.96;
  }

  const originalPrice = totalQuantity * 109.90;
  const discount = originalPrice - subtotal;

  // Frete
  const shippingFree = totalQuantity >= 3;
  const shippingCost = shippingFree ? 0 : 19.90;
  const finalTotal = subtotal + shippingCost;

  // Renderizar Valores do Resumo
  let summaryHTML = `
    <div class="summary-row">
      <span>Subtotal (Itens):</span>
      <span>R$ ${originalPrice.toFixed(2).replace('.', ',')}</span>
    </div>
  `;

  if (discount > 0.01) {
    summaryHTML += `
      <div class="summary-row" style="color: var(--color-neon-green); font-weight: 600;">
        <span>Desconto Pack Automático:</span>
        <span>- R$ ${discount.toFixed(2).replace('.', ',')}</span>
      </div>
    `;
  }

  summaryHTML += `
    <div class="summary-row">
      <span>Frete:</span>
      <span>${shippingFree ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}</span>
    </div>
    <div class="summary-row total">
      <span>Total:</span>
      <span>R$ ${finalTotal.toFixed(2).replace('.', ',')}</span>
    </div>
  `;

  document.querySelector(".cart-summary").innerHTML = summaryHTML;

  // Controle de Progresso do Frete Grátis & Incentive
  if (totalQuantity === 1) {
    freeShippingStatus.innerHTML = `Adicione mais <strong>1 camiseta</strong> para desconto automático!`;
    freeShippingBar.style.width = "33%";
    freeShippingBar.className = "progress-bar-fill";
  } else if (totalQuantity === 2) {
    freeShippingStatus.innerHTML = `Falta apenas <strong>1 camiseta</strong> para liberar <strong>FRETE GRÁTIS</strong> e desconto máximo!`;
    freeShippingBar.style.width = "66%";
    freeShippingBar.className = "progress-bar-fill";
  } else if (totalQuantity >= 3) {
    freeShippingStatus.innerHTML = `🔥 <strong>FRETE GRÁTIS & DESCONTO MÁXIMO LIBERADOS!</strong>`;
    freeShippingBar.style.width = "100%";
    freeShippingBar.className = "progress-bar-fill green";
  }
}


// ==========================================================================
// F. CAROUSEL DE LIFESTYLE (SLIDER COM SUPORTE E BULLETS)
// ==========================================================================
function initCarousel() {
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("carouselPrevBtn");
  const nextBtn = document.getElementById("carouselNextBtn");
  const dotsContainer = document.getElementById("carouselDots");
  
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = Array.from(track.children);
  let currentIndex = 0;

  // Renderizar Dots
  dotsContainer.innerHTML = slides.map((_, idx) => `<div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})"></div>`).join('');
  const dots = Array.from(dotsContainer.children);

  const updateCarousel = (index) => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === index);
    });
    currentIndex = index;
  };

  window.goToSlide = function(index) {
    updateCarousel(index);
  };

  prevBtn.addEventListener("click", () => {
    let nextIdx = currentIndex - 1;
    if (nextIdx < 0) nextIdx = slides.length - 1;
    updateCarousel(nextIdx);
  });

  nextBtn.addEventListener("click", () => {
    let nextIdx = currentIndex + 1;
    if (nextIdx >= slides.length) nextIdx = 0;
    updateCarousel(nextIdx);
  });

  // Auto-play suave do slide
  setInterval(() => {
    let nextIdx = currentIndex + 1;
    if (nextIdx >= slides.length) nextIdx = 0;
    updateCarousel(nextIdx);
  }, 6000);
}

// ==========================================================================
// G. FAQ ACCORDION INTERATIVO
// ==========================================================================
function initFaqAccordion() {
  const faqTriggers = document.querySelectorAll(".faq-trigger");

  faqTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const parent = trigger.parentElement;
      const answer = parent.querySelector(".faq-answer");
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      // Fechar todos
      document.querySelectorAll(".faq-item").forEach(item => {
        item.classList.remove("active");
        item.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
        item.querySelector(".faq-answer").style.maxHeight = null;
      });

      // Expandir o atual se não estivesse expandido
      if (!isExpanded) {
        parent.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
        // Ajuste dinâmico de altura para transição nativa de CSS
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

// ==========================================================================
// H. NOTIFICAÇÕES FLUTUANTES (FOMO E PROVA SOCIAL)
// ==========================================================================
function initToastsSystem() {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const names = ["Lucas", "Felipe", "Sofia", "Arthur", "Beatriz", "Gabriel", "Julia", "Enzo", "Guilherme", "Valentina", "Thiago", "Manuela"];
  const cities = ["São Paulo, SP", "Rio de Janeiro, RJ", "Porto Alegre, RS", "Curitiba, PR", "Belo Horizonte, MG", "Salvador, BA", "Brasília, DF", "Fortaleza, CE"];
  const comboTypes = ["Combo 3 Camisetas + Frete Grátis", "Combo 2 Camisetas (Pack)", "Combo 1 Camiseta (Básico)"];
  
  function triggerToast() {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomCombo = comboTypes[Math.floor(Math.random() * comboTypes.length)];
    const randomSec = Math.floor(Math.random() * 50) + 10;

    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerHTML = `
      <span class="toast-icon">⚡</span>
      <div class="toast-content">
        <span class="toast-message"><strong>${randomName}</strong> de ${randomCity} comprou o <strong>${randomCombo}</strong></span>
        <span class="toast-time">há ${randomSec} segundos</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Remover após 5 segundos
    setTimeout(() => {
      toast.style.animation = "toastIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) reverse forwards";
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 5000);
  }

  // Primeiro Toast após 8 segundos
  setTimeout(triggerToast, 8000);

  // Gatilhos subsequentes a cada 18 a 30 segundos aleatoriamente
  const scheduleNextToast = () => {
    const delay = Math.random() * 12000 + 18000;
    setTimeout(() => {
      triggerToast();
      scheduleNextToast();
    }, delay);
  };
  scheduleNextToast();
}

// ==========================================================================
// I. SISTEMA DE COUNTDOWN E ESTOQUE CRÍTICO (SIMULADOS)
// ==========================================================================
function initCountdown() {
  const timerEl = document.getElementById("countdownTimer");
  if (!timerEl) return;

  let timeRemaining = sessionStorage.getItem("void_countdown");
  if (!timeRemaining) {
    timeRemaining = 2 * 60 * 60 + 45 * 60 + 12; // 2h 45m 12s em segundos
  } else {
    timeRemaining = parseInt(timeRemaining, 10);
  }

  const updateTimer = () => {
    if (timeRemaining <= 0) {
      timeRemaining = 3 * 60 * 60; // Resetar para 3 horas
    }
    timeRemaining--;
    sessionStorage.setItem("void_countdown", timeRemaining);

    const hrs = Math.floor(timeRemaining / 3600);
    const mins = Math.floor((timeRemaining % 3600) / 60);
    const secs = timeRemaining % 60;

    timerEl.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}

function initStockUrgency() {
  // Peça centralizada de urgência bypass
}

// ==========================================================================
// J. SISTEMA DE PÁGINA DE PRODUTO DEDICADA PREMIUM (SHOPIFY LAYOUT STYLE)
// ==========================================================================
let currentProductPageSize = "M";

window.openProductPage = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentProductPageSize = "M"; // Resetar tamanho ativo para M
  
  const overlay = document.getElementById("productPageOverlay");
  if (!overlay) return;

  // Renderizar a galeria de 5 imagens (modo desktop: thumbnails | modo mobile: swipe)
  const thumbsHTML = product.images.map((img, index) => `
    <div class="product-gallery-thumb ${index === 0 ? 'active' : ''}" onclick="window.changeProductImage(this, '${img}')">
      <img src="${img}" alt="${product.name} Miniatura ${index + 1}">
    </div>
  `).join('');

  // Bullets para galeria mobile swipeable
  const bulletsHTML = product.images.map((_, index) => `
    <span class="gallery-bullet ${index === 0 ? 'active' : ''}"></span>
  `).join('');

  // Slides para galeria mobile swipeable
  const slidesHTML = product.images.map((img, index) => `
    <div class="mobile-gallery-slide">
      <img src="${img}" alt="${product.name} ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}">
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="product-page-container">
      <button class="product-page-close-btn" onclick="window.closeProductPage()" title="Voltar ao catálogo">✕ RETORNAR AO DROP</button>
      
      <div class="product-page-layout">
        <!-- LADO ESQUERDO: Galeria Shopify-Style (Desktop) / Swipe (Mobile) -->
        <div class="product-page-gallery-side">
          <!-- Desktop: thumbnails + imagem principal -->
          <div class="product-gallery-thumbnails-wrapper desktop-only">
            <div class="product-gallery-thumbnails">
              ${thumbsHTML}
            </div>
          </div>
          <div class="product-main-image-wrapper desktop-only" id="productMainImageContainer">
            <img src="${product.images[0]}" alt="${product.name} - Estampa Costas" id="productMainImage" class="zoom-image">
            <span class="product-gallery-indicator">Costas (Main Print)</span>
          </div>

          <!-- Mobile: galeria swipeable com scroll-snap -->
          <div class="mobile-gallery-track" id="mobileGalleryTrack" onscroll="window.updateGalleryBullets(this)">
            ${slidesHTML}
          </div>
          <div class="mobile-gallery-bullets" id="mobileGalleryBullets">
            ${bulletsHTML}
          </div>
        </div>
        
        <!-- LADO DIREITO: Detalhes e Conversão -->
        <div class="product-page-details-side" id="productDetailsSide">
          <span class="product-page-subtitle">// COLLECTION LOTE 01</span>
          <h2 class="product-page-title">${product.name}</h2>
          <span class="product-page-color">${product.colorText}</span>
          
          <div class="product-page-review-row">
            <span class="review-stars-small">★★★★★</span>
            <span class="review-count">(49 avaliações confirmadas)</span>
          </div>
          
          <div class="product-page-pricing">
            <span class="product-page-old-price">R$ ${product.oldPrice.toFixed(2).replace('.', ',')}</span>
            <span class="product-page-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="product-page-installments">ou 6x de R$ ${(product.price / 6).toFixed(2).replace('.', ',')} sem juros no cartão</div>
          
          <!-- Seletor de Tamanhos Redondos -->
          <div class="product-page-sizes-wrapper">
            <div class="size-header-row">
              <span class="size-title-label">TAMANHO:</span>
              <span class="size-current-active" id="activeSizeDisplay">M (RECOMENDADO)</span>
            </div>
            <div class="product-page-sizes">
              <button class="size-rounded-btn" onclick="window.selectProductPageSize(this, 'P')">P</button>
              <button class="size-rounded-btn active" onclick="window.selectProductPageSize(this, 'M')">M</button>
              <button class="size-rounded-btn" onclick="window.selectProductPageSize(this, 'G')">G</button>
              <button class="size-rounded-btn" onclick="window.selectProductPageSize(this, 'GG')">GG</button>
              <button class="size-rounded-btn" onclick="window.selectProductPageSize(this, 'XG')">XG</button>
            </div>
          </div>
          
          <!-- Botão ADD TO CART (Desktop inline) -->
          <button class="btn-add-to-cart desktop-only" onclick="window.addProductPageToCart('${product.id}')">ADICIONAR AO DROP ➔</button>
          
          <!-- Benefícios Premium -->
          <div class="product-page-benefits">
            <div class="benefit-item-small">
              <span class="benefit-icon-small">🛡️</span>
              <span class="benefit-text-small">Algodão Heavyweight (220g/m²)</span>
            </div>
            <div class="benefit-item-small">
              <span class="benefit-icon-small">✂️</span>
              <span class="benefit-text-small">Modelagem Oversized Autêntica</span>
            </div>
            <div class="benefit-item-small">
              <span class="benefit-icon-small">🎨</span>
              <span class="benefit-text-small">Estampa Maciça de Alta Costura</span>
            </div>
            <div class="benefit-item-small">
              <span class="benefit-icon-small">🧵</span>
              <span class="benefit-text-small">Costura Reforçada de Ombros</span>
            </div>
            <div class="benefit-item-small">
              <span class="benefit-icon-small">⚡</span>
              <span class="benefit-text-small">Drop Limitado / Sem Restock</span>
            </div>
          </div>
          
          <!-- Acordeões Expansíveis -->
          <div class="product-page-accordions">
            <div class="product-accordion-item">
              <button class="product-accordion-header" onclick="window.toggleProductAccordion(this)">
                <span>CONCEITO & MODELO</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="product-accordion-content">
                <p>${product.description}</p>
              </div>
            </div>
            <div class="product-accordion-item">
              <button class="product-accordion-header" onclick="window.toggleProductAccordion(this)">
                <span>ESPECIFICAÇÕES TÉCNICAS</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="product-accordion-content">
                <p style="white-space: pre-line;">${product.details}</p>
              </div>
            </div>
            <div class="product-accordion-item">
              <button class="product-accordion-header" onclick="window.toggleProductAccordion(this)">
                <span>PRAZO DE ENVIO</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="product-accordion-content">
                <p>Nossos drops são limitados e exclusivos. As postagens e envios ocorrem em até 3 dias úteis após a compensação do pagamento. Código de rastreamento enviado automaticamente via e-mail.</p>
              </div>
            </div>
            <div class="product-accordion-item">
              <button class="product-accordion-header" onclick="window.toggleProductAccordion(this)">
                <span>TABELA DE TAMANHOS (SIZE GUIDE)</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="product-accordion-content">
                <div class="size-guide-table-wrapper">
                  <table class="size-guide-table">
                    <thead><tr><th>Tamanho</th><th>Largura (cm)</th><th>Altura (cm)</th><th>Manga (cm)</th></tr></thead>
                    <tbody>
                      <tr><td>P</td><td>56</td><td>74</td><td>23</td></tr>
                      <tr><td>M</td><td>59</td><td>76</td><td>24</td></tr>
                      <tr><td>G</td><td>62</td><td>78</td><td>25</td></tr>
                      <tr><td>GG</td><td>65</td><td>80</td><td>26</td></tr>
                      <tr><td>XG</td><td>68</td><td>82</td><td>27</td></tr>
                    </tbody>
                  </table>
                  <p class="size-guide-tip">Dica: Nossa modelagem é oversized autêntica. Para caimento streetwear, peça seu tamanho padrão.</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Espaço inferior para o sticky CTA mobile não tapar acordeões -->
          <div class="mobile-sticky-spacer"></div>
        </div>
      </div>
    </div>

    <!-- Sticky CTA Mobile (fixado no rodapé, visível apenas no mobile) -->
    <div class="mobile-sticky-cta mobile-only" id="mobileStickyCta">
      <div class="mobile-sticky-size-indicator">
        <span>TAMANHO: </span><span id="mobileStickySize">M</span>
      </div>
      <button class="mobile-sticky-btn" onclick="window.addProductPageToCart('${product.id}')">
        ADICIONAR AO DROP
        <span class="sticky-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
      </button>
    </div>
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  
  // Iniciar zoom na imagem principal (apenas desktop)
  window.setupImageZoom();
};

window.closeProductPage = function() {
  const overlay = document.getElementById("productPageOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = ""; // Reabilitar scroll
};

window.changeProductImage = function(thumbElement, imageUrl) {
  // Alterar a imagem hero principal
  const mainImage = document.getElementById("productMainImage");
  if (mainImage) {
    mainImage.src = imageUrl;
  }

  // Identificar qual parte do produto estamos vendo para a label informativa
  const indicator = document.querySelector(".product-gallery-indicator");
  if (indicator) {
    if (imageUrl.includes("back")) {
      indicator.textContent = "Costas (Main Print)";
    } else if (imageUrl.includes("front")) {
      indicator.textContent = "Frente (Front View)";
    } else if (imageUrl.includes("graphic")) {
      indicator.textContent = "Detalhe do Grafismo";
    } else if (imageUrl.includes("gym") || imageUrl.includes("lifestyle")) {
      indicator.textContent = "Campanha Lifestyle";
    } else if (imageUrl.includes("logo") || imageUrl.includes("character")) {
      indicator.textContent = "Detalhe do Tecido";
    } else {
      indicator.textContent = "Detalhe Ampliado";
    }
  }

  // Alterar classe ativa das miniaturas
  const allThumbs = document.querySelectorAll(".product-gallery-thumb");
  allThumbs.forEach(t => t.classList.remove("active"));
  thumbElement.classList.add("active");
};

window.selectProductPageSize = function(buttonElement, size) {
  currentProductPageSize = size;
  
  const allButtons = document.querySelectorAll(".size-rounded-btn");
  allButtons.forEach(btn => btn.classList.remove("active"));
  buttonElement.classList.add("active");

  const display = document.getElementById("activeSizeDisplay");
  if (display) {
    display.textContent = `${size} ${size === 'M' ? '(RECOMENDADO)' : ''}`;
  }

  // Sincronizar com o indicador de tamanho do sticky CTA mobile
  const mobileStickySize = document.getElementById("mobileStickySize");
  if (mobileStickySize) {
    mobileStickySize.textContent = size;
  }
};

// Atualizar bullets da galeria swipeable mobile baseado na rolagem
window.updateGalleryBullets = function(trackEl) {
  const slideWidth = trackEl.offsetWidth;
  const currentIndex = Math.round(trackEl.scrollLeft / slideWidth);
  const bullets = document.querySelectorAll(".gallery-bullet");
  bullets.forEach((b, i) => b.classList.toggle("active", i === currentIndex));
};

window.toggleProductAccordion = function(headerElement) {
  const parent = headerElement.parentElement;
  const content = parent.querySelector(".product-accordion-content");
  const isExpanded = headerElement.classList.contains("active");

  // Fechar todos na página do produto
  const allItems = document.querySelectorAll(".product-accordion-item");
  allItems.forEach(item => {
    item.querySelector(".product-accordion-header").classList.remove("active");
    item.querySelector(".accordion-icon").textContent = "+";
    item.querySelector(".product-accordion-content").style.maxHeight = null;
  });

  if (!isExpanded) {
    headerElement.classList.add("active");
    headerElement.querySelector(".accordion-icon").textContent = "−";
    content.style.maxHeight = content.scrollHeight + "px";
  }
};

window.setupImageZoom = function() {
  const container = document.getElementById("productMainImageContainer");
  const img = document.getElementById("productMainImage");
  if (!container || !img) return;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    img.style.transform = "scale(1.7)";
  });

  container.addEventListener("mouseleave", () => {
    img.style.transform = "scale(1)";
    img.style.transformOrigin = "center center";
  });
};

window.addProductPageToCart = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const size = currentProductPageSize;
  const existingItem = shoppingCart.find(item => item.product.id === productId && item.size === size);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    shoppingCart.push({
      product: product,
      size: size,
      quantity: 1
    });
  }

  updateCartUI();
  window.closeProductPage(); // Opcional: fechar para o cliente ver o carrinho abrir
  window.openCart();
};
