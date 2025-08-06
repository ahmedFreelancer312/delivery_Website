import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Home, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-glass backdrop-blur-md shadow-lg py-4 dir-rtl font-cairo">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">منصة التوصيل</div>
        <div className="flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 text-gray-600 hover:text-blue-600 ${isActive ? "text-blue-600" : ""}`
            }
          >
            <Home className="h-5 w-5" />
            الرئيسية
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `flex items-center gap-2 text-gray-600 hover:text-blue-600 ${isActive ? "text-blue-600" : ""}`
            }
          >
            <ShoppingCart className="h-5 w-5" />
            السلة
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 text-gray-600 hover:text-blue-600 ${isActive ? "text-blue-600" : ""}`
            }
          >
            <User className="h-5 w-5" />
            الملف الشخصي
          </NavLink>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">تسجيل الخروج</Button>
      </div>
    </nav>
  );
};

export default Navbar;