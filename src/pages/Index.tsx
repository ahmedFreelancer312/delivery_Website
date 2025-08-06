import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "@/components/ui/use-toast";
import { Star, Clock, MapPin, ShoppingBag, Truck, Users, ChefHat } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
  delivery_fee: number;
  min_order: number;
}

interface MenuItem {
  _id: string; // استبدلت id بـ _id لأنه المستخدم في MongoDB
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  restaurantId: string;
}

const Index = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = "USER_ID_HERE"; // استبدل بـ userId من حالة المصادقة

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // جلب المطاعم
      const restaurantsResponse = await fetch("http://localhost:5000/api/restaurants");
      const restaurantsData = await restaurantsResponse.json();
      setRestaurants(restaurantsData || []);

      // جلب الأطباق المميزة
      const menuResponse = await fetch("http://localhost:5000/api/menu-items");
      const menuData = await menuResponse.json();
      setFeaturedItems(menuData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "خطأ", description: "فشل جلب البيانات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // دالة إضافة المنتج للسلة
  const addToCart = async (menuItem: MenuItem) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: menuItem._id,
          quantity: 1,
          price: menuItem.price,
          restaurantId: menuItem.restaurantId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "تم", description: "تم إضافة المنتج للسلة" });
      } else {
        toast({ title: "خطأ", description: data.message || "فشل إضافة المنتج", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "خطأ", description: "فشل الاتصال بالخادم", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-20"></div>
        <div className="absolute inset-0 bg-background/80"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="floating">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                طلباتي
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mt-4">
                أسرع خدمة توصيل في المدينة
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto">
              <p className="text-lg text-foreground/90 mb-6">
                اطلب من مطاعمنك المفضلة واستمتع بالتوصيل السريع إلى باب منزلك
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent glowing">
                  <Link to="/restaurants">
                    <ShoppingBag className="ml-2 h-5 w-5" />
                    ابدأ الطلب الآن
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="glass">
                  <Link to="/auth?mode=signup&role=restaurant">
                    <ChefHat className="ml-2 h-5 w-5" />
                    انضم كمطعم
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ChefHat, title: "100+", subtitle: "مطعم شريك" },
              { icon: Users, title: "10K+", subtitle: "عميل راضٍ" },
              { icon: Truck, title: "30", subtitle: "دقيقة متوسط التوصيل" },
              { icon: Star, title: "4.8", subtitle: "تقييم العملاء" },
            ].map((stat, index) => (
              <Card key={index} className="glass-card text-center p-6 neu">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground">{stat.title}</h3>
                <p className="text-muted-foreground">{stat.subtitle}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              المطاعم المميزة
            </h2>
            <p className="text-muted-foreground text-lg">
              اكتشف أفضل المطاعم في مدينتك
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="glass-card hover:scale-105 transition-transform duration-300 neu">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={restaurant.image_url || "/placeholder.svg"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-accent/90 text-accent-foreground">
                        <Star className="h-3 w-3 ml-1" />
                        {restaurant.rating.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 ml-1" />
                        {restaurant.delivery_fee} ج.م
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 ml-1" />
                        30-45 دقيقة
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild className="w-full glass">
                        <Link to={`/restaurant/${restaurant.id}`}>
                          عرض المنيو
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild className="glass">
              <Link to="/restaurants">
                عرض جميع المطاعم
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      {featuredItems.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-card/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                الأطباق المميزة
              </h2>
              <p className="text-muted-foreground text-lg">
                أشهى الأطباق من مطاعمنا المختارة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Card key={item._id} className="glass-card hover:scale-105 transition-transform duration-300">
                  <div className="relative h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-primary/90 text-primary-foreground font-bold">
                        {item.price} ج.م
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {item.description}
                    </p>
                    {item.category && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {item.category}
                      </Badge>
                    )}
                    <Button
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      onClick={() => addToCart(item)}
                    >
                      إضافة للسلة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="glass-card p-12 neu">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                جاهز لتبدأ رحلتك معنا؟
              </h2>
              <p className="text-lg text-muted-foreground">
                انضم إلى آلاف العملاء الراضين واستمتع بتجربة توصيل مميزة
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent glowing">
                  <Link to="/auth?mode=signup">
                    <Users className="ml-2 h-5 w-5" />
                    إنشاء حساب عميل
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="glass">
                  <Link to="/auth?mode=signup&role=driver">
                    <Truck className="ml-2 h-5 w-5" />
                    انضم كسائق
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 طلباتي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;