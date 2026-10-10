import React from 'react'
import { FaStar, FaClock } from 'react-icons/fa'
import { getShopImage } from '../utils/imageMapping'

function ShopCard({ name, image, address, onClick }) {
  // Check if image is an SVG or data URL, replace with our mapping
  const finalImage = (image && (image.startsWith('data:image/svg+xml') || image.includes('<svg'))) ? getShopImage(name) : (image || getShopImage(name));

  return (
    <div className='w-[280px] h-[220px] md:w-[320px] md:h-[235px] rounded-3xl shrink-0 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgb(230,57,70,0.12)] hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer border border-[#F0ECE8]' onClick={onClick}>
        <img src={finalImage} alt={name} className='absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500'/>
        
        <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5'>
            <h3 className='text-xl font-extrabold text-white line-clamp-1 capitalize drop-shadow-md leading-tight mb-1'>{name}</h3>
            <p className='text-xs text-[#EAE6E1] truncate capitalize mb-3 drop-shadow-sm'>{address || "Local Restaurant"}</p>
            
            <div className='flex items-center gap-3'>
                <div className='flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15'>
                    <FaStar className='text-[#FFC857] text-[12px]' />
                    <span className='text-xs font-bold text-white'>4.5</span>
                </div>
                <div className='flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15'>
                    <FaClock className='text-[#D1CCC7] text-[12px]' />
                    <span className='text-xs font-bold text-white'>25-35 min</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ShopCard
