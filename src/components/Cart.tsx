import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface CartItem {
  menuItemId: { _id: string; name: string };
  quantity: number;
  price: number;
}

const Cart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = "USER_ID_HERE"; // استبدل بـ userId من حالة المصادقة

  // جلب بيانات السلة
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/cart/${userId}`
        );
        const data = await response.json();
        setItems(data.items || []);
      } catch (err) {
        toast({
          title: "خطأ",
          description: "فشل جلب السلة",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId]);

  // تعديل الكمية
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${userId}/item/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
      const data = await response.json();
      setItems(data.items || []);
      toast({ title: "تم", description: "تم تحديث الكمية" });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الكمية",
        variant: "destructive",
      });
    }
  };

  // حذف عنصر
  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${userId}/item/${itemId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      setItems(data.items || []);
      toast({ title: "تم", description: "تم حذف العنصر" });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل حذف العنصر",
        variant: "destructive",
      });
    }
  };

  // حساب الإجمالي
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto py-8 dir-rtl font-cairo">
      <Card className="bg-glass backdrop-blur-md border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            سلة التسوق
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">جارٍ التحميل...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500">السلة فارغة</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.menuItemId._id}>
                      <TableCell>{item.menuItemId.name}</TableCell>
                      <TableCell>{item.price} ر.س</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(
                                item.menuItemId._id,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(
                                item.menuItemId._id,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(item.price * item.quantity).toFixed(2)} ر.س
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(item.menuItemId._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">
                  الإجمالي: {totalPrice.toFixed(2)} ر.س
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate("/checkout")}
                >
                  تأكيد الطلب
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;
