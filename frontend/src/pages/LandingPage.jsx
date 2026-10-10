import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaMapMarkedAlt, FaCloudUploadAlt, FaMobileAlt, FaUtensils, FaStore, FaMotorcycle, FaCheckCircle } from 'react-icons/fa';
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";

// Existing images from the project
import homeImg from '../assets/home.png';
import shopImg from '../assets/shop.png';
import scooterImg from '../assets/scooter.png';
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.webp';
import image3 from '../assets/image3.jpg';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen bg-[#FFF9F4] text-[#202124] font-sans overflow-x-hidden">
            {/* Navbar (Public) */}
            <nav className="w-full h-[80px] flex items-center justify-between px-6 md:px-12 fixed top-0 z-50 bg-[#FFF9F4]/90 backdrop-blur-md shadow-xs border-b border-[#F0ECE8]">
                <h1 className="text-3xl font-black bg-gradient-to-r from-[#E63946] to-[#FF6B5E] bg-clip-text text-transparent tracking-tight cursor-pointer" onClick={() => navigate('/')}>BiteRush</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/signin')} className="text-[#202124] font-semibold hover:text-[#E63946] transition-colors cursor-pointer">Sign In</button>
                    <button onClick={() => navigate('/signup')} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white font-bold shadow-md shadow-[#E63946]/20 hover:from-[#E63946] hover:to-[#D62828] transition-all cursor-pointer">Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="w-full pt-[120px] pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
                {/* Left: Content */}
                <div className="w-full lg:w-1/2 flex flex-col items-start gap-6 relative z-10">
                    <div className="px-3.5 py-1 bg-white shadow-xs border border-[#FFD9D4] rounded-full text-xs font-bold text-[#E63946] tracking-wider uppercase">
                        BITERUSH
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black leading-tight text-[#202124] tracking-tight">
                        Food Delivery,<br/>
                        <span className="bg-gradient-to-r from-[#E63946] to-[#FF6B5E] bg-clip-text text-transparent">Simplified.</span>
                    </h1>
                    <p className="text-lg text-[#77736F] max-w-md font-medium">
                        Discover great food, connect with restaurants, order securely and track every delivery in real-time.
                    </p>
                    <div className="text-sm font-semibold text-[#77736F]">
                        Customer &bull; Restaurant &bull; Delivery Partner
                    </div>
                    <div className="flex items-center gap-4 mt-4 w-full md:w-auto">
                        <button onClick={() => navigate('/signup')} className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white font-bold shadow-lg shadow-[#E63946]/25 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-lg cursor-pointer">
                            Get Started
                        </button>
                        <button onClick={() => navigate('/signin')} className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-white text-[#202124] font-bold shadow-xs border border-[#F0ECE8] hover:bg-[#FFF9F4] transition-colors text-lg cursor-pointer">
                            Sign In
                        </button>
                    </div>
                </div>

                {/* Right: Application Showcase Mockup */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative" style={{ perspective: '1000px' }}>
                    <div 
                        className="relative w-full max-w-[500px] h-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border-[8px] border-white transition-transform duration-700 hover:rotate-0 hover:!transform-none"
                        style={{ transform: 'rotateY(-10deg) rotateX(5deg)' }}
                    >
                        {/* Mock App Header */}
                        <div className="w-full h-[60px] bg-white flex items-center justify-between px-4 shadow-xs relative z-10 border-b border-[#F0ECE8]">
                            <h2 className="text-xl font-black bg-gradient-to-r from-[#E63946] to-[#FF6B5E] bg-clip-text text-transparent">BiteRush</h2>
                            <div className="hidden sm:flex bg-[#FFF9F4] border border-[#F0ECE8] rounded-xl px-2 py-1 items-center gap-2 w-1/2">
                                <IoIosSearch className="text-[#77736F]" />
                                <div className="text-xs text-[#77736F]">search delicious food...</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white flex items-center justify-center text-xs font-bold">U</div>
                        </div>
                        {/* Mock App Body */}
                        <div className="p-4 flex flex-col gap-4 bg-[#FFF9F4] h-[400px]">
                            {/* Location Mock */}
                            <div className="flex items-center gap-2">
                                <FaLocationDot className="text-[#E63946] text-sm" />
                                <div className="text-xs font-semibold text-[#202124]">New Delhi, India</div>
                            </div>
                            
                            <h3 className="text-sm font-semibold text-gray-800 mt-2">Inspiration for your first order</h3>
                            
                            {/* Categories Mock */}
                            <div className="flex gap-3 overflow-hidden">
                                {[image1, image2, image3].map((img, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-16 h-16 rounded-full bg-white shadow flex flex-col items-center justify-center overflow-hidden">
                                        <img src={img} alt="category" className="w-full h-full object-cover opacity-80" />
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-sm font-semibold text-gray-800 mt-2">Suggested Food Items</h3>

                            {/* Food Cards Mock */}
                            <div className="flex gap-3 overflow-hidden pb-4">
                                {[image2, image3].map((img, idx) => (
                                    <div key={idx} className="w-[140px] flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                                        <div className="h-[80px] w-full bg-gray-200">
                                            <img src={img} alt="food" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-2 flex flex-col gap-1">
                                            <div className="text-xs font-bold text-gray-800 truncate">Delicious Pizza</div>
                                            <div className="text-[10px] text-gray-500">Fast Food</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs font-bold text-[#ff4d2d]">₹299</span>
                                                <div className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center text-[6px]">🟢</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Mock App Bottom Nav */}
                        <div className="absolute bottom-0 w-full h-[50px] bg-white border-t border-gray-100 flex items-center justify-around text-gray-400">
                             <div className="flex flex-col items-center text-[#ff4d2d]"><FaUtensils size={16}/><span className="text-[10px] font-medium mt-1">Home</span></div>
                             <div className="flex flex-col items-center"><IoIosSearch size={20}/></div>
                             <div className="flex flex-col items-center relative"><FiShoppingCart size={18}/><span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff4d2d] rounded-full text-[8px] text-white flex items-center justify-center">2</span></div>
                        </div>
                    </div>

                    {/* Decorative Blobs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-200/40 to-red-100/40 blur-3xl -z-10 rounded-full"></div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="w-full py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col items-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Everything You Need to Deliver Better</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                        <FeatureCard icon={<FaMapMarkedAlt />} title="Location Based" desc="Discover restaurants based on your location." />
                        <FeatureCard icon={<FaLock />} title="Secure Payments" desc="Pay securely with Razorpay." />
                        <FeatureCard icon={<FaMobileAlt />} title="Real-Time Tracking" desc="Track delivery updates using real-time communication." />
                        <FeatureCard icon={<FaCheckCircle />} title="OTP Verification" desc="Secure delivery completion with OTP verification." />
                        <FeatureCard icon={<FaCloudUploadAlt />} title="Cloud Image Storage" desc="Restaurant and food images powered by Cloudinary." />
                    </div>
                </div>
            </section>

            {/* Three Role Section */}
            <section className="w-full py-20 px-6 bg-[#fff9f6]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">One Platform. Three Experiences.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <RoleCard img={homeImg} title="CUSTOMER" desc="Discover food, manage your cart, place secure orders and track deliveries." />
                        <RoleCard img={shopImg} title="RESTAURANT" desc="Manage your restaurant, food items and incoming orders." />
                        <RoleCard img={scooterImg} title="DELIVERY" desc="Accept delivery assignments, track locations and complete deliveries securely." />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="w-full py-16 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
                        <div className="hidden md:block absolute top-[32px] left-[10%] w-[80%] h-[2px] bg-gray-100 -z-10"></div>
                        <StepCard num="01" title="Discover" desc="Find restaurants and food near you." />
                        <StepCard num="02" title="Order" desc="Choose your food, manage your cart and pay securely." />
                        <StepCard num="03" title="Deliver" desc="Track your order until it reaches your doorstep." />
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="w-full py-16 px-6 bg-[#fff9f6]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Built as a Full-Stack Product</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Socket.IO', 'Firebase', 'Razorpay', 'Cloudinary', 'Geoapify'].map(tech => (
                            <span key={tech} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-600 border border-gray-100">{tech}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Project Showcase */}
            <section className="w-full py-20 px-6 bg-white border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
                    <div className="inline-block px-4 py-1 bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] rounded-full text-xs font-bold uppercase mb-4">Complete Solution</div>
                    <h2 className="text-3xl md:text-4xl font-black text-[#202124] mb-8 max-w-2xl">Built for the Complete Delivery Journey</h2>
                    <p className="text-[#77736F] max-w-3xl leading-relaxed mb-10 text-lg">
                        BiteRush handles Authentication, Restaurant & Food Management, Cart & Payment workflows, robust Order processing, Delivery assignment, OTP Verification, and Real-time updates all in one seamless application.
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="w-full py-24 px-6 bg-gradient-to-r from-[#E63946] via-[#FF6B5E] to-[#FF8066] text-white text-center">
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
                    <h2 className="text-4xl md:text-5xl font-black">Ready to experience BiteRush?</h2>
                    <p className="text-xl opacity-90 font-medium">Discover food. Order smarter. Track better.</p>
                    <div className="mt-6 flex flex-col items-center">
                        <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-white text-[#E63946] font-extrabold rounded-2xl shadow-xl hover:scale-105 transition-transform text-lg cursor-pointer">
                            Get Started
                        </button>
                        <div className="mt-6 text-sm font-medium">
                            <span className="opacity-90">Already have an account? </span>
                            <button onClick={() => navigate('/signin')} className="underline hover:text-white/80 transition-colors cursor-pointer font-bold">Sign In</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full pt-12 pb-8 px-6 bg-[#18191B] text-gray-400">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-2xl font-black text-white mb-1">BiteRush</h3>
                        <p className="text-sm text-gray-400">Next-Gen Food Delivery Platform</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                        <a href="https://github.com/priyanshuguptacoder/Vingo-Food-Delivery-App" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <a href="https://www.linkedin.com/in/priyanshu-gupta-b98689376/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="https://vingo-food-delivery-app-1.onrender.com/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Live Demo</a>
                    </div>
                </div>
                
                <div className="max-w-6xl mx-auto pt-8 border-t border-gray-800 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-gray-400 font-medium tracking-wide">
                        Made with ❤️ by Priyanshu
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Subcomponents

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff4d2d] flex items-center justify-center flex-shrink-0 text-xl">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function RoleCard({ img, title, desc }) {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col">
            <div className="h-[200px] bg-gray-50 p-6 flex items-center justify-center">
                {img ? (
                    <img src={img} alt={title} className="max-h-full object-contain" />
                ) : (
                    <div className="text-gray-300"><FaStore size={64}/></div>
                )}
            </div>
            <div className="p-8 flex flex-col items-center text-center flex-1">
                <div className="text-xs font-bold text-[#ff4d2d] tracking-widest mb-3">{title}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function StepCard({ num, title, desc }) {
    return (
        <div className="flex flex-col items-center text-center w-full md:w-1/3 z-10 relative">
            <div className="w-16 h-16 rounded-full bg-white shadow-md border-4 border-white flex items-center justify-center text-xl font-black text-[#ff4d2d] mb-4">
                {num}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 px-4">{desc}</p>
        </div>
    );
}

export default LandingPage;
