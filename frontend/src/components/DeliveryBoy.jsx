import React, { useEffect, useState, useRef } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { 
  FaMapMarkerAlt, 
  FaCheck, 
  FaBoxOpen, 
  FaMotorcycle, 
  FaStore, 
  FaRoute, 
  FaArrowRight 
} from 'react-icons/fa'
import { MdOutlineMyLocation, MdVerified } from 'react-icons/md'
import { FiPackage, FiClock, FiActivity } from 'react-icons/fi'

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [locationAddress, setLocationAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isManualLocation, setIsManualLocation] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualAddressInput, setManualAddressInput] = useState("")
  const [manualLoading, setManualLoading] = useState(false)
  const lastGeocodedRef = useRef({ lat: 0, lon: 0, time: 0 })

  const fetchAddressName = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIKEY
      let address = ""
      if (apiKey) {
        try {
          const res = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`
          )
          const loc = res?.data?.results?.[0]
          if (loc) {
            const parts = [
              loc.name && loc.name !== loc.street && loc.name !== loc.city ? loc.name : null,
              loc.hamlet || loc.suburb || loc.district,
              loc.city || loc.town || loc.village || loc.county
            ].filter(Boolean)

            if (parts.length > 0) {
              address = parts.join(", ")
            } else if (loc.address_line1 && loc.address_line2) {
              address = `${loc.address_line1}, ${loc.address_line2}`
            } else {
              address = loc.formatted || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
            }
          }
        } catch (apiErr) {
          console.warn("Geoapify reverse geocode fallback:", apiErr.message)
        }
      }

      if (!address) {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          )
          const d = res?.data?.address
          if (d) {
            const parts = [
              d.suburb || d.neighbourhood || d.hamlet || d.residential,
              d.city || d.town || d.village || d.county
            ].filter(Boolean)
            address = parts.join(", ") || res?.data?.display_name
          }
        } catch (nomErr) {
          console.warn("Nominatim fallback notice:", nomErr.message)
        }
      }

      if (address) {
        setLocationAddress(address)
        socket?.emit('updateLocation', {
          latitude: lat,
          longitude: lon,
          address,
          userId: userData._id
        })
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err)
    }
  }

  const handleSetManualLocation = async (e) => {
    e?.preventDefault()
    if (!manualAddressInput.trim()) return
    setManualLoading(true)
    try {
      const apiKey = import.meta.env.VITE_GEOAPIKEY
      let lat = deliveryBoyLocation?.lat || 28.6139
      let lon = deliveryBoyLocation?.lon || 77.2090
      let resolvedAddress = manualAddressInput.trim()

      if (apiKey) {
        try {
          const res = await axios.get(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(manualAddressInput)}&apiKey=${apiKey}`
          )
          const feature = res?.data?.features?.[0]
          if (feature) {
            lat = feature.properties.lat
            lon = feature.properties.lon
            resolvedAddress = feature.properties.formatted || feature.properties.address_line1 || manualAddressInput.trim()
          }
        } catch (err) {
          console.log("Geoapify search error:", err)
        }
      }

      setDeliveryBoyLocation({ lat, lon })
      setLocationAddress(resolvedAddress)
      setIsManualLocation(true)
      setShowManualInput(false)

      socket?.emit('updateLocation', {
        latitude: lat,
        longitude: lon,
        address: resolvedAddress,
        userId: userData._id
      })

      await axios.post(`${serverUrl}/api/user/update-location`, { lat, lon }, { withCredentials: true })
    } catch (error) {
      console.error("Error setting manual location:", error)
    } finally {
      setManualLoading(false)
    }
  }

  const handleSwitchToGps = () => {
    setIsManualLocation(false)
    setShowManualInput(false)
    setManualAddressInput("")
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setDeliveryBoyLocation({ lat, lon })
        fetchAddressName(lat, lon)
      })
    }
  }

  // Pre-load from user coordinates if available
  useEffect(() => {
    if (!userData || userData.role !== "deliveryBoy") return
    if (userData.location?.coordinates?.[0] && userData.location?.coordinates?.[1] && !deliveryBoyLocation) {
      const lon = userData.location.coordinates[0]
      const lat = userData.location.coordinates[1]
      setDeliveryBoyLocation({ lat, lon })
      lastGeocodedRef.current = { lat, lon, time: Date.now() }
      fetchAddressName(lat, lon)
    }
  }, [userData])

  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy" || isManualLocation) return
    let watchId
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (isManualLocation) return
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          setDeliveryBoyLocation({ lat: latitude, lon: longitude })

          const moved =
            Math.abs(latitude - lastGeocodedRef.current.lat) > 0.0008 ||
            Math.abs(longitude - lastGeocodedRef.current.lon) > 0.0008 ||
            Date.now() - lastGeocodedRef.current.time > 45000

          if (moved) {
            lastGeocodedRef.current = { lat: latitude, lon: longitude, time: Date.now() }
            fetchAddressName(latitude, longitude)
          }

          socket.emit('updateLocation', {
            latitude,
            longitude,
            address: locationAddress,
            userId: userData._id
          })
        },
        (error) => {
          console.log(error)
        },
        {
          enableHighAccuracy: true
        }
      )
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [socket, userData, locationAddress, isManualLocation])

  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)
  const completedDeliveriesCount = todayDeliveries.reduce((sum, d) => sum + d.count, 0)

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true })
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
      setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })
      console.log(result.data)
      await getCurrentOrder()
      await getAssignments()
    } catch (error) {
      console.log(error)
    }
  }

  const pickupOrder = async () => {
    if (!currentOrder) return
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/order/pickup-order`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true })
      console.log(result.data)
      await getCurrentOrder()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!socket) return

    const handleNewAssignment = (data) => {
      setAvailableAssignments(prev => {
        if (!prev) return [data]
        if (prev.some(a => String(a.assignmentId) === String(data.assignmentId))) return prev
        return [data, ...prev]
      })
    }

    const handleAssignmentAccepted = ({ assignmentId }) => {
      setAvailableAssignments(prev => prev ? prev.filter(a => String(a.assignmentId) !== String(assignmentId)) : [])
    }

    socket.on("newAssignment", handleNewAssignment)
    socket.on("assignmentAccepted", handleAssignmentAccepted)

    return () => {
      socket.off("newAssignment", handleNewAssignment)
      socket.off("assignmentAccepted", handleAssignmentAccepted)
    }
  }, [socket])

  useEffect(() => {
    if (socket && currentOrder?._id) {
      socket.emit('joinOrder', { orderId: currentOrder._id })
      return () => {
        socket.emit('leaveOrder', { orderId: currentOrder._id })
      }
    }
  }, [socket, currentOrder?._id])

  const sendOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true })
      setLoading(false)
      setShowOtpBox(true)
      console.log(result.data)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp
        },
        {
          withCredentials: true
        }
      )
      console.log(result.data)
      setMessage(result.data.message)
      setCurrentOrder(null)
      setShowOtpBox(false)
      setOtp("")
      await getAssignments()
      await handleTodayDeliveries()
    } catch (error) {
      console.log(
        "VERIFY OTP ERROR:",
        error.response?.data || error.message
      )
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true })
      console.log(result.data)
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()
  }, [userData])

  return (
    <div className='w-full min-h-screen bg-[#FFF9F4] text-[#202124] flex flex-col items-center pb-24'>
      <Nav />

      <div className='w-full max-w-5xl flex flex-col gap-8 px-4 sm:px-6 mt-4'>

        {/* Hero Banner: Rider Info & Locality */}
        <div className='bg-white rounded-3xl p-6 sm:p-8 border border-[#F0ECE8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden'>
          {/* Subtle Warm Ambient Glow */}
          <div className='absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#FFD9D4]/50 to-[#FFE8D6]/30 rounded-full blur-3xl pointer-events-none' />

          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 relative z-10'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E63946] to-[#FF6B5E] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#E63946]/20 ring-4 ring-[#FFF0ED] flex-shrink-0'>
                {userData?.fullName?.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <h1 className='text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight'>
                    {userData?.fullName}
                  </h1>
                  <MdVerified className='text-[#E63946] text-xl' title='Verified Partner' />
                </div>
                <p className='text-xs sm:text-sm text-[#77736F] font-medium flex items-center gap-2 mt-0.5'>
                  <span>BiteRush Fleet Delivery Partner</span>
                  <span className='w-1.5 h-1.5 rounded-full bg-[#D1CCC7]'></span>
                  <span className='text-[#E63946] font-semibold'>ID: #{userData?._id?.slice(-6).toUpperCase()}</span>
                </p>
              </div>
            </div>

            {/* Online Status Badge */}
            <div className='flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#E9F7EF] border border-[#C5E8D5] text-[#269B62] shadow-xs'>
              <span className='relative flex h-2.5 w-2.5'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#269B62] opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-[#269B62]'></span>
              </span>
              <span className='text-xs font-bold tracking-wide'>Online & Accepting Orders</span>
            </div>
          </div>

          {/* Locality & GPS Details Strip with Manual Option */}
          <div className='mt-6 pt-5 border-t border-[#F0ECE8] flex flex-col gap-4'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex items-center gap-2.5 flex-wrap'>
                <div className='p-2 rounded-xl bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4]'>
                  <FaMapMarkerAlt className='text-sm' />
                </div>
                <span className='text-xs font-bold text-[#77736F] uppercase tracking-wider'>Current Zone:</span>
                <span className='text-sm sm:text-base font-bold text-[#202124] bg-[#FFF9F4] px-3.5 py-1 rounded-xl border border-[#F0ECE8] shadow-xs'>
                  {locationAddress ? locationAddress : (deliveryBoyLocation ? "Resolving area name..." : "Fetching GPS location...")}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isManualLocation 
                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                    : "bg-[#E9F7EF] text-[#269B62] border-[#C5E8D5]"
                }`}>
                  {isManualLocation ? "Manual Zone" : "GPS (Default)"}
                </span>
              </div>

              <div className='flex items-center gap-3'>
                {isManualLocation ? (
                  <button
                    type="button"
                    onClick={handleSwitchToGps}
                    className='px-3.5 py-1.5 rounded-xl bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] hover:bg-[#FFE3DE] text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5'
                  >
                    <MdOutlineMyLocation size={14} className="animate-spin" />
                    <span>Switch to Live GPS</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowManualInput(prev => !prev)}
                    className='px-3.5 py-1.5 rounded-xl bg-[#FFF9F4] text-[#202124] border border-[#F0ECE8] hover:border-[#FFD9D4] hover:text-[#E63946] text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5'
                  >
                    <span>{showManualInput ? "Close" : "Change Zone Manually ✏️"}</span>
                  </button>
                )}

                {deliveryBoyLocation && (
                  <div className='hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#77736F] bg-[#FFF9F4] px-3 py-1.5 rounded-xl border border-[#F0ECE8]'>
                    <MdOutlineMyLocation className='text-[#E63946]' />
                    <span>{deliveryBoyLocation.lat.toFixed(4)}, {deliveryBoyLocation.lon.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Expandable Manual Zone Input Form */}
            {showManualInput && (
              <form onSubmit={handleSetManualLocation} className='bg-[#FFF9F4] p-4 rounded-2xl border border-[#F0ECE8] flex flex-col sm:flex-row items-center gap-3 animate-in fade-in duration-200'>
                <div className='flex-1 w-full'>
                  <input
                    type="text"
                    placeholder="Enter locality / city manually (e.g. Connaught Place, New Delhi)..."
                    value={manualAddressInput}
                    onChange={(e) => setManualAddressInput(e.target.value)}
                    className='w-full px-4 py-2.5 rounded-xl bg-white border border-[#F0ECE8] text-[#202124] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#E63946]'
                  />
                </div>
                <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
                  <button
                    type="submit"
                    disabled={manualLoading || !manualAddressInput.trim()}
                    className='px-5 py-2.5 bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white rounded-xl text-xs font-bold shadow-md shadow-[#E63946]/20 hover:from-[#E63946] hover:to-[#D62828] active:scale-95 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap'
                  >
                    {manualLoading ? "Updating..." : "Set Zone"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className='px-3.5 py-2.5 bg-white text-[#77736F] border border-[#F0ECE8] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
          {/* Earnings Card */}
          <div className='bg-white rounded-3xl p-6 border border-[#F0ECE8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgb(230,57,70,0.06)] hover:border-[#FFD9D4] transition-all flex flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-xs font-bold tracking-wider uppercase text-[#77736F]'>Today's Earnings</span>
                <div className='w-11 h-11 rounded-2xl bg-[#FFF0ED] text-[#E63946] font-extrabold text-xl flex items-center justify-center border border-[#FFD9D4] shadow-xs'>
                  ₹
                </div>
              </div>
              <div className='text-4xl sm:text-5xl font-black text-[#202124] tracking-tight mb-1'>
                ₹{totalEarning}
              </div>
              <p className='text-xs text-[#77736F] font-medium'>
                Fixed rate: <span className='text-[#E63946] font-bold'>₹{ratePerDelivery}</span> / delivered order
              </p>
            </div>
            <div className='mt-5 pt-3 border-t border-[#F0ECE8] flex items-center justify-between text-xs'>
              <span className='text-[#77736F]'>Payout Status</span>
              <span className='text-[#269B62] font-bold'>Instant Credit Ready</span>
            </div>
          </div>

          {/* Deliveries Completed Card */}
          <div className='bg-white rounded-3xl p-6 border border-[#F0ECE8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgb(0,0,0,0.06)] transition-all flex flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-xs font-bold tracking-wider uppercase text-[#77736F]'>Completed Drops</span>
                <div className='w-11 h-11 rounded-2xl bg-[#FFF9F4] text-[#E63946] font-extrabold text-lg flex items-center justify-center border border-[#F0ECE8] shadow-xs'>
                  <FiPackage />
                </div>
              </div>
              <div className='text-4xl sm:text-5xl font-black text-[#202124] tracking-tight mb-1'>
                {completedDeliveriesCount}
              </div>
              <p className='text-xs text-[#77736F] font-medium'>
                Orders delivered on-time today
              </p>
            </div>
            <div className='mt-5 pt-3 border-t border-[#F0ECE8] flex items-center justify-between text-xs'>
              <span className='text-[#77736F]'>Reliability Score</span>
              <span className='text-[#269B62] font-bold flex items-center gap-1'>
                <span>100% Target Met</span>
              </span>
            </div>
          </div>

          {/* Hourly Bar Chart */}
          <div className='bg-white rounded-3xl p-6 border border-[#F0ECE8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-xs font-bold tracking-wider uppercase text-[#77736F]'>Deliveries by Hour</span>
              <FiActivity className='text-[#E63946] text-lg' />
            </div>

            {todayDeliveries.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={todayDeliveries} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECE8" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11, fill: '#77736F' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#77736F' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [value, "Deliveries"]} 
                    labelFormatter={label => `${label}:00`} 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#F0ECE8', 
                      borderRadius: '16px',
                      color: '#202124',
                      fontSize: '12px',
                      boxShadow: '0 8px 30px rgb(0 0 0 / 0.08)'
                    }} 
                  />
                  <Bar dataKey="count" fill='#E63946' radius={[6, 6, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[120px] flex flex-col items-center justify-center text-[#77736F] font-medium text-xs bg-[#FFF9F4] rounded-2xl border border-dashed border-[#F0ECE8] gap-1'>
                <FiClock className='text-base text-[#77736F]' />
                <span>No deliveries recorded yet today</span>
              </div>
            )}

            <div className='mt-3 pt-3 border-t border-[#F0ECE8] text-right'>
              <span className='text-[11px] text-[#77736F]'>Updated live via socket</span>
            </div>
          </div>
        </div>

        {/* Available Orders Section (When no order is actively assigned) */}
        {!currentOrder && (
          <div className='bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0ECE8] w-full'>
            <div className='flex items-center justify-between mb-6 pb-4 border-b border-[#F0ECE8]'>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-[#FFF0ED] text-[#E63946] rounded-2xl border border-[#FFD9D4]'>
                  <FaBoxOpen size={20} />
                </div>
                <div>
                  <h2 className='text-xl sm:text-2xl font-extrabold text-[#202124]'>Available Orders Near You</h2>
                  <p className='text-xs text-[#77736F] mt-0.5'>Ready for pickup from restaurants in your active locality</p>
                </div>
              </div>
              <span className='px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4]'>
                {availableAssignments?.length || 0} Ready
              </span>
            </div>

            <div className='space-y-4'>
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div 
                    key={index} 
                    className='bg-white border border-[#F0ECE8] hover:border-[#FFD9D4] hover:shadow-[0_8px_30px_rgb(230,57,70,0.08)] rounded-2xl p-5 sm:p-6 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5'
                  >
                    <div className='flex-1 space-y-3'>
                      <div className='flex items-center gap-3'>
                        <span className='p-2 rounded-xl bg-[#FFF9F4] text-[#E63946] border border-[#F0ECE8]'>
                          <FaStore size={16} />
                        </span>
                        <h3 className='text-lg sm:text-xl font-bold text-[#202124]'>{a?.shopName}</h3>
                        <span className='px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#E9F7EF] text-[#269B62] border border-[#C5E8D5]'>
                          ₹{a.subtotal}
                        </span>
                      </div>

                      {/* Route flow summary */}
                      <div className='flex items-start gap-2.5 text-xs text-[#202124] bg-[#FFF9F4] p-3 rounded-xl border border-[#F0ECE8]'>
                        <FaRoute className='text-[#E63946] text-sm mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='font-bold text-[#202124]'>Customer Drop Address:</p>
                          <p className='text-[#77736F] leading-relaxed'>{a?.deliveryAddress?.text}</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <span className='px-2.5 py-1 bg-[#FFF9F4] text-[#77736F] text-xs font-bold rounded-lg border border-[#F0ECE8]'>
                          {a.items?.length} items
                        </span>
                        <span className='text-xs text-[#77736F]'>
                          Estimated Payout: <strong className='text-[#269B62] font-bold'>₹50</strong>
                        </span>
                      </div>
                    </div>

                    <button 
                      className='w-full md:w-auto bg-gradient-to-r from-[#FF6B5E] to-[#E63946] hover:from-[#E63946] hover:to-[#D62839] text-white font-bold px-8 py-3.5 rounded-2xl shadow-md shadow-[#E63946]/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base' 
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      <FaMotorcycle size={18} />
                      <span>Accept Delivery</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className='text-center py-14 bg-[#FFF9F4] rounded-2xl border border-dashed border-[#F0ECE8] flex flex-col items-center justify-center gap-3'>
                  <div className='relative flex h-12 w-12'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-15'></span>
                    <div className='relative inline-flex rounded-full h-12 w-12 bg-white border border-[#FFD9D4] items-center justify-center text-[#E63946] text-xl shadow-xs'>
                      <FaMotorcycle />
                    </div>
                  </div>
                  <p className='text-[#202124] font-bold text-base'>Scanning for nearby orders in {locationAddress || 'your zone'}...</p>
                  <p className='text-[#77736F] text-xs max-w-md'>Keep this page open. New orders from nearby restaurants will appear here instantly in real-time.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Delivery Console (When rider is on active duty with an order) */}
        {currentOrder && (
          <div className='bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(230,57,70,0.06)] border-2 border-[#FFD9D4] w-full relative overflow-hidden'>
            <div className='flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F0ECE8]'>
              <div className='flex items-center gap-3'>
                <span className='relative flex h-3 w-3'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#269B62] opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-3 w-3 bg-[#269B62]'></span>
                </span>
                <h2 className='text-xl sm:text-2xl font-extrabold text-[#202124]'>Active Delivery Mission</h2>
              </div>

              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                currentOrder?.shopOrder.status === 'out of delivery' 
                  ? 'bg-[#E9F7EF] text-[#269B62] border-[#C5E8D5]' 
                  : 'bg-[#FFF0ED] text-[#E63946] border-[#FFD9D4]'
              }`}>
                {currentOrder?.shopOrder.status === 'out of delivery' ? '🚚 Out for Delivery (En Route)' : '📦 Assigned (Pickup from Restaurant)'}
              </span>
            </div>

            {/* Delivery Stepper */}
            <div className='grid grid-cols-3 gap-2 mb-6 bg-[#FFF9F4] p-3 rounded-2xl border border-[#F0ECE8]'>
              <div className='flex items-center gap-2 text-xs font-bold text-[#269B62] px-2 py-1'>
                <span className='w-5 h-5 rounded-full bg-[#E9F7EF] text-[#269B62] flex items-center justify-center text-[10px]'>✓</span>
                <span>1. Accepted</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 ${currentOrder?.shopOrder.status === 'out of delivery' ? 'text-[#269B62]' : 'text-[#E63946]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentOrder?.shopOrder.status === 'out of delivery' ? 'bg-[#E9F7EF] text-[#269B62]' : 'bg-[#FFF0ED] text-[#E63946] animate-pulse'}`}>
                  {currentOrder?.shopOrder.status === 'out of delivery' ? '✓' : '2'}
                </span>
                <span>2. Picked Up</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 ${showOtpBox ? 'text-[#269B62]' : 'text-[#77736F]'}`}>
                <span className='w-5 h-5 rounded-full bg-white text-[#77736F] flex items-center justify-center text-[10px] border border-[#F0ECE8]'>3</span>
                <span>3. Delivered</span>
              </div>
            </div>

            {/* Order Route Detail Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              {/* Pickup Point */}
              <div className='bg-[#FFF9F4] border border-[#F0ECE8] rounded-2xl p-4'>
                <div className='flex items-center gap-2 text-[#E63946] text-xs font-bold uppercase tracking-wider mb-2'>
                  <FaStore />
                  <span>Pickup Restaurant</span>
                </div>
                <p className='text-lg font-bold text-[#202124]'>{currentOrder?.shopOrder.shop.name}</p>
                <div className='flex items-center gap-2 mt-2'>
                  <span className='text-xs font-bold px-2 py-0.5 rounded-md bg-white text-[#77736F] border border-[#F0ECE8]'>
                    {currentOrder.shopOrder.shopOrderItems.length} items
                  </span>
                  <span className='text-xs font-bold px-2 py-0.5 rounded-md bg-[#E9F7EF] text-[#269B62] border border-[#C5E8D5]'>
                    ₹{currentOrder.shopOrder.subtotal}
                  </span>
                </div>
              </div>

              {/* Drop-off Point */}
              <div className='bg-[#FFF9F4] border border-[#F0ECE8] rounded-2xl p-4'>
                <div className='flex items-center gap-2 text-[#269B62] text-xs font-bold uppercase tracking-wider mb-2'>
                  <FaMapMarkerAlt />
                  <span>Customer Destination</span>
                </div>
                <p className='text-lg font-bold text-[#202124]'>{currentOrder.user.fullName}</p>
                <p className='text-xs text-[#77736F] leading-relaxed mt-1'>
                  {currentOrder.deliveryAddress.text}
                </p>
              </div>
            </div>

            {/* Live Map Tracking View */}
            <div className='mb-6'>
              <DeliveryBoyTracking data={{ 
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0]
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }} />
            </div>

            {/* Action Buttons */}
            {currentOrder.shopOrder.status !== "out of delivery" && (
              <button 
                className='w-full bg-gradient-to-r from-[#FF6B5E] to-[#E63946] hover:from-[#E63946] hover:to-[#D62839] text-white font-bold py-4 rounded-2xl shadow-md shadow-[#E63946]/20 active:scale-[0.98] transition-all flex justify-center items-center gap-3 text-base sm:text-lg cursor-pointer mb-3' 
                onClick={pickupOrder} 
                disabled={loading}
              >
                {loading ? <ClipLoader size={22} color='#ffffff' /> : <><FaBoxOpen size={20} /> Pick Up Order from Restaurant</>}
              </button>
            )}

            {!showOtpBox ? (
              <button 
                className='w-full bg-[#269B62] hover:bg-[#208353] text-white font-bold py-4 rounded-2xl shadow-md shadow-[#269B62]/20 active:scale-[0.98] transition-all flex justify-center items-center gap-3 text-base sm:text-lg cursor-pointer' 
                onClick={sendOtp} 
                disabled={loading}
              >
                {loading ? <ClipLoader size={24} color='#ffffff' /> : <><FaCheck size={20} /> Mark As Delivered (Send Customer OTP)</>}
              </button>
            ) : (
              <div className='p-6 border border-[#F0ECE8] rounded-2xl bg-[#FFF9F4] shadow-xs'>
                <div className='text-center mb-4'>
                  <h4 className='text-base font-bold text-[#202124] mb-1'>Verify Customer Delivery OTP</h4>
                  <p className='text-xs text-[#77736F]'>
                    Enter the 4-digit code provided by <span className='font-bold text-[#202124]'>{currentOrder.user.fullName}</span>.
                  </p>
                </div>

                <div className='flex justify-center mb-4'>
                  <input 
                    type="text" 
                    className='w-64 border border-[#F0ECE8] bg-white px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] text-center text-3xl font-mono font-black tracking-[12px] text-[#202124] shadow-xs' 
                    placeholder='••••' 
                    maxLength={4} 
                    onChange={(e) => setOtp(e.target.value)} 
                    value={otp}
                  />
                </div>
                
                {message && (
                  <div className='mb-4 p-3 bg-[#E9F7EF] border border-[#C5E8D5] text-[#269B62] rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2'>
                    <FaCheck /> {message}
                  </div>
                )}

                <button 
                  className="w-full bg-gradient-to-r from-[#FF6B5E] to-[#E63946] hover:from-[#E63946] hover:to-[#D62839] text-white py-3.5 rounded-2xl font-bold shadow-md shadow-[#E63946]/20 active:scale-[0.98] transition-all text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={verifyOtp} 
                  disabled={otp.length < 4}
                >
                  Verify OTP & Complete Delivery
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoy

