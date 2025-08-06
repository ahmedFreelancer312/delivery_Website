import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Cart from "./models/Cart.js";
import MenuItem from "./models/MenuItem.js";
import Restaurant from "./models/Restaurant.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//  uz7AqN0EGjtfZuKS
mongoose
  .connect(
    "mongodb+srv://ahmedsadeek312:uz7AqN0EGjtfZuKS@cluster0.zlshh6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connecting to MongoDB is Done "))
  .catch((err) => console.error("error on connecting to MongoDB", err));

app.get("/api/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ is_active: true }).limit(6);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/menu-items", async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true }).limit(8);
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// جلب السلة
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.menuItemId");
    if (!cart) return res.status(404).json({ message: "Cart is not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// إضافة عنصر إلى السلة
app.post("/api/cart/:userId", async (req, res) => {
  try {
    const { menuItemId, quantity, price, restaurantId } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      cart = new Cart({
        userId: req.params.userId,
        restaurantId,
        items: [{ menuItemId, quantity, price }],
      });
    } else {
      if (cart.restaurantId.toString() !== restaurantId) {
        return res.status(400).json({ message: "لا يمكن إضافة عناصر من مطاعم مختلفة" });
      }
      const itemIndex = cart.items.findIndex((item) => item.menuItemId.toString() === menuItemId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ menuItemId, quantity, price });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// تعديل كمية عنصر
app.put("/api/cart/:userId/item/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "السلة غير موجودة" });

    const itemIndex = cart.items.findIndex((item) => item.menuItemId.toString() === req.params.itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "العنصر غير موجود" });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// حذف عنصر من السلة
app.delete("/api/cart/:userId/item/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "السلة غير موجودة" });

    cart.items = cart.items.filter((item) => item.menuItemId.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(5000, () => console.log("server is running at port : 5000"));