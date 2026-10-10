import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import LocationModal from './LocationModal';

function Nav() {
    const { userData, currentCity, cartItems } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [query, setQuery] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearchItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
            dispatch(setSearchItems(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (query) {
            handleSearchItems()
        } else {
            dispatch(setSearchItems(null))
        }
    }, [query])

    const isRider = userData?.role === "deliveryBoy"

    return (
        <>
        <div className='w-full h-[80px] flex items-center justify-between px-6 md:px-12 fixed top-0 z-[9999] transition-all duration-300 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-b border-[#F0ECE8] text-[#202124]'>

            {showSearch && userData.role === "user" && <div className='w-[90%] h-[60px] bg-white shadow-xl rounded-2xl items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden border border-[#F0ECE8] overflow-hidden'>
                <div 
                    className='flex items-center w-[45%] overflow-hidden gap-[8px] px-[12px] border-r border-[#F0ECE8] bg-[#FFF9F4] h-full cursor-pointer hover:bg-[#FFF0ED]'
                    onClick={() => setShowLocationModal(true)}
                    title="Change location"
                >
                    <FaLocationDot size={16} className="text-[#E63946] flex-shrink-0" />
                    <div className='w-full truncate text-[#202124] font-bold text-xs'>{currentCity || "Select City"}</div>
                </div>
                <div className='w-[55%] flex items-center gap-[10px] px-[10px] h-full'>
                    <IoIosSearch size={22} className='text-[#77736F] flex-shrink-0' />
                    <input type="text" placeholder='Search food...' className='text-[#202124] placeholder-[#77736F] outline-none w-full text-xs' onChange={(e) => setQuery(e.target.value)} value={query} />
                </div>
            </div>}

            {/* Brand Logo & Fleet Badge & Mobile Location */}
            <div className='flex items-center gap-3'>
                <div className='cursor-pointer' onClick={() => navigate('/')}>
                    <h1 className='text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#E63946] to-[#FF6B5E] bg-clip-text text-transparent hover:opacity-90 transition-opacity'>BiteRush</h1>
                </div>
                {isRider && (
                    <span className='hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4]'>
                        <span className='w-2 h-2 rounded-full bg-[#269B62] animate-pulse'></span>
                        Rider Partner
                    </span>
                )}
                {userData?.role === "user" && (
                    <button 
                        onClick={() => setShowLocationModal(true)}
                        className='md:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F4] border border-[#F0ECE8] hover:border-[#FFD9D4] text-[#202124] text-xs font-bold max-w-[140px] truncate cursor-pointer hover:bg-[#FFF0ED] shadow-xs active:scale-95 transition-all'
                        title="Click to change location"
                    >
                        <FaLocationDot size={12} className="text-[#E63946] flex-shrink-0" />
                        <span className='truncate'>{currentCity || "Set Location"}</span>
                    </button>
                )}
            </div>
            
            {/* User Search Bar with Clickable Location Pill */}
            {userData.role === "user" && <div className='md:w-[50%] lg:w-[45%] h-[50px] bg-[#FFF9F4] rounded-full items-center hidden md:flex border border-[#F0ECE8] focus-within:border-[#E63946] focus-within:ring-2 focus-within:ring-[#E63946]/15 transition-all overflow-hidden'>
                <div 
                    className='flex items-center w-[35%] overflow-hidden gap-[8px] px-[16px] border-r border-[#EAE6E1] h-full cursor-pointer hover:bg-[#FFF0ED]/80 transition-all group'
                    onClick={() => setShowLocationModal(true)}
                    title="Click to change city or enter location manually"
                >
                    <FaLocationDot size={16} className="text-[#E63946] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className='w-full truncate text-[#202124] font-bold text-xs sm:text-sm'>
                        {currentCity || "Select City"}
                    </div>
                    <span className='text-[10px] text-[#E63946] font-semibold hidden lg:inline-block opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                        Change
                    </span>
                </div>
                <div className='w-[65%] flex items-center gap-[10px] px-[15px] h-full'>
                    <IoIosSearch size={22} className='text-[#77736F] flex-shrink-0' />
                    <input type="text" placeholder='Search delicious food...' className='text-[#202124] placeholder-[#77736F] outline-none w-full bg-transparent text-sm' onChange={(e) => setQuery(e.target.value)} value={query} />
                </div>
            </div>}

            {/* Rider Header Status Pill */}
            {isRider && (
                <div className='hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FFF9F4] border border-[#F0ECE8] shadow-xs'>
                    <span className='relative flex h-2.5 w-2.5'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#269B62] opacity-75'></span>
                        <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-[#269B62]'></span>
                    </span>
                    <span className='text-xs font-semibold text-[#202124]'>Online & Accepting Orders</span>
                </div>
            )}

            {/* Actions & Profile */}
            <div className='flex items-center gap-4 sm:gap-5'>
                {userData.role === "user" && (showSearch ? <RxCross2 size={24} className='text-[#202124] md:hidden cursor-pointer hover:text-[#E63946] transition-colors' onClick={() => setShowSearch(false)} /> : <IoIosSearch size={24} className='text-[#202124] md:hidden cursor-pointer hover:text-[#E63946] transition-colors' onClick={() => setShowSearch(true)} />)
                }
                
                {userData.role === "owner" ? (
                    <>
                        {myShopData && <> 
                            <button className='hidden md:flex items-center gap-2 px-4 py-2 cursor-pointer rounded-full bg-[#FFF0ED] text-[#E63946] font-semibold hover:bg-[#FFE3DE] transition-colors border border-[#FFD9D4]' onClick={() => navigate("/add-item")}>
                                <FaPlus size={16} />
                                <span>Add Food Item</span>
                            </button>
                            <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#FFF0ED] text-[#E63946] hover:bg-[#FFE3DE] transition-colors' onClick={() => navigate("/add-item")}>
                                <FaPlus size={16} />
                            </button>
                        </>}
                       
                        <div className='hidden md:flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full bg-[#FFF9F4] text-[#202124] font-semibold hover:bg-[#F5EFE9] transition-colors border border-[#F0ECE8]' onClick={() => navigate("/my-orders")}>
                            <TbReceipt2 size={18} />
                            <span>My Orders</span>
                        </div>
                        <div className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#FFF9F4] text-[#202124] hover:bg-[#F5EFE9] transition-colors' onClick={() => navigate("/my-orders")}>
                            <TbReceipt2 size={18} />
                        </div>
                    </>
                ) : userData.role === "user" ? (
                    <>
                        <div className='relative cursor-pointer hover:scale-105 transition-transform p-1.5' onClick={() => navigate("/cart")}>
                            <FiShoppingCart size={22} className='text-[#202124] hover:text-[#E63946] transition-colors' />
                            {cartItems?.length > 0 && <span className='absolute -right-1 -top-1 bg-[#E63946] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm'>{cartItems.length}</span>}
                        </div>   

                        <button className='hidden md:block px-4 py-2 rounded-full bg-[#FFF9F4] text-[#202124] font-semibold hover:bg-[#F5EFE9] transition-colors border border-[#F0ECE8]' onClick={() => navigate("/my-orders")}>
                            My Orders
                        </button>
                    </>
                ) : null}

                {/* Profile Avatar */}
                <div 
                    className='w-[42px] h-[42px] rounded-full flex items-center justify-center text-white text-base font-bold shadow-md shadow-[#E63946]/20 bg-gradient-to-tr from-[#E63946] to-[#FF6B5E] cursor-pointer transition-all hover:scale-105 ring-2 ring-[#FFD9D4]' 
                    onClick={() => setShowInfo(prev => !prev)}
                >
                    {userData?.fullName?.slice(0, 1).toUpperCase()}
                </div>
                
                {/* Profile Dropdown */}
                {showInfo && (
                    <div className='fixed top-[74px] right-6 w-[220px] rounded-2xl p-4 flex flex-col gap-2 z-[9999] shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all bg-white border border-[#F0ECE8] text-[#202124]'>
                        <div className='border-b border-[#F0ECE8] pb-2 mb-1'>
                            <p className='text-sm font-bold truncate text-[#202124]'>{userData.fullName}</p>
                            <span className='text-[11px] font-bold text-[#E63946]'>
                                {isRider ? "Delivery Partner" : userData.role === "owner" ? "Restaurant Partner" : "Customer"}
                            </span>
                        </div>
                        {userData.role === "user" && (
                            <div className='md:hidden px-3 py-2 text-[#202124] font-semibold cursor-pointer hover:bg-[#FFF9F4] rounded-xl transition-colors' onClick={() => navigate("/my-orders")}>
                                My Orders
                            </div>
                        )}
                        <button 
                            className='w-full text-left px-3 py-2 font-bold cursor-pointer rounded-xl transition-colors text-[#E63946] hover:bg-[#FFF0ED]' 
                            onClick={handleLogOut}
                        >
                            Log Out
                        </button>
                    </div>
                )}

            </div>
        </div>
        <LocationModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} />
        </>
    )
}

export default Nav
