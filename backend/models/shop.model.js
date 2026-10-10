import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],

    isDefault: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

const Shop = mongoose.model("Shop", shopSchema)

export default Shop
