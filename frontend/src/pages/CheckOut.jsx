import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, setTotalAmount } from '../redux/userSlice';

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap()
    map.setView([location.lat, location.lon], 16, { animate: true })
  }
  return null
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latitude = pos.coords.latitude
          const longitude = pos.coords.longitude
          dispatch(setLocation({ lat: latitude, lon: longitude }))
          getAddressByLatLng(latitude, longitude)
        },
        () => {
          if (userData?.location?.coordinates) {
            const latitude = userData.location.coordinates[1]
            const longitude = userData.location.coordinates[0]
            dispatch(setLocation({ lat: latitude, lon: longitude }))
            getAddressByLatLng(latitude, longitude)
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    } else if (userData?.location?.coordinates) {
      const latitude = userData.location.coordinates[1]
      const longitude = userData.location.coordinates[0]
      dispatch(setLocation({ lat: latitude, lon: longitude }))
      getAddressByLatLng(latitude, longitude)
    }
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      const addr = result?.data?.results?.[0]?.address_line2 || result?.data?.results?.[0]?.formatted
      if (addr) {
        dispatch(setAddress(addr))
        setAddressInput(addr)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    if (!addressInput?.trim()) return
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      const feature = result?.data?.features?.[0]
      if (feature) {
        const { lat, lon } = feature.properties
        dispatch(setLocation({ lat, lon }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems
      }, { withCredentials: true })

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data))
        navigate("/order-placed")
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        const razorpayKeyId = result.data.razorpayKeyId
        openRazorpayWindow(orderId, razorOrder, razorpayKeyId)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert(error?.response?.data?.message || "Something went wrong while placing your order. Please try Cash on Delivery or check the backend logs.")
    }
  }

  const openRazorpayWindow = async (orderId, razorOrder, razorpayKeyId) => {
    // If order is simulated because Razorpay API keys are not configured in backend
    if (razorOrder?.isSimulated) {
      const confirmPayment = window.confirm(
        `[Development Mode] Real Razorpay API credentials are not yet configured in backend/.env.\n\nClick OK to simulate a successful payment of ₹${razorOrder.amount / 100} and complete the order!`
      );
      if (confirmPayment) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            orderId
          }, { withCredentials: true });
          dispatch(addMyOrder(result.data));
          navigate("/order-placed");
        } catch (err) {
          console.error("Simulated payment error:", err);
        }
      }
      return;
    }

    const options = {
      key: razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "BiteRush",
      description: "Fast Food Delivery Website",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          navigate("/order-placed")
        } catch (error) {
          console.log(error)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    setAddressInput(address)
  }, [address])

  return (
    <div className='min-h-screen bg-[#FFF9F4] flex justify-center p-4 md:p-8 relative text-[#202124]'>
      <div className='absolute top-4 md:top-8 left-4 md:left-8 cursor-pointer p-2 hover:bg-[#FFF0ED] rounded-full transition-colors text-[#E63946] z-10 border border-[#F0ECE8] bg-white shadow-xs' onClick={() => navigate(-1)}>
        <IoIosArrowRoundBack size={28} />
      </div>
      
      <div className='w-full max-w-4xl flex flex-col gap-8'>
        <h1 className='text-3xl font-black text-[#202124] tracking-tight text-center md:text-left md:ml-16 mt-2 mb-2'>Secure Checkout</h1>
        
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Location Section */}
            <section className='bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8] p-6 md:p-8'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold flex items-center gap-2 text-[#202124]'>
                  <div className='p-2 bg-[#FFF0ED] border border-[#FFD9D4] rounded-2xl'>
                    <IoLocationSharp className='text-[#E63946]' size={20}/>
                  </div>
                  Delivery Address
                </h2>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className='inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF9F4] hover:bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs'
                  title="Detect again using GPS"
                >
                  <TbCurrentLocation size={14} className="animate-pulse" />
                  <span>Fetch via GPS</span>
                </button>
              </div>

              <p className='text-xs text-[#77736F] font-medium mb-3'>
                Default fetched via GPS. You can freely type or edit your delivery address below:
              </p>
              
              <div className='flex flex-col sm:flex-row gap-3 mb-6'>
                <input 
                  type="text" 
                  className='flex-1 border border-[#F0ECE8] rounded-2xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all bg-[#FFF9F4]/50 text-[#202124] font-medium' 
                  placeholder='Enter street address, building or area...' 
                  value={addressInput} 
                  onChange={(e) => setAddressInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      getLatLngByAddress();
                    }
                  }}
                />
                <div className='flex gap-2 sm:gap-3'>
                  <button 
                    type="button"
                    className='flex-1 sm:flex-none bg-[#202124] hover:bg-black text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer text-xs font-bold' 
                    onClick={getLatLngByAddress}
                    title="Find on Map"
                  >
                    <IoSearchOutline size={16} />
                    <span>Search</span>
                  </button>
                  <button 
                    type="button"
                    className='flex-1 sm:flex-none bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] hover:bg-[#FFE3DE] px-5 py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-xs font-bold' 
                    onClick={getCurrentLocation} 
                    title="Use Current GPS Coordinates"
                  >
                    <TbCurrentLocation size={16} />
                    <span>GPS</span>
                  </button>
                </div>
              </div>
              
              <div className='rounded-2xl border border-[#F0ECE8] overflow-hidden shadow-xs'>
                <div className='h-[300px] w-full flex items-center justify-center bg-[#FFF9F4]'>
                  <MapContainer
                    className={"w-full h-full"}
                    center={[location?.lat, location?.lon]}
                    zoom={16}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap location={location} />
                    <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />
                  </MapContainer>
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className='bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8] p-6 md:p-8'>
              <h2 className='text-xl font-bold mb-4 flex items-center gap-2 text-[#202124]'>
                 <div className='p-2 bg-green-50 border border-green-200 rounded-2xl'>
                  <FaCreditCard className='text-[#269B62]' size={18}/>
                </div>
                Payment Method
              </h2>
              
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${paymentMethod === "cod" ? "border-[#E63946] bg-[#FFF0ED]/40 shadow-xs" : "border-[#F0ECE8] hover:border-gray-300 bg-white"}`} onClick={() => setPaymentMethod("cod")}>
                  <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100/80 shrink-0'>
                    <MdDeliveryDining className='text-[#269B62] text-2xl' />
                  </span>
                  <div>
                    <p className='font-bold text-[#202124]'>Cash On Delivery</p>
                    <p className='text-xs text-[#77736F] mt-0.5 font-medium'>Pay when food arrives</p>
                  </div>
                  {paymentMethod === "cod" && <div className='ml-auto w-4 h-4 rounded-full bg-[#E63946] border-4 border-[#FFD9D4]'></div>}
                </div>
                
                <div className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${paymentMethod === "online" ? "border-[#E63946] bg-[#FFF0ED]/40 shadow-xs" : "border-[#F0ECE8] hover:border-gray-300 bg-white"}`} onClick={() => setPaymentMethod("online")}>
                  <div className='flex -space-x-3 shrink-0'>
                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100/80 ring-2 ring-white z-10'>
                      <FaMobileScreenButton className='text-purple-700 text-xl' />
                    </span>
                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/80 ring-2 ring-white'>
                      <FaCreditCard className='text-blue-700 text-lg' />
                    </span>
                  </div>
                  <div>
                    <p className='font-bold text-[#202124]'>Pay Online</p>
                    <p className='text-xs text-[#77736F] mt-0.5 font-medium'>UPI / Cards / Wallets</p>
                  </div>
                  {paymentMethod === "online" && <div className='ml-auto w-4 h-4 rounded-full bg-[#E63946] border-4 border-[#FFD9D4]'></div>}
                </div>
              </div>
            </section>
          </div>

          <div className='lg:col-span-1'>
            {/* Order Summary */}
            <section className='bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8] p-6 md:p-8 sticky top-6'>
              <h2 className='text-xl font-bold mb-6 text-[#202124] border-b border-[#F0ECE8] pb-3'>Order Summary</h2>
              
              <div className='space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar'>
                {cartItems.map((item,index)=>(
                  <div key={index} className='flex justify-between items-start gap-4'>
                    <div className='flex-1'>
                      <p className='font-bold text-[#202124] text-sm capitalize'>{item.name}</p>
                      <p className='text-xs text-[#77736F] font-medium'>Qty: {item.quantity}</p>
                    </div>
                    <span className='font-bold text-[#202124] text-sm'>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className='border-t border-dashed border-[#F0ECE8] pt-4 space-y-3 mb-6'>
                <div className='flex justify-between font-medium text-[#77736F] text-sm'>
                  <span>Subtotal</span>
                  <span className='text-[#202124] font-bold'>₹{totalAmount}</span>
                </div>
                <div className='flex justify-between font-medium text-[#77736F] text-sm'>
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-[#269B62] font-bold" : "text-[#202124] font-bold"}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                </div>
              </div>
              
              <div className='flex justify-between items-center text-xl font-extrabold text-[#202124] pt-4 border-t border-[#F0ECE8] mb-8'>
                <span>Total</span>
                <span className='text-[#E63946] text-3xl font-black'>₹{AmountWithDeliveryFee}</span>
              </div>
              
              <button className='w-full bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white py-4 rounded-2xl font-bold text-lg shadow-md shadow-[#E63946]/20 hover:from-[#E63946] hover:to-[#D62828] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer' onClick={handlePlaceOrder}>
                {paymentMethod === "cod" ? "Place Order (COD)" : "Pay & Place Order"}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckOut
