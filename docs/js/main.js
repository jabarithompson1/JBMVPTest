// Simple product data for the MVP
const products = [
    {
        id: 1,
        name: "Aurora Oud",
        brand: "Luminous Scents",
        price: 89.99,
        notes: "Oud, amber, vanilla",
        description: "Warm and deep evening scent with a rich oud base."
    },
    {
        id: 2,
        name: "Citrus Dawn",
        brand: "Luminous Scents",
        price: 59.99,
        notes: "Bergamot, lemon, neroli",
        description: "Fresh daytime fragrance that is bright and uplifting."
    },
    {
        id: 3,
        name: "Velvet Iris",
        brand: "Luminous Scents",
        price: 74.50,
        notes: "Iris, violet, sandalwood",
        description: "Soft floral scent with a creamy sandalwood base."
    }
];
function customAlert(message) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
        <p>${message}</p>
        <button id="customAlertBtn">OK</button>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(alertBox);

    alertBox.classList.remove('scroll-reveal', 'revealed');
    overlay.classList.remove('scroll-reveal', 'revealed');

    const closeAlert = () => {
        overlay.remove();
        alertBox.remove();
    };

    document.getElementById('customAlertBtn').addEventListener('click', closeAlert);
    overlay.addEventListener('click', closeAlert);
}

function customConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
        <p>${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="confirmYes" class="btn-primary">Yes</button>
            <button id="confirmNo" class="btn-secondary">Cancel</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(alertBox);

    alertBox.classList.remove('scroll-reveal', 'revealed');
    overlay.classList.remove('scroll-reveal', 'revealed');

    const closeDialog = () => {
        overlay.remove();
        alertBox.remove();
    };

    document.getElementById('confirmYes').addEventListener('click', () => {
        closeDialog();
        onConfirm();
    });

    document.getElementById('confirmNo').addEventListener('click', closeDialog);
    overlay.addEventListener('click', closeDialog);
}

const BASKET_STORAGE_KEY = "luminousScentsBasket";

// Basket helpers

function loadBasket() {
    const stored = localStorage.getItem(BASKET_STORAGE_KEY);
    if (!stored) {
        return [];
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Could not parse stored basket", e);
        return [];
    }
}

function saveBasket(basket) {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
}

function addToBasket(productId) {
    const basket = loadBasket();
    const existing = basket.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        basket.push({ productId, quantity: 1 });
    }
    saveBasket(basket);
    customAlert("Added to basket");
}

function updateQuantity(productId, change) {
    const basket = loadBasket();
    const item = basket.find(i => i.productId === productId);
    if (!item) {
        return;
    }
    item.quantity += change;
    if (item.quantity <= 0) {
        const index = basket.indexOf(item);
        basket.splice(index, 1);
    }
    saveBasket(basket);
    renderBasketPage();
}

// Rendering functions

function renderProductsPage() {
    const container = document.getElementById("productsContainer");
    if (!container) {
        return;
    }

    container.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("article");
        card.className = "card";

        card.innerHTML = `
            <div class="product-image-container ${product.id === 1 ? 'aurora-oud-image' : ''}">
                <img src="images/${product.id === 1 ? 'aurora-oud.png' : product.id === 2 ? 'citrus-dawn.png' : 'velvet-iris.png'}" alt="${product.name}" class="product-image">
            </div>
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
            <p><strong>Notes:</strong> ${product.notes}</p>
            <p class="price">£${product.price.toFixed(2)}</p>
            <p>${product.description}</p>
            <button class="btn-primary" data-product-id="${product.id}">
                Add to basket
            </button>
                `;

        container.appendChild(card);

        applyScrollReveal(card);
        card.querySelectorAll('h3, p, .btn-primary').forEach(el => applyScrollReveal(el));
    });

    container.addEventListener("click", event => {
        const button = event.target.closest("button[data-product-id]");
        if (button) {
            const id = Number(button.getAttribute("data-product-id"));
            addToBasket(id);
        }
    });
}

function renderBasketPage() {
    const container = document.getElementById("basketContainer");
    const summary = document.getElementById("basketSummary");
    if (!container || !summary) {
        return;
    }

    const basket = loadBasket();

    container.innerHTML = "";
    summary.innerHTML = "";

    if (basket.length === 0) {
        container.innerHTML = "<p>Your basket is empty.</p>";
        return;
    }

    let total = 0;

    basket.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return;
        }
        const lineTotal = product.price * item.quantity;
        total += lineTotal;

        const row = document.createElement("div");
        row.className = "basket-item";

        row.innerHTML = `
            <div class="basket-item-name">
                <p>${product.name}</p>
                <p class="small-text">£${product.price.toFixed(2)} each</p>
            </div>
            <div class="basket-item-controls">
                <button class="qty-btn" data-action="decrease" data-id="${product.id}">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-action="increase" data-id="${product.id}">+</button>
                <span>£${lineTotal.toFixed(2)}</span>
            </div>
        `;

        container.appendChild(row);

        // Add listeners directly to buttons
        row.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(btn.getAttribute('data-id'));
                const action = btn.getAttribute('data-action');
                if (action === 'increase') {
                    updateQuantity(id, 1);
                } else if (action === 'decrease') {
                    updateQuantity(id, -1);
                }
            });
        });
    });

    summary.innerHTML = `
        <p><strong>Total:</strong> £${total.toFixed(2)}</p>
        <button id="clearBasketBtn" class="btn-secondary" style="margin-right: 1rem;">Clear basket</button>
        <button id="checkoutBtn" class="btn-primary">Proceed to checkout</button>
    `;

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            window.location.href = "checkout.html";
        });
    }

    const clearBtn = document.getElementById("clearBasketBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            customConfirm("Are you sure you want to clear your basket?", () => {
                localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify([]));
                renderBasketPage();
            });
        });
    }
}

// Scroll reveal helper function
function applyScrollReveal(element) {
    element.classList.add('scroll-reveal');
    observer.observe(element);
}

// Simple front end auth validation

function setupAuthForm() {
    const form = document.getElementById("authForm");
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
    const message = document.getElementById("authMessage");
    const isNewUser = document.getElementById("isNewUser");

    if (!form || !emailInput || !passwordInput || !message) {
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Custom validation with styled messages
        if (!email) {
            customAlert("Please enter your email address.");
            return;
        }

        if (!email.includes('@')) {
            customAlert("Please enter a valid email address with an '@' symbol.");
            return;
        }

        if (!password) {
            customAlert("Please enter a password.");
            return;
        }

        if (password.length < 6) {
            customAlert("Password must be at least 6 characters long.");
            return;
        }

        // Rest of the existing success logic...
        if (isNewUser.checked) {
            message.textContent = "Account created locally for MVP. In the full system this will be stored securely.";
        } else {
            message.textContent = "Login successful in this demo. Real authentication will be added later.";
        }
        message.style.color = "#ffffff";
        message.style.textShadow = "0 0 10px rgba(240, 194, 75, 0.6), 0 0 20px rgba(240, 194, 75, 0.3)";
        message.style.opacity = "0";
        message.classList.remove('scroll-reveal', 'revealed', 'show');
        setTimeout(() => {
            message.style.opacity = "1";
            message.classList.add('show');
        }, 10);

        localStorage.setItem("luminousScentsUserEmail", email);
    });
}

// Starfield canvas effect

function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const stars = [];
    const starCount = 250;

    function createStars() {
        stars.length = 0;
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 1.8 + 0.5,
                speed: Math.random() * 0.3 + 0.05,
                alpha: Math.random() * 0.5 + 0.5,
                isGold: true
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, w, h);

        for (let s of stars) {
            const parallaxX = mouseX * (s.size / 2);
            const parallaxY = mouseY * (s.size / 2);
            
            ctx.beginPath();
            ctx.arc(s.x + parallaxX, s.y + parallaxY, s.size, 0, Math.PI * 2);

            const gradient = ctx.createRadialGradient(
                s.x + parallaxX, s.y + parallaxY, 0,
                s.x + parallaxX, s.y + parallaxY, s.size * 4
            );

            gradient.addColorStop(0, `rgba(255, 220, 130, ${s.alpha})`);
            gradient.addColorStop(0.4, `rgba(245, 210, 120, ${s.alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(240, 194, 75, 0)`);

            ctx.fillStyle = gradient;
            ctx.fill();

            s.x += s.speed * 0.2;
            if (s.x > w) s.x = 0;
        }
    }

    function twinkle() {
        for (let s of stars) {
            s.alpha += (Math.random() - 0.5) * 0.02;
            s.alpha = Math.min(Math.max(s.alpha, 0.15), 0.7);
        }
    }

    function loop() {
        drawStars();
        twinkle();
        requestAnimationFrame(loop);
    }

    window.addEventListener("resize", () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        createStars();
    });

    createStars();
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    });
    loop();
}

// Page initialiser

function renderCheckoutPage() {
    const orderItems = document.getElementById("orderItems");
    const subtotalEl = document.getElementById("subtotal");
    const shippingEl = document.getElementById("shipping");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    
    if (!orderItems || !subtotalEl || !shippingEl || !taxEl || !totalEl) {
        return;
    }

    const basket = loadBasket();
    
    // Clear existing items
    orderItems.innerHTML = "";
    
    if (basket.length === 0) {
        orderItems.innerHTML = "<p>Your basket is empty.</p>";
        placeOrderBtn.disabled = true;
        return;
    }

    let subtotal = 0;

    basket.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return;
        }
        
        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        const orderItem = document.createElement("div");
        orderItem.className = "order-item";
        
        orderItem.innerHTML = `
            <div class="item-image">
                <img src="images/${product.id === 1 ? 'aurora-oud.png' : product.id === 2 ? 'citrus-dawn.png' : 'velvet-iris.png'}" alt="${product.name}">
            </div>
            <div class="item-details">
                <h4>${product.name}</h4>
                <p>${product.brand}</p>
                <p class="item-notes">${product.notes}</p>
                <p class="item-price">£${product.price.toFixed(2)} each</p>
            </div>
            <div class="item-total">
                £${lineTotal.toFixed(2)}
                <br>
                <small>Qty: ${item.quantity}</small>
            </div>
        `;

        orderItems.appendChild(orderItem);
    });

    // Calculate totals
    const shipping = subtotal > 75 ? 0 : 4.99;
    const taxRate = 0.20; // 20% VAT
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    // Update totals display
    subtotalEl.textContent = `£${subtotal.toFixed(2)}`;
    shippingEl.textContent = shipping === 0 ? "FREE" : `£${shipping.toFixed(2)}`;
    taxEl.textContent = `£${tax.toFixed(2)}`;
    totalEl.innerHTML = `<strong>£${total.toFixed(2)}</strong>`;

    // Setup billing address toggle
    const sameAsShipping = document.getElementById("sameAsShipping");
    const billingAddress = document.getElementById("billingAddress");
    
    if (sameAsShipping && billingAddress) {
        sameAsShipping.addEventListener("change", () => {
            billingAddress.style.display = sameAsShipping.checked ? "none" : "block";
        });
    }

    // Add input formatting for better UX
    const cardNumber = document.getElementById("cardNumber");
    const expiry = document.getElementById("expiry");
    const cvv = document.getElementById("cvv");
    
    if (cardNumber) {
        cardNumber.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "");
            let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
            if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
            e.target.value = formattedValue;
        });
    }
    
    if (expiry) {
        expiry.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length >= 2) {
                value = value.substring(0, 2) + "/" + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cvv) {
        cvv.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
    }

    // Setup payment method handling
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const cardDetails = document.getElementById("cardDetails");
    
    if (paymentMethods.length && cardDetails) {
        paymentMethods.forEach(method => {
            method.addEventListener("change", () => {
                if (method.value === "card") {
                    cardDetails.style.display = "block";
                } else {
                    cardDetails.style.display = "none";
                }
            });
        });
    }

    // Setup form validation and submission
    const checkoutForm = document.createElement("form");
    checkoutForm.id = "checkoutForm";
    
    // Wrap existing form elements in a form for proper submission
    const formsContainer = document.querySelector(".checkout-forms");
    if (formsContainer && !formsContainer.querySelector("form")) {
        const formContent = formsContainer.innerHTML;
        formsContainer.innerHTML = "";
        formsContainer.appendChild(checkoutForm);
        checkoutForm.innerHTML = formContent;
        
        // Move the place order button to the summary section where it should be
        const placeOrderBtnContainer = document.querySelector(".checkout-summary");
        if (placeOrderBtnContainer && placeOrderBtnContainer.contains(placeOrderBtn)) {
            // Button is already in the right place
        }
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", handlePlaceOrder);
    }

    function handlePlaceOrder() {
        const form = document.getElementById("checkoutForm");
        if (!form) return;

        // Validate required fields
        const requiredFields = [
            { id: "email", name: "Email Address" },
            { id: "firstName", name: "First Name" },
            { id: "lastName", name: "Last Name" },
            { id: "address1", name: "Address" },
            { id: "city", name: "City" },
            { id: "postcode", name: "Postcode" },
            { id: "country", name: "Country" }
        ];

        for (let field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                customAlert(`Please fill in the ${field.name} field.`);
                if (element) element.focus();
                return;
            }
        }

        // Email validation
        const email = document.getElementById("email").value;
        if (!email.includes("@")) {
            customAlert("Please enter a valid email address.");
            document.getElementById("email").focus();
            return;
        }

        // If billing address is different, validate billing fields too
        const sameAsShipping = document.getElementById("sameAsShipping");
        if (sameAsShipping && !sameAsShipping.checked) {
            const billingRequired = [
                { id: "billingFirstName", name: "Billing First Name" },
                { id: "billingLastName", name: "Billing Last Name" },
                { id: "billingAddress1", name: "Billing Address" },
                { id: "billingCity", name: "Billing City" },
                { id: "billingPostcode", name: "Billing Postcode" },
                { id: "billingCountry", name: "Billing Country" }
            ];

            for (let field of billingRequired) {
                const element = document.getElementById(field.id);
                if (!element || !element.value.trim()) {
                    customAlert(`Please fill in the ${field.name} field.`);
                    if (element) element.focus();
                    return;
                }
            }
        }

        // Validate card details if card payment selected
        const cardPayment = document.getElementById("card");
        if (cardPayment && cardPayment.checked) {
            const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
            const cardName = document.getElementById("cardName").value.trim();
            const expiry = document.getElementById("expiry").value.trim();
            const cvv = document.getElementById("cvv").value.trim();

            if (!cardNumber || cardNumber.length < 16) {
                customAlert("Please enter a valid 16-digit card number.");
                document.getElementById("cardNumber").focus();
                return;
            }

            if (!cardName) {
                customAlert("Please enter the name on the card.");
                document.getElementById("cardName").focus();
                return;
            }

            if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
                customAlert("Please enter expiry date in MM/YY format.");
                document.getElementById("expiry").focus();
                return;
            }

            if (!cvv || cvv.length < 3) {
                customAlert("Please enter a valid CVV.");
                document.getElementById("cvv").focus();
                return;
            }
        }

        // Process the order
        customAlert("Order placed successfully! This is a demo - no real payment has been processed.");
        
        // Clear the basket
        localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify([]));
        
        // Redirect to thank you page or home
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page");

    initStarfield();
    initMouseTrail();

    // rest of the code...
    if (page === "home") {
        setupAuthForm();
    } else if (page === "products") {
        renderProductsPage();
    } else if (page === "basket") {
        renderBasketPage();
    } else if (page === "checkout") {
        renderCheckoutPage();
    }
});
// Scroll reveal animations
const observerOptions = {
    threshold: 0,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        } else {
            entry.target.classList.remove('revealed');
        }
    });
}, observerOptions);

// Prevent observer from catching dynamically added elements
const originalObserve = observer.observe;
observer.observe = function(element) {
    if (element.classList.contains('custom-alert') || 
        element.classList.contains('custom-alert-overlay') ||
        element.closest('.custom-alert')) {
        return;
    }
    originalObserve.call(this, element);
};
document.querySelectorAll('.main-header, .site-footer, .hero-text, .hero-text h2, .hero-text p, .page-header, .page-header h2, .page-header p, .card, .card h3, .card p, .card .btn-primary, .feature-card, .feature-card h4, .feature-card p, .basket-section, .basket-item, .basket-summary, .basket-summary p, .basket-summary .btn-primary, .info-column, .info-column h3, .info-column p, .steps-list li, .step-number, .feature-section h3, .auth-section, .auth-form').forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
});


function initMouseTrail() {
    const canvas = document.getElementById('trailCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    function updateCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    updateCanvasSize();
    
    const points = [];
    const maxAge = 1000;
    
    window.addEventListener('mousemove', (e) => {
        points.push({
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        });
    });
    
    window.addEventListener('mouseleave', () => {
        points.length = 0;
    });
    
    window.addEventListener('resize', updateCanvasSize);
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        const now = Date.now();
    
        for (let i = points.length - 1; i >= 0; i--) {
            if (now - points[i].time > maxAge) {
                points.splice(i, 1);
            }
        }
    
        if (points.length > 1) {
            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                const prevPoint = points[i - 1];
                const age = now - point.time;
                const life = 1 - (age / maxAge);
                const alpha = life * 0.6;
                const size = life * 2;
    
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.strokeStyle = `rgba(240, 194, 75, ${alpha})`;
                ctx.lineWidth = size;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }
    
        requestAnimationFrame(animate);
    }
    
    animate();
}
