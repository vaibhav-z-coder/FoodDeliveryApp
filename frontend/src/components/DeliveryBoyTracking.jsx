import React from 'react'
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
})

function DeliveryBoyTracking({ data }) {
    const deliveryBoyLat = data.deliveryBoyLocation.lat
    const deliveryBoylon = data.deliveryBoyLocation.lon
    const customerLat = data.customerLocation.lat
    const customerlon = data.customerLocation.lon

    const path = [
        [deliveryBoyLat, deliveryBoylon],
        [customerLat, customerlon]
    ]

    const center = [deliveryBoyLat, deliveryBoylon]

    return (
        <div className='w-full h-[360px] rounded-3xl overflow-hidden border border-[#F0ECE8] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative'>
            <div className='absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#F0ECE8] text-[#202124] text-xs font-bold flex items-center gap-2 shadow-sm pointer-events-none'>
                <span className='w-2 h-2 rounded-full bg-[#269B62] animate-ping'></span>
                <span>Live Route Navigation</span>
            </div>
            <MapContainer
                className={"w-full h-full"}
                center={center}
                zoom={14}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
             <Marker position={[deliveryBoyLat,deliveryBoylon]} icon={deliveryBoyIcon}>
                 <Popup className="font-semibold text-[#202124]">Your Live Location</Popup>
             </Marker>
              <Marker position={[customerLat,customerlon]} icon={customerIcon}>
                 <Popup className="font-semibold text-[#202124]">Customer Drop Location</Popup>
             </Marker>

             <Polyline positions={path} color='#E63946' weight={4} dashArray="8, 8"/>
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
