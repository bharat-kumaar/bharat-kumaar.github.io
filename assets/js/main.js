/**
 * Bharat Kumar - Ultra-Advanced Portfolio Engine
 * Multi-theme switcher, Web Audio Synthesizer, 3D Tilt Physics, Terminal 3.0 & API Sandbox
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------- 1. Web Audio FX Synthesizer ----------------
  let audioCtx = null;
  let isMuted = localStorage.getItem('bk_audio_muted') === 'true';

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, vol = 0.05, slideFreq = null) {
    if (isMuted) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
      }

      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context may be restricted by browser until user gesture
    }
  }

  const playHoverSound = () => playTone(520, 'sine', 0.04, 0.03, 680);
  const playClickSound = () => playTone(780, 'triangle', 0.06, 0.06, 1200);
  const playSuccessSound = () => {
    playTone(523.25, 'sine', 0.12, 0.05); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.12, 0.05), 50); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.18, 0.06), 100); // G5
  };

  // Audio Toggle UI
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  function updateAudioToggleUI() {
    if (!audioToggleBtn) return;
    const icon = audioToggleBtn.querySelector('i');
    if (isMuted) {
      audioToggleBtn.classList.remove('sound-on');
      if (icon) icon.className = 'fa-solid fa-volume-xmark';
      audioToggleBtn.setAttribute('title', 'Sound FX: Off (Click to enable)');
    } else {
      audioToggleBtn.classList.add('sound-on');
      if (icon) icon.className = 'fa-solid fa-volume-high';
      audioToggleBtn.setAttribute('title', 'Sound FX: On (Click to mute)');
    }
  }

  if (audioToggleBtn) {
    updateAudioToggleUI();
    audioToggleBtn.addEventListener('click', () => {
      initAudio();
      isMuted = !isMuted;
      localStorage.setItem('bk_audio_muted', isMuted);
      updateAudioToggleUI();
      if (!isMuted) playSuccessSound();
    });
  }

  // Attach sound to interactive buttons & HUD pills
  document.querySelectorAll('.btn, .social-icon-btn, .filter-btn, .theme-option, .api-shortcut-btn, .hero-satellite-pill, .hud-pill').forEach(btn => {
    btn.addEventListener('mouseenter', playHoverSound);
    btn.addEventListener('click', playClickSound);
  });

  // ---------------- 2. Multi-Theme Color Engine ----------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeOptions = document.querySelectorAll('.theme-option');
  const currentThemeLabel = document.getElementById('current-theme-name');

  const themes = {
    violet: 'Hyper-Violet',
    emerald: 'Emerald Matrix',
    sunset: 'Sunset Flare',
    blue: 'Cyber Blue'
  };

  function applyTheme(themeKey) {
    if (!themes[themeKey]) themeKey = 'violet';
    document.documentElement.setAttribute('data-theme', themeKey);
    localStorage.setItem('bk_portfolio_theme', themeKey);

    if (currentThemeLabel) {
      currentThemeLabel.textContent = themes[themeKey];
    }

    themeOptions.forEach(opt => {
      if (opt.getAttribute('data-theme-choice') === themeKey) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  const savedTheme = localStorage.getItem('bk_portfolio_theme') || 'violet';
  applyTheme(savedTheme);

  if (themeToggleBtn && themeDropdown) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });

    themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const chosen = opt.getAttribute('data-theme-choice');
        applyTheme(chosen);
        themeDropdown.classList.remove('show');
        playSuccessSound();
      });
    });

    document.addEventListener('click', () => {
      themeDropdown.classList.remove('show');
    });
  }

  // ---------------- 3. 3D Card Tilt & Flashlight Spotlight ----------------
  const tiltCards = document.querySelectorAll('.holo-card, .project-card, .cert-card, .hero-satellite-pill');

  tiltCards.forEach(card => {
    // Add spotlight overlay if not already present
    if (!card.querySelector('.card-spotlight')) {
      const spot = document.createElement('div');
      spot.className = 'card-spotlight';
      card.appendChild(spot);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---------------- 4. Dynamic Typewriter ----------------
  const typewriterElement = document.getElementById('typewriter-text');
  const words = [
    'Full Stack AI Developer',
    'Cinematic Code Sculptor',
    'Backend Architect (Node.js & Python)',
    'Data Science & ML Trainee',
    'Builder of Tomorrow, Creator of Impact'
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 80;
  const deleteSpeed = 40;
  const waitDuration = 2000;

  function typeEffect() {
    if (!typewriterElement) return;

    const currentWord = words[wordIndex];

    if (isDeleting) {
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      setTimeout(() => { isDeleting = true; typeEffect(); }, waitDuration);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeEffect, 400);
    } else {
      setTimeout(typeEffect, isDeleting ? deleteSpeed : typeSpeed);
    }
  }
  typeEffect();

  // ---------------- 5. Mobile Navbar Drawer & ScrollSpy ----------------
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbar = document.getElementById('navbar');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = navToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateScrollSpy();
  });

  const sections = document.querySelectorAll('section[id]');
  function updateScrollSpy() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetNavLink = document.querySelector(`.nav-menu a[href*='${sectionId}']`);

      if (targetNavLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetNavLink.classList.add('active');
        } else {
          targetNavLink.classList.remove('active');
        }
      }
    });
  }

  // ---------------- 6. Skills Filtering ----------------
  const skillFilters = document.querySelectorAll('[data-skill-filter]');
  const skillCards = document.querySelectorAll('.skill-card');

  skillFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      skillFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-skill-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---------------- 7. Project Filtering ----------------
  const projectFilters = document.querySelectorAll('[data-project-filter]');
  const projectCards = document.querySelectorAll('.project-card');

  projectFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      projectFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-project-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---------------- 8. Curated Certificate Vault (12 Items) Filtering ----------------
  const certFilters = document.querySelectorAll('[data-cert-filter]');
  const certCards = document.querySelectorAll('.cert-card');

  certFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      certFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-cert-filter');

      certCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---------------- 9. Terminal 3.0 & API Sandbox ----------------
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const apiButtons = document.querySelectorAll('.api-shortcut-btn');

  const apiResponses = {
    '/api/profile': {
      status: 200,
      engineer: "Bharat Kumar",
      title: "Cinematic Code Sculptor & Full Stack AI Developer",
      college: "Arya College of Engineering & IT, Jaipur (RTU Kota)",
      cgpa: 8.57,
      graduation: 2027,
      openForRoles: true,
      mantra: "Code. Learn. Build. Repeat."
    },
    '/api/skills': {
      status: 200,
      languages: ["Python", "Java", "JavaScript (ES6+)", "SQL", "HTML5/CSS3"],
      backend: ["Node.js", "Express.js", "MongoDB", "Redis", "Flask", "JWT Auth"],
      cloudAndTools: ["Microsoft Azure", "Git", "GitHub", "Unity Engine", "VS Code"],
      coreCS: ["Data Structures & Algorithms", "DBMS", "System Design", "OOP"]
    },
    '/api/projects': {
      status: 200,
      count: 5,
      featured: [
        { name: "Smart Inventory Management", stack: "Node.js, Express, MongoDB, Redis, JWT" },
        { name: "ShopWave E-Commerce", stack: "Python, Flask, SQLite, JS" },
        { name: "Quantum Dynamics AI Stock Analytics", stack: "Python, Pandas, NumPy, Visuals" },
        { name: "Smart Attendance System", stack: "Java, Relational Database" }
      ]
    },
    '/api/hire': {
      status: 201,
      message: "Ready to collaborate! Redirecting to email dispatch...",
      email: "bharatkumar70233@gmail.com",
      phone: "+91 7023318654"
    }
  };

  function formatJSON(obj) {
    const jsonStr = JSON.stringify(obj, null, 2);
    return jsonStr
      .replace(/"([^"]+)":/g, '<span style="color:var(--accent-primary)">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span style="color:var(--accent-secondary)">"$1"</span>')
      .replace(/: (true|false|\d+(\.\d+)?)/g, ': <span style="color:#10b981">$1</span>');
  }

  function handleCommand(rawInput) {
    const cmd = rawInput.trim();
    if (!cmd) return;

    const commandLine = document.createElement('div');
    commandLine.innerHTML = `<span style="color:var(--accent-primary)">visitor@bharat-dev:~$</span> ${escapeHtml(cmd)}`;
    terminalOutput.appendChild(commandLine);

    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    const responseDiv = document.createElement('div');
    responseDiv.style.margin = '0.35rem 0 1rem 0';

    if (lower.startsWith('get /api/profile') || lower === 'bio') {
      responseDiv.innerHTML = `<pre style="font-family:var(--font-code); line-height:1.45;">${formatJSON(apiResponses['/api/profile'])}</pre>`;
    } else if (lower.startsWith('get /api/skills') || lower === 'skills') {
      responseDiv.innerHTML = `<pre style="font-family:var(--font-code); line-height:1.45;">${formatJSON(apiResponses['/api/skills'])}</pre>`;
    } else if (lower.startsWith('get /api/projects') || lower === 'projects') {
      responseDiv.innerHTML = `<pre style="font-family:var(--font-code); line-height:1.45;">${formatJSON(apiResponses['/api/projects'])}</pre>`;
    } else if (lower.startsWith('post /api/hire') || lower === 'hire') {
      responseDiv.innerHTML = `<pre style="font-family:var(--font-code); line-height:1.45;">${formatJSON(apiResponses['/api/hire'])}</pre>`;
      setTimeout(() => {
        window.location.href = 'mailto:bharatkumar70233@gmail.com?subject=Job%20Opportunity%20for%20Bharat%20Kumar';
      }, 1200);
    } else if (lower === 'help') {
      responseDiv.innerHTML = `<span style="color:var(--accent-primary); font-weight:bold;">Available Sandbox Commands:</span>
  • <span style="color:var(--accent-secondary)">GET /api/profile</span>   : Profile payload &amp; background
  • <span style="color:var(--accent-secondary)">GET /api/skills</span>    : Technical proficiencies matrix
  • <span style="color:var(--accent-secondary)">GET /api/projects</span>  : Production projects index
  • <span style="color:var(--accent-secondary)">POST /api/hire</span>     : Direct hiring inquiry
  • <span style="color:var(--accent-secondary)">help</span>               : Show this command menu
  • <span style="color:var(--accent-secondary)">clear</span>              : Clear terminal screen`;
    } else {
      responseDiv.innerHTML = `command not found: <span style="color:#ef4444">${escapeHtml(cmd)}</span>. Try <span style="color:var(--accent-primary)">'help'</span> or click the quick API buttons above.`;
    }

    terminalOutput.appendChild(responseDiv);
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        handleCommand(val);
      }
    });
  }

  apiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const endpoint = btn.getAttribute('data-endpoint');
      if (endpoint) {
        handleCommand(endpoint);
      }
    });
  });

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------------- 10. Certificate Lightbox Modal ----------------
  const modalBackdrop = document.getElementById('cert-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaptionTitle = document.getElementById('modal-caption-title');
  const modalCaptionIssuer = document.getElementById('modal-caption-issuer');
  const modalClose = document.getElementById('modal-close');

  function openCertificateModal(src, title, issuer) {
    if (!modalBackdrop || !modalImg) return;
    modalImg.src = src;
    if (modalCaptionTitle) modalCaptionTitle.textContent = title || 'Verified Credential';
    if (modalCaptionIssuer) modalCaptionIssuer.textContent = issuer || 'Verified Credential Issuer';
    modalBackdrop.classList.add('open');
    playSuccessSound();
  }

  if (modalBackdrop && modalImg && modalClose) {
    // 1. Regular cert cards
    certCards.forEach(card => {
      card.addEventListener('click', () => {
        const fullSrc = card.getAttribute('data-img');
        const title = card.querySelector('.cert-title')?.textContent || 'Certificate';
        const issuer = card.querySelector('.cert-issuer')?.textContent || '';
        openCertificateModal(fullSrc, title, issuer);
      });
    });

    // 2. VIP Internship spotlight cards
    const internshipCards = document.querySelectorAll('.internship-card');
    internshipCards.forEach(card => {
      card.addEventListener('click', () => {
        const fullSrc = card.getAttribute('data-img');
        const title = card.getAttribute('data-title') || card.querySelector('.cert-title')?.textContent || 'Internship Credential';
        const issuer = card.getAttribute('data-issuer') || card.querySelector('.cert-issuer')?.textContent || '';
        openCertificateModal(fullSrc, title, issuer);
      });
    });

    // 3. Career Experience timeline direct trigger buttons
    const certTriggerBtns = document.querySelectorAll('.cert-trigger-btn');
    certTriggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = btn.getAttribute('data-cert-src');
        const title = btn.getAttribute('data-cert-title');
        const issuer = btn.getAttribute('data-cert-issuer');
        openCertificateModal(src, title, issuer);
      });
    });

    const closeModal = () => modalBackdrop.classList.remove('open');
    modalClose.addEventListener('click', closeModal);

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // ---------------- 11. Toast & Copy to Clipboard ----------------
  const toast = document.getElementById('toast-notice');
  const toastMsg = document.getElementById('toast-message');

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    playSuccessSound();
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('bharatkumar70233@gmail.com').then(() => {
        showToast('✓ Email address copied to clipboard!');
      });
    });
  }

  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('+917023318654').then(() => {
        showToast('✓ Phone number copied to clipboard!');
      });
    });
  }

  // ---------------- 12. Contact Form Submission ----------------
  const contactForm = document.getElementById('portfolio-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name')?.value || '';
      const email = document.getElementById('form-email')?.value || '';
      const subject = document.getElementById('form-subject')?.value || 'Message from Portfolio';
      const message = document.getElementById('form-message')?.value || '';

      if (!name || !email || !message) {
        showToast('⚠ Please complete all required fields.');
        return;
      }

      const mailtoUrl = `mailto:bharatkumar70233@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;
      window.location.href = mailtoUrl;

      showToast('✓ Opening email client to send message to Bharat!');
      contactForm.reset();
    });
  }

  // ---------------- 13. Scroll To Top ----------------
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------------- 14. Animated Stats Counter ----------------
  const counters = document.querySelectorAll('.stat-counter');
  let hasCounted = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const isDecimal = counter.getAttribute('data-decimal');
      const duration = 1400;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const currentVal = ease * target;

        if (isDecimal) {
          counter.textContent = currentVal.toFixed(2);
        } else {
          counter.textContent = Math.floor(currentVal);
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = isDecimal ? target.toFixed(2) : target;
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
          hasCounted = true;
          runCounters();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsStrip);
  } else {
    runCounters();
  }
});
