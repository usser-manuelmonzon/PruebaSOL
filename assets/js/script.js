const CART_KEY = "sistemasolgt-cart";
const body = document.body;
const page = body.dataset.page;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".nav a")];
const searchForms = [...document.querySelectorAll("[data-search-form]")];
const productCards = [...document.querySelectorAll("[data-product-card]")];
const itemCards = [...document.querySelectorAll("[data-item-card]")];
const searchableCards = productCards.length ? productCards : itemCards;
const searchStatus = document.querySelector("[data-search-status]");
const cartToggleButtons = [...document.querySelectorAll("[data-cart-toggle]")];
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartCloseButton = document.querySelector("[data-cart-close]");
const cartClearButton = document.querySelector("[data-cart-clear]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartSummary = document.querySelector("[data-cart-summary]");
const cartWhatsapp = document.querySelector("[data-cart-whatsapp]");
const checkoutForm = document.querySelector("[data-checkout-form]");
const leadForm = document.querySelector("[data-lead-form]");
const checkoutMethod = document.querySelector("[data-checkout-method]");
const checkoutName = document.querySelector("[data-checkout-name]");
const checkoutCard = document.querySelector("[data-checkout-card]");
const checkoutExpiry = document.querySelector("[data-checkout-expiry]");
const checkoutCvv = document.querySelector("[data-checkout-cvv]");
const checkoutMessage = document.querySelector("[data-checkout-message]");
const modal = document.querySelector("[data-modal]");
const modalContent = document.querySelector("[data-modal-content]");
const modalCloseButtons = [...document.querySelectorAll("[data-modal-close]")];
const viewButtons = [...document.querySelectorAll("[data-view-item]")];
const addButtons = [...document.querySelectorAll("[data-add-item]")];
const revealItems = [
  ...document.querySelectorAll(
    ".hero-home__content, .hero-home__visual, .page-hero__grid > *, .category-card, .media-card, .catalog-card"
  ),
];

const siteRoot = new URL(page === "inicio" ? "./" : "../", window.location.href);

const resolveAssetPath = (path) => {
  if (!path) return "";
  if (/^(https?:|file:|data:|blob:)/i.test(path)) return path;
  const normalized = path.replace(/^\.?\.\//, "").replace(/^\.?\//, "");
  return new URL(normalized, siteRoot).href;
};

const formatCurrency = (value) => `Q${Number(value || 0).toLocaleString("es-GT")}`;

const normalizeCartItem = (item) => ({
  id: item.id || `${item.type || "producto"}-${(item.name || "item").toLowerCase().replace(/\s+/g, "-")}`,
  name: item.name || "Item",
  type: item.type || "producto",
  image: resolveAssetPath(item.image || ""),
  price: Number(item.price || 0),
  quantity: Number(item.quantity || 1),
});

const readCart = () => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map(normalizeCartItem);
  } catch {
    return [];
  }
};

const writeCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const getCardData = (card) => ({
  id: card.dataset.itemId || `${card.dataset.itemType || "producto"}-${(card.dataset.itemName || "item").toLowerCase().replace(/\s+/g, "-")}`,
  name: card.dataset.itemName || "Item",
  type: card.dataset.itemType || "producto",
  image: resolveAssetPath(card.dataset.itemImage || ""),
  price: Number(card.dataset.itemPrice || 0),
  description: card.dataset.itemDescription || "",
  specs: (card.dataset.itemSpecs || "").split("|").filter(Boolean),
  includes: (card.dataset.itemIncludes || "")
    .split("|")
    .filter(Boolean)
    .map((entry) => {
      const [name, image] = entry.split("::");
      return { name, image: resolveAssetPath(image) };
    }),
  whatsapp: card.dataset.itemWhatsapp || "Hola,%20quiero%20informacion",
});

let cart = readCart();

navLinks.forEach((link) => {
  link.classList.toggle("is-active", link.dataset.link === page);
});

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

searchForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    const target = form.getAttribute("action") || "productos.html";
    const value = input?.value.trim().toLowerCase() || "";

    const serviceWords = ["servicio", "combo", "implementacion", "facturacion", "soporte"];
    const goServices = serviceWords.some((word) => value.includes(word));
    const baseTarget = goServices ? "servicios.html" : target;
    const url = new URL(baseTarget, window.location.href);

    if (value) {
      url.searchParams.set("search", value);
    }

    window.location.href = url.toString();
  });
});

const applySearchFilter = () => {
  if (!searchableCards.length) return;

  const params = new URLSearchParams(window.location.search);
  const query = (params.get("search") || "").trim().toLowerCase();

  if (!query) {
    searchableCards.forEach((card) => card.classList.remove("is-hidden"));
    if (searchStatus && page === "productos") {
      searchStatus.textContent = "Explora nuestros productos disponibles para punto de venta.";
    }
    return;
  }

  let results = 0;

  searchableCards.forEach((card) => {
    const haystack = (card.dataset.searchText || "").toLowerCase();
    const matches = haystack.includes(query);
    card.classList.toggle("is-hidden", !matches);
    if (matches) results += 1;
  });

  if (searchStatus) {
    searchStatus.textContent =
      results > 0
        ? `Mostrando ${results} resultado(s) para "${query}".`
        : `No encontramos resultados para "${query}". Intenta con combo, laptop, impresora, lector o caja.`;
  }
};

applySearchFilter();

const cartTotal = () =>
  cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);

const cartUnits = () =>
  cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

const createCartMessage = (items) => {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
  );

  return `Hola, quiero cotizar lo siguiente:\n\n${lines.join("\n")}\n\nTotal estimado: ${formatCurrency(cartTotal())}`;
};

const openCart = () => body.classList.add("cart-open");
const closeCart = () => body.classList.remove("cart-open");

const collapseCheckout = () => {
  if (checkoutForm) {
    checkoutForm.classList.add("is-collapsed");
  }
};

const expandCheckout = () => {
  if (!checkoutForm) return;
  checkoutForm.classList.remove("is-collapsed");
  checkoutForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

const updateQuantity = (id, delta) => {
  cart = cart
    .map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, Number(item.quantity || 1) + delta) } : item
    )
    .filter((item) => item.quantity > 0);

  writeCart(cart);
  renderCart();
};

const removeItem = (id) => {
  cart = cart.filter((item) => item.id !== id);
  writeCart(cart);
  renderCart();
};

const renderCart = () => {
  if (!cartItems || !cartCount) return;

  cartCount.textContent = String(cartUnits());

  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Aun no has agregado productos o servicios.</p>';
    if (cartSummary) {
      cartSummary.innerHTML = "";
    }
    collapseCheckout();
    if (cartWhatsapp) {
      cartWhatsapp.setAttribute(
        "href",
        "https://wa.me/50258103302?text=Hola,%20quiero%20informacion%20sobre%20Sistemasolgt"
      );
    }
    if (checkoutMessage) {
      checkoutMessage.textContent = "";
    }
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-row">
          <img class="cart-row__image" src="${item.image}" alt="${item.name}">
          <div class="cart-row__content">
            <div class="cart-row__top">
              <div>
                <strong>${item.name}</strong>
                <span class="cart-row__meta">${item.type}</span>
              </div>
              <button class="cart-row__remove" type="button" data-remove-id="${item.id}">Quitar</button>
            </div>
            <div class="cart-row__bottom">
              <div class="cart-row__qty">
                <button type="button" data-qty-action="decrease" data-qty-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-qty-action="increase" data-qty-id="${item.id}">+</button>
              </div>
              <div class="cart-row__prices">
                <small>${formatCurrency(item.price)} c/u</small>
                <strong>${formatCurrency(item.price * item.quantity)}</strong>
              </div>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  cartItems.querySelectorAll("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => removeItem(button.getAttribute("data-remove-id")));
  });

  cartItems.querySelectorAll("[data-qty-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-qty-id");
      const action = button.getAttribute("data-qty-action");
      updateQuantity(id, action === "increase" ? 1 : -1);
    });
  });

  if (cartSummary) {
    cartSummary.innerHTML = `
      <div class="cart-summary__row">
        <span>Productos y servicios</span>
        <strong>${cartUnits()} unidad(es)</strong>
      </div>
      <div class="cart-summary__row cart-summary__row--total">
        <span>Total estimado</span>
        <strong>${formatCurrency(cartTotal())}</strong>
      </div>
      <button class="btn btn--primary btn--compact cart-summary__confirm" type="button" data-cart-confirm>Confirmar compra</button>
    `;

    cartSummary.querySelector("[data-cart-confirm]")?.addEventListener("click", () => {
      expandCheckout();
    });
  }

  if (cartWhatsapp) {
    cartWhatsapp.setAttribute(
      "href",
      `https://wa.me/50258103302?text=${encodeURIComponent(createCartMessage(cart))}`
    );
  }
};

const buildIncludesMarkup = (includes) => {
  if (!includes.length) return "";

  return `
    <div class="modal__includes">
      <h4>Incluye</h4>
      <div class="modal__include-grid">
        ${includes
          .map(
            (item) => `
              <article class="modal__include-card">
                <img src="${item.image}" alt="${item.name}">
                <span>${item.name}</span>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
};

const buildModalMarkup = (card) => {
  const item = getCardData(card);
  const specs = item.specs.map((spec) => `<li>${spec}</li>`).join("");

  return `
    <div class="modal__text modal__text--stacked">
      <div class="modal__headline">
        <div>
          <h3>${item.name}</h3>
          <p class="modal__price">${formatCurrency(item.price)}</p>
        </div>
      </div>
      <div class="modal__media">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <p>${item.description}</p>
      <ul class="modal__specs">${specs}</ul>
      ${buildIncludesMarkup(item.includes)}
      <div class="hero-home__actions modal__actions">
        <button class="btn btn--primary" type="button" data-modal-add>Agregar al carrito</button>
        <a class="btn btn--secondary" href="https://wa.me/50258103302?text=${item.whatsapp}" target="_blank" rel="noreferrer">Consultar por WhatsApp</a>
      </div>
    </div>
  `;
};

const openModal = (card) => {
  if (!modal || !modalContent) return;
  modal.hidden = false;
  body.classList.add("modal-open");
  modalContent.innerHTML = buildModalMarkup(card);
  modalContent.querySelector("[data-modal-add]")?.addEventListener("click", () => {
    addItemToCart(card);
    closeModal();
    openCart();
  });
};

const closeModal = () => {
  if (!modal) return;
  modal.hidden = true;
  body.classList.remove("modal-open");
};

const addItemToCart = (card) => {
  const item = getCardData(card);
  const existing = cart.find((entry) => entry.id === item.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      type: item.type,
      image: item.image,
      price: item.price,
      quantity: 1,
    });
  }

  writeCart(cart);
  renderCart();
};

const syncPaymentFields = () => {
  if (!checkoutMethod || !checkoutCard || !checkoutExpiry || !checkoutCvv) return;

  const isCard = checkoutMethod.value === "tarjeta";
  checkoutCard.closest("label").classList.toggle("is-hidden", !isCard);
  checkoutExpiry.closest("label").classList.toggle("is-hidden", !isCard);
  checkoutCvv.closest("label").classList.toggle("is-hidden", !isCard);
};

if (checkoutMethod) {
  checkoutMethod.addEventListener("change", syncPaymentFields);
  syncPaymentFields();
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!cart.length) {
      if (checkoutMessage) {
        checkoutMessage.textContent = "Agrega al menos un producto o servicio antes de continuar.";
      }
      return;
    }

    const method = checkoutMethod?.value || "tarjeta";
    const name = checkoutName?.value.trim() || "";
    const card = checkoutCard?.value.trim() || "";
    const expiry = checkoutExpiry?.value.trim() || "";
    const cvv = checkoutCvv?.value.trim() || "";

    if (!name) {
      if (checkoutMessage) {
        checkoutMessage.textContent = "Ingresa el nombre del titular para simular la compra.";
      }
      return;
    }

    if (method === "tarjeta" && (!card || !expiry || !cvv)) {
      if (checkoutMessage) {
        checkoutMessage.textContent = "Completa los datos de tarjeta para la simulacion.";
      }
      return;
    }

    if (checkoutMessage) {
      checkoutMessage.textContent = `Compra simulada completada con ${method}. Total: ${formatCurrency(cartTotal())}.`;
    }

    cart = [];
    writeCart(cart);
    renderCart();
    checkoutForm.reset();
    syncPaymentFields();
    collapseCheckout();
  });
}

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const recipient = leadForm.dataset.mailto || "manuelalexandermonzonpalma@gmail.com";
    const nombre = (formData.get("nombre") || "").toString().trim();
    const correo = (formData.get("correo") || "").toString().trim();
    const telefono = (formData.get("telefono") || "").toString().trim();
    const ciudad = (formData.get("ciudad") || "").toString().trim();
    const origen = (formData.get("origen") || "").toString().trim();
    const motivo = (formData.get("motivo") || "").toString().trim();
    const mensaje = (formData.get("mensaje") || "").toString().trim();

    const subject = `Nuevo contacto Sistemasolgt - ${motivo || "Consulta general"}`;
    const bodyLines = [
      `Nombre: ${nombre || "No indicado"}`,
      `Correo: ${correo || "No indicado"}`,
      `Telefono: ${telefono || "No indicado"}`,
      `Ciudad: ${ciudad || "No indicada"}`,
      `Origen: ${origen || "No indicado"}`,
      `Motivo: ${motivo || "No indicado"}`,
      "",
      "Mensaje:",
      mensaje || "Sin mensaje adicional.",
    ];

    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      bodyLines.join("\n")
    )}`;

    window.location.href = mailtoUrl;
  });
}

cartToggleButtons.forEach((button) => button.addEventListener("click", openCart));
cartCloseButton?.addEventListener("click", closeCart);
cartClearButton?.addEventListener("click", () => {
  cart = [];
  writeCart(cart);
  renderCart();
  if (checkoutMessage) {
    checkoutMessage.textContent = "";
  }
  collapseCheckout();
});

modalCloseButtons.forEach((button) => button.addEventListener("click", closeModal));

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-item-card]");
    if (card) openModal(card);
  });
});

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-item-card]");
    if (!card) return;
    addItemToCart(card);
    openCart();
  });
});

renderCart();

revealItems.forEach((item) => item.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));
