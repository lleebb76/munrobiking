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
        // Map calendar items to your exact product page filenames
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
