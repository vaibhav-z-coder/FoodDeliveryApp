import React from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaMinus, FaPlus } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeCartItem } from '../redux/userSlice';
import { getFoodImage } from '../utils/imageMapping';

function FoodCard({ data }) {
    const dispatch = useDispatch()
    const { cartItems } = useSelector(state => state.user)
    
    // Read live quantity directly from Redux cartItems
    const cartItem = cartItems?.find(item => String(item.id) === String(data._id))
    const currentQty = cartItem ? cartItem.quantity : 0
    
    // Check if image is an SVG or data URL, replace with our mapping
    const finalImage = (data.image && (data.image.startsWith('data:image/svg+xml') || data.image.includes('<svg'))) ? getFoodImage(data.name) : (data.image || getFoodImage(data.name));
    
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                (i <= rating) ? (
                    <FaStar key={i} className='text-[#FFC857] text-sm' />
                ) : (
                    <FaRegStar key={i} className='text-[#EAE6E1] text-sm' />
                )
            )
        }
        return stars
    }

    const handleAdd = () => {
        dispatch(addToCart({
            id: data._id,
            name: data.name,
            price: data.price,
            image: data.image,
            shop: data.shop,
            quantity: 1,
            foodType: data.foodType
        }))
    }

    const handleIncrease = () => {
        if (currentQty === 0) {
            handleAdd()
        } else {
            dispatch(updateQuantity({
                id: data._id,
                quantity: currentQty + 1
            }))
        }
    }
    
    const handleDecrease = () => {
        if (currentQty > 1) {
            dispatch(updateQuantity({
                id: data._id,
                quantity: currentQty - 1
            }))
        } else if (currentQty === 1) {
            dispatch(removeCartItem(data._id))
        }
    }

    return (
        <div className='w-full rounded-2xl border border-[#F0ECE8] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(230,57,70,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group'>
            <div className='relative w-full h-[180px] overflow-hidden bg-[#FFF9F4]'>
                <div className='absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-xs z-10 border border-[#F0ECE8]'>
                    {data.foodType === "veg" ? <FaLeaf className='text-[#269B62] text-xs' /> : <FaDrumstickBite className='text-[#E63946] text-xs' />}
                </div>

                <img src={finalImage} alt={data.name} className='w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105' />
            </div>

            <div className="flex-1 flex flex-col p-4">
                <h3 className='font-bold text-[#202124] text-lg truncate mb-0.5 capitalize' title={data.name}>{data.name}</h3>
                <p className='text-xs font-semibold text-[#77736F] truncate mb-1.5 capitalize' title={data.shop?.name || 'BiteRush'}>
                    {data.shop?.name || 'BiteRush'}
                </p>

                <div className='flex items-center gap-1.5'>
                    <div className='flex items-center'>
                        {renderStars(data.rating?.average || 0)}
                    </div>
                    <span className='text-xs font-medium text-[#77736F]'>
                        ({data.rating?.count || 0})
                    </span>
                </div>
            </div>

            <div className='flex items-center justify-between p-4 pt-0 mt-auto'>
                <span className='font-extrabold text-[#202124] text-xl tracking-tight'>
                    ₹{data.price}
                </span>

                {currentQty === 0 ? (
                    <button 
                        onClick={handleAdd}
                        className='px-4 py-1.5 bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] hover:bg-gradient-to-r hover:from-[#FF6B5E] hover:to-[#E63946] hover:text-white rounded-full font-bold text-sm shadow-xs active:scale-95 transition-all duration-200 flex items-center gap-1 cursor-pointer hover:shadow-md hover:shadow-[#E63946]/20'
                    >
                        <FaPlus size={10} />
                        <span>ADD</span>
                    </button>
                ) : (
                    <div className='flex items-center bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white rounded-full shadow-md shadow-[#E63946]/20 px-1 py-0.5 border border-[#E63946] transition-all duration-200'>
                        <button 
                            className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 transition-all text-white cursor-pointer' 
                            onClick={handleDecrease}
                            title="Decrease quantity"
                        >
                            <FaMinus size={10} />
                        </button>
                        <span className='w-7 text-center font-bold text-sm text-white select-none'>
                            {currentQty}
                        </span>
                        <button 
                            className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 transition-all text-white cursor-pointer' 
                            onClick={handleIncrease}
                            title="Increase quantity"
                        >
                            <FaPlus size={10} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FoodCard
