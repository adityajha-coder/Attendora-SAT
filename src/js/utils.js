export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

export function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function initVisuals() {
    const canvas = document.getElementById('shooting-stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let stars = [], shootingStars = [];
    
    function initStars() { stars = []; for (let i = 0; i < 100; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 1.5, alpha: Math.random(), dAlpha: 0.01 + Math.random() * 0.01 }); }
    function drawStars() { stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`; ctx.fill(); s.alpha += s.dAlpha; if (s.alpha > 1 || s.alpha < 0) s.dAlpha *= -1; }); }
    function createShootingStar() { if (Math.random() < 0.02) { shootingStars.push({ x: Math.random() * canvas.width, y: Math.random() > 0.5 ? 0 : Math.random() * canvas.height, len: Math.random() * 80 + 10, speed: Math.random() * 10 + 5, size: Math.random() * 1 + 0.5, angle: Math.PI / 4 + (Math.random() * Math.PI / 4) }); } }
    function drawShootingStars() { shootingStars.forEach((s, i) => { ctx.beginPath(); const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.len * Math.cos(s.angle), s.y - s.len * Math.sin(s.angle)); grad.addColorStop(0, `rgba(255, 255, 255, ${s.size / 2})`); grad.addColorStop(1, 'rgba(255, 255, 255, 0)'); ctx.strokeStyle = grad; ctx.lineWidth = s.size; ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.len * Math.cos(s.angle), s.y - s.len * Math.sin(s.angle)); ctx.stroke(); s.x += s.speed * Math.cos(s.angle); s.y += s.speed * Math.sin(s.angle); if (s.x > canvas.width + s.len || s.y > canvas.height + s.len) shootingStars.splice(i, 1); }); }
    
    let animationFrameId;
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); drawStars(); createShootingStar(); drawShootingStars(); animationFrameId = requestAnimationFrame(animate); }
    function stopAnimate() { cancelAnimationFrame(animationFrameId); }
    
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initStars(); });
    
    return { initStars, animate, stopAnimate };
}