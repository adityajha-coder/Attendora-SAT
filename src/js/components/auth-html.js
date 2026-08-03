export const authHtml = `
    <div id="auth-page" class="min-h-screen flex items-center justify-center p-4 relative hidden z-50">

        <!-- LOGIN (Clerk Auth) -->
        <div id="login-form" class="w-full max-w-md flex flex-col items-center">
            <div id="clerk-auth-container" class="w-full flex justify-center items-center min-h-[380px]"></div>
        </div>

        <!-- EDIT PROFILE (shown via JS) -->
        <div id="edit-profile-wrapper" class="card max-w-md w-full p-6 sm:p-8 rounded-2xl z-10 no-hover hidden">
            <form id="edit-profile-form">
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
