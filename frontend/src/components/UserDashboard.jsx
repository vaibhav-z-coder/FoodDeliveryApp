import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import ShopCard from './ShopCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import { FaFire, FaMotorcycle, FaStar } from 'react-icons/fa';

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user)
  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")

  const handleFilterByCategory = (category) => {
    setSelectedCategory(category)
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      const filteredList = itemsInMyCity?.filter(i => i.category?.toLowerCase() === category.toLowerCase())
      setUpdatedItemsList(filteredList)
    }
  }

  useEffect(() => {
    if (selectedCategory === "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      const filteredList = itemsInMyCity?.filter(i => i.category?.toLowerCase() === selectedCategory.toLowerCase())
      setUpdatedItemsList(filteredList)
    }
  }, [itemsInMyCity])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth - 5)
    }
  }
  
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      const onCateScroll = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      const onShopScroll = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      
      cateScrollRef.current.addEventListener('scroll', onCateScroll)
      shopScrollRef.current?.addEventListener('scroll', onShopScroll)

      return () => {
        cateScrollRef.current?.removeEventListener("scroll", onCateScroll)
        shopScrollRef.current?.removeEventListener("scroll", onShopScroll)
      }
    }
  }, [categories, shopInMyCity])

  return (
    <div className='w-full flex flex-col gap-10 items-center bg-[#FFF9F4] pb-24 text-[#202124]'>
      <Nav />

      {/* Hero Promotional Banner */}
      <div className='w-full max-w-7xl px-4 sm:px-6 md:px-8 mt-2'>
        <div className='bg-gradient-to-r from-[#E63946] via-[#FF6B5E] to-[#FF8066] rounded-3xl p-6 sm:p-10 text-white shadow-[0_16px_40px_rgb(230,57,70,0.18)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6'>
          {/* Subtle Decorative Shapes */}
          <div className='absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none' />
          <div className='absolute left-1/3 -top-16 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none' />

          <div className='flex-1 space-y-3 text-center md:text-left z-10'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide uppercase'>
              <FaFire className='text-[#FFC857]' />
              <span>Fastest Delivery In Town</span>
            </div>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight'>
              Craving something delicious in <span className='text-[#FFC857]'>{currentCity || "your city"}</span>?
            </h1>
            <p className='text-sm sm:text-base text-white/90 font-medium max-w-xl'>
              Order from top verified restaurants near you with lightning-fast live GPS delivery.
            </p>
            <div className='flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2'>
              <span className='flex items-center gap-1.5 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm'>
                <FaMotorcycle className='text-[#FFC857]' /> 30-Min Fast Drop
              </span>
              <span className='flex items-center gap-1.5 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm'>
                <FaStar className='text-[#FFC857]' /> 4.8+ Rated Kitchens
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-7xl flex flex-col gap-6 items-start px-4 sm:px-6 md:px-8'>
          <div className='flex items-center justify-between w-full border-b border-[#F0ECE8] pb-3'>
            <h2 className='text-[#202124] text-2xl sm:text-3xl font-extrabold tracking-tight'>
              Search Results
            </h2>
            <span className='text-xs font-bold px-3 py-1 bg-[#FFF0ED] text-[#E63946] rounded-full border border-[#FFD9D4]'>
              {searchItems.length} dishes found
            </span>
          </div>
          <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center'>
            {searchItems.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      {/* Categories Horizontal Carousel */}
      <div className="w-full max-w-7xl flex flex-col gap-6 items-start px-4 sm:px-6 md:px-8">
        <div className='flex items-center justify-between w-full'>
          <div>
            <h2 className='text-[#202124] text-2xl sm:text-3xl font-extrabold tracking-tight'>
              What's on your mind?
            </h2>
            <p className='text-xs sm:text-sm text-[#77736F] mt-0.5'>Explore hand-picked cuisines and specialties</p>
          </div>
          {selectedCategory !== "All" && (
            <button 
              onClick={() => handleFilterByCategory("All")}
              className='text-xs font-bold text-[#E63946] hover:underline cursor-pointer'
            >
              Show All
            </button>
          )}
        </div>

        <div className='w-full relative group'>
          {showLeftCateButton && (
            <button 
              className='absolute -left-3 top-1/2 -translate-y-1/2 bg-white text-[#E63946] p-2 rounded-full shadow-lg hover:scale-110 transition-all z-10 border border-[#F0ECE8] cursor-pointer' 
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft size={22} />
            </button>
          )}

          <div className='w-full flex overflow-x-auto gap-4 pb-3 scroll-smooth no-scrollbar' ref={cateScrollRef}>
            {categories.map((cate, index) => (
              <CategoryCard 
                name={cate.category} 
                image={cate.image} 
                key={index} 
                isSelected={selectedCategory?.toLowerCase() === cate.category?.toLowerCase()}
                onClick={() => handleFilterByCategory(cate.category)} 
              />
            ))}
          </div>
          
          {showRightCateButton && (
            <button 
              className='absolute -right-3 top-1/2 -translate-y-1/2 bg-white text-[#E63946] p-2 rounded-full shadow-lg hover:scale-110 transition-all z-10 border border-[#F0ECE8] cursor-pointer' 
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaCircleChevronRight size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Best Restaurants Carousel */}
      <div className='w-full max-w-7xl flex flex-col gap-6 items-start px-4 sm:px-6 md:px-8'>
        <div>
          <h2 className='text-[#202124] text-2xl sm:text-3xl font-extrabold tracking-tight'>
            Top Restaurants in {currentCity || "your area"}
          </h2>
          <p className='text-xs sm:text-sm text-[#77736F] mt-0.5'>Best-rated kitchens delivering right now</p>
        </div>

        <div className='w-full relative group'>
          {showLeftShopButton && (
            <button 
              className='absolute -left-3 top-1/2 -translate-y-1/2 bg-white text-[#E63946] p-2 rounded-full shadow-lg hover:scale-110 transition-all z-10 border border-[#F0ECE8] cursor-pointer' 
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft size={22} />
            </button>
          )}

          <div className='w-full flex overflow-x-auto gap-5 pb-3 scroll-smooth no-scrollbar p-1' ref={shopScrollRef}>
            {shopInMyCity?.length > 0 ? shopInMyCity.map((shop, index) => (
              <ShopCard name={shop.name} image={shop.image} address={shop.address} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
            )) : (
              <div className='text-[#77736F] font-medium py-10 w-full text-center bg-white rounded-3xl border border-[#F0ECE8]'>
                No restaurants registered in {currentCity} yet.
              </div>
            )}
          </div>
          
          {showRightShopButton && (
            <button 
              className='absolute -right-3 top-1/2 -translate-y-1/2 bg-white text-[#E63946] p-2 rounded-full shadow-lg hover:scale-110 transition-all z-10 border border-[#F0ECE8] cursor-pointer' 
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaCircleChevronRight size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Food Items Section with Category Quick-Filter Tabs */}
      <div className='w-full max-w-7xl flex flex-col gap-6 items-start px-4 sm:px-6 md:px-8'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4'>
          <div>
            <h2 className='text-[#202124] text-2xl sm:text-3xl font-extrabold tracking-tight'>
              Popular Dishes Near You
            </h2>
            <p className='text-xs sm:text-sm text-[#77736F] mt-0.5'>Hand-crafted meals available for fast ordering</p>
          </div>

          {/* Quick Category Filter Pills */}
          <div className='flex items-center gap-2 overflow-x-auto no-scrollbar py-1'>
            <button 
              onClick={() => handleFilterByCategory("All")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "All" 
                  ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/20" 
                  : "bg-white text-[#77736F] border border-[#F0ECE8] hover:border-[#FFD9D4] hover:text-[#E63946]"
              }`}
            >
              All Dishes
            </button>
            {categories.slice(0, 5).map((cat, i) => (
              <button 
                key={i}
                onClick={() => handleFilterByCategory(cat.category)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory?.toLowerCase() === cat.category?.toLowerCase() 
                    ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/20" 
                    : "bg-white text-[#77736F] border border-[#F0ECE8] hover:border-[#FFD9D4] hover:text-[#E63946]"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </div>

        {updatedItemsList?.length > 0 ? (
          <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center'>
            {updatedItemsList.map((item, index) => (
              <FoodCard key={index} data={item} />
            ))}
          </div>
        ) : (
          <div className='w-full text-center py-14 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F0ECE8] flex flex-col items-center justify-center gap-2'>
            <span className='text-3xl'>🍲</span>
            <p className='text-[#202124] font-bold text-lg'>No dishes available for {selectedCategory}.</p>
            <p className='text-[#77736F] text-xs'>Try switching to "All Dishes" or explore other categories.</p>
            <button 
              onClick={() => handleFilterByCategory("All")}
              className='mt-2 px-5 py-2 bg-[#FFF0ED] text-[#E63946] border border-[#FFD9D4] rounded-full text-xs font-bold hover:bg-[#E63946] hover:text-white transition-all cursor-pointer'
            >
              View All Dishes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard
