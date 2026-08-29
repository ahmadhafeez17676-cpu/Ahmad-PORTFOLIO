/* ============================================================
   AHMAD HAFEEZ — Portfolio Script
   ============================================================ */

/* ---- NAVBAR ---- */
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');
const allNavLinks = document.querySelectorAll('.nav-link');

// Scrolled class
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActiveLink();
});

// Mobile toggle
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

// Close on link click (mobile)
allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// Active link on scroll
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    allNavLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
}

/* ---- PARTICLES ---- */
(function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            left: ${Math.random() * 100}%;
            top:  ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 6}s;
            animation-duration: ${3 + Math.random() * 4}s;
            opacity: ${Math.random() * 0.5};
            width:  ${1 + Math.random() * 2}px;
            height: ${1 + Math.random() * 2}px;
        `;
        container.appendChild(p);
    }
})();

/* ---- SCROLL REVEAL ---- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Trigger bar fills & counters when revealed
            triggerBars(entry.target);
            triggerCounters(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- SKILL BARS ---- */
function triggerBars(parent) {
    // Check if parent itself or within a revealed section
    const bars = parent.querySelectorAll ? parent.querySelectorAll('.bar-fill') : [];
    bars.forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
    });
    // Also check document-wide when skills section reveals
    if (parent.classList.contains('visible') || parent.closest) {
        document.querySelectorAll('.bar-fill').forEach(bar => {
            if (isInViewport(bar)) bar.style.width = bar.dataset.width + '%';
        });
    }
}

function isInViewport(el) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
}

// Also trigger bars on scroll for safety
window.addEventListener('scroll', () => {
    document.querySelectorAll('.bar-fill').forEach(bar => {
        if (isInViewport(bar) && bar.style.width === '0px' || bar.style.width === '') {
            bar.style.width = bar.dataset.width + '%';
        }
    });
});

/* ---- COUNTERS ---- */
function triggerCounters(parent) {
    const counters = parent.querySelectorAll ? parent.querySelectorAll('.counter') : [];
    counters.forEach(animateCounter);
}

function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = true;
    const target = +el.dataset.target;
    const duration = 1500;
    const start = performance.now();
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

// Also trigger counters from page-wide observer
document.querySelectorAll('.counter').forEach(el => {
    const counterObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { animateCounter(el); counterObs.disconnect(); }
    }, { threshold: 0.5 });
    counterObs.observe(el);
});

/* ---- CONTACT FORM (Web3Forms) ---- */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    const formData = {
        access_key: document.querySelector('[name="access_key"]').value,
        subject: '📩 New Portfolio Contact — Ahmad Hafeez',
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        project_type: document.getElementById('projectType').value || 'Not specified',
        budget: document.getElementById('budget').value || 'Not specified',
        message: document.getElementById('message').value.trim()
    };

    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(formData)
        });
        const json = await res.json();

        if (json.success) {
            showToast('success', '✅ Message sent! I will get back to you soon. 🚀');
            contactForm.reset();
        } else {
            showToast('error', '❌ ' + (json.message || 'Something went wrong.'));
        }
    } catch (err) {
        showToast('error', '❌ Network error. Please email: ahmadhafeez17676@gmail.com');
    } finally {
        btnText.style.display = 'inline-flex';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
});

/* ---- TOAST ---- */
function showToast(type, msg) {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type} show`;
    toast.querySelector('.toast-msg').textContent = msg;
    setTimeout(() => toast.classList.remove('show'), 4500);
}

/* ---- SMOOTH SCROLL for inline <a href="#..."> ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    });
});

/* ---- INITIAL TRIGGER on load ---- */
window.addEventListener('load', () => {
    // Make hero items visible immediately
    document.querySelectorAll('.hero .reveal').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 200);
    });
});

/* ============================================================
   ADVANCED EFFECTS (Cursor & 3D Tilt)
   ============================================================ */

/* ---- CUSTOM CURSOR GLOW ---- */
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ---- CURSOR TAIL ANIMATION ----
const cursorTail = document.getElementById('cursorTail');
let tailX = mouseX;
let tailY = mouseY;

function animateTail() {
    // slower lerp for a trailing effect
    tailX += (mouseX - tailX) * 0.05;
    tailY += (mouseY - tailY) * 0.05;
    if (cursorTail) {
        cursorTail.style.transform = `translate(${tailX}px, ${tailY}px)`;
    }
    requestAnimationFrame(animateTail);
}
animateTail();

function animateGlow() {
    // Smooth trailing effect
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    if (cursorGlow) {
        cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
    }
    requestAnimationFrame(animateGlow);
}
animateGlow();

/* ---- 3D TILT EFFECT FOR PROJECT CARDS ---- */
const projectTiltCards = document.querySelectorAll('.project-card');
projectTiltCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
    });
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        setTimeout(() => { card.style.transform = ''; card.style.transition = ''; }, 400);
    });
});

/* ---- 3D PUSH-PULL EFFECT FOR SKILL CHIPS ---- */
const chipCards = document.querySelectorAll('.chip-card');
chipCards.forEach(chip => {
    const icon = chip.querySelector('i');
    const label = chip.querySelector('span');

    chip.addEventListener('mouseenter', () => {
        chip.style.transition = 'none';
    });

    chip.addEventListener('mousemove', (e) => {
        const rect = chip.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        // Gentle tilt — max 18 degrees for small cards
        const rotX = ((y - cy) / cy) * -18;
        const rotY = ((x - cx) / cx) * 18;

        // Scale up slightly (pop-out 3D effect)
        chip.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.08, 1.08, 1.08)`;
        chip.style.zIndex = '10';

        // The icon floats outward based on mouse position
        if (icon) {
            const floatX = ((x - cx) / cx) * 5;
            const floatY = ((y - cy) / cy) * 5;
            icon.style.transform = `translate(${floatX}px, ${floatY}px) scale(1.25)`;
            icon.style.transition = 'transform 0.1s ease-out';
        }
        if (label) {
            label.style.textShadow = '0 0 10px rgba(0,212,255,0.5)';
        }
    });

    chip.addEventListener('mouseleave', () => {
        chip.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease';
        chip.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        chip.style.zIndex = '';

        if (icon) {
            icon.style.transform = '';
            icon.style.transition = 'transform 0.4s ease';
        }
        if (label) {
            label.style.textShadow = '';
        }

        setTimeout(() => { chip.style.transform = ''; chip.style.transition = ''; }, 500);
    });
});

/* ---- SCROLL PROGRESS & PARALLAX ---- */
window.addEventListener('scroll', () => {
    // 1. Scroll Progress
    const scrollProgress = document.getElementById('scrollProgressBar');
    if (scrollProgress) {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progressHeight = (window.scrollY / totalHeight) * 100;
        scrollProgress.style.width = progressHeight + "%";
    }

    // 2. Parallax Effects for Project Cards
    const wrappers = document.querySelectorAll('.parallax-wrapper');
    wrappers.forEach((wrapper, index) => {
        // Find how far the element is from the vertical center of viewport
        const rect = wrapper.getBoundingClientRect();
        const elementCenterY = rect.top + (rect.height / 2);
        const viewportCenterY = window.innerHeight / 2;

        // Calculate offset (difference between element center and viewport center)
        const diff = elementCenterY - viewportCenterY;

        // Apply varying speeds based on index (middle card moves slightly differently)
        const speedMultiplier = index % 2 === 1 ? -0.12 : -0.06;

        // Apply transform
        wrapper.style.transform = `translateY(${diff * speedMultiplier}px)`;
        wrapper.style.transition = 'transform 0.1s ease-out';
    });
});

/* ---- TYPEWRITER EFFECT ---- */
const typeTextSpan = document.getElementById('typeText');
if (typeTextSpan) {
    const textArray = ["Full-Stack", "Web", "Scalable", "Modern MERN"];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentText = textArray[textIndex];

        if (isDeleting) {
            typeTextSpan.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typeTextSpan.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 150;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }

    setTimeout(typeWriter, 1000);
}

/* ---- CURSOR MAGNETIC HOVER ---- */
const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursorGlow && cursorGlow.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorGlow && cursorGlow.classList.remove('hovered'));
});

/* PROJECTS OVERLAY JS */
const showBtn = document.getElementById('showProjectsBtn');
const overlay = document.getElementById('projectsOverlay');
const closeBtn = document.getElementById('closeProjectsBtn');
if (showBtn && overlay && closeBtn) {
    showBtn.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.add('visible');
    });
    closeBtn.addEventListener('click', () => overlay.classList.remove('visible'));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('visible');
    });
}

/* ---- MAGNETIC BUTTONS ---- */
const magneticElems = document.querySelectorAll('.btn-primary, .btn-outline, .social-btn, .nav-logo');
magneticElems.forEach(elem => {
    elem.addEventListener('mousemove', (e) => {
        const rect = elem.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        elem.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        elem.style.transition = 'transform 0.1s ease-out';
    });
    elem.addEventListener('mouseleave', () => {
        elem.style.transform = `translate(0px, 0px)`;
        elem.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        setTimeout(() => {
            elem.style.transform = '';
            elem.style.transition = '';
        }, 400);
    });
});

/* ---- BACKGROUND ORBS MOUSE PARALLAX ---- */
const bgOrbs = document.querySelector('.global-bg');
document.addEventListener('mousemove', (e) => {
    if (bgOrbs) {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        bgOrbs.style.transform = `translate(${-x}px, ${-y}px)`;
        bgOrbs.style.transition = 'transform 0.1s ease-out';
    }
});
