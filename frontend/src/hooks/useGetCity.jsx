import axios from "axios"
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    setCurrentAddress,
    setCurrentCity,
    setCurrentState
} from "../redux/userSlice"
import { setAddress, setLocation } from "../redux/mapSlice"

function useGetCity() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    useEffect(() => {
        if (!userData) return;

        const savedCity = localStorage.getItem("biteRush_selectedCity")

        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by browser. Using saved or default city.")
            dispatch(setCurrentCity(savedCity || "New Delhi"))
            return
        }

        // By default fetch via Geolocation API
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const latitude = position.coords.latitude
                    const longitude = position.coords.longitude

                    dispatch(
                        setLocation({
                            lat: latitude,
                            lon: longitude
                        })
                    )

                    const result = await axios.get(
                        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                    )

                    const location = result?.data?.results?.[0]

                    if (!location) {
                        dispatch(setCurrentCity(savedCity || "New Delhi"))
                        return
                    }

                    const city =
                        location.city ||
                        location.county ||
                        location.town ||
                        location.village ||
                        savedCity ||
                        "New Delhi"

                    const state = location.state || ""
                    const address =
                        location.address_line2 ||
                        location.address_line1 ||
                        city

                    dispatch(setCurrentCity(city))
                    dispatch(setCurrentState(state))
                    dispatch(setCurrentAddress(address))
                    dispatch(setAddress(address))

                    console.log("Detected city via Geolocation API:", city)

                } catch (error) {
                    console.error("Reverse geocoding error:", error)
                    dispatch(setCurrentCity(savedCity || "New Delhi"))
                }
            },

            (error) => {
                console.log("Geolocation permission/timeout:", error.message)
                dispatch(setCurrentCity(savedCity || "New Delhi"))
            },

            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000
            }
        )
    }, [userData, apiKey])

    return null
}

export default useGetCity
