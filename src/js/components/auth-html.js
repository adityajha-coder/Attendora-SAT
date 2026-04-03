export const authHtml = `
    <div id="auth-page" class="min-h-screen flex items-center justify-center p-4 relative hidden">
         <div class="absolute top-[-100px] left-[-150px] w-[300px] h-[300px] bg-gradient-to-br from-indigo-500/20 to-sky-500/20 rounded-full blur-3xl opacity-50"></div>
         <div class="absolute bottom-[-150px] md:bottom-[-250px] right-[-150px] md:right-[-250px] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gradient-to-tl from-blue-500/20 to-purple-600/20 rounded-full blur-3xl opacity-60"></div>
        <div class="card max-w-md w-full p-6 sm:p-8 rounded-2xl z-10 no-hover">
            <form id="login-form">
                <h2 class="text-3xl font-bold text-center mb-2 font-brand text-white">Welcome Back!</h2>
                <p class="text-center text-gray-400 mb-6">Sign in to continue to Attendora.</p>
                <div class="mb-4">
                    <label for="login-contact" class="block mb-2 text-sm font-medium text-gray-300">Email Address</label>
                    <input type="email" id="login-contact" class="form-input" required placeholder="name@example.com">
                </div>
                <div class="mb-6">
                    <label for="login-password" class="block mb-2 text-sm font-medium text-gray-300">Password</label>
                    <input type="password" id="login-password" class="form-input" required>
                    <a href="#" id="show-forgot-password" class="text-xs text-blue-400 hover:underline mt-2 inline-block">Forgot Password?</a>
                </div>
                <button type="submit" class="w-full btn-primary text-white font-bold py-3 px-6 rounded-lg">Sign In</button>
                
                <div id="login-google-divider" class="flex items-center gap-4 my-5">
                    <div class="flex-1 h-px bg-white/15"></div>
                    <span class="text-gray-500 text-sm font-medium">or</span>
                    <div class="flex-1 h-px bg-white/15"></div>
                </div>
                
                <button type="button" id="google-signin-btn" class="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-bold transition-all duration-200 border border-white/20 bg-white/5 hover:bg-white/15 text-white" aria-label="Sign in with Google">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                </button>
                
                <p class="text-center text-gray-400 mt-4">Don't have an account? <a href="#" id="show-signup" class="font-semibold text-blue-400 hover:underline">Sign up</a></p>
            </form>
            <form id="signup-form" class="hidden">
                <h2 class="text-3xl font-bold text-center mb-2 font-brand text-white">Create Account</h2>
                <p class="text-center text-gray-400 mb-6">Start your journey with Attendora.</p>
                
                <div class="mb-4">
                    <label for="signup-name" class="block mb-2 text-sm font-medium text-gray-300">Full Name</label>
                    <input type="text" id="signup-name" class="form-input" required>
                </div>
                
                <div class="mb-6">
                    <label for="signup-contact" class="block mb-2 text-sm font-medium text-gray-300">Email Address (Required for sign-in)</label>
                    <input type="email" id="signup-contact" class="form-input" required placeholder="name@example.com">
                </div>
                
                <div class="mb-4" id="signup-password-wrapper">
                    <label for="signup-password" class="block mb-2 text-sm font-medium text-gray-300">Password</label>
                    <input type="password" id="signup-password" class="form-input" required>
                </div>
                 <div class="mb-6" id="signup-password-confirm-wrapper">
                    <label for="signup-password-confirm" class="block mb-2 text-sm font-medium text-gray-300">Confirm Password</label>
                    <input type="password" id="signup-password-confirm" class="form-input" required>
                </div>

                 <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="signup-course" class="block mb-2 text-sm font-medium text-gray-300">Course</label>
                        <input type="text" id="signup-course" placeholder="e.g., B.Tech CSE" class="form-input" required>
                    </div>
                    <div>
                        <label for="signup-year" class="block mb-2 text-sm font-medium text-gray-300">Year</label>
                        <input type="number" id="signup-year" min="1" max="5" placeholder="e.g., 2" class="form-input" required>
                    </div>
                </div>
                
                <!-- Password Management Section (shown only in edit profile mode) -->
                <div id="password-management-section" class="hidden mb-6">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="flex-1 h-px bg-white/15"></div>
                        <span class="text-gray-400 text-sm font-medium">Password</span>
                        <div class="flex-1 h-px bg-white/15"></div>
                    </div>
                    
                    <!-- Change Password (for email/password users) -->
                    <div id="change-password-section" class="hidden space-y-3">
                        <div>
                            <label for="current-password" class="block mb-2 text-sm font-medium text-gray-300">Current Password</label>
                            <input type="password" id="current-password" class="form-input" placeholder="Enter current password">
                        </div>
                        <div>
                            <label for="new-password" class="block mb-2 text-sm font-medium text-gray-300">New Password</label>
                            <input type="password" id="new-password" class="form-input" placeholder="Enter new password (min 6 chars)">
                        </div>
                        <div>
                            <label for="new-password-confirm" class="block mb-2 text-sm font-medium text-gray-300">Confirm New Password</label>
                            <input type="password" id="new-password-confirm" class="form-input" placeholder="Re-enter new password">
                        </div>
                        <button type="button" id="change-password-btn" class="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white font-semibold py-2.5 px-5 rounded-lg border border-white/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                            Change Password
                        </button>
                    </div>
                    
                    <!-- Create Password (for Google-only users) -->
                    <div id="create-password-section" class="hidden space-y-3">
                        <p class="text-sm text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            You signed in with Google. Create a password to also sign in with email.
                        </p>
                        <div>
                            <label for="create-password" class="block mb-2 text-sm font-medium text-gray-300">New Password</label>
                            <input type="password" id="create-password" class="form-input" placeholder="Min 6 characters">
                        </div>
                        <div>
                            <label for="create-password-confirm" class="block mb-2 text-sm font-medium text-gray-300">Confirm Password</label>
                            <input type="password" id="create-password-confirm" class="form-input" placeholder="Re-enter password">
                        </div>
                        <button type="button" id="create-password-btn" class="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white font-semibold py-2.5 px-5 rounded-lg border border-white/20 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Create Password
                        </button>
                    </div>
                </div>

                <button type="submit" class="w-full btn-primary text-white font-bold py-3 px-6 rounded-lg">Sign Up</button>
                
                <div id="signup-google-divider" class="flex items-center gap-4 my-5">
                    <div class="flex-1 h-px bg-white/15"></div>
                    <span class="text-gray-500 text-sm font-medium">or</span>
                    <div class="flex-1 h-px bg-white/15"></div>
                </div>
                
                <button type="button" id="google-signup-btn" class="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-bold transition-all duration-200 border border-white/20 bg-white/5 hover:bg-white/15 text-white" aria-label="Sign up with Google">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                </button>
                
                <p class="text-center text-gray-400 mt-4">Already have an account? <a href="#" id="show-login" class="font-semibold text-blue-400 hover:underline">Sign in</a></p>
            </form>
        </div>
    </div>
`;
