import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'
import { MdPhone } from "react-icons/md";
import { FaStore } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";

function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState() 
    const navigate = useNavigate()
    const {socket} = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})
    
    const [deliveryOtp, setDeliveryOtp] = useState(null)
    
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!socket) return

        socket.emit('joinOrder', { orderId })

        const handleLocationUpdate = ({deliveryBoyId, latitude, longitude, address}) => {
            setLiveLocations(prev => ({
                ...prev,
                [deliveryBoyId]: {
                    lat: latitude,
                    lon: longitude,
                    address: address || prev[deliveryBoyId]?.address
                }
            }))
        }

        const handleStatusUpdate = (data) => {
            if (data.orderId === orderId) {
                setCurrentOrder(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        shopOrders: prev.shopOrders?.map(so => {
                            if (String(so._id) === String(data.shopOrderId) || String(so.shop?._id || so.shop) === String(data.shopId)) {
                                return {
                                    ...so,
                                    status: data.status,
                                    assignedDeliveryBoy: data.assignedDeliveryBoy || so.assignedDeliveryBoy
                                }
                            }
                            return so
                        })
                    }
                })
                handleGetOrder()
            }
        }

        const handleOrderAssigned = (data) => {
            if (data.orderId === orderId) {
                setCurrentOrder(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        shopOrders: prev.shopOrders?.map(so => {
                            if (String(so._id) === String(data.shopOrderId) || String(so.shop?._id || so.shop) === String(data.shopId)) {
                                return {
                                    ...so,
                                    assignedDeliveryBoy: data.assignedDeliveryBoy,
                                    status: data.status || so.status
                                }
                            }
                            return so
                        })
                    }
                })
                handleGetOrder()
            }
        }

        const handleOrderPickedUp = (data) => {
            if (data.orderId === orderId) {
                setCurrentOrder(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        shopOrders: prev.shopOrders?.map(so => {
                            if (String(so._id) === String(data.shopOrderId)) {
                                return { ...so, status: "out of delivery" }
                            }
                            return so
                        })
                    }
                })
                handleGetOrder()
            }
        }

        const handleOrderDelivered = (data) => {
            if (data.orderId === orderId) {
                setCurrentOrder(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        shopOrders: prev.shopOrders?.map(so => {
                            if (String(so._id) === String(data.shopOrderId)) {
                                return { ...so, status: "delivered" }
                            }
                            return so
                        })
                    }
                })
                setDeliveryOtp(null)
                handleGetOrder()
            }
        }

        const handleDeliveryOtp = (data) => {
            if (data.orderId === orderId && data.otp) {
                setDeliveryOtp(data.otp)
            }
        }

        socket.on('updateDeliveryLocation', handleLocationUpdate)
        socket.on('update-status', handleStatusUpdate)
        socket.on('orderAssigned', handleOrderAssigned)
        socket.on('orderPickedUp', handleOrderPickedUp)
        socket.on('orderDelivered', handleOrderDelivered)
        socket.on('deliveryOtp', handleDeliveryOtp)
        
        return () => {
            socket.emit('leaveOrder', { orderId })
            socket.off('updateDeliveryLocation', handleLocationUpdate)
            socket.off('update-status', handleStatusUpdate)
            socket.off('orderAssigned', handleOrderAssigned)
            socket.off('orderPickedUp', handleOrderPickedUp)
            socket.off('orderDelivered', handleOrderDelivered)
            socket.off('deliveryOtp', handleDeliveryOtp)
        }
    }, [socket, orderId])

    useEffect(() => {
        handleGetOrder()
    }, [orderId])

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'preparing': return 'bg-orange-100 text-orange-800'
            case 'out for delivery':
            case 'out of delivery': return 'bg-blue-100 text-blue-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className='min-h-screen bg-[#FFF9F4] py-6 px-4 md:px-8 text-[#202124]'>
            <div className='max-w-4xl mx-auto flex flex-col gap-8'>
                
                <div className='flex items-center gap-4 mb-2 sticky top-0 bg-[#FFF9F4]/90 backdrop-blur py-4 z-10 border-b border-[#F0ECE8]'>
                    <div className='cursor-pointer p-2 hover:bg-[#FFF0ED] rounded-full transition-colors text-[#E63946]' onClick={() => navigate(-1)}>
                        <IoIosArrowRoundBack size={32} />
                    </div>
                    <h1 className='text-3xl font-extrabold text-[#202124] tracking-tight'>Track Order</h1>
                    {currentOrder && (
                        <span className='ml-auto bg-white text-[#77736F] px-3 py-1 rounded-full text-sm font-bold border border-[#F0ECE8] shadow-xs'>
                            #{currentOrder._id.slice(-6)}
                        </span>
                    )}
                </div>

                <div className='flex flex-col gap-8 pb-20'>
                    {currentOrder?.shopOrders?.map((shopOrder, index) => (
                        <div className='bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8] space-y-6' key={index}>
                            <div className='flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#F0ECE8] pb-6'>
                                <div>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <div className='w-10 h-10 bg-[#FFF0ED] rounded-xl flex items-center justify-center text-[#E63946] border border-[#FFD9D4]'>
                                            <FaStore size={18} />
                                        </div>
                                        <p className='text-xl font-bold text-[#202124]'>{shopOrder.shop.name}</p>
                                    </div>
                                    <p className='text-[#77736F] font-medium ml-13'><span className='text-gray-400'>Items:</span> {shopOrder.shopOrderItems?.map(i => i.name).join(", ")}</p>
                                    <p className='text-[#202124] font-bold ml-13 mt-1'><span className='text-gray-400 font-medium'>Subtotal:</span> ₹{shopOrder.subtotal}</p>
                                </div>
                                
                                <div className='flex flex-col items-start md:items-end gap-2'>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(shopOrder.status)}`}>
                                        {shopOrder.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className='bg-[#FFF9F4] rounded-2xl p-5 border border-[#F0ECE8]'>
                                <p className='text-sm text-[#77736F] font-bold uppercase tracking-wider mb-2'>Delivery Address</p>
                                <p className='text-[#202124] font-medium'>{currentOrder.deliveryAddress?.text}</p>
                            </div>

                            {shopOrder.status !== "delivered" && shopOrder.status !== "cancelled" ? (
                                <div className='bg-blue-50/50 border border-blue-100 rounded-2xl p-5'>
                                    {shopOrder.assignedDeliveryBoy ? (
                                        <div className='flex items-center gap-4'>
                                            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl'>
                                                {shopOrder.assignedDeliveryBoy.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className='text-xs text-blue-500 font-bold uppercase tracking-wider mb-0.5'>Delivery Partner</p>
                                                <p className='font-bold text-blue-900'>{shopOrder.assignedDeliveryBoy.fullName}</p>
                                                <p className='text-sm font-medium text-blue-700 flex items-center gap-1 mt-0.5'>
                                                    <MdPhone size={14}/> {shopOrder.assignedDeliveryBoy.mobile}
                                                </p>
                                                {(liveLocations[shopOrder.assignedDeliveryBoy._id]?.address || shopOrder.assignedDeliveryBoy.currentAddress) && (
                                                    <p className='text-xs text-blue-800 font-semibold flex items-center gap-1 mt-1 bg-blue-100/70 px-2 py-0.5 rounded-md w-fit'>
                                                        <FaMapMarkerAlt size={11} className="text-[#E63946]" />
                                                        Near: {liveLocations[shopOrder.assignedDeliveryBoy._id]?.address || shopOrder.assignedDeliveryBoy.currentAddress}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 bg-[#FFF0ED] rounded-full flex items-center justify-center border border-[#FFD9D4]'>
                                                <div className='w-4 h-4 bg-[#E63946] rounded-full animate-pulse'></div>
                                            </div>
                                            <div>
                                                <p className='font-bold text-[#202124]'>Assigning Partner</p>
                                                <p className='text-sm text-[#77736F] font-medium'>Waiting for a delivery partner to accept your order...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : shopOrder.status === "delivered" && (
                                <div className='bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center justify-center'>
                                    <p className='text-green-600 font-bold text-lg flex items-center gap-2'>
                                        <span className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>✓</span>
                                        Order Delivered Successfully
                                    </p>
                                </div>
                            )}

                            {(deliveryOtp || shopOrder.deliveryOtp) && shopOrder.status !== "delivered" && (
                                <div className='bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-amber-800 font-bold text-lg'>
                                            🔑
                                        </div>
                                        <div>
                                            <p className='font-bold text-amber-900'>Delivery Verification OTP</p>
                                            <p className='text-xs text-amber-700 font-medium'>Share this 4-digit OTP with your delivery partner upon arrival</p>
                                        </div>
                                    </div>
                                    <div className='bg-white px-6 py-2 rounded-xl border border-amber-300 shadow-sm'>
                                        <span className='font-mono font-black text-2xl tracking-widest text-amber-900'>{deliveryOtp || shopOrder.deliveryOtp}</span>
                                    </div>
                                </div>
                            )}

                            {(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && shopOrder.status !== "cancelled") && (
                                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
                                    <DeliveryBoyTracking data={{
                                        deliveryBoyLocation: liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                                            lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                                            lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                                        },
                                        customerLocation: {
                                            lat: currentOrder.deliveryAddress.latitude,
                                            lon: currentOrder.deliveryAddress.longitude
                                        }
                                    }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TrackOrderPage
