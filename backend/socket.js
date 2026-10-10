import User from "./models/user.model.js"
import jwt from "jsonwebtoken"

export const socketHandler = (io) => {
  // Authentication middleware
  io.use((socket, next) => {
    if (socket.request.headers.cookie) {
      const tokenCookie = socket.request.headers.cookie.split(';').find(c => c.trim().startsWith('token='));
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.userId;
          return next();
        } catch (err) {
          // invalid token
        }
      }
    }
    // If not authenticated, we still let them connect but they won't have socket.userId
    next();
  });

  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id)

    socket.on('identity', async (payload) => {
      try {
        const actualUserId = socket.userId || payload?.userId;
        if (!actualUserId) return;
        socket.userId = actualUserId;

        const user = await User.findByIdAndUpdate(actualUserId, {
          socketId: socket.id,
          isOnline: true
        }, { new: true })
        console.log(`User ${actualUserId} identified on socket ${socket.id}`)
      } catch (error) {
        console.log("Socket identity error:", error)
      }
    })

    socket.on('joinOrder', ({ orderId }) => {
      if (orderId) {
        const roomName = `order_${orderId}`
        socket.join(roomName)
        console.log(`Socket ${socket.id} joined room ${roomName}`)
      }
    })

    socket.on('leaveOrder', ({ orderId }) => {
      if (orderId) {
        const roomName = `order_${orderId}`
        socket.leave(roomName)
        console.log(`Socket ${socket.id} left room ${roomName}`)
      }
    })

    socket.on('updateLocation', async (payload) => {
      try {
        const userId = socket.userId || payload?.userId;
        if (!userId) return;
        socket.userId = userId;

        const latitude = Number(payload.latitude);
        const longitude = Number(payload.longitude);

        if (isNaN(latitude) || isNaN(longitude)) return;

        const address = payload.address;

        const updateData = {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        };

        if (address) {
          updateData.currentAddress = address;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })

        if (user) {
          const locPayload = {
            deliveryBoyId: String(userId),
            latitude,
            longitude,
            address: address || user.currentAddress || "",
            orderId: payload.orderId
          }
          // Broadcast to all listening clients and specifically to order room
          io.emit('updateDeliveryLocation', locPayload)
          if (payload.orderId) {
            io.to(`order_${payload.orderId}`).emit('updateDeliveryLocation', locPayload)
          }
        }
      } catch (error) {
        console.log('updateDeliveryLocation error:', error)
      }
    })

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate({ socketId: socket.id }, {
          socketId: null,
          isOnline: false
        })
        console.log("Socket disconnected:", socket.id)
      } catch (error) {
        console.log("Socket disconnect error:", error)
      }
    })
  })
}