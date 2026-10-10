import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../components/FoodCard';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useSelector } from 'react-redux';
import { getShopImage } from '../utils/imageMapping';

function Shop() {
    const {shopId} = useParams()
    const [items, setItems] = useState([])
    const [shop, setShop] = useState(null)
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)

    const totalCartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
    
    const handleShop = async () => {
        try {
           const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, {withCredentials:true}) 
           setShop(result.data.shop)
           setItems(result.data.items)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        handleShop()
    }, [shopId])

  return (
    <div className='min-h-screen bg-[#FFF9F4] pb-28 text-[#202124]'>
        {/* Sticky Top Header with Back Button and Cart */}
        <div className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F0ECE8] shadow-[0_4px_20px_rgb(0,0,0,0.03)] px-4 sm:px-8 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div 
                    className='cursor-pointer p-2 bg-[#FFF9F4] hover:bg-[#FFF0ED] rounded-full transition-all text-[#E63946] border border-[#F0ECE8] shadow-xs hover:scale-105 active:scale-95' 
                    onClick={() => navigate(-1)}
                    title="Go Back"
                >
                    <IoIosArrowRoundBack size={28} />
                </div>
                {shop && (
                    <div className='flex flex-col'>
                        <h2 className='text-base sm:text-lg font-bold text-[#202124] leading-tight truncate max-w-[200px] sm:max-w-md'>{shop.name}</h2>
                        <span className='text-xs text-[#77736F] font-medium truncate max-w-[200px] sm:max-w-md'>{shop.address}</span>
                    </div>
                )}
            </div>

            <button 
                onClick={() => navigate('/cart')}
                className='relative flex items-center gap-2 bg-gradient-to-r from-[#FF6B5E] to-[#E63946] hover:from-[#E63946] hover:to-[#D62839] text-white px-4 py-2 rounded-full font-bold shadow-md shadow-[#E63946]/20 active:scale-95 transition-all cursor-pointer'
            >
                <FiShoppingCart size={18} />
                <span className='hidden sm:inline text-sm'>Cart</span>
                {totalCartCount > 0 && (
                    <span className='bg-white text-[#E63946] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs'>
                        {totalCartCount}
                    </span>
                )}
            </button>
        </div>
        
        {shop && (
            <div className='relative w-full h-[38vh] md:h-[48vh] min-h-[280px] mt-[58px]'>
                <img src={shop.image && (shop.image.startsWith('data:image/svg+xml') || shop.image.includes('<svg')) ? getShopImage(shop.name) : (shop.image || getShopImage(shop.name))} alt={shop.name} className='w-full h-full object-cover'/>
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end px-6 md:px-16 pb-12'>
                    <div className='max-w-7xl w-full mx-auto'>
                        <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3'>
                            <FaStore className='text-[#E63946] text-3xl' />
                        </div>
                        <h1 className='text-4xl md:text-6xl font-black text-white drop-shadow-md mb-4 tracking-tight'>{shop.name}</h1>
                        <div className='flex items-center gap-2 bg-white/20 backdrop-blur-sm w-fit px-4 py-2 rounded-full border border-white/30'>
                            <FaLocationDot size={16} className='text-[#E63946]'/>
                            <p className='text-sm md:text-base font-medium text-white'>{shop.address}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${shop ? 'py-12' : 'pt-24 pb-12'}`}>
            <div className='flex items-center justify-between mb-10'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-[#FFF0ED] border border-[#FFD9D4] rounded-xl flex items-center justify-center'>
                        <FaUtensils className='text-[#E63946] text-lg'/>
                    </div>
                    <h2 className='text-3xl font-extrabold text-[#202124] tracking-tight'>Our Menu</h2>
                </div>
                <div className='text-sm font-bold text-[#77736F] bg-white border border-[#F0ECE8] px-4 py-2 rounded-full shadow-xs'>
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </div>
            </div>

            {items.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'>
                    {items.map((item, index) => (
                        <div key={index} className='w-full flex justify-center'>
                            <FoodCard data={item} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F0ECE8]'>
                    <div className='w-24 h-24 bg-[#FFF0ED] rounded-full flex items-center justify-center mb-6 text-[#E63946] text-4xl opacity-70 border border-[#FFD9D4]'>🍽️</div>
                    <p className='text-[#202124] font-bold text-xl mb-2'>Menu is empty</p>
                    <p className='text-[#77736F] mb-8 font-medium'>This restaurant hasn't added any items yet.</p>
                </div>
            )}
        </div>

        {/* Sticky Floating Bottom Cart Bar */}
        {totalCartCount > 0 && (
            <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-[#202124] text-white rounded-3xl shadow-[0_16px_40px_rgb(0,0,0,0.18)] p-4 flex items-center justify-between border border-[#3A3B3E] animate-in fade-in slide-in-from-bottom-4 duration-300'>
                <div className='flex items-center gap-3.5'>
                    <div className='w-11 h-11 bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-[#E63946]/30'>
                        <FiShoppingCart size={20} />
                    </div>
                    <div>
                        <p className='font-bold text-sm sm:text-base tracking-tight'>
                            {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in cart
                        </p>
                        <p className='text-xs text-[#D1CCC7] font-medium'>
                            Subtotal: <span className='text-white font-bold'>₹{totalAmount}</span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/cart')} 
                    className='bg-gradient-to-r from-[#FF6B5E] to-[#E63946] hover:from-[#E63946] hover:to-[#D62839] text-white font-bold px-6 py-2.5 rounded-2xl shadow-md shadow-[#E63946]/20 active:scale-95 transition-all text-sm flex items-center gap-2 cursor-pointer'
                >
                    <span>View Cart</span>
                    <span>→</span>
                </button>
            </div>
        )}
    </div>
  )
}

export default Shop
