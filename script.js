document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") return;

    let audioCtx; 
    let audioInitialized = false;

    function initAudio() {
        if (!audioInitialized) { 
            audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
            audioInitialized = true; 
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    function playTicSound() {
        if (!audioInitialized || !audioCtx || !isAnimEnabled) return;
        const osc = audioCtx.createOscillator(); 
        const gain = audioCtx.createGain();
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime); 
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);
        osc.connect(gain); 
        gain.connect(audioCtx.destination);
        osc.start(); 
        osc.stop(audioCtx.currentTime + 0.02);
    }

    const preloader = document.getElementById('preloader');
    const loaderText = document.getElementById('loader-text');
    const loaderPercent = document.getElementById('loader-percentage');
    const loaderStatus = document.getElementById('loaderStatus');
    
    let isSiteLoaded = false;
    let currentLetters = ["A", "X", "O"];
    let letterIndex = 0;

    let fakeProgress = { value: 0 };
    const progressTween = gsap.to(fakeProgress, {
        value: 99, duration: 4, ease: "power1.out",
        onUpdate: () => { loaderPercent.innerText = `${Math.floor(fakeProgress.value)}%`; }
    });

    window.addEventListener('load', () => {
        isSiteLoaded = true;
        progressTween.kill();
        gsap.to(fakeProgress, {
            value: 100, duration: 0.4, ease: "power2.out",
            onUpdate: () => { loaderPercent.innerText = `100%`; },
            onComplete: () => {
                gsap.to(loaderStatus, { opacity: 0, y: 10, duration: 0.3, delay: 0.2 });
            }
        });
    });

    function runLoaderLoop() {
        if (isSiteLoaded && letterIndex === 0) {
            triggerFinalSignature();
            return;
        }

        loaderText.innerText = currentLetters[letterIndex];

        const tl = gsap.timeline({
            onComplete: () => {
                letterIndex = (letterIndex + 1) % currentLetters.length;
                runLoaderLoop();
            }
        });

        tl.to(loaderText, { opacity: 1, scale: 1.1, duration: 0.4, ease: "power2.out" })
          .to(loaderText, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in", delay: 0.3, onStart: playTicSound });
    }

    gsap.set(loaderText, { opacity: 0 });
    runLoaderLoop();

    function triggerFinalSignature() {
        const finalTl = gsap.timeline({
            onComplete: () => {
                gsap.to(preloader, { 
                    opacity: 0, duration: 0.8, ease: "power2.inOut",
                    onComplete: () => { preloader.remove(); animatePage(0); } 
                });
            }
        });

        finalTl.set(loaderText, { innerText: "AXO", scale: 0.9, letterSpacing: "2px" })
               .to(loaderText, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", onStart: playTicSound })
               .to(loaderText, { letterSpacing: "14px", duration: 0.7, ease: "power2.inOut" })
               .to(loaderText, { opacity: 0, scale: 1.3, duration: 0.5, ease: "power2.in", delay: 0.5 });
    }

    const settingsContainer = document.getElementById('settingsContainer');
    const settingsToggle = document.getElementById('settingsToggle');
    let isBlurEnabled = true; 
    let isCanvasEnabled = true; 
    let isAnimEnabled = true;

    settingsToggle.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        settingsContainer.classList.toggle('open'); 
    });
    document.addEventListener('click', () => settingsContainer.classList.remove('open'));
    settingsContainer.querySelector('.settings-menu').addEventListener('click', (e) => e.stopPropagation());

    document.getElementById('toggleTheme').addEventListener('change', (e) => {
        if (e.target.checked) document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
    });
    
    document.getElementById('toggleBlur').addEventListener('change', (e) => { isBlurEnabled = e.target.checked; });
    document.getElementById('toggleCanvas').addEventListener('change', (e) => { isCanvasEnabled = e.target.checked; });
    document.getElementById('toggleAnim').addEventListener('change', (e) => { 
        isAnimEnabled = e.target.checked;
        if(!isAnimEnabled) { 
            gsap.killTweensOf("*"); 
            gsap.set(".page1-anim, .page2-anim, .page3-anim, .char", { opacity: 1, y: 0 }); 
        } else { 
            animatePage(currentSection); 
        }
    });

    
    const translations = {
        fr: {
            heroSubtitle: "Hello I'm Ilhan.",
            heroTitle: "Moi et la Techno.",
            heroDesc: "Aujourd'hui, j'oriente cette curiosité vers la cybersécurité pour apprendre à protéger les systèmes et relever des défis techniques.",
            projectsSubtitle: "Mon Histoire",
            projectsTitle: "Mon Parcours",
            proj1Title: "01. connaissances",
            proj1H3: "01. Mes connaissances",
            proj1Text: "Bases solides en développement, exploration créative du code et passion pour le fonctionnement interne des systèmes.",
            proj2Title: "02. Projets Majeurs",
            proj2H3: "02. Expériences",
            proj2Text: "J'apprends en faisant. Que ce soit en créant une console portable, en testant des protocoles sans fil ou en concevant ce site, chaque projet me permet de comprendre concrètement comment les systèmes fonctionnent.",
            proj3Title: "03. Objectifs & Avenir",
            proj3H3: "03. Vision d'Avenir",
            proj3Text: "actuellement en 1sti2d, mon objectif est de poursuivre un Bac+3 spécialisé pour consolider mes bases techniques. Par la suite, je vise une spécialisation au sein des unités de cyberdéfense pour acquérir une expérience opérationnelle de haut niveau. Mon ambition est de maîtriser les enjeux de sécurité critique, que ce soit pour servir dans les forces ou pour protéger les infrastructures du secteur privé.",
            contactSubtitle: "Réseau",
            contactTitle: "Me contacter.",
            contactDesc: "Une idée, un projet ou simplement envie d'échanger ? Mes réseaux sont ouverts.",
            settingsToggle: "⚙ Paramètres",
            labelTheme: "Thème Blanc",
            labelBlur: "Effet de flou",
            labelCanvas: "Fond particules",
            labelAnim: "Animations",
            labelLang: "English version",
            panelClose: "← Fermer",
            panelDefaultTitle: "Titre du parcours",
            panelDefaultDate: "2026 - Avenir",
            panelDefaultText: "Ici s'affichera la description complète de ton parcours, de tes compétences ou de tes objectifs à venir."
        },
        en: {
            heroSubtitle: "Hello I'm Ilhan.",
            heroTitle: "Me and Tech.",
            heroDesc: "Today, I direct this curiosity toward cybersecurity to learn how to protect systems and tackle technical challenges.",
            projectsSubtitle: "My Story",
            projectsTitle: "My Journey",
            proj1Title: "01. Knowledge",
            proj1H3: "01. My knowledge",
            proj1Text: "Solid foundations in development, creative exploration of code, and a passion for the inner workings of systems.",
            proj2Title: "02. Major Projects",
            proj2H3: "02. Experiences",
            proj2Text: "I learn by doing. Whether creating a handheld console, testing wireless protocols, or designing this website, each project helps me understand concretely how systems work.",
            proj3Title: "03. Goals & Future",
            proj3H3: "03. Future Vision",
            proj3Text: "Currently in 1STI2D, my goal is to pursue a specialized Bachelor's degree to consolidate my technical foundations. Afterwards, I aim to specialize within cyberdefense units to acquire high-level operational experience. My ambition is to master critical security challenges, whether serving in the forces or protecting private sector infrastructures.",
            contactSubtitle: "Network",
            contactTitle: "Contact me.",
            contactDesc: "An idea, a project, or just want to chat? My channels are open.",
            settingsToggle: "⚙ Settings",
            labelTheme: "Light Theme",
            labelBlur: "Blur Effect",
            labelCanvas: "Particles Bg",
            labelAnim: "Animations",
            labelLang: "English version",
            panelClose: "← Close",
            panelDefaultTitle: "Journey Title",
            panelDefaultDate: "2026 - Future",
            panelDefaultText: "Your complete journey description, skills, or upcoming goals will be displayed here."
        }
    };

    document.getElementById('toggleLang').addEventListener('change', (e) => {
        const lang = e.target.checked ? 'en' : 'fr';
        
      
        document.getElementById('hero-subtitle').innerText = translations[lang].heroSubtitle;
        document.getElementById('hero-desc').innerText = translations[lang].heroDesc;
        document.getElementById('projects-subtitle').innerText = translations[lang].projectsSubtitle;
        document.getElementById('contact-subtitle').innerText = translations[lang].contactSubtitle;
        document.getElementById('contact-desc').innerText = translations[lang].contactDesc;
        document.getElementById('settingsToggle').innerText = translations[lang].settingsToggle;
        document.getElementById('labelTheme').innerText = translations[lang].labelTheme;
        document.getElementById('labelBlur').innerText = translations[lang].labelBlur;
        document.getElementById('labelCanvas').innerText = translations[lang].labelCanvas;
        document.getElementById('labelAnim').innerText = translations[lang].labelAnim;
        document.getElementById('labelLang').innerText = translations[lang].labelLang;
        document.getElementById('panelClose').innerText = translations[lang].panelClose;

        
        const p1 = document.getElementById('proj-1');
        p1.setAttribute('data-title', translations[lang].proj1Title);
        p1.setAttribute('data-text', translations[lang].proj1Text);
        p1.setAttribute('data-date', lang === 'fr' ? 'Bases' : 'Foundations');
        document.getElementById('proj-1-h3').innerText = translations[lang].proj1H3;

        const p2 = document.getElementById('proj-2');
        p2.setAttribute('data-title', translations[lang].proj2Title);
        p2.setAttribute('data-text', translations[lang].proj2Text);
        p2.setAttribute('data-date', lang === 'fr' ? 'Pratique' : 'Hands-on');
        document.getElementById('proj-2-h3').innerText = translations[lang].proj2H3;

        const p3 = document.getElementById('proj-3');
        p3.setAttribute('data-title', translations[lang].proj3Title);
        p3.setAttribute('data-text', translations[lang].proj3Text);
        p3.setAttribute('data-date', lang === 'fr' ? '2026 - Avenir' : '2026 - Future');
        document.getElementById('proj-3-h3').innerText = translations[lang].proj3H3;

       
        if(panel.classList.contains('open') && activeProjectItem) {
            document.getElementById('panelTitle').innerText = activeProjectItem.getAttribute('data-title');
            document.getElementById('panelDate').innerText = activeProjectItem.getAttribute('data-date');
            document.getElementById('panelText').innerText = activeProjectItem.getAttribute('data-text');
        } else if(!panel.classList.contains('open')) {
            document.getElementById('panelTitle').innerText = translations[lang].panelDefaultTitle;
            document.getElementById('panelDate').innerText = translations[lang].panelDefaultDate;
            document.getElementById('panelText').innerText = translations[lang].panelDefaultText;
        }

        
        const heroTitle = document.getElementById('hero-title');
        heroTitle.innerText = translations[lang].heroTitle;
        setupSplitText('hero-title');

        const projectsTitle = document.getElementById('projects-title');
        projectsTitle.innerText = translations[lang].projectsTitle;
        setupSplitText('projects-title');

        const contactTitle = document.getElementById('contact-title');
        contactTitle.innerText = translations[lang].contactTitle;
        setupSplitText('contact-title');

       
        gsap.set(".char", { opacity: 1, y: 0 });
    });

    function setupSplitText(id) {
        const element = document.getElementById(id); 
        if (!element) return;
        let text = element.innerText; 
        element.innerHTML = "";
        for (let char of text) { 
            element.innerHTML += char === " " ? "&nbsp;" : `<span class='char'>${char}</span>`; 
        }
    }
    setupSplitText('hero-title'); 
    setupSplitText('projects-title'); 
    setupSplitText('contact-title');

    let currentSection = 0; 
    const totalSections = 3; 
    let isAnimating = false;
    const container = document.getElementById('mainContainer'); 
    const dots = document.querySelectorAll('.dot');
    let scrollVelocity = 0; 
    let blendState = { pageProgress: 0 }; 

    function animatePage(index) {
        isAnimating = true;
        if (isBlurEnabled) container.classList.add('transitioning');
        const animDuration = isAnimEnabled ? 1.2 : 0;
        scrollVelocity = index > currentSection ? 65 : -65;

        gsap.to(container, { 
            y: `-${index * 100}%`, duration: animDuration, ease: "power4.inOut", 
            onComplete: () => { 
                container.classList.remove('transitioning'); 
                setTimeout(() => { isAnimating = false; }, 100); 
            } 
        });

        gsap.to(blendState, { pageProgress: index, duration: animDuration + 0.3, ease: "power2.out" });
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

        if (!isAnimEnabled) { 
            gsap.set(".page1-anim, .page2-anim, .page3-anim, .char", { opacity: 1, y: 0 }); 
            return; 
        }

        if (index === 0) {
            gsap.to(".page1-anim", { opacity: 1, y: 0, stagger: 0.12, duration: 0.8 });
            gsap.to("#hero-title .char", { opacity: 1, y: 0, stagger: 0.015, duration: 0.6, delay: 0.05 });
        } else if (index === 1) {
            gsap.to(".page2-anim", { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 });
            gsap.to("#projects-title .char", { opacity: 1, y: 0, stagger: 0.015, duration: 0.6, delay: 0.05 });
        } else if (index === 2) {
            gsap.to(".page3-anim", { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 });
            gsap.to("#contact-title .char", { opacity: 1, y: 0, stagger: 0.015, duration: 0.6, delay: 0.05 });
        }
    }

   
    window.addEventListener('wheel', (e) => {
        scrollVelocity += e.deltaY * 0.12;
        if (isAnimating || document.getElementById('preloader')) return; 
        if (e.deltaY > 35 && currentSection < totalSections - 1) { 
            document.getElementById('detailsPanel').classList.remove('open'); 
            currentSection++; 
            animatePage(currentSection); 
        } else if (e.deltaY < -35 && currentSection > 0) { 
            document.getElementById('detailsPanel').classList.remove('open'); 
            currentSection--; 
            animatePage(currentSection); 
        }
    });

    
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        if (isAnimating || document.getElementById('preloader')) return;
        const swipeDistance = touchStartY - touchEndY;
        const threshold = 45; // Sensibilité du glissement de doigt en pixels

        if (swipeDistance > threshold && currentSection < totalSections - 1) {
            document.getElementById('detailsPanel').classList.remove('open');
            currentSection++;
            animatePage(currentSection);
        } else if (swipeDistance < -threshold && currentSection > 0) {
            document.getElementById('detailsPanel').classList.remove('open');
            currentSection--;
            animatePage(currentSection);
        }
    }

    const cursor = document.getElementById('cursor');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2; 
    let cursorX = mouseX, cursorY = mouseY;
    
    window.addEventListener('mousemove', (e) => { 
        mouseX = e.clientX; 
        mouseY = e.clientY; 
    });

    function updateCursor() {
        let targetX = mouseX, targetY = mouseY;
        if (activeMagnetic) {
            const rect = activeMagnetic.getBoundingClientRect();
            targetX = (rect.left + rect.width / 2) + (mouseX - (rect.left + rect.width / 2)) * 0.25;
            targetY = (rect.top + rect.height / 2) + (mouseY - (rect.top + rect.height / 2)) * 0.25;
        }
        cursorX += (targetX - cursorX) * 0.15; 
        cursorY += (targetY - cursorY) * 0.15;
        cursor.style.left = `${cursorX}px`; 
        cursor.style.top = `${cursorY}px`;
        requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    let activeMagnetic = null;
    document.querySelectorAll('.magnetic-target').forEach(el => {
        el.addEventListener('mouseenter', () => { activeMagnetic = el; cursor.classList.add('hovered'); });
        el.addEventListener('mouseleave', () => { activeMagnetic = null; cursor.classList.remove('hovered'); gsap.to(el, { x: 0, y: 0, duration: 0.4 }); });
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            gsap.to(el, { x: (e.clientX - (rect.left + rect.width / 2)) * 0.35, y: (e.clientY - (rect.top + rect.height / 2)) * 0.35, duration: 0.2 });
        });
    });

    const panel = document.getElementById('detailsPanel');
    document.querySelectorAll('.project-item, .contact-links a, .settings-toggle, .settings-menu input, .magnetic-target, .close-panel-btn').forEach(item => {
        item.addEventListener('mouseenter', () => { cursor.classList.add('hovered'); playTicSound(); });
        item.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    let activeProjectItem = null;
    document.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', () => {
            activeProjectItem = item;
            document.getElementById('panelTitle').innerText = item.getAttribute('data-title');
            document.getElementById('panelDate').innerText = item.getAttribute('data-date');
            document.getElementById('panelText').innerText = item.getAttribute('data-text');
            panel.classList.add('open');
        });
    });
    
    document.getElementById('panelClose').addEventListener('click', () => panel.classList.remove('open'));

    const fpsCounter = document.getElementById('fpsCounter');
    let lastCalledTime; 
    let fps; 
    let frameCount = 0;
    
    function calculateFPS() {
        if(!lastCalledTime) { lastCalledTime = performance.now(); return; }
        let delta = (performance.now() - lastCalledTime) / 1000; 
        lastCalledTime = performance.now();
        fps = Math.round(1 / delta); 
        frameCount++;
        if (frameCount % 10 === 0) fpsCounter.innerText = fps > 60 ? 60 : fps;
    }

    const canvas = document.getElementById('experienceCanvas'); 
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function initCanvas() {
        width = window.innerWidth; 
        height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr; 
        canvas.height = height * dpr;
        canvas.style.width = width + 'px'; 
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
    }
    initCanvas();

    const particles = []; 
    let shockwave = null;
    
    for (let i = 0; i < 115; i++) {
        let vxI = (Math.random() - 0.5) * 1.4, vyI = (Math.random() - 0.5) * 1.4;
        particles.push({ 
            x: Math.random() * width, y: Math.random() * height, size: Math.random() * 1.5 + 0.6, 
            baseVx: vxI, baseVy: vyI, vx: vxI, vy: vyI,
            phase: Math.random() * Math.PI * 2, angle: Math.random() * Math.PI * 2,
            speed: 1 + Math.random() * 1.5, radius: 130 + (i * 1.1)
        });
    }

    window.addEventListener('click', (e) => {
        if(panel.classList.contains('open') || settingsContainer.contains(e.target) || document.getElementById('preloader')) return;
        shockwave = { x: e.clientX, y: e.clientY, radius: 0, maxRadius: 280, force: 35 };
    });

    function animateCanvas() {
        calculateFPS(); 
        ctx.clearRect(0, 0, width, height);
        
        scrollVelocity *= 0.90; 
        if(Math.abs(scrollVelocity) < 0.01) scrollVelocity = 0;

        if (isCanvasEnabled) {
            if (shockwave) { 
                shockwave.radius += (shockwave.maxRadius - shockwave.radius) * 0.1; 
                shockwave.force *= 0.88; 
                if (shockwave.force < 0.2) shockwave = null; 
            }
            
            const particleColor = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
            const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--line-color').trim();
            const pProg = blendState.pageProgress;

            if (pProg > 1) ctx.filter = `blur(${1.2 * (pProg - 1)}px)`; 
            else ctx.filter = 'none';

            particles.forEach((p, i) => {
                let targetVx, targetVy; 
                const v2x = Math.sin((p.y * 0.006) + p.phase) * 0.25; 
                const v2y = 2.2 + p.size * 0.4;
                
                if (pProg <= 1) { 
                    targetVx = p.baseVx + (v2x - p.baseVx) * pProg; 
                    targetVy = p.baseVy + (v2y - p.baseVy) * pProg; 
                } else { 
                    targetVx = v2x; targetVy = v2y; 
                }
                
                p.vx += (targetVx - p.vx) * 0.07; 
                p.vy += (targetVy - p.vy) * 0.07;

                if (shockwave) {
                    const sDx = p.x - shockwave.x; 
                    const sDy = p.y - shockwave.y; 
                    const sDist = Math.hypot(sDx, sDy) || 1;
                    if (sDist < shockwave.radius && sDist > shockwave.radius - 60) {
                        p.vx += (sDx / sDist) * (1 - sDist / shockwave.maxRadius) * shockwave.force * 0.4;
                        p.vy += (sDy / sDist) * (1 - sDist / shockwave.maxRadius) * shockwave.force * 0.4;
                    }
                }

                p.x += p.vx; 
                p.y += p.vy;
                
                if (p.x < -40) p.x = width + 40; 
                if (p.x > width + 40) p.x = -40;
                if (p.y < -40) p.y = height + 40; 
                if (p.y > height + 40) p.y = -40;

                let renderX = p.x; 
                let renderY = p.y;
                
                if (pProg > 1) {
                    const vortexProgress = pProg - 1; 
                    p.angle += 0.002 * p.speed;
                    const targetVortexX = (width / 2) + Math.cos(p.angle) * p.radius;
                    const targetVortexY = (height / 2) + Math.sin(p.angle) * p.radius;
                    renderX = p.x + (targetVortexX - p.x) * vortexProgress; 
                    renderY = p.y + (targetVortexY - p.y) * vortexProgress;
                }
                
                renderY += (scrollVelocity * (p.size * 1.4));

                ctx.fillStyle = particleColor; 
                ctx.beginPath();
                const currentSpeed = Math.hypot(p.vx, p.vy + scrollVelocity);
                
                if (currentSpeed > 2.8 && pProg <= 1.1) {
                    let stretch = 1 + currentSpeed * 0.12;
                    ctx.ellipse(renderX, renderY, p.size * 0.85, p.size * (stretch > 4.5 ? 4.5 : stretch), Math.atan2(p.vy + scrollVelocity, p.vx) - Math.PI/2, 0, Math.PI * 2);
                } else { 
                    ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2); 
                }
                ctx.fill();

                if (pProg < 0.9) {
                    const lineAlphaFactor = 1 - pProg;
                    for (let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j]; 
                        let p2RenderX = p2.x; 
                        let p2RenderY = p2.y + (scrollVelocity * (p2.size * 1.4));
                        const distLines = Math.hypot(renderX - p2RenderX, renderY - p2RenderY);
                        
                        if (distLines < 110) {
                            ctx.strokeStyle = `rgba(${lineColor}, ${(0.12 - distLines/110) * lineAlphaFactor})`; 
                            ctx.lineWidth = 0.5;
                            ctx.beginPath(); 
                            ctx.moveTo(renderX, renderY); 
                            ctx.lineTo(p2RenderX, p2RenderY); 
                            ctx.stroke();
                        }
                    }
                }
            });
            ctx.filter = 'none'; 
        }
        requestAnimationFrame(animateCanvas);
    }
    
    animateCanvas(); 
    window.addEventListener('resize', initCanvas);

    const emailLink = document.getElementById('email-link');
    emailLink.addEventListener('mouseover', () => { emailLink.textContent = 'axocapi@gmail.com'; });
    emailLink.addEventListener('mouseout', () => { emailLink.textContent = 'Email'; });

    const discordLink = document.getElementById('discord-link');
    discordLink.addEventListener('mouseover', () => { discordLink.textContent = 'capitain_axo'; });
    discordLink.addEventListener('mouseout', () => { discordLink.textContent = 'Discord'; });
});
});
