"use client";
 
import { Briefcase, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const FullScreenSignup = ({
  onSubmit,
  isLogin = false,
  loading = false,
  error = "",
  onForgotPassword,
  showReset = false,
  onResetPassword,
  resetError = "",
  resetLoading = false,
}: {
  onSubmit: (email: string, password: string, fullName?: string) => void;
  isLogin?: boolean;
  loading?: boolean;
  error?: string;
  onForgotPassword?: () => void;
  showReset?: boolean;
  onResetPassword?: (email: string) => void;
  resetError?: string;
  resetLoading?: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
 
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
 
  const validatePassword = (value: string) => {
    return value.length >= 6;
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
 
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
 
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
 
    if (!isLogin && !fullName.trim()) {
      setFullNameError("Please enter your full name.");
      valid = false;
    } else {
      setFullNameError("");
    }
 
    if (valid) {
      onSubmit(email, password, fullName);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl rounded-3xl">
        {/* ...existing left-side code... */}
        <div className="w-full h-full z-2 absolute bg-gradient-to-t from-transparent to-[#90EE90]/20 rounded-3xl"></div>
        <div className="flex absolute z-2 overflow-hidden backdrop-blur-2xl rounded-l-3xl">
          {/* ...existing gradient bars... */}
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-[#90EE90]/50 via-[69%] to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-[#90EE90]/50 via-[69%] to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-[#90EE90]/50 via-[69%] to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-[#90EE90]/50 via-[69%] to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-[#90EE90]/50 via-[69%] to-white/30 opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-[#90EE90]/50 via-[69%] to-white/30 opacity-30 overflow-hidden"></div>
        </div>
        <div className="w-[15rem] h-[15rem] bg-gradient-to-r from-[#90EE90] to-[#32CD32] absolute z-1 rounded-full bottom-0 left-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-10 left-20"></div>
        <div className="w-[6rem] h-[6rem] bg-gradient-to-r from-[#90EE90] to-[#32CD32] absolute z-1 rounded-full bottom-5 left-32 opacity-70"></div>

        <div className="bg-gradient-to-br from-[#228B22] to-[#006400] text-white p-8 md:p-12 md:w-1/2 relative rounded-l-3xl overflow-hidden">
          <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative">
            Your gateway to global opportunities and career growth.
          </h1>
          <p className="text-gray-300 mt-4 z-10 relative">
            Discover scholarships, jobs, fellowships, and competitions from around the world. 
            Let AI help you find and apply to the best opportunities.
          </p>
        </div>

        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white z-10 text-gray-900 rounded-r-3xl">
          <div className="flex flex-col items-left mb-8">
            <div className="flex flex-col items-center">
              <img className='h-16 w-16 rounded-full' src="/assets/img/logo.jpg" alt="App Logo" />
              <span className="text-xl font-bold text-[#008000] mt-2">PrimeChances</span>
              <span className="text-xs text-gray-500 mt-1">Find your next opportunity</span>
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">
              {showReset ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-left opacity-80">
              {showReset
                ? 'Enter your email to receive a password reset link.'
                : isLogin
                ? 'Sign in to your PrimeChances account'
                : 'Create your PrimeChances account'}
            </p>
          </div>

          {showReset ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={e => {
                e.preventDefault();
                if (!validateEmail(resetEmail)) {
                  setResetEmailError('Please enter a valid email address.');
                } else {
                  setResetEmailError('');
                  onResetPassword && onResetPassword(resetEmail);
                }
              }}
              noValidate
            >
              <div>
                <label htmlFor="resetEmail" className="block text-sm mb-2 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  placeholder="Enter your email"
                  className={`text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-white text-black focus:ring-[#90EE90] focus:border-[#90EE90] ${
                    resetEmailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  aria-invalid={!!resetEmailError}
                  aria-describedby="resetEmail-error"
                />
                {resetEmailError && (
                  <p id="resetEmail-error" className="text-red-500 text-xs mt-1">
                    {resetEmailError}
                  </p>
                )}
              </div>
              {resetError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {resetError}
                </div>
              )}
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-gradient-to-r from-[#90EE90] to-[#32CD32] hover:from-[#32CD32] hover:to-[#228B22] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
              <div className="text-center text-gray-600 text-sm mt-2">
                <button
                  type="button"
                  className="text-[#90EE90] font-medium hover:underline"
                  onClick={onForgotPassword}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* ...existing signup/login form fields... */}
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm mb-2 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Enter your full name"
                    className={`text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-white text-black focus:ring-[#90EE90] focus:border-[#90EE90] ${
                      fullNameError ? "border-red-500" : "border-gray-300"
                    }`}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    aria-invalid={!!fullNameError}
                    aria-describedby="fullName-error"
                  />
                  {fullNameError && (
                    <p id="fullName-error" className="text-red-500 text-xs mt-1">
                      {fullNameError}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm mb-2 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className={`text-sm w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-white text-black focus:ring-[#90EE90] focus:border-[#90EE90] ${
                    emailError ? "border-red-500" : "border-gray-300"
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError}
                  aria-describedby="email-error"
                />
                {emailError && (
                  <p id="email-error" className="text-red-500 text-xs mt-1">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm mb-2 font-medium">
                  {isLogin ? 'Password' : 'Create Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                    className={`text-sm w-full py-3 pr-12 pl-4 border rounded-lg focus:outline-none focus:ring-2 bg-white text-black focus:ring-[#90EE90] focus:border-[#90EE90] ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!passwordError}
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-red-500 text-xs mt-1">
                    {passwordError}
                  </p>
                )}
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#90EE90] to-[#32CD32] hover:from-[#32CD32] hover:to-[#228B22] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>

              <div className="text-center text-gray-600 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <a 
                  href={isLogin ? "/auth?tab=signup" : "/auth?tab=signin"} 
                  className="text-[#90EE90] font-medium hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </a>
              </div>
              {isLogin && (
                <div className="text-center text-gray-600 text-sm mt-2">
                  <button
                    type="button"
                    className="text-[#90EE90] font-medium hover:underline"
                    onClick={onForgotPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
