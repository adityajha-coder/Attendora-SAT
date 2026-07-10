export const landingHtml = `
    <div id="landing-page">
        <header class="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
            <div class="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" class="flex items-center gap-3">
                    <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs><linearGradient id="logoGradientHeader" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="var(--primary-color-start)"/><stop offset="100%" stop-color="var(--primary-color-end)"/></linearGradient></defs>
                        <circle cx="12" cy="12" r="10" stroke="url(#logoGradientHeader)" stroke-width="2"/>
                        <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="text-3xl font-bold tracking-widest text-white hero-glow font-brand">ATTENDORA</span>
                </a>
                <div class="hidden md:flex items-center gap-4">
                    <button id="go-to-login-btn" class="bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">Sign In</button>
                </div>
            </div>
        </header>

        <main>
            <section id="home" class="min-h-screen flex items-center justify-center text-center overflow-hidden relative pt-20">
                <div class="container mx-auto px-6 z-10">
                    <h1 class="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 hero-glow leading-tight font-brand">Smart Attendance Tracking</h1>
                    <p class="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">Stay on top of your classes with predictive insights, goal tracking, and motivational achievements.</p>
                    <button id="go-to-login-landing-btn" class="btn-primary text-white font-bold py-4 px-10 rounded-full text-lg">Sign In to Get Started</button>
                </div>
                <div class="absolute bottom-[-150px] md:bottom-[-250px] right-[-150px] md:right-[-250px] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gradient-to-tl from-blue-500/20 to-purple-600/20 rounded-full blur-3xl opacity-60"></div>
                <div class="absolute top-[-100px] left-[-150px] w-[300px] h-[300px] bg-gradient-to-br from-indigo-500/20 to-sky-500/20 rounded-full blur-3xl opacity-50"></div>
            </section>
        </main>
    </div>
`;
