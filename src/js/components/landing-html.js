export const landingHtml = `
    <div id="landing-page">
        <header class="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
            <div class="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" class="flex items-center gap-3">
                    <img src="assets/images/fevicon.png" alt="Attendora Logo" class="w-10 h-10 rounded-full border border-white/20">
                    <span class="text-2xl font-bold tracking-wide text-white font-brand">ATTENDORA</span>
                </a>
                <div class="hidden md:flex items-center gap-4">
                    <button id="go-to-login-btn" class="bg-white/5 text-white font-semibold py-2.5 px-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">Sign In</button>
                </div>
            </div>
        </header>

        <main>
            <section id="home" class="min-h-screen flex items-center justify-center text-center overflow-hidden relative pt-20">
                <div class="container mx-auto px-6 z-10">
                    <h1 class="text-4xl sm:text-5xl md:text-7xl font-brand font-black text-white mb-4 leading-tight tracking-tight drop-shadow-xl">Smart Attendance Tracking</h1>
                    <p class="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">Stay on top of your classes with predictive insights, goal tracking, and motivational achievements.</p>
                    <button id="go-to-login-landing-btn" class="btn-primary text-white font-bold py-4 px-10 rounded-xl text-lg hover:scale-105 active:scale-95 transition-all">Sign In to Get Started</button>
                </div>
            </section>
        </main>
    </div>
`;
