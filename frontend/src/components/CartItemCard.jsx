import React from 'react'
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
import { getFoodImage } from '../utils/imageMapping';

function CartItemCard({data}) {
    const dispatch = useDispatch()
    
    // Check if image is an SVG or data URL, replace with our mapping
    const finalImage = (data.image && (data.image.startsWith('data:image/svg+xml') || data.image.includes('<svg'))) ? getFoodImage(data.name) : (data.image || getFoodImage(data.name));
    
    const handleIncrease = (id, currentQty) => {
       dispatch(updateQuantity({id, quantity: currentQty + 1}))
    }
    
    const handleDecrease = (id, currentQty) => {
        if(currentQty > 1){
            dispatch(updateQuantity({id, quantity: currentQty - 1}))
        }
    }
    
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#F0ECE8] hover:border-[#FFD9D4] hover:shadow-[0_8px_30px_rgb(230,57,70,0.06)] transition-all gap-4'>
      <div className='flex items-center gap-4 w-full sm:w-auto'>
        <div className='w-20 h-20 sm:w-20 sm:h-20 flex-shrink-0 bg-[#FFF9F4] rounded-xl overflow-hidden border border-[#F0ECE8]'>
            <img src={finalImage} alt={data.name} className='w-full h-full object-cover object-center'/>
        </div>
        <div className='flex-1'>
            <h1 className='font-bold text-[#202124] text-lg mb-0.5 capitalize'>{data.name}</h1>
            <p className='text-xs font-semibold text-[#77736F] mb-1.5 capitalize'>{data.shop?.name || 'BiteRush'}</p>
            <p className='text-sm text-[#77736F] font-medium'>₹{data.price} x {data.quantity}</p>
            <p className="font-extrabold text-[#E63946] text-lg mt-0.5">₹{data.price * data.quantity}</p>
        </div>
      </div>
      
      <div className='flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 bg-[#FFF9F4] sm:bg-transparent p-2 sm:p-0 rounded-2xl'>
        <div className='flex items-center bg-white rounded-full border border-[#F0ECE8] p-0.5 shadow-xs'>
            <button className='w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-[#FFF0ED] text-[#202124] hover:text-[#E63946] transition-colors' onClick={() => handleDecrease(data.id, data.quantity)}>
                <FaMinus size={11}/>
            </button>
            <span className='w-8 text-center font-bold text-sm text-[#202124]'>{data.quantity}</span>
            <button className='w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-[#FFF0ED] text-[#202124] hover:text-[#E63946] transition-colors' onClick={() => handleIncrease(data.id, data.quantity)}>
                <FaPlus size={11}/>
            </button>
        </div>
        
        <button className="p-2.5 bg-[#FFF0ED] text-[#E63946] rounded-full hover:bg-[#E63946] hover:text-white transition-colors cursor-pointer border border-[#FFD9D4]" onClick={() => dispatch(removeCartItem(data.id))}>
            <CiTrash size={20}/>
        </button>
      </div>
    </div>
  )
}

export default CartItemCard
