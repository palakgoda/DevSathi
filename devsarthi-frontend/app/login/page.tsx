'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Separate Login states
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Separate Registration states
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [course, setCourse] = useState('');
    const [semester, setSemester] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Reset messages and clear unrelated fields on view toggle
    const toggleView = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMsg('');
        setShowPassword(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (isLogin) {
            // Login validations & submission
            if (!emailRegex.test(loginEmail)) {
                setError('Please enter a valid email address.');
                return;
            }
            if (!loginPassword) {
                setError('Please enter your password.');
                return;
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (signInError) {
                setError(signInError.message);
                return;
            }

            router.push('/dashboard');

        } else {
            // Registration validations & submission
            if (!emailRegex.test(registerEmail)) {
                setError('Please enter a valid email address.');
                return;
            }
            if (fullName.trim().length < 2) {
                setError('Please enter your full name.');
                return;
            }
            if (!course || !semester) {
                setError('Please select your branch and semester.');
                return;
            }
            if (registerPassword.length < 8) {
                setError('Password must be at least 8 characters long.');
                return;
            }
            if (registerPassword !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }

            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: registerEmail,
                password: registerPassword,
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (authData.user) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: authData.user.id,
                            email: registerEmail,
                            full_name: fullName,
                            course: course,
                            semester: semester,
                        }
                    ]);

                if (insertError) {
                    setError('Account created, but profile update failed: ' + insertError.message);
                    return;
                }
            }

            // Transfer the newly registered credentials over to login fields for convenience
            setLoginEmail(registerEmail);
            setLoginPassword('');

            // Wipe registration form cleanly
            setRegisterEmail('');
            setRegisterPassword('');
            setConfirmPassword('');
            setFullName('');
            setCourse('');
            setSemester('');

            setIsLogin(true);
            setSuccessMsg('Account successfully created! Please enter your password to log in.');
        }
    };

    return (
        <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-[#fdf9ef] text-[#1c1c16] font-sans antialiased">
            {/* Left Branding */}
            <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-[#f2eee4] border-r border-[#c0c9c2]/50 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#bbeed5] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <div className="relative z-10">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-[#013626] tracking-tight font-serif">
                            DevSarthi
                        </h1>
                        <p className="text-sm text-[#316e52] uppercase tracking-widest font-semibold mt-1">
                            Academic Architect
                        </p>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-4xl lg:text-5xl font-bold text-[#013626] leading-tight font-serif mb-6">
                        Learn Smarter.<br />
                        Code Deeper.<br />
                        <span className="text-[#2c694e]">Think for Yourself.</span>
                    </h2>
                    <p className="text-lg text-[#414944] border-l-2 border-[#60c595] pl-4">
                        Your sources. Your practice. Your understanding. Enter the focused academic learning workspace.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-[#717974]">
                    © 2024 DevSarthi. Built for Mumbai University.
                </div>
            </div>

            {/* Right Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 relative">
                <div className="md:hidden w-full max-w-md mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[#013626] tracking-tight font-serif">DevSarthi</h1>
                    <p className="text-sm text-[#316e52] uppercase tracking-widest font-semibold mt-1">Academic Architect</p>
                </div>

                <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_32px_-4px_rgba(30,77,59,0.08)] border border-[#c0c9c2]/40 p-8 sm:p-10 relative z-10">

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-[#013626] font-serif mb-2">
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="text-[#414944]">
                            {isLogin
                                ? 'Continue your learning journey with DevSarthi.'
                                : 'Start building your personalized learning journey.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">

                        {!isLogin ? (
                            <>
                                {/* Registration: Name & Email */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            name="register_fullname"
                                            autoComplete="name"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] focus:border-[#60c595] outline-none"
                                            placeholder="Alex Johnson"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            name="register_email"
                                            autoComplete="off"
                                            required
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] focus:border-[#60c595] outline-none"
                                            placeholder="student@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Registration: Branch & Semester */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Branch</label>
                                        <select
                                            required
                                            value={course}
                                            onChange={(e) => setCourse(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] outline-none"
                                        >
                                            <option value="" disabled>Select</option>
                                            <option value="IT">Info Tech (IT)</option>
                                            <option value="CS">Computer Engg</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Semester</label>
                                        <select
                                            required
                                            value={semester}
                                            onChange={(e) => setSemester(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] outline-none"
                                        >
                                            <option value="" disabled>Select</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>Sem {num}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Registration: Passwords */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="register_password"
                                                autoComplete="new-password"
                                                required
                                                value={registerPassword}
                                                onChange={(e) => setRegisterPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] outline-none pr-10"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717974] hover:text-[#013626]"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Confirm</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="register_confirm_password"
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Login: Email & Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="login_email"
                                        autoComplete="email"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] focus:border-[#60c595] outline-none"
                                        placeholder="student@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#1c1c16] mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="login_password"
                                            autoComplete="current-password"
                                            required
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#f7f3e9] border border-[#c0c9c2] rounded-lg focus:ring-2 focus:ring-[#60c595] outline-none pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717974] hover:text-[#013626]"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-1 mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="peer appearance-none w-4 h-4 border border-[#c0c9c2] rounded-sm bg-[#f7f3e9] checked:bg-[#013626] checked:border-[#013626] focus:ring-2 focus:ring-[#60c595] focus:ring-offset-1 transition-all cursor-pointer"
                                            />
                                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-[#414944] group-hover:text-[#013626] transition-colors select-none">
                                            Remember me
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => alert("Forgot password flow will be implemented here.")}
                                        className="text-sm font-semibold text-[#316e52] hover:text-[#013626] transition-all hover:underline decoration-[#60c595] decoration-2 underline-offset-4 rounded-sm outline-none focus:ring-2 focus:ring-[#60c595]"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 mt-4 bg-[#013626] hover:bg-[#002114] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            {isLogin ? 'Login' : 'Create Account'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center relative z-10">
                    <p className="text-[#414944]">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            type="button"
                            onClick={toggleView}
                            className="font-semibold text-[#013626] border-b border-[#013626]/30 hover:border-[#013626] transition-colors pb-0.5 ml-1"
                        >
                            {isLogin ? 'Create one' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}