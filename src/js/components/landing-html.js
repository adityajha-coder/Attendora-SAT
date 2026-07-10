export const landingHtml = `
    <div id="landing-page">
        <header class="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
            <div class="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" class="flex items-center gap-3">
                    <img src="assets/images/fevicon.png" alt="Attendora Logo" class="w-10 h-10 rounded-full border-2 border-white/20 shadow-lg">
                    <span class="text-3xl font-bold tracking-widest text-white font-brand">ATTENDORA</span>
                </a>
                <div class="hidden md:flex items-center gap-4">
                    <button id="go-to-login-btn" class="bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">Sign In</button>
                </div>
            </div>
        </header>

        <main>
            <section id="home" class="min-h-screen flex items-center justify-center text-center overflow-hidden relative pt-20">
                <div class="container mx-auto px-6 z-10">
                    <h1 class="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 leading-tight font-brand">Smart Attendance Tracking</h1>
                    <p class="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">Stay on top of your classes with predictive insights, goal tracking, and motivational achievements.</p>
                    <button id="go-to-login-landing-btn" class="btn-primary text-white font-bold py-4 px-10 rounded-full text-lg">Sign In to Get Started</button>
                </div>
                <div class="relative z-10 w-full max-w-4xl mx-auto px-6">
            </section>
        </main>
    </div>
`;
