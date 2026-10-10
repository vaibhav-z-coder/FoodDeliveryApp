import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { FaStar } from 'react-icons/fa'
import { IoLocationOutline } from "react-icons/io5";
import { TbReceipt } from "react-icons/tb";
import { getFoodImage } from '../utils/imageMapping';

function UserOrderCard({ data }) {
    const navigate = useNavigate()
    const [selectedRating, setSelectedRating] = useState({})//itemId:rating

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const handleRating = async (itemId, rating) => {
        try {
            const result = await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
            setSelectedRating(prev => ({
                ...prev, [itemId]: rating
            }))
        } catch (error) {
            console.log(error)
        }
    }

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'out for delivery': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className='bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8] p-6 sm:p-8 space-y-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#F0ECE8] pb-4 gap-4'>
                <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-[#FFF0ED] rounded-2xl flex items-center justify-center text-[#E63946] border border-[#FFD9D4]'>
                        <TbReceipt size={24} />
                    </div>
                    <div>
                        <p className='font-bold text-[#202124] text-lg'>
                            Order <span className='text-[#E63946] uppercase tracking-wider font-extrabold'>#{data._id.slice(-6)}</span>
                        </p>
                        <p className='text-sm text-[#77736F] font-medium'>
                            {formatDate(data.createdAt)}
                        </p>
                    </div>
                </div>
                <div className='text-left sm:text-right w-full sm:w-auto bg-[#FFF9F4] sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-[#F0ECE8] sm:border-0'>
                    <p className='text-sm text-[#77736F] font-medium'>
                        Payment: <span className='text-[#202124] font-bold uppercase'>{data.paymentMethod}</span>
                    </p>
                    {data.paymentMethod !== "cod" && <p className='text-xs text-[#77736F]'>Status: {data.payment ? "Paid" : "Pending"}</p>}
                </div>
            </div>

            <div className='space-y-4'>
                {data.shopOrders.map((shopOrder, index) => (
                    <div className='border border-[#F0ECE8] rounded-2xl p-5 bg-[#FFF9F4]/60 space-y-4' key={index}>
                        <div className='flex justify-between items-center border-b border-[#F0ECE8] pb-3'>
                            <h3 className='font-bold text-[#202124] text-lg capitalize'>{shopOrder.shop.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(shopOrder.status)}`}>
                                {shopOrder.status}
                            </span>
                        </div>

                        <div className='flex space-x-4 overflow-x-auto pb-2 custom-scrollbar'>
                            {shopOrder.shopOrderItems.map((item, idx) => (
                                <div key={idx} className='flex-shrink-0 w-[180px] border border-[#F0ECE8] rounded-2xl p-3 bg-white shadow-xs flex flex-col'>
                                    <div className='w-full h-28 rounded-xl overflow-hidden mb-3 bg-[#FFF9F4]'>
                                        <img src={item.item.image && (item.item.image.startsWith('data:image/svg+xml') || item.item.image.includes('<svg')) ? getFoodImage(item.name) : (item.item.image || getFoodImage(item.name))} alt={item.name} className='w-full h-full object-cover hover:scale-105 transition-transform' />
                                    </div>
                                    <p className='text-sm font-bold text-[#202124] truncate capitalize' title={item.name}>{item.name}</p>
                                    <p className='text-xs font-medium text-[#77736F] mt-1 mb-2'>Qty: {item.quantity} × ₹{item.price}</p>
                                    
                                    <div className='mt-auto pt-2 border-t border-[#F0ECE8] flex items-center justify-between'>
                                        <span className='font-bold text-[#202124]'>₹{item.quantity * item.price}</span>
                                    </div>

                                    {shopOrder.status === "delivered" && (
                                        <div className='flex space-x-1 mt-3 justify-center'>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} className={`text-lg cursor-pointer transition-transform hover:scale-110 ${selectedRating[item.item._id] >= star ? 'text-[#FFC857]' : 'text-gray-200'}`} onClick={() => handleRating(item.item._id, star)}>
                                                    <FaStar />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className='flex justify-between items-center pt-2'>
                            <p className='text-sm text-[#77736F] font-medium'>Shop Subtotal</p>
                            <p className='font-bold text-[#202124]'>₹{shopOrder.subtotal}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-[#F0ECE8] pt-6 gap-4'>
                <div className='flex items-center gap-2'>
                    <div className='text-[#E63946]'>
                        <IoLocationOutline size={20} />
                    </div>
                    <p className='text-sm text-[#77736F] font-medium truncate max-w-xs' title={data.deliveryAddress.text}>
                        {data.deliveryAddress.text}
                    </p>
                </div>
                
                <div className='flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end'>
                    <div className='text-right'>
                        <p className='text-xs text-[#77736F] font-semibold uppercase tracking-wider mb-1'>Order Total</p>
                        <p className='font-black text-2xl text-[#E63946]'>₹{data.totalAmount}</p>
                    </div>
                    {data.shopOrders?.[0].status !== 'delivered' && data.shopOrders?.[0].status !== 'cancelled' && (
                        <button className='bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white px-6 py-3 rounded-2xl font-bold shadow-md shadow-[#E63946]/20 hover:from-[#E63946] hover:to-[#D62828] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer' onClick={() => navigate(`/track-order/${data._id}`)}>
                            Track Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserOrderCard
