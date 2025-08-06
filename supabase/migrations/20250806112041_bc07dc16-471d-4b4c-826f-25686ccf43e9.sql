-- Create enum types for user roles and order status
CREATE TYPE user_role AS ENUM ('customer', 'restaurant', 'driver', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled');

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  address TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  min_order DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Restaurant policies
CREATE POLICY "Everyone can view active restaurants" 
ON public.restaurants FOR SELECT 
USING (is_active = TRUE);

CREATE POLICY "Restaurant owners can manage their restaurants" 
ON public.restaurants FOR ALL 
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all restaurants" 
ON public.restaurants FOR ALL 
USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Menu items policies
CREATE POLICY "Everyone can view available menu items" 
ON public.menu_items FOR SELECT 
USING (is_available = TRUE);

CREATE POLICY "Restaurant owners can manage their menu items" 
ON public.menu_items FOR ALL 
USING (EXISTS(SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));

CREATE POLICY "Admins can manage all menu items" 
ON public.menu_items FOR ALL 
USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_address TEXT NOT NULL,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Customers can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Restaurant owners can view their restaurant orders" 
ON public.orders FOR SELECT 
USING (EXISTS(SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));

CREATE POLICY "Restaurant owners can update their restaurant orders" 
ON public.orders FOR UPDATE 
USING (EXISTS(SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()));

CREATE POLICY "Drivers can view assigned orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = driver_id OR (driver_id IS NULL AND EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'driver')));

CREATE POLICY "Drivers can update assigned orders" 
ON public.orders FOR UPDATE 
USING (auth.uid() = driver_id);

CREATE POLICY "Admins can manage all orders" 
ON public.orders FOR ALL 
USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create order items table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Users can view order items of their orders" 
ON public.order_items FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM public.orders 
  WHERE id = order_id 
  AND (customer_id = auth.uid() 
       OR driver_id = auth.uid() 
       OR EXISTS(SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()))
));

CREATE POLICY "Customers can insert order items for their orders" 
ON public.order_items FOR INSERT 
WITH CHECK (EXISTS(SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid()));

CREATE POLICY "Admins can manage all order items" 
ON public.order_items FOR ALL 
USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Users can view chat messages for their orders" 
ON public.chat_messages FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM public.orders 
  WHERE id = order_id 
  AND (customer_id = auth.uid() 
       OR driver_id = auth.uid() 
       OR EXISTS(SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()))
));

CREATE POLICY "Users can send chat messages for their orders" 
ON public.chat_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id AND EXISTS(
  SELECT 1 FROM public.orders 
  WHERE id = order_id 
  AND (customer_id = auth.uid() 
       OR driver_id = auth.uid() 
       OR EXISTS(SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid()))
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();