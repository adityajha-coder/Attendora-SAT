export const authHtml = `
    <div id="auth-page" class="min-h-screen flex items-center justify-center p-4 relative hidden">
         <div class="absolute top-[-100px] left-[-150px] w-[300px] h-[300px] bg-gradient-to-br from-indigo-500/20 to-sky-500/20 rounded-full blur-3xl opacity-50"></div>
         <div class="absolute bottom-[-150px] md:bottom-[-250px] right-[-150px] md:right-[-250px] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gradient-to-tl from-blue-500/20 to-purple-600/20 rounded-full blur-3xl opacity-60"></div>
        <div class="card max-w-md w-full p-6 sm:p-8 rounded-2xl z-10 no-hover">

            <!-- LOGIN (Google only) -->
            <div id="login-form">
                <h2 class="text-3xl font-bold text-center mb-2 font-brand text-white">Welcome to Attendora</h2>
                <p class="text-center text-gray-400 mb-8">Sign in with your Google account to continue.</p>
                <button type="button" id="google-signin-btn" class="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-lg font-bold transition-all duration-200 border border-white/20 bg-white/5 hover:bg-white/15 text-white text-lg" aria-label="Sign in with Google">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                </button>
                <p class="text-center text-gray-500 text-xs mt-6">By signing in, you agree to use Attendora for academic tracking.</p>
            </div>

            <!-- EDIT PROFILE (shown via JS) -->
            <form id="edit-profile-form" class="hidden">
                <h2 class="text-3xl font-bold text-center mb-2 font-brand text-white">Edit Profile</h2>
                <p class="text-center text-gray-400 mb-6">Update your personal information.</p>
                
                <div class="mb-4">
                    <label for="edit-name" class="block mb-2 text-sm font-medium text-gray-300">Full Name</label>
                    <input type="text" id="edit-name" class="form-input" required placeholder="Your full name">
                </div>

                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label for="edit-course" class="block mb-2 text-sm font-medium text-gray-300">Department / Course</label>
                        <input type="text" id="edit-course" placeholder="e.g., B.Tech CSE" class="form-input">
                    </div>
                    <div>
                        <label for="edit-year" class="block mb-2 text-sm font-medium text-gray-300">Year</label>
                        <input type="number" id="edit-year" min="1" max="5" placeholder="e.g., 2" class="form-input">
                    </div>
                </div>

                <button type="submit" class="w-full btn-primary text-white font-bold py-3 px-6 rounded-lg">Save Changes</button>
                <button type="button" id="cancel-edit-profile-btn" class="w-full bg-white/10 text-white font-bold py-3 px-6 rounded-lg mt-3 border border-white/20 hover:bg-white/20 transition-colors">Cancel</button>
            </form>

        </div>
    </div>
`;
