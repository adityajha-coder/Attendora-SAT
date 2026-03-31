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
                
                <div class="mb-4">
                    <label for="signup-password" class="block mb-2 text-sm font-medium text-gray-300">Password</label>
                    <input type="password" id="signup-password" class="form-input" required>
                </div>
                 <div class="mb-6">
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
                
                <button type="submit" class="w-full btn-primary text-white font-bold py-3 px-6 rounded-lg">Sign Up</button>
                <p class="text-center text-gray-400 mt-4">Already have an account? <a href="#" id="show-login" class="font-semibold text-blue-400 hover:underline">Sign in</a></p>
            </form>
        </div>
    </div>
`;
