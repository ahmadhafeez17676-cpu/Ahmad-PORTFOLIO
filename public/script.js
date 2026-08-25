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

/* ---- CONTACT FORM ---- */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    const data = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        projectType: document.getElementById('projectType').value,
        budget: document.getElementById('budget').value,
        message: document.getElementById('message').value.trim()
    };

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (json.success) {
            showToast('success', '✅ ' + json.message);
            contactForm.reset();
        } else {
            showToast('error', '❌ ' + (json.message || 'Something went wrong.'));
        }
    } catch (err) {
        showToast('error', '❌ Server not reachable. Please try again later.');
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
