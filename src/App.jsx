import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProductsProvider } from "./context/ProductsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdateBanner from "./components/UpdateBanner.jsx";
import ReferralPage from "./services/ReferralPage.jsx";

import AuthPage from "./pages/AuthPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ShopsPage from "./pages/ShopsPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NewSalePage from "./pages/NewSalePage";
import BalanceSettingsPage from "./pages/BalanceSettingsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import {useAutoSync} from "./hooks/useSync.js";
import OAuthCallbackPage from "./pages/OAuthCallbackPage.jsx";
import OAuthErrorPage from "./pages/OAuthErrorPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import InvoiceDetailPage from "./pages/InvoiceDetailPage.jsx";
import InvoicesPage from "./pages/InvoicesPage.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import ShopSettingsPage from "./pages/ShopSettingsPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import UserSupportPage from "./pages/UserSupportPage.jsx";
import TicketDetailPage from "./pages/TicketDetailPage.jsx";
import AdminSupportPage from "./pages/AdminSupportPage.jsx";
import CashRegistersPage from "./pages/CashRegistersPage.jsx";
import CashSessionPage from "./pages/CashSessionPage.jsx";
import CashHistoryPage from "./pages/CashHistoryPage.jsx";
import MembershipsPage from "./pages/MembershipsPage.jsx";
import SubscriptionPage from "./pages/SubscriptionPage";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";

export default function App() {
    useAutoSync();
    return (
        // Ordre des providers : Theme et Auth sont indépendants l'un de l'autre,
        // mais Shop et Products dépendent conceptuellement d'un compte connecté
        // (même si techniquement ils ne consomment pas AuthContext directement).
        <ThemeProvider>
            <AuthProvider>
                <ShopProvider>
                    <ProductsProvider>
                        <UpdateBanner />
                        <BrowserRouter>
                            <Routes>
                                {/* Routes publiques */}
                                <Route path="/" element={<LandingPage/>}/>
                                <Route path="/login" element={<LoginPage/>}/>
                                <Route path="/register" element={<RegisterPage/>}/>
                                <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                                <Route path="/privacy" element={<PrivacyPage/>}/>
                                <Route path="/terms" element={<TermsPage/>}/>
                                <Route path="/oauth-callback" element={<OAuthCallbackPage/>}/>
                                <Route path="/oauth-error" element={<OAuthErrorPage/>}/>
                                <Route path="/verify-email" element={<VerifyEmailPage/>}/>
                                <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                                <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />


                                <Route
                                    path="/shops"
                                    element={
                                        <ProtectedRoute requireShop={false}>
                                            <ShopsPage/>
                                        </ProtectedRoute>
                                    }
                                />


                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/products"
                                    element={
                                        <ProtectedRoute>
                                            <ProductsPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/products/new"
                                    element={
                                        <ProtectedRoute>
                                            <ProductDetailPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/products/:id"
                                    element={
                                        <ProtectedRoute>
                                            <ProductDetailPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/sales/new"
                                    element={
                                        <ProtectedRoute>
                                            <NewSalePage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings/balance"
                                    element={
                                        <ProtectedRoute>
                                            <BalanceSettingsPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/employees"
                                    element={
                                        <ProtectedRoute requireManager>
                                            <EmployeesPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/memberships"
                                    element={
                                        <ProtectedRoute requireManager>
                                            <MembershipsPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/cash"
                                    element={
                                        <ProtectedRoute requireManager>
                                            <CashRegistersPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/cash/:registerId"
                                    element={
                                        <ProtectedRoute requireManager>
                                            <CashSessionPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/cash/history"
                                    element={
                                        <ProtectedRoute requireManager>
                                            <CashHistoryPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings/profile"
                                    element={
                                        <ProtectedRoute>
                                            <ProfileSettingsPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings/shop"
                                    element={
                                        <ProtectedRoute>
                                            <ShopSettingsPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/chat"
                                    element={
                                        <ProtectedRoute>
                                            <ChatPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/reports"
                                    element={
                                        <ProtectedRoute>
                                            <ReportsPage/>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route 
                                    path="/subscription" 
                                    element={
                                        <ProtectedRoute>
                                            <SubscriptionPage/>
                                        </ProtectedRoute>
                                    } 
                                />

                                <Route
                                    path="/referrals"
                                    element={
                                        <ProtectedRoute>
                                            <ReferralPage/>
                                        </ProtectedRoute>
                                    }
                                />
                                

                                {/* Support routes */}
                                <Route path="/support" element={<ProtectedRoute requireShop={false}><UserSupportPage/></ProtectedRoute>} />
                                <Route path="/support/tickets/:id" element={<ProtectedRoute requireShop={false}><TicketDetailPage/></ProtectedRoute>} />
                                <Route path="/admin/support" element={<ProtectedRoute requireShop={false}><AdminSupportPage/></ProtectedRoute>} />

                                {/* Toute route inconnue renvoie vers /login ; ProtectedRoute
                    prendra ensuite le relai pour rediriger plus loin si déjà connecté. */}
                                <Route path="*" element={<Navigate to="/login" replace/>}/>
                            </Routes>
                        </BrowserRouter>
                    </ProductsProvider>
                </ShopProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}