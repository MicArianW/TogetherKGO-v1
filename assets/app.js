// TogetherKGO - Food Resources App
window.__APP = (function () {
  let map,
    markers = [],
    services = [],
    center = { lat: 43.7648, lng: -79.1810 }; // KGO area
  let info;

  const el = (id) => document.getElementById(id);

  /* ------------------------------
     LOAD SERVICES JSON
  ------------------------------ */
  async function loadData() {
    try {
      const resp = await fetch("data/services.json");
      services = await resp.json();

      // Immediately show results list
      applyFilters();

      // If map is already initialized, draw markers now
      if (map) renderMarkers(services);
    } catch (err) {
      console.error("Failed to load services.json", err);
      if (el("results")) {
        el("results").innerHTML = '<li style="padding: 20px; text-align: center; color: #888;">Unable to load food resources. Please refresh the page.</li>';
      }
    }
  }

  /* ------------------------------
            INIT MAP
  ------------------------------ */
  function initMap() {
    const mapEl = el("map");
    if (!mapEl) return;

    map = new google.maps.Map(mapEl, {
      center,
      zoom: 13,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    info = new google.maps.InfoWindow();

    // Draw markers if data is already loaded
    if (services.length > 0) {
      renderMarkers(services);
    }
  }

  /* ------------------------------
        DISTANCE CALCULATOR
  ------------------------------ */
  function kmDistance(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * (Math.PI / 180);
    const dLng = (b.lng - a.lng) * (Math.PI / 180);
    const s1 =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * (Math.PI / 180)) *
        Math.cos(b.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s1));
  }

  /* ------------------------------
        RENDER MARKERS
  ------------------------------ */
  function renderMarkers(items) {
    if (!map) return;

    markers.forEach((m) => m.setMap(null));
    markers = [];

    items.forEach((item) => {
      const m = new google.maps.Marker({
        position: item.location,
        map,
        title: item.name,
        animation: google.maps.Animation.DROP,
      });

      m.addListener("click", () => {
        const contactInfo = [];
        if (item.phone) contactInfo.push(`<div>📞 ${item.phone}</div>`);
        if (item.email) contactInfo.push(`<div>📧 ${item.email}</div>`);
        
        // Google Maps directions link
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`;
        contactInfo.push(`<div><a href="${directionsUrl}" target="_blank" style="color: #1e40af;">🗺️ Get Directions</a></div>`);
        
        if (item.website) contactInfo.push(`<div><a href="${item.website}" target="_blank">🌐 Website</a></div>`);

        info.setContent(`
          <div style="max-width:300px; padding: 8px;">
            <strong style="font-size: 16px;">${item.name}</strong><br/>
            <div style="margin: 8px 0; color: #555;">${item.address}</div>
            <div style="margin: 8px 0;">
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${item.type.replace('_', ' ')}</span>
            </div>
            <div style="margin: 8px 0; color: #555;"><strong>Hours:</strong> ${item.hours || "Contact for hours"}</div>
            ${contactInfo.length > 0 ? '<div style="margin: 10px 0; padding-top: 8px; border-top: 1px solid #ddd;">' + contactInfo.join('') + '</div>' : ''}
            <div style="margin-top: 10px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}" 
                 target="_blank" 
                 style="background: #22c55e; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; display: inline-block;">
                Get Directions
              </a>
            </div>
          </div>
        `);
        info.open(map, m);
      });

      markers.push(m);
    });

    // Fit map bounds to show all markers
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend(m.getPosition()));
      map.fitBounds(bounds);
      
      // Don't zoom in too much
      const listener = google.maps.event.addListener(map, "idle", function() {
        if (map.getZoom() > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  }

  /* ------------------------------
       LIST RESULTS
  ------------------------------ */
  function listResults(items) {
    const ul = el("results");
    const countEl = el("resultCount");
    
    if (!ul) return;

    ul.innerHTML = "";
    
    if (countEl) {
      countEl.textContent = `${items.length} food resource${items.length !== 1 ? 's' : ''} found`;
    }

    if (items.length === 0) {
      ul.innerHTML = '<li style="padding: 20px; text-align: center; color: #888;">No resources match your search criteria. Try adjusting your filters.</li>';
      return;
    }

    items.forEach((it) => {
      const li = document.createElement("li");
      
      const contactInfo = [];
      if (it.phone) contactInfo.push(`📞 ${it.phone}`);
      
      // Google Maps directions link (green, like website)
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(it.address)}`;
      contactInfo.push(`<a href="${directionsUrl}" target="_blank" style="color: #22c55e;">🗺️ Directions</a>`);
      
      if (it.website) contactInfo.push(`<a href="${it.website}" target="_blank" style="color: #22c55e;">🌐 Website</a>`);
      
      li.innerHTML = `
        <div><strong>${it.name}</strong></div>
        <div class="subtle">${it.address}</div>
        <div style="margin: 8px 0;">
          ${(it.tags || [])
            .map((t) => `<span class="badge">${t.replace('_', ' ')}</span>`)
            .join("")}
        </div>
        <div class="subtle"><strong>Hours:</strong> ${it.hours || "Contact for hours"}</div>
        ${contactInfo.length > 0 ? '<div class="subtle" style="margin-top: 6px;">' + contactInfo.join(' • ') + '</div>' : ''}
      `;

      // Click result -> center map and open info window
      li.onclick = () => {
        if (map) {
          map.panTo(it.location);
          map.setZoom(15);
          
          // Find and click the corresponding marker
          const marker = markers.find(m => 
            m.getPosition().lat() === it.location.lat && 
            m.getPosition().lng() === it.location.lng
          );
          if (marker) {
            google.maps.event.trigger(marker, 'click');
          }
        }
      };

      ul.appendChild(li);
    });
  }

  /* ------------------------------
        FILTER ENGINE
  ------------------------------ */
  function applyFilters() {
    const qEl = el("q");
    const typeEl = el("type");
    const dayEl = el("openDay");
    const radiusEl = el("radius");

    if (!qEl || !typeEl || !dayEl || !radiusEl) return;

    const q = qEl.value.toLowerCase().trim();
    const type = typeEl.value;
    const day = dayEl.value;
    const radius = parseInt(radiusEl.value, 10);

    const mapCenter = map ? map.getCenter().toJSON() : center;

    const filtered = services.filter((s) => {
      // Text search
      const text =
        [s.name, s.address, s.description, ...(s.tags || [])]
          .join(" ")
          .toLowerCase()
          .replace(/_/g, ' '); // Replace underscaces with spaces
      if (q && !text.includes(q)) return false;

      // Type filter
      if (type && s.type !== type) return false;
      
      // Day filter
      if (day && s.days && !s.days.includes(day)) return false;

      // Radius filter
      if (radius < 90000) {
        const d = kmDistance(mapCenter, s.location);
        if (d * 1000 > radius) return false;
      }

      return true;
    });

    // Update results list
    listResults(filtered);

    // Update map markers
    if (map) renderMarkers(filtered);
  }

  /* ------------------------------
       RESET FILTERS
  ------------------------------ */
  function resetFilters() {
    const qEl = el("q");
    const typeEl = el("type");
    const dayEl = el("openDay");
    const radiusEl = el("radius");

    if (qEl) qEl.value = "";
    if (typeEl) typeEl.value = "";
    if (dayEl) dayEl.value = "";
    if (radiusEl) radiusEl.value = "99999";
    
    applyFilters();
  }

  /* ------------------------------
        EVENT BINDINGS
  ------------------------------ */
  function setupEvents() {
    const applyBtn = el("applyBtn");
    const resetBtn = el("resetBtn");

    if (applyBtn) applyBtn.onclick = applyFilters;
    if (resetBtn) resetBtn.onclick = resetFilters;

    // Real-time search on input
    const qEl = el("q");
    if (qEl) {
      qEl.addEventListener("input", applyFilters);
    }
  }

  /* ------------------------------
        SHARE FUNCTIONALITY
  ------------------------------ */
  function setupShare() {
    const shareBtn = el("shareBtn");
    if (!shareBtn) return;

    shareBtn.onclick = async () => {
      const shareData = {
        title: 'TogetherKGO - Food Resources',
        text: 'Find food banks and community resources in the Kingston-Galloway-Orton Park area',
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      } catch (err) {
        console.log('Share failed:', err);
      }
    };
  }

  /* ------------------------------
              BOOT
  ------------------------------ */
  function boot() {
    setupEvents();
    setupShare();
    loadData();
  }

  // Only boot if we're on a page with the required elements
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return { initMap };
})();

/* ===================================================================
   MOBILE NAVIGATION FIX - Added for slide-out menu functionality
   =================================================================== */

// Mobile Navigation Controller
class MobileNavigation {
  constructor() {
    this.overlay = null;
    this.sidebar = null;
    this.closeBtn = null;
    this.languageBtn = null;
    this.languageMenu = null;
    this.isMenuOpen = false;
    this.isLanguageOpen = false;
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.createMobileMenu();
    this.createLanguageDropdown();
    this.attachEventListeners();
    this.highlightCurrentPage();
  }

  createMobileMenu() {
    // Check if mobile menu already exists
    if (document.querySelector('.mobile-menu-overlay')) return;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'mobile-menu-overlay';
    
    // Create sidebar
    this.sidebar = document.createElement('div');
    this.sidebar.className = 'mobile-menu-sidebar';
    
    // Get current page for navigation links
    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath.includes('index.html') || currentPath.includes('home.html');
    
    // Check if we're on submit-listing page
    const isSubmitPage = currentPath.includes('submit-listing');
    
    // Build navigation links based on page
    let navLinks = `
      <li><a href="${isHome ? '#' : 'index.html'}">Home</a></li>
      <li><a href="food-banks.html">Find Food Banks</a></li>
      <li><a href="community.html">Community Board</a></li>
      <li><a href="resources.html">Resources</a></li>
    `;
    
    // Add Languages link if on submit-listing page
    if (isSubmitPage) {
      navLinks += `<li><a href="#" class="mobile-menu-language-trigger">🌐 Languages</a></li>`;
    }
    
    this.sidebar.innerHTML = `
      <div class="mobile-menu-header">
        <div class="mobile-menu-logo">TogetherKGO</div>
        <button class="mobile-menu-close" aria-label="Close menu">×</button>
      </div>
      <nav>
        <ul class="mobile-menu-nav">
          ${navLinks}
        </ul>
      </nav>
      ${isSubmitPage ? `
      <div class="mobile-menu-languages" style="padding: 1rem; border-top: 1px solid #e5e7eb; display: none;">
        <div style="font-weight: 600; margin-bottom: 0.5rem; color: #1f2937;">Select Language:</div>
        <ul style="list-style: none;">
          <li><a href="#" data-lang="en" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">English</a></li>
          <li><a href="#" data-lang="ta" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">தமிழ் (Tamil)</a></li>
          <li><a href="#" data-lang="bn" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">বাংলা (Bengali)</a></li>
          <li><a href="#" data-lang="tl" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">Tagalog (Filipino)</a></li>
          <li><a href="#" data-lang="gu" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">ગુજરાતી (Gujarati)</a></li>
          <li><a href="#" data-lang="ur" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">اردو (Urdu)</a></li>
          <li><a href="#" data-lang="fa" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">فارسی (Persian/Farsi)</a></li>
          <li><a href="#" data-lang="es" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">Español (Spanish)</a></li>
          <li><a href="#" data-lang="fr" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">Français (French)</a></li>
          <li><a href="#" data-lang="hi" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">हिन्दी (Hindi)</a></li>
          <li><a href="#" data-lang="ar" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">العربية (Arabic)</a></li>
          <li><a href="#" data-lang="zh" style="display: block; padding: 0.5rem; color: #1f2937; text-decoration: none;">中文 (Chinese)</a></li>
        </ul>
      </div>
      ` : ''}
    `;
    
    // Append to body
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.sidebar);
    
    // Store references
    this.closeBtn = this.sidebar.querySelector('.mobile-menu-close');
  }

  createLanguageDropdown() {
    // Find language button
    this.languageBtn = document.querySelector('.language-btn');
    
    if (!this.languageBtn) return;

    // Check if dropdown already exists
    let languageContainer = this.languageBtn.closest('.language-dropdown');
    if (!languageContainer) {
      // Wrap language button in container
      languageContainer = document.createElement('div');
      languageContainer.className = 'language-dropdown';
      this.languageBtn.parentNode.insertBefore(languageContainer, this.languageBtn);
      languageContainer.appendChild(this.languageBtn);
    }

    // Check if dropdown menu already exists
    this.languageMenu = languageContainer.querySelector('.language-dropdown-menu');
    
    if (!this.languageMenu) {
      // Create dropdown menu
      this.languageMenu = document.createElement('div');
      this.languageMenu.className = 'language-dropdown-menu';
      this.languageMenu.innerHTML = `
        <ul>
          <li><button data-lang="en">English</button></li>
          <li><button data-lang="ta">தமிழ் (Tamil)</button></li>
          <li><button data-lang="bn">বাংলা (Bengali)</button></li>
          <li><button data-lang="tl">Tagalog (Filipino)</button></li>
          <li><button data-lang="gu">ગુજરાતી (Gujarati)</button></li>
          <li><button data-lang="ur">اردو (Urdu)</button></li>
          <li><button data-lang="fa">فارسی (Persian/Farsi)</button></li>
          <li><button data-lang="es">Español (Spanish)</button></li>
          <li><button data-lang="fr">Français (French)</button></li>
          <li><button data-lang="hi">हिन्दी (Hindi)</button></li>
          <li><button data-lang="ar">العربية (Arabic)</button></li>
          <li><button data-lang="zh">中文 (Chinese)</button></li>
        </ul>
      `;
      languageContainer.appendChild(this.languageMenu);
    }
  }

  attachEventListeners() {
    // Find all menu buttons on the page
    const menuButtons = document.querySelectorAll('.mobile-menu-btn, [data-mobile-menu]');
    menuButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openMenu();
      });
    });

    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeMenu());
    }

    // Overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeMenu());
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isMenuOpen) this.closeMenu();
        if (this.isLanguageOpen) this.closeLanguageMenu();
      }
    });

    // Language button
    if (this.languageBtn) {
      this.languageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleLanguageMenu();
      });
    }

    // Language selection
    if (this.languageMenu) {
      const languageButtons = this.languageMenu.querySelectorAll('button[data-lang]');
      languageButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = btn.getAttribute('data-lang');
          this.changeLanguage(lang);
        });
      });
    }

    // Close language menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isLanguageOpen && 
          this.languageMenu && 
          !this.languageMenu.contains(e.target) && 
          !this.languageBtn.contains(e.target)) {
        this.closeLanguageMenu();
      }
    });

    // Handle navigation links in mobile menu
    const navLinks = this.sidebar?.querySelectorAll('.mobile-menu-nav a:not(.mobile-menu-language-trigger)');
    if (navLinks) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });
    }
    
    // Handle language trigger in mobile menu (submit-listing page)
    const languageTrigger = this.sidebar?.querySelector('.mobile-menu-language-trigger');
    if (languageTrigger) {
      languageTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        const languagesSection = this.sidebar.querySelector('.mobile-menu-languages');
        if (languagesSection) {
          // Toggle display
          if (languagesSection.style.display === 'none' || languagesSection.style.display === '') {
            languagesSection.style.display = 'block';
          } else {
            languagesSection.style.display = 'none';
          }
        }
      });
    }
    
    // Handle language selection in mobile menu
    const mobileMenuLanguageLinks = this.sidebar?.querySelectorAll('.mobile-menu-languages a[data-lang]');
    if (mobileMenuLanguageLinks) {
      mobileMenuLanguageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = link.getAttribute('data-lang');
          this.changeLanguage(lang);
          this.closeMenu();
        });
      });
    }
  }

  openMenu() {
    if (this.overlay && this.sidebar) {
      this.isMenuOpen = true;
      this.overlay.classList.add('active');
      this.sidebar.classList.add('active');
      document.body.classList.add('menu-open');
    }
  }

  closeMenu() {
    if (this.overlay && this.sidebar) {
      this.isMenuOpen = false;
      this.overlay.classList.remove('active');
      this.sidebar.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  }

  toggleLanguageMenu() {
    if (this.isLanguageOpen) {
      this.closeLanguageMenu();
    } else {
      this.openLanguageMenu();
    }
  }

  openLanguageMenu() {
    if (this.languageMenu) {
      this.isLanguageOpen = true;
      this.languageMenu.classList.add('active');
    }
  }

  closeLanguageMenu() {
    if (this.languageMenu) {
      this.isLanguageOpen = false;
      this.languageMenu.classList.remove('active');
    }
  }

  changeLanguage(langCode) {
    console.log('Changing language to:', langCode);
    
    // Close the dropdown
    this.closeLanguageMenu();
    
    // Check if i18n system exists (if you have one)
    if (window.i18n && typeof window.i18n.changeLanguage === 'function') {
      window.i18n.changeLanguage(langCode);
    } else if (window.changeLanguage && typeof window.changeLanguage === 'function') {
      window.changeLanguage(langCode);
    } else {
      // Store language preference
      localStorage.setItem('preferredLanguage', langCode);
      
      // Show notification
      this.showLanguageNotification(langCode);
    }
  }

  showLanguageNotification(langCode) {
    // Simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4ade80;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
    `;
    notification.textContent = `Language changed to ${langCode.toUpperCase()}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = this.sidebar?.querySelectorAll('.mobile-menu-nav a');
    
    if (navLinks) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href) || 
            (href === '#' && (currentPath === '/' || currentPath.includes('index.html')))) {
          link.classList.add('active');
        }
      });
    }
  }
}

// Initialize mobile navigation when script loads
const mobileNav = new MobileNavigation();
