const products = [
    {
        id: "crew-1",
        name: "Black Sweatshirt",
        type: "sweatshirt",
        color: "Black",
        image: "sweatshirt-hanger"
    },
    {
        id: "hoodie-1",
        name: "Black Hoodie",
        type: "hoodie",
        color: "Black",
        image: "hoodie-hanger"
    },
    {
        id: "joggers-1",
        name: "Black Sweatpants",
        type: "trousers",
        color: "Black",
        image: "joggers-hanger"
    },
    {
        id: "crew-2",
        name: "Black Sweatshirt",
        type: "sweatshirt",
        color: "Black",
        image: "sweatshirt-hanger"
    },
    {
        id: "hoodie-2",
        name: "Black Hoodie",
        type: "hoodie",
        color: "Black",
        image: "hoodie-hanger"
    },
    {
        id: "joggers-2",
        name: "Black Sweatpants",
        type: "trousers",
        color: "Black",
        image: "joggers-hanger"
    }
];

const rail = document.getElementById("product-rail");
const wrap = document.getElementById("wardrobe-wrap");

const productOverlay = document.getElementById("product-overlay");
const cartOverlay = document.getElementById("cart-overlay");

const detailArt = document.getElementById("detail-art");
const sizeOptions = document.getElementById("size-options");
const addButton = document.getElementById("add-to-selection");

const cart = [];

let currentProduct = null;
let selectedSize = "";
let returnFocus = null;
let toastTimer;

function garmentImages(product) {
    const scene = document.createElement("span");
    scene.className = "garment-scene";

    const garment = document.createElement("img");
    garment.className = "hanging-garment-image";
    garment.src = `images/${product.image}.webp`;
    garment.alt = `${product.color} ${product.name}, front view`;

    scene.append(garment);
    return scene;
}

function renderRail(filter = "all") {
    const visible = products.filter(product => {
        return filter === "all" || product.type === filter;
    });

    rail.replaceChildren();

    visible.forEach(product => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "garment-button";
        button.setAttribute("aria-label", `View ${product.name}`);

        const art = document.createElement("span");
        art.className = "garment-art";
        art.append(garmentImages(product));
        art.setAttribute("aria-hidden", "true");

        const name = document.createElement("span");
        name.className = "garment-name";
        name.textContent = product.name;

        button.append(art, name);

        button.addEventListener("click", () => {
            openProduct(product, button);
        });

        rail.append(button);
    });

    document.getElementById("product-count").textContent =
        `01 — ${String(visible.length).padStart(2, "0")}`;
}

function openDialog(overlay, trigger) {
    returnFocus = trigger;
    overlay.hidden = false;
    document.body.classList.add("dialog-open");
    overlay.querySelector('[role="dialog"]').focus();
}

function closeDialog(overlay) {
    overlay.hidden = true;
    document.body.classList.remove("dialog-open");

    if (returnFocus && returnFocus.isConnected) {
        returnFocus.focus();
    }
}

function openProduct(product, trigger) {
    currentProduct = product;
    selectedSize = "";

    document.getElementById("detail-name").textContent =
        product.name;

    document.getElementById("detail-category").textContent =
        product.type.toUpperCase();

    document.getElementById("detail-color").textContent =
        product.color;

    detailArt.replaceChildren(garmentImages(product));
    sizeOptions.replaceChildren();

    ["S", "M", "L", "XL", "XXL"].forEach(size => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = size;
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", () => {
            selectedSize = size;

            sizeOptions.querySelectorAll("button").forEach(option => {
                option.setAttribute(
                    "aria-pressed",
                    String(option === button)
                );
            });

            addButton.disabled = false;
            addButton.textContent = "Add to selection ↗";
        });

        sizeOptions.append(button);
    });

    addButton.disabled = true;
    addButton.textContent = "Select a size";

    openDialog(productOverlay, trigger);
}

function renderCart() {
    const container = document.getElementById("cart-items");
    container.replaceChildren();

    document.getElementById("cart-count").textContent =
        cart.length;

    if (!cart.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent =
            "Your selection is empty. Choose something from the wardrobe.";

        container.append(empty);
        return;
    }

    cart.forEach((item, index) => {
        const line = document.createElement("div");
        line.className = "cart-line";

        const description = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = item.product.name;

        const variant = document.createElement("p");
        variant.textContent =
            `${item.product.color} / ${item.size}`;

        description.append(name, variant);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";

        remove.setAttribute(
            "aria-label",
            `Remove ${item.product.name}, size ${item.size}`
        );

        remove.addEventListener("click", () => {
            cart.splice(index, 1);
            renderCart();
        });

        line.append(description, remove);
        container.append(line);
    });
}

/* Product filters */

document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach(option => {
            option.setAttribute(
                "aria-pressed",
                String(option === button)
            );
        });

        renderRail(button.dataset.filter);
    });
});

/* Add to the temporary selection */

addButton.addEventListener("click", () => {
    if (!currentProduct || !selectedSize) {
        return;
    }

    cart.push({
        product: currentProduct,
        size: selectedSize
    });

    renderCart();
    closeDialog(productOverlay);

    const toast = document.getElementById("toast");
    toast.textContent = "Added to your selection.";
    toast.classList.add("visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2500);
});

/* Open and close dialogs */

document.getElementById("open-cart").addEventListener(
    "click",
    event => {
        renderCart();
        openDialog(cartOverlay, event.currentTarget);
    }
);

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
        const overlay =
            button.dataset.close === "product"
                ? productOverlay
                : cartOverlay;

        closeDialog(overlay);
    });
});

document.addEventListener("keydown", event => {
    const overlay = !productOverlay.hidden
        ? productOverlay
        : !cartOverlay.hidden
            ? cartOverlay
            : null;

    if (!overlay) {
        return;
    }

    if (event.key === "Escape") {
        closeDialog(overlay);
        return;
    }

    if (event.key !== "Tab") {
        return;
    }

    const focusable = [
        ...overlay.querySelectorAll(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
    ];

    if (!focusable.length) {
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const dialog = overlay.querySelector('[role="dialog"]');

    if (
        event.shiftKey &&
        (document.activeElement === first ||
            document.activeElement === dialog)
    ) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});

/* Wardrobe movement */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const mobileScreen = window.matchMedia(
  "(max-width: 700px)"
);

let scrollFrame = 0;

function featureGarment(selected) {
  const buttons = [
    ...rail.querySelectorAll(".garment-button")
  ];

  const active = buttons.indexOf(selected);

  buttons.forEach((button, index) => {
    const featured = index === active;
    const direction = index < active ? -1 : 1;

    button.classList.toggle("is-featured", featured);

    button.style.setProperty(
      "--turn",
      featured ? "0deg" : "-68deg"
    );

    button.style.setProperty(
      "--offset",
      active < 0 || featured
        ? "0px"
        : `${direction * 55}px`
    );

    button.style.setProperty(
      "--scale",
      featured ? "1.3" : "1"
    );

    button.style.setProperty(
      "--swing",
      featured ? "-1deg" : "0deg"
    );

    button.style.zIndex = featured ? "2" : "1";
  });
}

function updateMobileSelection() {
  if (!mobileScreen.matches) {
    return;
  }

  const buttons = [
    ...rail.querySelectorAll(".garment-button")
  ];

  if (!buttons.length) {
    return;
  }

  const box = wrap.getBoundingClientRect();
  const center = box.left + box.width / 2;

  const nearest = buttons.reduce((closest, button) => {
    const rect = button.getBoundingClientRect();

    const distance = Math.abs(
      center - (rect.left + rect.width / 2)
    );

    if (!closest || distance < closest.distance) {
      return { button, distance };
    }

    return closest;
  }, null);

  const index = buttons.indexOf(nearest.button);

  if (!reducedMotion.matches) {
    featureGarment(nearest.button);
  }

  document.getElementById("product-count").textContent =
    `${String(index + 1).padStart(2, "0")} / ` +
    `${String(buttons.length).padStart(2, "0")}`;
}

/* Update the selected garment while swiping */

wrap.addEventListener(
  "scroll",
  () => {
    if (!mobileScreen.matches || scrollFrame) {
      return;
    }

    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateMobileSelection();
    });
  },
  { passive: true }
);

/* Reset the mobile position when a category changes */

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    if (mobileScreen.matches) {
      wrap.scrollLeft = 0;
      requestAnimationFrame(updateMobileSelection);
    }
  });
});

window.addEventListener("resize", () => {
  if (mobileScreen.matches) {
    updateMobileSelection();
  } else {
    featureGarment(null);
  }
});

/* Desktop mouse movement */

wrap.addEventListener("pointermove", event => {
  if (
    event.pointerType === "touch" ||
    mobileScreen.matches ||
    reducedMotion.matches
  ) {
    return;
  }

  const buttons = [
    ...rail.querySelectorAll(".garment-button")
  ];

  const nearest = buttons.reduce((closest, button) => {
    const rect = button.getBoundingClientRect();

    const distance = Math.abs(
      event.clientX - (rect.left + rect.width / 2)
    );

    if (!closest || distance < closest.distance) {
      return { button, distance };
    }

    return closest;
  }, null);

  if (nearest) {
    featureGarment(nearest.button);
  }
});

wrap.addEventListener("pointerleave", () => {
  if (!mobileScreen.matches) {
    featureGarment(null);
  }
});

/* Keyboard interaction */

rail.addEventListener("focusin", event => {
  const button = event.target.closest(".garment-button");

  if (button && !reducedMotion.matches) {
    featureGarment(button);
  }
});

rail.addEventListener("focusout", event => {
  if (
    !mobileScreen.matches &&
    !rail.contains(event.relatedTarget)
  ) {
    featureGarment(null);
  }
});

renderRail();
renderCart();

if (mobileScreen.matches) {
  requestAnimationFrame(updateMobileSelection);
}
