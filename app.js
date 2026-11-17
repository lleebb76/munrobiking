document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('data.json');
    const data = await res.json();

    // Populate Site Titles & Footers
    if (document.getElementById('site-title')) document.getElementById('site-title').innerText = data.siteTitle;
    if (document.getElementById('footer-text')) document.getElementById('footer-text').innerText = data.copyright;
    if (document.getElementById('sidebar-copyright')) document.getElementById('sidebar-copyright').innerText = data.copyright;
    if (document.getElementById('legal-footer-text')) document.getElementById('legal-footer-text').innerText = data.legalFooter;

    // Populate Homepage Horizontal Scroll
    const scrollContainer = document.getElementById('home-scroll');
    if (scrollContainer && data.homeScrollItems) {
      scrollContainer.innerHTML = data.homeScrollItems.map(item => `
        <a href="album.html?id=${item.id}" class="scroll-card">
          <img src="${item.coverImage}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>${item.subtitle} • ${item.date}</p>
        </a>
      `).join('');

      // Mouse Wheel Horizontal Scroll
      scrollContainer.addEventListener('wheel', (evt) => {
        if (evt.deltaY !== 0) {
          evt.preventDefault();
          scrollContainer.scrollLeft += evt.deltaY;
        }
      });

      // Arrow Button Click Handlers
      const btnLeft = document.getElementById('scroll-left');
      const btnRight = document.getElementById('scroll-right');

      if (btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => {
          scrollContainer.scrollBy({ left: -350, behavior: 'smooth' });
        });

        btnRight.addEventListener('click', () => {
          scrollContainer.scrollBy({ left: 350, behavior: 'smooth' });
        });
      }
    }

    // Populate Shop Grid
    const shopGrid = document.getElementById('shop-grid');
    if (shopGrid && data.calendars) {
      shopGrid.innerHTML = data.calendars.map(cal => {
        let pageLink = 'A4 Wall Calendar.html';
        if (cal.id === 'a3-calendar' || cal.id === 'calendar-2026') pageLink = 'A3 Wall Calendar.html';
        if (cal.id === 'landscapes-calendar' || cal.id === 'highlands-calendar') pageLink = 'Landscape calendar.html';

        return `
          <div class="card">
            <a href="${pageLink}" style="text-decoration: none; color: inherit;">
              <img src="${cal.cover}" alt="${cal.title}">
              <h3>${cal.title}</h3>
              <p style="font-size: 13px; color: #666; margin-bottom: 8px;">${cal.size} • £${cal.price.toFixed(2)}</p>
              <p style="font-size: 13px; line-height: 1.4;">${cal.description}</p>
            </a>
            <a href="${pageLink}" class="btn-primary">View Details</a>
          </div>
        `;
      }).join('');
    }

    // Populate Album / Gallery Page
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('id') || 'benidorm-biking';
    const albumTitle = document.getElementById('album-title');
    const squareGrid = document.getElementById('square-grid');

    if (squareGrid && data.galleries[albumId]) {
      const photos = data.galleries[albumId];
      const currentItem = data.homeScrollItems.find(i => i.id === albumId);
      if (albumTitle) albumTitle.innerText = currentItem ? currentItem.title : "Photo Album";
      
      squareGrid.innerHTML = photos.map(photo => `
        <img src="${photo}" alt="Square photo" class="square-thumb" onclick="openLightbox('${photo}')">
      `).join('');
    }

  } catch (err) {
    console.error("Error loading site data:", err);
  }
});

// Initialize Cart Badge & Cart Page rendering
  updateCartBadge();
  if (document.getElementById('cart-content-area')) {
    renderCartPage();
  }
});

// Cart Management Functions
function getCart() {
  return JSON.parse(localStorage.getItem('munro_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('munro_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCartAndRedirect(product) {
  let cart = getCart();
  let existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  saveCart(cart);
  window.location.href = 'cart.html';
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function updateQuantity(productId, change) {
  let cart = getCart();
  let item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity = (item.quantity || 1) + change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
    saveCart(cart);
    renderCartPage();
  }
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.innerText = `🛒 (${totalCount})`;
  }
}

function renderCartPage() {
  const container = document.getElementById('cart-content-area');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <p style="font-size: 15px; color: var(--text-muted); margin-bottom: 20px;">Your cart is currently empty.</p>
      <a href="shop.html" class="btn-primary" style="display: inline-block; width: auto; padding: 12px 24px;">Browse Calendars</a>
    `;
    return;
  }

  let subtotal = 0;
  let itemsHtml = cart.map(item => {
    let qty = item.quantity || 1;
    let itemTotal = item.price * qty;
    subtotal += itemTotal;
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="${item.cover}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; background: #EAE5DC;">
          <div>
            <h4 style="font-family: var(--font-serif); font-size: 16px; margin-bottom: 4px;">${item.title}</h4>
            <p style="font-size: 13px; color: var(--text-muted);">£${item.price.toFixed(2)} each</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; border: 1px solid var(--border-color); padding: 4px 8px; background: #fff;">
            <button onclick="updateQuantity('${item.id}', -1)" style="background: none; border: none; cursor: pointer; font-size: 14px; padding: 0 4px;">−</button>
            <span style="font-size: 14px; min-width: 20px; text-align: center;">${qty}</span>
            <button onclick="updateQuantity('${item.id}', 1)" style="background: none; border: none; cursor: pointer; font-size: 14px; padding: 0 4px;">+</button>
          </div>
          <span style="font-weight: 500; min-width: 60px; text-align: right;">£${itemTotal.toFixed(2)}</span>
          <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #999; cursor: pointer; font-size: 16px;" title="Remove">✕</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="background: var(--panel-bg); border: 1px solid var(--border-color); padding: 24px; max-width: 650px;">
      ${itemsHtml}
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 2px solid var(--border-color);">
        <span style="font-family: var(--font-serif); font-size: 18px; font-weight: 600;">Total</span>
        <span style="font-family: var(--font-serif); font-size: 20px; font-weight: 600;">£${subtotal.toFixed(2)}</span>
      </div>
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=lleebb76@gmail.com&item_name=${encodeURIComponent('Get. That. Shot. Order (' + cart.length + ' items)')}&amount=${subtotal.toFixed(2)}&currency_code=GBP" target="_blank" class="btn-primary" style="display: block; text-align: center; margin-top: 24px;">Proceed to Secure Checkout with PayPal (£${subtotal.toFixed(2)})</a>
    </div>
  `;
}

// Lightbox functionality
function openLightbox(imgSrc) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (lightbox && lightboxImg) {
    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
  }
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'lightbox' || e.target.id === 'lightbox-close') {
    document.getElementById('lightbox').classList.remove('active');
  }
});
