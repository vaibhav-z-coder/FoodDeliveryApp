import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';

function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)
    
    return (
        <div className='min-h-screen bg-[#FFF9F4] flex justify-center p-4 md:p-8 text-[#202124]'>
            <div className='w-full max-w-3xl flex flex-col'>
                <div className='flex items-center gap-3 mb-8 sticky top-0 bg-[#FFF9F4]/95 backdrop-blur py-4 z-10 border-b border-[#F0ECE8]'>
                    <div className='cursor-pointer p-2 hover:bg-[#FFF0ED] rounded-full transition-colors text-[#E63946] border border-[#F0ECE8]' onClick={() => navigate("/")}>
                        <IoIosArrowRoundBack size={28} />
                    </div>
                    <h1 className='text-3xl font-extrabold text-[#202124] tracking-tight'>Your Cart</h1>
                    {cartItems?.length > 0 && <span className='bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] px-3.5 py-1 rounded-full font-bold text-xs ml-auto'>{cartItems.length} items</span>}
                </div>
                
                {cartItems?.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8]'>
                        <div className='w-20 h-20 bg-[#FFF0ED] rounded-full flex items-center justify-center mb-5 text-[#E63946] text-3xl border border-[#FFD9D4] shadow-xs'>🛒</div>
                        <p className='text-[#202124] font-extrabold text-2xl mb-1.5'>Your cart is empty</p>
                        <p className='text-[#77736F] mb-6 font-medium text-sm'>Looks like you haven't added any delicious food yet.</p>
                        <button className='bg-gradient-to-r from-[#FF6B5E] to-[#E63946] hover:from-[#E63946] hover:to-[#D62839] text-white px-8 py-3.5 rounded-2xl font-bold shadow-md shadow-[#E63946]/20 active:scale-95 transition-all cursor-pointer' onClick={() => navigate("/")}>
                            Explore Restaurants
                        </button>
                    </div>
                ) : (
                    <div className='flex flex-col gap-6 pb-20'>
                        <div className='space-y-4'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>
                        
                        <div className='bg-white p-6 sm:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8] flex flex-col gap-4'>
                            <h2 className='text-lg font-bold text-[#202124] border-b border-[#F0ECE8] pb-3'>Order Summary</h2>
                            <div className='flex justify-between items-center text-[#77736F] font-medium'>
                                <span>Subtotal</span>
                                <span className='text-[#202124] font-bold'>₹{totalAmount}</span>
                            </div>
                            <div className='flex justify-between items-center text-[#77736F] font-medium'>
                                <span>Delivery Fee</span>
                                <span className='text-[#269B62] font-bold'>Free</span>
                            </div>
                            <div className='flex justify-between items-center pt-3 border-t border-[#F0ECE8] mt-2'>
                                <span className='text-lg font-bold text-[#202124]'>Total Amount</span>
                                <span className='text-3xl font-black text-[#E63946]'>₹{totalAmount}</span>
                            </div>
                        </div>
                        
                        <button className='w-full bg-gradient-to-r from-[#FF6B5E] to-[#E63946] hover:from-[#E63946] hover:to-[#D62839] text-white px-6 py-4 rounded-2xl text-lg font-bold shadow-md shadow-[#E63946]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center gap-2' onClick={() => navigate("/checkout")}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage
