import React from 'react'

function CategoryCard({ name, image, onClick, isSelected }) {
  return (
    <div 
      className={`w-[125px] h-[130px] md:w-[150px] md:h-[155px] rounded-3xl border shrink-0 overflow-hidden bg-white transition-all duration-300 relative group cursor-pointer flex flex-col items-center justify-between p-2.5 ${
        isSelected 
          ? 'border-[#E63946] shadow-[0_8px_25px_rgb(230,57,70,0.15)] ring-2 ring-[#FFD9D4]' 
          : 'border-[#F0ECE8] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-[#FFD9D4] hover:shadow-[0_12px_30px_rgb(230,57,70,0.08)] hover:-translate-y-1'
      }`} 
      onClick={onClick}
    >
      <div className='w-full h-[85px] md:h-[100px] rounded-2xl overflow-hidden bg-[#FFF9F4]'>
        <img 
          src={image} 
          alt={name} 
          className='w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-500'
        />
      </div>
      <p className={`text-xs md:text-sm font-bold truncate text-center capitalize w-full px-1 ${
        isSelected ? 'text-[#E63946]' : 'text-[#202124] group-hover:text-[#E63946]'
      } transition-colors`}>
        {name}
      </p>
    </div>
  )
}

export default CategoryCard
