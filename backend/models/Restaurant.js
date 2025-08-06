import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image_url: { type: String, default: "/placeholder.svg" },
  rating: { type: Number, default: 0 },
  delivery_fee: { type: Number, required: true },
  min_order: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
});

export default mongoose.model("Restaurant", restaurantSchema);
