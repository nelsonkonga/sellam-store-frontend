import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProductsProvider } from "./context/ProductsContext";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthPage from "./pages/AuthPage";
import ShopsPage from "./pages/ShopsPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NewSalePage from "./pages/NewSalePage";
import DailyBalancePage from "./pages/DailyBalancePage";
import BalanceSettingsPage from "./pages/BalanceSettingsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";

// Page vide en attendant l'implémentation du mot de passe oublié
function ForgotPasswordPlaceholder() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
            <p className="text-gray-700 dark:text-gray-300">
                Page /forgot-password à venir
            </p>
        </div>
    );
}

export default function App() {
    return (
        // Ordre des providers : Theme et Auth sont indépendants l'un de l'autre,
        // mais Shop et Products dépendent conceptuellement d'un compte connecté
        // (même si techniquement ils ne consomment pas AuthContext directement).
        <ThemeProvider>
            <AuthProvider>
                <ShopProvider>
                    <ProductsProvider>
                        <BrowserRouter>
                            <Routes>
                                {/* Routes publiques */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<AuthPage />} />
                                <Route path="/register" element={<AuthPage />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPlaceholder />} />

                                {/* Route protégée mais sans exigence de boutique sélectionnée :
                    c'est justement ici qu'on en choisit une. */}
                                <Route
                                    path="/shops"
                                    element={
                                        <ProtectedRoute requireShop={false}>
                                            <ShopsPage />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Routes protégées nécessitant une boutique sélectionnée */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/products"
                                    element={
                                        <ProtectedRoute>
                                            <ProductsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/products/new"
                                    element={
                                        <ProtectedRoute>
                                            <ProductDetailPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/products/:id"
                                    element={
                                        <ProtectedRoute>
                                            <ProductDetailPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/sales/new"
                                    element={
                                        <ProtectedRoute>
                                            <NewSalePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/balance"
                                    element={
                                        <ProtectedRoute>
                                            <DailyBalancePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings/balance"
                                    element={
                                        <ProtectedRoute>
                                            <BalanceSettingsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings/profile"
                                    element={
                                        <ProtectedRoute>
                                            <ProfileSettingsPage />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Toute route inconnue renvoie vers /login ; ProtectedRoute
                    prendra ensuite le relai pour rediriger plus loin si déjà connecté. */}
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </BrowserRouter>
                    </ProductsProvider>
                </ShopProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}