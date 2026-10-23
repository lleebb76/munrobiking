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
    }

    // Populate Shop Grid
    const shopGrid = document.getElementById('shop-grid');
    if (shopGrid && data.calendars) {
      shopGrid.innerHTML = data.calendars.map(cal => `
        <div class="card">
          <div>
            <img src="${cal.cover}" alt="${cal.title}">
            <h3>${cal.title}</h3>
            <p style="font-size: 13px; color: #666; margin-bottom: 8px;">${cal.size} • £${cal.price.toFixed(2)}</p>
            <p style="font-size: 13px; line-height: 1.4;">${cal.description}</p>
          </div>
          <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(data.paypalBusinessEmail)}&item_name=${encodeURIComponent(cal.title)}&amount=${cal.price}&currency_code=GBP" target="_blank" class="btn-primary">Buy with PayPal (£${cal.price.toFixed(2)})</a>
        </div>
      `).join('');
    }

    // Populate Album / Gallery Page
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('id') || 'ben-nevis';
    const albumTitle = document.getElementById('album-title');
    const squareGrid = document.getElementById('square-grid');

    if (squareGrid && data.galleries[albumId]) {
      const photos = data.galleries[albumId];
      if (albumTitle) albumTitle.innerText = data.homeScrollItems.find(i => i.id === albumId)?.title || "Photo Album";
      
      squareGrid.innerHTML = photos.map(photo => `
        <img src="${photo}" alt="Square photo" class="square-thumb" onclick="openLightbox('${photo}')">
      `).join('');
    }

  } catch (err) {
    console.error("Error loading site data:", err);
  }
});

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