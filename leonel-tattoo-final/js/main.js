(function(){
  const $ = (s, p=document)=>p.querySelector(s);
  const $$ = (s, p=document)=>Array.from(p.querySelectorAll(s));
  const phone = (window.APP && window.APP.phone) || "";
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-quad',
      once: true,
      offset: 50
    });
  }
  // Header scroll effect
  const header = $(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  // Smooth scroll
  $$("#site-nav a, .footer-nav a, .hero-ctas a").forEach(a => {
    a.addEventListener("click", (e) => {
      if (a.hash && a.getAttribute("href") !== "#") {
        e.preventDefault();
        const el = document.querySelector(a.hash);
        if (el) {
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });
          
          // Update URL
          if (history.pushState) {
            history.pushState(null, null, a.hash);
          } else {
            location.hash = a.hash;
          }
        }
        
        // Close mobile menu if open
        try {
          const navMenu = document.getElementById("nav-menu");
          const navToggle = document.getElementById("nav-toggle");
          if (navMenu && navMenu.classList.contains("open")) {
            navMenu.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
          }
        } catch(e) {}
      }
    });
  });

  // Mobile menu
  const navToggle = $("#nav-toggle");
  const navMenu = $("#nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      
      // Prevent body scroll when menu is open
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (navMenu.classList.contains("open") && 
          !navMenu.contains(e.target) && 
          !navToggle.contains(e.target)) {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  // Build gallery from assets folder
  const gallery = $("#gallery");
  const imgs = [];
  for (let i = 1; i <= 12; i++) {
    const n1 = "assets/images/portfolio/foto" + i + ".jpg";
    imgs.push(n1);
  }
  
  imgs.forEach(src => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-aos", "zoom-in");
    
    const img = new Image();
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = "Trabajo de tatuaje";
    img.src = src;
    img.onerror = () => {
      card.remove();
    };
    
    card.appendChild(img);
    gallery && gallery.appendChild(card);
  });

  // Booking form -> WhatsApp
  function buildWaURL(msg) {
    const base = "https://wa.me/";
    const clean = phone.replace(/[^\d]/g, "");
    return base + clean + "?text=" + encodeURIComponent(msg);
  }

  const form = $("#booking-form");
  const linkInline = $("#wa-link-inline");
  const floatingWA = $("#floating-wa");

  function validateEmail(v) { 
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); 
  }
  
  function setError(name, msg) {
    const el = document.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || "";
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let ok = true;
    
    setError("name", ""); 
    setError("email", ""); 
    setError("phone", "");
    
    if (!data.name) { 
      setError("name", "Ingresa tu nombre"); 
      ok = false; 
    }
    
    if (!data.email || !validateEmail(data.email)) { 
      setError("email", "Correo inválido"); 
      ok = false; 
    }
    
    if (!data.phone) { 
      setError("phone", "Ingresa tu teléfono"); 
      ok = false; 
    }
    
    if (!ok) return;
    
    const msg = `Hola Leonel, soy ${data.name}. Me gustaría cotizar un tatuaje.
- Email: ${data.email}
- Teléfono: ${data.phone}
- Idea: ${data.idea || "-"}
- Tamaño: ${data.size || "-"}
- Ubicación: ${data.placement || "-"}
Gracias!`;
    
    const url = buildWaURL(msg);
    window.open(url, "_blank", "noopener");
  });

  // Set inline and floating WhatsApp links
  const defaultMsg = "Hola Leonel, vengo desde tu web y quiero más información.";
  const urlDefault = buildWaURL(defaultMsg);
  linkInline?.setAttribute("href", urlDefault);
  floatingWA?.setAttribute("href", urlDefault);

  // Add loading animation for images
  const images = $$("img");
  images.forEach(img => {
    if (!img.complete) {
      img.style.opacity = "0";
      img.addEventListener("load", () => {
        img.style.transition = "opacity 0.5s ease";
        img.style.opacity = "1";
      });
    }
  });

  // Parallax effect for hero background
  const heroBg = $(".hero-bg");
  if (heroBg) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      heroBg.style.transform = `scale(1.1) translateY(${rate}px)`;
    });
  }


  // Espera 5 segundos y oculta el loader
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.getElementById("loader").classList.add("hidden");
      document.getElementById("content").style.display = "block";
    }, 4000); // 5000 ms = 5 segundos
  });

  // === Frontier Fix: Fallback AOS y manejo seguro del loader ===
  try {
    if (typeof AOS === 'undefined') {
      document.querySelectorAll('[data-aos]').forEach((el,i)=>{
        el.classList.add('fallback-aos');
        setTimeout(()=> el.classList.add('animate'), i*60);
      });
    } else {
      // Re-inicializar por seguridad si la página ya cargó
      AOS.init({ duration: 700, once: true, offset: 50 });
    }
  } catch(e){ console.warn('AOS fallback warn:', e); }

  // Loader seguro
  window.addEventListener('load', () => {
    setTimeout(() => {
      var loader = document.getElementById('loader');
      if (loader && loader.classList) loader.classList.add('hidden');
      var content = document.getElementById('content');
      if (content && content.style) content.style.display = 'block';
    }, 800);
  });

})();