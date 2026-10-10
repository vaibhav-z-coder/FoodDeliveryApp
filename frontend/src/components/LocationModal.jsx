import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaLocationDot, FaCity } from 'react-icons/fa6'
import { TbCurrentLocation } from 'react-icons/tb'
import { IoSearchOutline, IoClose } from 'react-icons/io5'
import { FaCheck } from 'react-icons/fa'
import axios from 'axios'
import { serverUrl } from '../App'
import { setCurrentAddress, setCurrentCity, setCurrentState } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'
import { ClipLoader } from 'react-spinners'

const POPULAR_CITIES = [
  'Delhi',
  'New Delhi',
  'Noida',
  'Gurugram',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Kolkata',
  'Jaipur',
  'Lucknow',
  'Vingo Demo'
]

function LocationModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { currentCity } = useSelector(state => state.user)
  const [manualInput, setManualInput] = useState('')
  const [isDetectingGps, setIsDetectingGps] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  if (!isOpen) return null

  // 1. Detect location automatically using GPS Geolocation API
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.')
      return
    }

    setIsDetectingGps(true)
    setStatusMessage('Fetching GPS coordinates...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          dispatch(setLocation({ lat: latitude, lon: longitude }))

          // Reverse geocode via Geoapify
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          )

          const locationData = result?.data?.results?.[0]
          const detectedCity =
            locationData?.city ||
            locationData?.county ||
            locationData?.town ||
            locationData?.village ||
            'New Delhi'
          const state = locationData?.state || ''
          const address =
            locationData?.address_line2 ||
            locationData?.address_line1 ||
            detectedCity

          dispatch(setCurrentCity(detectedCity))
          dispatch(setCurrentState(state))
          dispatch(setCurrentAddress(address))
          dispatch(setAddress(address))

          localStorage.setItem('biteRush_selectedCity', detectedCity)

          // Also sync to backend user location
          try {
            await axios.post(
              `${serverUrl}/api/user/update-location`,
              { lat: latitude, lon: longitude },
              { withCredentials: true }
            )
          } catch (e) {
            console.log(e)
          }

          setIsDetectingGps(false)
          setStatusMessage('')
          onClose()
        } catch (error) {
          console.error('GPS Geocode error:', error)
          setIsDetectingGps(false)
          setStatusMessage('Could not fetch address from coordinates. Try manual entry.')
        }
      },
      (error) => {
        console.error('GPS error:', error)
        setIsDetectingGps(false)
        setStatusMessage('GPS permission denied or timed out. Please enter location manually below.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // 2. Apply a selected / typed city manually
  const applyCity = async (cityName) => {
    if (!cityName || !cityName.trim()) return
    const cleanCity = cityName.trim()
    setIsSearching(true)
    setStatusMessage(`Setting location to "${cleanCity}"...`)

    try {
      // Forward geocode to find coordinates if possible
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cleanCity)}&apiKey=${apiKey}`
      )

      const feature = result?.data?.features?.[0]
      if (feature) {
        const { lat, lon, city, state, formatted } = feature.properties
        const finalCityName = city || cleanCity
        dispatch(setLocation({ lat, lon }))
        dispatch(setCurrentCity(finalCityName))
        dispatch(setCurrentState(state || ''))
        dispatch(setCurrentAddress(formatted || finalCityName))
        dispatch(setAddress(formatted || finalCityName))
        localStorage.setItem('biteRush_selectedCity', finalCityName)

        try {
          await axios.post(
            `${serverUrl}/api/user/update-location`,
            { lat, lon },
            { withCredentials: true }
          )
        } catch (e) {
          console.log(e)
        }
      } else {
        // Fallback: Set manually typed text directly
        dispatch(setCurrentCity(cleanCity))
        dispatch(setCurrentAddress(cleanCity))
        localStorage.setItem('biteRush_selectedCity', cleanCity)
      }

      setIsSearching(false)
      setStatusMessage('')
      onClose()
    } catch (error) {
      console.log('Manual geocode fallback:', error)
      // Even if API fails, user can set city manually
      dispatch(setCurrentCity(cleanCity))
      dispatch(setCurrentAddress(cleanCity))
      localStorage.setItem('biteRush_selectedCity', cleanCity)
      setIsSearching(false)
      setStatusMessage('')
      onClose()
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    applyCity(manualInput)
  }

  return (
    <div className='fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200'>
      <div 
        className='w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.2)] border border-[#F0ECE8] p-6 sm:p-8 flex flex-col gap-6 text-[#202124] max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-[#F0ECE8] pb-4'>
          <div className='flex items-center gap-2.5'>
            <div className='w-10 h-10 bg-[#FFF0ED] border border-[#FFD9D4] rounded-2xl flex items-center justify-center text-[#E63946]'>
              <FaLocationDot size={20} />
            </div>
            <div>
              <h2 className='text-xl font-extrabold text-[#202124] tracking-tight'>Choose Delivery Location</h2>
              <p className='text-xs text-[#77736F] font-medium'>By default GPS is used, or enter manually</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className='p-2 rounded-full hover:bg-[#FFF9F4] text-[#77736F] hover:text-[#202124] transition-colors cursor-pointer border border-[#F0ECE8]'
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Current GPS Option Button */}
        <button
          onClick={handleDetectGps}
          disabled={isDetectingGps}
          className='w-full flex items-center justify-between p-4 rounded-2xl bg-[#FFF9F4] hover:bg-[#FFF0ED] border border-[#F0ECE8] hover:border-[#FFD9D4] transition-all cursor-pointer group shadow-xs'
        >
          <div className='flex items-center gap-3.5 text-left'>
            <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#E63946] shadow-xs border border-[#F0ECE8] group-hover:scale-105 transition-transform'>
              {isDetectingGps ? (
                <ClipLoader size={18} color='#E63946' />
              ) : (
                <TbCurrentLocation size={22} className='animate-pulse' />
              )}
            </div>
            <div>
              <p className='font-bold text-sm text-[#202124] group-hover:text-[#E63946] transition-colors'>
                Use Current Location (GPS)
              </p>
              <p className='text-xs text-[#77736F]'>
                Automatically fetch via Geolocation API
              </p>
            </div>
          </div>
          <span className='text-xs font-bold text-[#E63946] bg-white px-3 py-1 rounded-full border border-[#FFD9D4]'>
            Default
          </span>
        </button>

        {/* Status Notification */}
        {statusMessage && (
          <div className='text-xs font-semibold p-3 rounded-xl bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] text-center'>
            {statusMessage}
          </div>
        )}

        {/* Divider */}
        <div className='relative flex items-center my-1'>
          <div className='flex-grow border-t border-[#F0ECE8]'></div>
          <span className='flex-shrink-0 mx-4 text-[#77736F] text-xs font-bold uppercase tracking-wider'>
            or enter manually
          </span>
          <div className='flex-grow border-t border-[#F0ECE8]'></div>
        </div>

        {/* Manual Location Search Form */}
        <form onSubmit={handleManualSubmit} className='flex flex-col gap-3'>
          <label className='text-xs font-bold uppercase tracking-wider text-[#77736F]'>
            Type City or Locality
          </label>
          <div className='relative flex items-center'>
            <IoSearchOutline className='absolute left-4 text-[#77736F]' size={20} />
            <input
              type='text'
              placeholder='e.g. Mumbai, Connaught Place, Bengaluru...'
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className='w-full pl-11 pr-24 py-3.5 rounded-2xl bg-[#FFF9F4] border border-[#F0ECE8] text-[#202124] text-sm font-medium focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/15 transition-all'
            />
            <button
              type='submit'
              disabled={!manualInput.trim() || isSearching}
              className='absolute right-2 px-4 py-2 bg-gradient-to-r from-[#FF6B5E] to-[#E63946] text-white rounded-xl font-bold text-xs shadow-md shadow-[#E63946]/20 hover:from-[#E63946] hover:to-[#D62828] active:scale-95 transition-all disabled:opacity-50 cursor-pointer'
            >
              {isSearching ? <ClipLoader size={14} color='white' /> : 'Set'}
            </button>
          </div>
        </form>

        {/* Quick Pick Popular Cities */}
        <div className='flex flex-col gap-2.5 pt-1'>
          <div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#77736F]'>
            <FaCity size={12} />
            <span>Popular Cities</span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {POPULAR_CITIES.map((city, idx) => {
              const isSelected = currentCity?.toLowerCase() === city.toLowerCase()
              return (
                <button
                  key={idx}
                  type='button'
                  onClick={() => applyCity(city)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#E63946] text-white shadow-sm shadow-[#E63946]/30'
                      : 'bg-[#FFF9F4] text-[#202124] border border-[#F0ECE8] hover:border-[#FFD9D4] hover:text-[#E63946] hover:bg-[#FFF0ED]'
                  }`}
                >
                  {city}
                  {isSelected && <FaCheck size={9} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Currently Selected Location Footer */}
        <div className='bg-[#FFF9F4] p-3 rounded-2xl border border-[#F0ECE8] flex items-center justify-between text-xs'>
          <span className='text-[#77736F] font-medium'>Active Location:</span>
          <span className='font-bold text-[#E63946] flex items-center gap-1'>
            <FaLocationDot size={12} />
            {currentCity || 'Not selected'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LocationModal
