/* ==========================================================================
   VOID CREW — PRODUCTION HEADLESS SHOPIFY STOREFRONT SYSTEM
   Integração Direta com Shopify Storefront API (GraphQL)
   Carrinho Real, Checkout Seguro, Produtos Reais e Inventário Dinâmico
   ========================================================================== */

// 1. ESTADO GLOBAL DA APLICAÇÃO
let SHOPIFY_DOMAIN = "";
let SHOPIFY_ACCESS_TOKEN = "";
let PRODUCTS = [];
let shoppingCart = [];
let currentProductPageSize = "M";

// Injetar estilos de animação de loading e utilitários
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner-spin { animation: spin 0.8s linear infinite; }
`;
document.head.appendChild(style);

// 2. INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener("DOMContentLoaded", async () => {
  initCountdown();
  initFaqAccordion();
  initMobileMenu();
  initCarousel();
  initHeaderScroll();
  initDiscountSimulator();
  initSizeGuideEvents();
  initScrollRevealAndParallax();

  const configured = await initShopify();
  if (configured) {
    await fetchShopifyProducts();
    await initShopifyCart();
  } else {
    renderConfigWarning();
  }

  initCartEvents();
});

// ==========================================================================
// A. INICIALIZAÇÃO E CLIENTE GRAPHQL DO SHOPIFY
// ==========================================================================
async function initShopify() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    
    SHOPIFY_DOMAIN = config.domain || "";
    SHOPIFY_ACCESS_TOKEN = config.accessToken || "";

    if (!SHOPIFY_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
      console.warn("[SHOPIFY CONFIG] Variáveis de ambiente do Shopify não configuradas.");
      return false;
    }
    return true;
  } catch (err) {
    console.error("Falha ao ler endpoint de configuração /api/config:", err);
    return false;
  }
}

async function shopifyQuery(query, variables = {}) {
  const url = `https://${SHOPIFY_DOMAIN}/api/2024-04/graphql.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.error("HTTP error response:", response.status, text);
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }
  
  const result = await response.json();
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(result.errors[0].message);
  }
  return result.data;
}

// ==========================================================================
// B. CONSULTAS E MUTAÇÕES GRAPHQL (STOREFRONT API)
// ==========================================================================
const FETCH_PRODUCTS_QUERY = `
  query getProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                availableForSale
                price {
                  amount
                }
                product {
                  id
                  title
                  images(first: 1) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
          }
          subtotalAmount {
            amount
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                  }
                  product {
                    title
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
          }
          subtotalAmount {
            amount
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                  }
                  product {
                    title
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
          }
          subtotalAmount {
            amount
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                  }
                  product {
                    title
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
          }
          subtotalAmount {
            amount
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                  }
                  product {
                    title
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ==========================================================================
// C. BUSCA E RENDERIZAÇÃO DO CATÁLOGO DINÂMICO REAL
// ==========================================================================
async function fetchShopifyProducts() {
  try {
    const data = await shopifyQuery(FETCH_PRODUCTS_QUERY);
    
    PRODUCTS = data.products.edges.map(edge => {
      const node = edge.node;
      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      const firstVariant = node.variants.edges[0]?.node;
      const oldPrice = firstVariant?.compareAtPrice ? parseFloat(firstVariant.compareAtPrice.amount) : price * 1.35;

      const variants = node.variants.edges.map(ve => {
        const v = ve.node;
        const sizeOption = v.selectedOptions.find(o => o.name.toLowerCase() === 'tamanho' || o.name.toLowerCase() === 'size');
        return {
          id: v.id,
          title: v.title,
          price: parseFloat(v.price.amount),
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null,
          size: sizeOption ? sizeOption.value : v.title,
          available: v.availableForSale
        };
      });

      // Extrair tags ou criar badges baseados no handle
      let badge = "";
      if (node.handle.includes("tiger") || node.handle.includes("best")) {
        badge = "BEST SELLER";
      } else if (node.handle.includes("new") || node.handle.includes("samurai")) {
        badge = "NEW DROP";
      } else if (!node.availableForSale) {
        badge = "ESGOTADO";
      } else if (variants.length <= 2) {
        badge = "LIMITED LOTE 01";
      }

      return {
        id: node.id,
        handle: node.handle,
        name: node.title,
        badge: badge,
        price: price,
        oldPrice: oldPrice,
        images: node.images.edges.map(e => e.node.url),
        description: node.description,
        details: node.descriptionHtml,
        variants: variants,
        available: node.availableForSale
      };
    });

    renderCatalog();
    updateFlagshipSection();
  } catch (err) {
    console.error("Erro ao puxar catálogo do Shopify:", err);
    renderErrorCatalog(err.message);
  }
}

function renderCatalog() {
  const catalogContainer = document.getElementById("productsCatalog");
  if (!catalogContainer) return;

  if (PRODUCTS.length === 0) {
    catalogContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px; font-family: monospace;">
        Nenhum produto encontrado na sua coleção do Shopify.
      </div>
    `;
    return;
  }

  catalogContainer.innerHTML = PRODUCTS.map((p, index) => {
    const frontImage = p.images[1] || p.images[0] || 'assets/placeholder.png';
    const backImage = p.images[0] || 'assets/placeholder.png';
    const isAvailable = p.available;
    
    // Ficha técnica assimétrica estilo ateliê
    const techSpec = p.name.toUpperCase().includes("TIGER")
      ? "HEAVYCOTTON 220g/m² • FIT OVERSIZED 90s • COSTURA DE OMBRO REFORÇADA"
      : "PREMIUM COTTON 200g/m² • OMBRO REBAIXADO • RIBANA CANELADA 3cm";

    // Número editorial no topo do card
    const editorialIndex = String(index + 1).padStart(2, '0') + '/';

    return `
      <div class="product-card ${!isAvailable ? 'sold-out' : ''}" id="product-${p.id.replace(/[^a-z0-9]/gi, '_')}" onclick="openProductPage('${p.id}')">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <div class="product-card-thumb" title="Ver detalhes de ${p.name}">
          <span class="product-editorial-index">${editorialIndex}</span>
          <img src="${frontImage}" alt="${p.name} Frente" class="front-img">
          <img src="${backImage}" alt="${p.name} Costas" class="back-img" style="opacity: 0;">
          <div class="product-tech-spec">${techSpec}</div>
          ${isAvailable ? `<button class="quick-add-btn" onclick="window.addProductToCart('${p.id}', 'M'); event.stopPropagation();">COMPRA RÁPIDA (TAM M) ➔</button>` : ''}
        </div>
        <div class="product-card-details">
          <h3 class="product-card-title">${p.name}</h3>
          <div class="product-card-pricing">
            <span class="product-old-price">R$ ${p.oldPrice.toFixed(2).replace('.', ',')}</span>
            <span class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="product-installments">6x de R$ ${(p.price / 6).toFixed(2).replace('.', ',')} s/juros</div>
          <button class="product-card-btn" ${!isAvailable ? 'disabled' : ''} onclick="window.addProductToCart('${p.id}'); event.stopPropagation();">
            ${isAvailable ? '+ ADICIONAR AO DROP' : 'ESGOTADO'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function updateFlagshipSection() {
  const flagship = PRODUCTS[0];
  if (!flagship) return;

  const flagshipImg = document.getElementById("flagshipImage");
  const flagshipTitle = document.querySelector(".flagship-title");
  const flagshipDesc = document.querySelector(".flagship-description");

  if (flagshipImg) flagshipImg.src = flagship.images[0] || flagshipImg.src;
  if (flagshipTitle) flagshipTitle.textContent = flagship.name.toUpperCase();
  if (flagshipDesc) flagshipDesc.textContent = flagship.description;
}

// ==========================================================================
// D. SISTEMA DE CARRINHO DE COMPRAS REAL DO SHOPIFY
// ==========================================================================
async function initShopifyCart() {
  const cartId = localStorage.getItem('shopify_cart_id');
  if (cartId) {
    try {
      showLoadingToast("Carregando seu carrinho...");
      const data = await shopifyQuery(GET_CART_QUERY, { cartId });
      if (data && data.cart) {
        syncCartWithShopify(data.cart);
        hideLoadingToast();
        return;
      }
    } catch (err) {
      console.warn("Carrinho anterior expirado ou inválido. Criando novo...", err);
    }
  }
  localStorage.removeItem('shopify_cart_id');
  localStorage.removeItem('shopify_cart_checkout_url');
  hideLoadingToast();
  updateCartUI(null);
}

function syncCartWithShopify(cartData) {
  if (!cartData) return;
  localStorage.setItem('shopify_cart_id', cartData.id);
  localStorage.setItem('shopify_cart_checkout_url', cartData.checkoutUrl);

  shoppingCart = cartData.lines.edges.map(edge => {
    const line = edge.node;
    const variant = line.merchandise;
    if (!variant) return null;
    return {
      lineId: line.id,
      variantId: variant.id,
      name: variant.product?.title || 'Produto Indisponível',
      colorText: variant.title || '',
      size: variant.title || '',
      quantity: line.quantity,
      price: variant.price ? parseFloat(variant.price.amount) : 0,
      image: variant.product?.images?.edges[0]?.node.url || 'assets/placeholder.png'
    };
  }).filter(Boolean);

  updateCartUI(cartData);
}

window.addProductToCart = async function(productId, size = 'M') {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const variant = product.variants.find(v => v.size === size) || product.variants[0];
  if (!variant) return;

  showLoadingToast("Adicionando item ao drop...");

  try {
    const cartId = localStorage.getItem('shopify_cart_id');
    if (!cartId) {
      // Criar novo carrinho com o item
      const data = await shopifyQuery(CART_CREATE_MUTATION, {
        input: {
          lines: [{ merchandiseId: variant.id, quantity: 1 }]
        }
      });
      if (data && data.cartCreate && data.cartCreate.cart) {
        syncCartWithShopify(data.cartCreate.cart);
      } else {
        throw new Error("Erro ao criar carrinho.");
      }
    } else {
      try {
        // Adicionar linha ao carrinho existente
        const data = await shopifyQuery(CART_LINES_ADD_MUTATION, {
          cartId,
          lines: [{ merchandiseId: variant.id, quantity: 1 }]
        });
        if (data && data.cartLinesAdd && data.cartLinesAdd.cart) {
          syncCartWithShopify(data.cartLinesAdd.cart);
        } else {
          throw new Error("Carrinho expirado ou inválido.");
        }
      } catch (errInner) {
        console.warn("Falha ao adicionar ao carrinho existente (carrinho expirado). Criando novo...", errInner);
        localStorage.removeItem('shopify_cart_id');
        localStorage.removeItem('shopify_cart_checkout_url');
        
        const data = await shopifyQuery(CART_CREATE_MUTATION, {
          input: {
            lines: [{ merchandiseId: variant.id, quantity: 1 }]
          }
        });
        if (data && data.cartCreate && data.cartCreate.cart) {
          syncCartWithShopify(data.cartCreate.cart);
        } else {
          throw new Error("Erro ao criar carrinho após retry: " + errInner.message);
        }
      }
    }
    hideLoadingToast();
    window.openCart();
  } catch (err) {
    console.error("Erro ao adicionar no Shopify Cart:", err);
    showErrorToast("Item indisponível ou erro na conexão: " + err.message);
  }
};

window.changeQuantity = async function(lineId, currentQty, change) {
  const cartId = localStorage.getItem('shopify_cart_id');
  if (!cartId) return;

  const newQty = currentQty + change;
  showLoadingToast("Atualizando carrinho...");

  try {
    if (newQty <= 0) {
      const data = await shopifyQuery(CART_LINES_REMOVE_MUTATION, {
        cartId,
        lineIds: [lineId]
      });
      syncCartWithShopify(data.cartLinesRemove.cart);
    } else {
      const data = await shopifyQuery(CART_LINES_UPDATE_MUTATION, {
        cartId,
        lines: [{ id: lineId, quantity: newQty }]
      });
      syncCartWithShopify(data.cartLinesUpdate.cart);
    }
    hideLoadingToast();
  } catch (err) {
    console.error("Erro ao alterar quantidade:", err);
    showErrorToast("Erro ao alterar quantidade: " + err.message);
    localStorage.removeItem('shopify_cart_id');
    localStorage.removeItem('shopify_cart_checkout_url');
    initShopifyCart();
  }
};

window.removeItem = async function(lineId) {
  const cartId = localStorage.getItem('shopify_cart_id');
  if (!cartId) return;

  showLoadingToast("Removendo item...");

  try {
    const data = await shopifyQuery(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds: [lineId]
    });
    syncCartWithShopify(data.cartLinesRemove.cart);
    hideLoadingToast();
  } catch (err) {
    console.error("Erro ao remover item:", err);
    showErrorToast("Erro ao remover item: " + err.message);
    localStorage.removeItem('shopify_cart_id');
    localStorage.removeItem('shopify_cart_checkout_url');
    initShopifyCart();
  }
};

// ==========================================================================
// E. RENDERIZAR O CARRINHO SEGURO NA TELA (VALORES DO SHOPIFY)
// ==========================================================================
function updateCartUI(cartData) {
  const cartBadge = document.getElementById("cartBadge");
  const cartEmptyState = document.getElementById("cartEmptyState");
  const cartFilledState = document.getElementById("cartFilledState");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const freeShippingStatus = document.getElementById("freeShippingStatus");
  const freeShippingBar = document.getElementById("freeShippingBar");

  if (!cartBadge) return;

  const totalQuantity = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0 || !cartData) {
    cartBadge.textContent = "0";
    cartEmptyState.style.display = "block";
    cartFilledState.style.display = "none";
    return;
  }

  cartBadge.textContent = totalQuantity;
  cartEmptyState.style.display = "none";
  cartFilledState.style.display = "flex";

  // Preencher itens reais no carrinho
  cartItemsContainer.innerHTML = shoppingCart.map(item => `
    <div class="cart-item-card">
      <div class="cart-item-thumb">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <span class="cart-item-title">${item.name}</span>
        <span class="cart-item-desc">Modelo: ${item.colorText} / Tam: ${item.size}</span>
        <div class="cart-item-qty-selector">
          <button class="qty-adjust-btn" onclick="window.changeQuantity('${item.lineId}', ${item.quantity}, -1)">-</button>
          <span class="qty-number">${item.quantity}</span>
          <button class="qty-adjust-btn" onclick="window.changeQuantity('${item.lineId}', ${item.quantity}, 1)">+</button>
        </div>
      </div>
      <div class="cart-item-price-box">
        <span class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
        <button class="cart-item-remove-btn" onclick="window.removeItem('${item.lineId}')" title="Excluir item">✕</button>
      </div>
    </div>
  `).join('');

  // Pegar custos oficiais vindos da API do Shopify (inclui descontos automáticos)
  const subtotal = parseFloat(cartData.cost.subtotalAmount.amount);
  const total = parseFloat(cartData.cost.totalAmount.amount);
  const totalSavings = (totalQuantity * 109.90) - subtotal; // Simula a exibição da economia comercial

  let summaryHTML = `
    <div class="summary-row">
      <span>Subtotal (Itens):</span>
      <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
    </div>
  `;

  if (totalSavings > 0.01) {
    summaryHTML += `
      <div class="summary-row" style="color: var(--color-neon-green); font-weight: 600;">
        <span>Desconto Progressivo Aplicado:</span>
        <span>- R$ ${totalSavings.toFixed(2).replace('.', ',')}</span>
      </div>
    `;
  }

  // Lógica de Frete Grátis na interface
  const shippingFree = totalQuantity >= 4;
  const shippingCost = shippingFree ? 0 : 19.90;
  const finalTotal = total + (shippingFree ? 0 : shippingCost);

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

  // Atualizar Barra de Progresso do Frete Grátis
  if (totalQuantity === 1) {
    freeShippingStatus.innerHTML = `Adicione mais <strong>3 camisetas</strong> para ganhar <strong>FRETE GRÁTIS</strong>!`;
    freeShippingBar.style.width = "25%";
    freeShippingBar.className = "progress-bar-fill";
  } else if (totalQuantity === 2) {
    freeShippingStatus.innerHTML = `Adicione mais <strong>2 camisetas</strong> para ganhar <strong>FRETE GRÁTIS</strong>!`;
    freeShippingBar.style.width = "50%";
    freeShippingBar.className = "progress-bar-fill";
  } else if (totalQuantity === 3) {
    freeShippingStatus.innerHTML = `Adicione apenas <strong>1 camiseta</strong> para liberar <strong>FRETE GRÁTIS</strong>!`;
    freeShippingBar.style.width = "75%";
    freeShippingBar.className = "progress-bar-fill";
  } else if (totalQuantity >= 4) {
    freeShippingStatus.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="free-shipping-icon" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> <strong>FRETE GRÁTIS LIBERADO!</strong>`;
    freeShippingBar.style.width = "100%";
    freeShippingBar.className = "progress-bar-fill green";
  }
}

function initCartEvents() {
  const cartTrigger = document.getElementById("cartTrigger");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const checkoutBtn = document.getElementById("checkoutBtn");

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

  // REDIRECIONAMENTO DE CHECKOUT REAL E SEGURO DO SHOPIFY
  checkoutBtn.addEventListener("click", () => {
    const checkoutUrl = localStorage.getItem('shopify_cart_checkout_url');
    if (checkoutUrl) {
      showLoadingToast("Redirecionando para o checkout seguro...");
      window.location.href = checkoutUrl;
    } else {
      showErrorToast("Nenhum link de checkout gerado. Adicione itens.");
    }
  });
}

// ==========================================================================
// F. DETALHES DO PRODUTO EM POPUP PREMIUM (DADOS REAIS DO SHOPIFY)
// ==========================================================================
window.openProductPage = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentProductPageSize = product.variants[0]?.size || "M";
  
  const overlay = document.getElementById("productPageOverlay");
  if (!overlay) return;

  const thumbsHTML = product.images.map((img, index) => `
    <div class="product-gallery-thumb ${index === 0 ? 'active' : ''}" onclick="window.changeProductImage(this, '${img}')">
      <img src="${img}" alt="${product.name} Miniatura ${index + 1}">
    </div>
  `).join('');

  const bulletsHTML = product.images.map((_, index) => `
    <span class="gallery-bullet ${index === 0 ? 'active' : ''}"></span>
  `).join('');

  const slidesHTML = product.images.map((img, index) => `
    <div class="mobile-gallery-slide">
      <img src="${img}" alt="${product.name} ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}">
    </div>
  `).join('');

  // Gerar botões de tamanhos reais do produto no Shopify
  const sizesHTML = product.variants.map((v, index) => {
    const isOutOfStock = !v.available;
    return `
      <button class="size-rounded-btn ${index === 0 ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}" 
              ${isOutOfStock ? 'disabled' : ''}
              onclick="window.selectProductPageSize(this, '${v.size}')">
        ${v.size}
      </button>
    `;
  }).join('');

  const firstAvailableVariant = product.variants.find(v => v.available) || product.variants[0];
  const oldPriceHTML = firstAvailableVariant?.compareAtPrice 
    ? `R$ ${firstAvailableVariant.compareAtPrice.toFixed(2).replace('.', ',')}` 
    : `R$ ${(product.price * 1.35).toFixed(2).replace('.', ',')}`;

  overlay.innerHTML = `
    <div class="product-page-container">
      <button class="product-page-close-btn" onclick="window.closeProductPage()" title="Voltar ao catálogo">✕ RETORNAR AO DROP</button>
      
      <div class="product-page-layout">
        <div class="product-page-gallery-side">
          <div class="product-gallery-thumbnails-wrapper desktop-only">
            <div class="product-gallery-thumbnails">
              ${thumbsHTML}
            </div>
          </div>
          <div class="product-main-image-wrapper desktop-only" id="productMainImageContainer">
            <img src="${product.images[0] || 'assets/placeholder.png'}" alt="${product.name}" id="productMainImage" class="zoom-image">
            <span class="product-gallery-indicator">Costas (Main Print)</span>
          </div>

          <div class="mobile-gallery-track" id="mobileGalleryTrack" onscroll="window.updateGalleryBullets(this)">
            ${slidesHTML}
          </div>
          <div class="mobile-gallery-bullets" id="mobileGalleryBullets">
            ${bulletsHTML}
          </div>
        </div>
        
        <div class="product-page-details-side" id="productDetailsSide">
          <span class="product-page-subtitle">// COLLECTION LOTE 01</span>
          <h2 class="product-page-title">${product.name}</h2>
          <span class="product-page-color">${product.badge || 'Streetwear Premium'}</span>
          
          <div class="product-page-review-row">
            <span class="review-stars-small">★★★★★</span>
            <span class="review-count">(49 avaliações confirmadas)</span>
          </div>
          
          <div class="product-page-pricing">
            <span class="product-page-old-price">${oldPriceHTML}</span>
            <span class="product-page-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="product-page-installments">ou 6x de R$ ${(product.price / 6).toFixed(2).replace('.', ',')} sem juros no cartão</div>
          
          <div class="product-page-sizes-wrapper">
            <div class="size-header-row">
              <span class="size-title-label">TAMANHO:</span>
              <span class="size-current-active" id="activeSizeDisplay">${currentProductPageSize} ${currentProductPageSize === 'M' ? '(RECOMENDADO)' : ''}</span>
            </div>
            <div class="product-page-sizes">
              ${sizesHTML}
            </div>
            <button class="size-guide-trigger-btn" onclick="window.openSizeGuide(); event.stopPropagation();">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="btn-ruler-icon" style="display:inline-block; vertical-align:middle; margin-right:6px; margin-top:-2px;">
                <path d="M21.3 8.7L8.7 21.3c-1 1-2.5 1-3.5 0l-2.5-2.5c-1-1-1-2.5 0-3.5L15.3 2.7c1-1 2.5-1 3.5 0l2.5 2.5c1 1 1 2.5 0 3.5z"/>
                <line x1="6.5" y1="12.5" x2="8.5" y2="14.5"/>
                <line x1="9.5" y1="9.5" x2="11.5" y2="11.5"/>
                <line x1="12.5" y1="6.5" x2="14.5" y2="8.5"/>
                <line x1="15.5" y1="3.5" x2="17.5" y2="5.5"/>
              </svg>TABELA DE MEDIDAS (SIZE GUIDE)</button>
          </div>
          
          <button class="btn-add-to-cart desktop-only" ${!product.available ? 'disabled' : ''} onclick="window.addProductPageToCart('${product.id}')">
            ${product.available ? 'ADICIONAR AO DROP ➔' : 'ESGOTADO'}
          </button>
          
          <div class="product-page-benefits">
            <div class="benefit-item-small">
              <span class="benefit-icon-small">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 5v4h3v11h12V9h3V5l-3-3z"/>
                  <path d="M10 2a2 2 0 0 0 4 0"/>
                </svg>
              </span>
              <span class="benefit-text-small">Algodão Heavyweight (220g/m²)</span>
            </div>
            <div class="benefit-item-small">
              <span class="benefit-icon-small">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="6" cy="6" r="3"/>
                  <circle cx="6" cy="18" r="3"/>
                  <line x1="9.8" y1="8.2" x2="20" y2="17"/>
                  <line x1="9.8" y1="15.8" x2="20" y2="7"/>
                </svg>
              </span>
              <span class="benefit-text-small">Modelagem Oversized Autêntica</span>
            </div>
            <div class="benefit-item-small">
              <span class="benefit-icon-small">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5 21 6.5 21C8 21 9 20 10.5 20C11 20 11.5 22 12 22Z"/>
                  <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/>
                  <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/>
                  <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/>
                </svg>
              </span>
              <span class="benefit-text-small">Estampa Maciça de Alta Costura</span>
            </div>
          </div>
          
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
                <div style="white-space: pre-line;">${product.details}</div>
              </div>
            </div>
          </div>
          
          <div class="mobile-sticky-spacer"></div>
        </div>
      </div>
    </div>

    <div class="mobile-sticky-cta mobile-only" id="mobileStickyCta">
      <div class="mobile-sticky-size-indicator">
        <span>TAMANHO: </span><span id="mobileStickySize">${currentProductPageSize}</span>
      </div>
      <button class="mobile-sticky-btn" ${!product.available ? 'disabled' : ''} onclick="window.addProductPageToCart('${product.id}')">
        ${product.available ? `ADICIONAR AO DROP <span class="sticky-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>` : 'ESGOTADO'}
      </button>
    </div>
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  window.setupImageZoom();
};

window.closeProductPage = function() {
  const overlay = document.getElementById("productPageOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
};

window.changeProductImage = function(thumbElement, imageUrl) {
  const mainImage = document.getElementById("productMainImage");
  if (mainImage) mainImage.src = imageUrl;

  const indicator = document.querySelector(".product-gallery-indicator");
  if (indicator) {
    indicator.textContent = imageUrl.includes("back") ? "Costas (Main Print)" : "Detalhe da Peça";
  }

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

  const mobileStickySize = document.getElementById("mobileStickySize");
  if (mobileStickySize) mobileStickySize.textContent = size;
};

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

window.addProductPageToCart = async function(productId) {
  await window.addProductToCart(productId, currentProductPageSize);
  window.closeProductPage();
};

// ==========================================================================
// G. OUTROS COMPONENTES DA INTERFACE (LIFESTYLE, MENU, FAQ, COUNTDOWN)
// ==========================================================================
function initCountdown() {
  const timerEl = document.getElementById("countdownTimer");
  if (!timerEl) return;

  let timeRemaining = sessionStorage.getItem("void_countdown");
  if (!timeRemaining) {
    timeRemaining = 2 * 60 * 60 + 45 * 60 + 12;
  } else {
    timeRemaining = parseInt(timeRemaining, 10);
  }

  const updateTimer = () => {
    if (timeRemaining <= 0) timeRemaining = 3 * 60 * 60;
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

function initFaqAccordion() {
  const faqTriggers = document.querySelectorAll(".faq-trigger");
  faqTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const parent = trigger.parentElement;
      const answer = parent.querySelector(".faq-answer");
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-item").forEach(item => {
        item.classList.remove("active");
        item.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
        item.querySelector(".faq-answer").style.maxHeight = null;
      });

      if (!isExpanded) {
        parent.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

function initCarousel() {
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("carouselPrevBtn");
  const nextBtn = document.getElementById("carouselNextBtn");
  const dotsContainer = document.getElementById("carouselDots");
  
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = Array.from(track.children);
  let currentIndex = 0;

  dotsContainer.innerHTML = slides.map((_, idx) => `<div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})"></div>`).join('');
  const dots = Array.from(dotsContainer.children);

  const updateCarousel = (index) => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, idx) => dot.classList.toggle("active", idx === index));
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

  setInterval(() => {
    let nextIdx = currentIndex + 1;
    if (nextIdx >= slides.length) nextIdx = 0;
    updateCarousel(nextIdx);
  }, 6000);
}

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
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) window.closeMobileMenu();
  });
}

// ==========================================================================
// H. NOTIFICAÇÕES (TOASTS) DE FEEDBACK DA API
// ==========================================================================
function showLoadingToast(msg) {
  let toast = document.getElementById('shopify-feedback-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shopify-feedback-toast';
    toast.style = "position: fixed; bottom: 20px; right: 20px; background: #fff; color: #000; padding: 14px 28px; border: 1px solid #e5e5e5; z-index: 10000; font-family: 'Unbounded', monospace; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 10px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: all 0.3s ease;";
    document.body.appendChild(toast);
  }
  toast.style.borderColor = "#e5e5e5";
  toast.style.background = "#fff";
  toast.style.color = "#000";
  toast.innerHTML = `<span class="spinner-spin" style="display:inline-block; width:12px; height:12px; border: 2px solid #000; border-top-color: transparent; border-radius:50%;"></span> ${msg}`;
  toast.style.display = 'flex';
}

function hideLoadingToast() {
  const toast = document.getElementById('shopify-feedback-toast');
  if (toast) toast.style.display = 'none';
}

function showErrorToast(msg) {
  let toast = document.getElementById('shopify-feedback-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shopify-feedback-toast';
    toast.style = "position: fixed; bottom: 20px; right: 20px; background: #fff5f5; color: #c00; padding: 14px 28px; border: 1px solid #ffcccc; z-index: 10000; font-family: 'Unbounded', monospace; font-size: 11px; font-weight: 800; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);";
    document.body.appendChild(toast);
  }
  toast.style.borderColor = "#ffcccc";
  toast.style.background = "#fff5f5";
  toast.style.color = "#c00";
  toast.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:6px; margin-top:-2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}`;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

function renderErrorCatalog(errorMsg) {
  const catalog = document.getElementById("productsCatalog");
  if (catalog) {
    catalog.innerHTML = `
      <div style="grid-column: 1/-1; background: #fff5f5; border: 1px dashed #ffcccc; padding: 25px; text-align: center; color: #c00; font-family: 'Unbounded', monospace; font-size: 12px; border-radius: 4px;">
        <strong>Erro ao carregar catálogo:</strong> ${errorMsg}<br>
        <span style="color: #666; font-size:11px;">Por favor, verifique suas chaves no .env e o status do seu Storefront.</span>
      </div>
    `;
  }
}

function renderConfigWarning() {
  const catalog = document.getElementById('productsCatalog');
  if (catalog) {
    catalog.style.display = 'block';
    catalog.innerHTML = `
      <div style="grid-column: 1 / -1; background: #fff5f5; border: 1px dashed #ffcccc; padding: 30px; text-align: center; color: #c00; font-family: 'Unbounded', monospace; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <h3 style="margin-top:0; color: #c00;">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:8px; margin-top:-2px;">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>CONEXÃO SHOPIFY INDISPONÍVEL
        </h3>
        <p style="color: #444;">As variáveis de ambiente do Shopify Storefront API não foram encontradas localmente.</p>
        <p style="font-size: 13px; color: #666; margin: 15px 0 5px 0;">Crie um arquivo <strong>.env</strong> na pasta do projeto e configure suas chaves:</p>
        <pre style="background: #fafafa; padding: 15px; text-align: left; display: inline-block; border-radius: 4px; border: 1px solid #e5e5e5; color: #000; font-size:12px; margin: 10px 0; font-family: monospace; width: 100%; max-width: 500px; box-sizing: border-box;">
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=sua-loja.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=seu_access_token_aqui</pre>
        <p style="font-size: 13px; color: #666; margin-top: 10px;">Após salvar o arquivo .env, reinicie o servidor do site para carregar as alterações.</p>
      </div>
    `;
  }
}

// ==========================================================================
// I. INTERAÇÕES DE ALTA COSTURA E RECURSOS PREMIUM (LIGHT BRUTALISTA)
// ==========================================================================

function initHeaderScroll() {
  const header = document.getElementById("mainHeader");
  if (!header) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  });
}



function initSizeGuideEvents() {
  window.openSizeGuide = () => {
    const sizeGuide = document.getElementById("sizeGuideOverlay");
    if (sizeGuide) {
      sizeGuide.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  };

  window.closeSizeGuide = () => {
    const sizeGuide = document.getElementById("sizeGuideOverlay");
    if (sizeGuide) {
      sizeGuide.style.display = "none";
      const pdpOverlay = document.getElementById("productPageOverlay");
      if (!pdpOverlay || !pdpOverlay.classList.contains("open")) {
        document.body.style.overflow = "";
      }
    }
  };

  const sizeGuideOverlay = document.getElementById("sizeGuideOverlay");
  if (sizeGuideOverlay) {
    sizeGuideOverlay.addEventListener("click", (e) => {
      if (e.target === sizeGuideOverlay) window.closeSizeGuide();
    });
  }
}

function initDiscountSimulator() {
  const buttons = document.querySelectorAll(".simulator-opt-btn");
  const simUnitPrice = document.getElementById("simUnitPrice");
  const simSavings = document.getElementById("simSavings");
  const simShipping = document.getElementById("simShipping");
  const simTotal = document.getElementById("simTotal");
  const simBtnQty = document.getElementById("simBtnQty");
  const simAddBtn = document.getElementById("simAddBtn");

  if (!buttons.length || !simUnitPrice) return;

  let currentSimQty = 1;

  const updateSimulation = (qty) => {
    currentSimQty = qty;

    let unitPrice = 109.90;
    let totalSavings = 0.00;
    let shipping = 19.90;

    if (qty === 2) {
      unitPrice = 99.90;
      totalSavings = 20.00;
    } else if (qty === 3) {
      unitPrice = 89.90;
      totalSavings = 60.00;
    } else if (qty >= 4) {
      unitPrice = 89.90;
      totalSavings = qty * 20.00;
      shipping = 0.00;
    }

    const rawTotal = (unitPrice * qty) + shipping;

    simUnitPrice.textContent = `R$ ${unitPrice.toFixed(2).replace('.', ',')}`;
    simSavings.textContent = `R$ ${totalSavings.toFixed(2).replace('.', ',')}`;
    simShipping.textContent = shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`;
    simTotal.textContent = `R$ ${rawTotal.toFixed(2).replace('.', ',')}`;
    
    simBtnQty.textContent = qty === 4 ? "4 CAMISETAS" : `${qty} ${qty === 1 ? 'CAMISETA' : 'CAMISETAS'}`;
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const qty = parseInt(btn.getAttribute("data-qty"), 10);
      updateSimulation(qty);
    });
  });

  simAddBtn.addEventListener("click", async () => {
    if (PRODUCTS.length === 0) {
      showErrorToast("Nenhum produto disponível no catálogo para adicionar.");
      return;
    }

    const baseProduct = PRODUCTS[0];
    if (!baseProduct) return;

    showLoadingToast(`Adicionando combo de ${currentSimQty} camisetas...`);

    try {
      const variant = baseProduct.variants.find(v => v.size === 'M') || baseProduct.variants[0];
      if (!variant) throw new Error("Variante não encontrada.");

      const cartId = localStorage.getItem('shopify_cart_id');
      if (!cartId) {
        const data = await shopifyQuery(CART_CREATE_MUTATION, {
          input: {
            lines: [{ merchandiseId: variant.id, quantity: currentSimQty }]
          }
        });
        if (data && data.cartCreate && data.cartCreate.cart) {
          syncCartWithShopify(data.cartCreate.cart);
        }
      } else {
        const data = await shopifyQuery(CART_LINES_ADD_MUTATION, {
          cartId,
          lines: [{ merchandiseId: variant.id, quantity: currentSimQty }]
        });
        if (data && data.cartLinesAdd && data.cartLinesAdd.cart) {
          syncCartWithShopify(data.cartLinesAdd.cart);
        }
      }
      
      hideLoadingToast();
      window.openCart();
    } catch (err) {
      console.error("Erro ao adicionar combo simulado:", err);
      showErrorToast("Erro ao adicionar combo: " + err.message);
    }
  });
}

// ==========================================================================
// SCROLL REVEALS AND LOW-INTENSITY PARALLAX
// ==========================================================================
function initScrollRevealAndParallax() {
  // Intersection Observer for scroll reveal animations
  const observerOptions = {
    root: null,
    rootMargin: '0px -10% -10% 0px',
    threshold: 0.05
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Auto-observe headers and reveal elements
  const elementsToReveal = document.querySelectorAll(
    '.section-title, .section-subtitle, .flagship-title, .flagship-quote, .reveal-text'
  );
  elementsToReveal.forEach(el => {
    el.classList.add('reveal-text');
    revealObserver.observe(el);
  });

  // Low-intensity Scroll Parallax on Hero and Flagship
  const heroImage = document.getElementById("heroBgImage");
  const flagshipImage = document.querySelector(".flagship-main-image-wrapper img");

  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;

    // Parallax on hero image (very subtle scale & shift)
    if (heroImage) {
      heroImage.style.transform = `scale(1.05) translate3d(0, ${scrolled * 0.08}px, 0)`;
    }

    // Parallax on flagship image when visible in viewport
    if (flagshipImage) {
      const parentRect = flagshipImage.parentElement.getBoundingClientRect();
      const parentTop = parentRect.top + scrolled;
      const elementVisible = parentRect.bottom > 0 && parentRect.top < window.innerHeight;

      if (elementVisible) {
        const offset = (scrolled + window.innerHeight - parentTop) * 0.03;
        flagshipImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1.03)`;
      }
    }
  }, { passive: true });
}

