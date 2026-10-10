import React from 'react'
import { useState } from 'react';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function SignIn() {
    const primaryColor = "#ff4d2d";
    const hoverColor = "#e64323";
    const bgColor = "#fff9f6";
    const borderColor = "#f3f4f6"; // gray-100 equivalent for softer borders

    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const handleSignIn = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
            }, { withCredentials: true })
            dispatch(setUserData(result.data))
            setErr("")
            setLoading(false)
        } catch (error) {
            setErr(error?.response?.data?.message || "Something went wrong")
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        try {
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                email: result.user.email,
            }, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-[#FFF9F4] text-[#202124]'>
            <div className='bg-white rounded-3xl shadow-[0_16px_40px_rgb(0,0,0,0.04)] w-full max-w-md p-8 border border-[#F0ECE8]'>
                <h1 className='text-4xl font-black mb-2 bg-gradient-to-r from-[#E63946] to-[#FF6B5E] bg-clip-text text-transparent tracking-tight cursor-pointer' onClick={() => navigate('/')}>BiteRush</h1>
                <p className='text-[#77736F] mb-8 font-medium text-sm'>Sign in to your account to get started with delicious food deliveries.</p>

                {/* email */}
                <div className='mb-5'>
                    <label htmlFor="email" className='block text-[#202124] font-bold mb-2 text-sm'>Email</label>
                    <input type="email" id="email" className='w-full border border-[#F0ECE8] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all bg-[#FFF9F4]/50 text-[#202124]' placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} value={email} required />
                </div>
                {/* password*/}
                <div className='mb-3'>
                    <label htmlFor="password" className='block text-[#202124] font-bold mb-2 text-sm'>Password</label>
                    <div className='relative'>
                        <input type={`${showPassword ? "text" : "password"}`} id="password" className='w-full border border-[#F0ECE8] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all bg-[#FFF9F4]/50 text-[#202124] pr-12' placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <button className='absolute right-4 cursor-pointer top-[14px] text-gray-400 hover:text-gray-600 transition-colors' type="button" onClick={() => setShowPassword(prev => !prev)}>{!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}</button>
                    </div>
                </div>

                <div className='text-right mb-6 text-sm'>
                    <span className='cursor-pointer text-[#E63946] font-semibold hover:underline transition-colors' onClick={() => navigate("/forgot-password")}>
                        Forgot Password?
                    </span>
                </div>

                <button className='w-full font-bold py-3.5 rounded-2xl transition-all duration-300 bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white hover:from-[#E63946] hover:to-[#D62828] hover:shadow-lg hover:shadow-[#E63946]/20 active:scale-[0.98] flex items-center justify-center cursor-pointer shadow-md shadow-[#E63946]/10' onClick={handleSignIn} disabled={loading}>
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign In"}
                </button>
                
                {err && <div className='bg-[#FFF0ED] text-[#E63946] text-sm font-semibold text-center p-3 rounded-2xl mt-4 border border-[#FFD9D4]'>{err}</div>}

                <div className='relative flex py-6 items-center'>
                    <div className='flex-grow border-t border-[#F0ECE8]'></div>
                    <span className='flex-shrink-0 mx-4 text-[#77736F] text-xs font-bold uppercase tracking-wider'>or</span>
                    <div className='flex-grow border-t border-[#F0ECE8]'></div>
                </div>

                <button className='w-full flex items-center justify-center gap-3 border border-[#F0ECE8] rounded-2xl px-4 py-3 font-bold text-[#202124] transition-all duration-300 hover:bg-[#FFF9F4] hover:shadow-xs active:scale-[0.98] cursor-pointer' onClick={handleGoogleAuth}>
                    <FcGoogle size={22} />
                    <span>Sign In with Google</span>
                </button>

                <p className='text-center mt-8 text-[#77736F] font-medium text-sm'>
                    Don't have an account? <span className='text-[#E63946] hover:underline font-bold cursor-pointer transition-colors' onClick={() => navigate("/signup")}>Sign Up</span>
                </p>
            </div>
        </div>
    )
}

export default SignIn
