import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';


function MyOrders() {
  const { userData, myOrders, socket} = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  useEffect(() => {
    socket?.on('newOrder', (data) => {
      if(data.shopOrders?.owner._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]))
      }
    })

    socket?.on('update-status', ({orderId, shopId, status, userId}) => {
      if(!userId || userId === userData._id) {
        dispatch(updateRealtimeOrderStatus({orderId, shopId, status}))
      }
    })

    return () => {
      socket?.off('newOrder')
      socket?.off('update-status')
    }
  }, [socket, myOrders])

  return (
    <div className='min-h-screen bg-[#FFF9F4] flex justify-center px-4 md:px-8 py-6 text-[#202124]'>
      <div className='w-full max-w-3xl'>

        <div className='flex items-center gap-4 mb-8 sticky top-0 bg-[#FFF9F4]/90 backdrop-blur py-4 z-10 border-b border-[#F0ECE8]'>
          <div className='cursor-pointer p-2 hover:bg-[#FFF0ED] rounded-full transition-colors text-[#E63946]' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={32} />
          </div>
          <h1 className='text-3xl font-extrabold text-[#202124] tracking-tight'>My Orders</h1>
        </div>
        
        {myOrders?.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8]'>
            <div className='w-24 h-24 bg-[#FFF0ED] rounded-full flex items-center justify-center mb-6 text-[#E63946] text-4xl opacity-80 border border-[#FFD9D4]'>🧾</div>
            <p className='text-[#202124] font-bold text-xl mb-2'>No orders yet</p>
            <p className='text-[#77736F] mb-8 font-medium'>You haven't placed any orders yet.</p>
            {userData.role === "user" && <button className='bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white px-8 py-3 rounded-2xl font-bold shadow-md shadow-[#E63946]/20 hover:from-[#E63946] hover:to-[#D62828] active:scale-95 transition-all cursor-pointer' onClick={() => navigate("/")}>
                Order Now
            </button>}
          </div>
        ) : (
          <div className='space-y-6 pb-20'>
            {myOrders?.map((order,index) => (
              userData.role === "user" ?
              (
                <UserOrderCard data={order} key={index}/>
              )
              :
              userData.role === "owner" ? (
                <OwnerOrderCard data={order} key={index}/>
              )
              :
              null
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders
