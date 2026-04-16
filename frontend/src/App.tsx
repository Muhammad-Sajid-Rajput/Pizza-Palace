import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Admin, Login, Dashboard, CheckOut, Menu, Orders } from './pages';
import { MainLayout } from './components';
import ProtectRoute from './components/ProtectRoute';
import ProtectRouteLogin from './components/ProtectRouteLogin';

export default function App() {
   return (
      <BrowserRouter>
         <Routes>
            {/* Public Routes - No Layout */}
            <Route
               path="/login"
               element={
                  <ProtectRouteLogin>
                     <Login />
                  </ProtectRouteLogin>
               }
            />

            {/* Protected Routes - With MainLayout */}
            <Route element={<MainLayout />}>
               {/* Dashboard - User's main hub with stats and orders */}
               <Route
                  path="/"
                  element={
                     <ProtectRoute allowedRoles={['user', 'admin']}>
                        <Navigate to="/dashboard" replace />
                     </ProtectRoute>
                  }
               />

               <Route
                  path="/dashboard"
                  element={
                     <ProtectRoute allowedRoles={['user', 'admin']}>
                        <Dashboard />
                     </ProtectRoute>
                  }
               />

               {/* Menu - Customer pizza browsing */}
               <Route
                  path="/menu"
                  element={
                     <ProtectRoute allowedRoles={['user', 'admin']}>
                        <Menu />
                     </ProtectRoute>
                  }
               />

               {/* Orders - Full order history view */}
               <Route
                  path="/orders"
                  element={
                     <ProtectRoute allowedRoles={['user', 'admin']}>
                        <Orders />
                     </ProtectRoute>
                  }
               />

               {/* Cart & Checkout */}
               <Route
                  path="/cart"
                  element={
                     <ProtectRoute allowedRoles={['user', 'admin']}>
                        <CheckOut />
                     </ProtectRoute>
                  }
               />

               <Route
                  path="/checkout"
                  element={
                     <ProtectRoute allowedRoles={['user', 'admin']}>
                        <CheckOut />
                     </ProtectRoute>
                  }
               />
            </Route>

            {/* Admin Routes - Separate layout or full-screen */}
            <Route
               path="/admin"
               element={
                  <ProtectRoute allowedRoles={['admin']}>
                     <Admin />
                  </ProtectRoute>
               }
            />

            <Route path="*" element={<Navigate to="/menu" replace />} />
         </Routes>
      </BrowserRouter>
   );
}
