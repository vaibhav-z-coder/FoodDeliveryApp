import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

function OrderPlaced() {
    const navigate = useNavigate()
  return (
    <div className='min-h-screen bg-[#FFF9F4] flex justify-center items-center px-4 relative overflow-hidden text-[#202124]'>
      <div className='w-full max-w-lg bg-white rounded-3xl shadow-[0_16px_40px_rgb(0,0,0,0.04)] p-10 flex flex-col items-center text-center border border-[#F0ECE8] relative z-10'>
        <div className='w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-200'>
            <FaCircleCheck className='text-[#269B62] text-5xl drop-shadow-sm'/>
        </div>
        
        <h1 className='text-4xl font-black text-[#202124] mb-4 tracking-tight'>Order Placed!</h1>
        
        <p className='text-[#77736F] text-base mb-10 font-medium leading-relaxed'>
          Thank you for ordering with BiteRush. Your delicious food is being prepared.
          You can track your order status in real-time in the "My Orders" section.
        </p>
        
        <div className='flex flex-col sm:flex-row gap-4 w-full'>
            <button className='flex-1 bg-white border border-[#F0ECE8] text-[#202124] px-6 py-4 rounded-2xl text-base font-bold hover:bg-[#FFF9F4] active:scale-[0.98] transition-all cursor-pointer' onClick={() => navigate("/")}>
                Home
            </button>
            <button className='flex-1 bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white px-6 py-4 rounded-2xl text-base font-bold shadow-md shadow-[#E63946]/20 hover:from-[#E63946] hover:to-[#D62828] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer' onClick={() => navigate("/my-orders")}>
                My Orders
            </button>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className='absolute top-20 -left-20 w-64 h-64 bg-[#FF6B5E]/10 rounded-full blur-3xl'></div>
      <div className='absolute bottom-20 -right-20 w-80 h-80 bg-[#E63946]/10 rounded-full blur-3xl'></div>
    </div>
  )
}

export default OrderPlaced
