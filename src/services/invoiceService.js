import api from "./api";

export async function createInvoice(shopId, customerName = null) {
    const response = await api.post(`/invoices?shopId=${shopId}`, { customerName });
    return response.data;
}

export async function addInvoiceLine(invoiceId, productId, quantity, discountType = null, discountValue = null) {
    const response = await api.post(`/invoices/${invoiceId}/lines`, {
        productId, quantity, discountType, discountValue,
    });
    return response.data;
}

/**
 * Remplace directement la quantité d'une ligne déjà présente dans la
 * facture (contrairement à addInvoiceLine, qui fusionne/additionne).
 * Réservé aux utilisateurs ayant la permission EDIT_INVOICE (managers).
 */
export async function modifyLineQuantity(invoiceId, saleId, quantity) {
    const response = await api.put(`/invoices/${invoiceId}/lines/${saleId}/quantity`, { quantity });
    return response.data;
}

export async function removeInvoiceLine(invoiceId, saleId, isManagerAction = false) {
    const response = await api.delete(
        `/invoices/${invoiceId}/lines/${saleId}?isManagerAction=${isManagerAction}`
    );
    return response.data;
}

export async function applyInvoiceDiscount(invoiceId, discountType, discountValue) {
    const response = await api.post(`/invoices/${invoiceId}/discount`, { discountType, discountValue });
    return response.data;
}

export async function validateInvoice(invoiceId, customerName = null) {
    const response = await api.post(`/invoices/${invoiceId}/validate`, { customerName });
    return response.data;
}

export function getInvoicePdfUrl(invoiceId) {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    return `${baseUrl}/invoices/${invoiceId}/pdf`;
}

export async function downloadInvoicePdf(invoiceId) {
    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: "blob"
    });
    
    const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    
    // Détection mobile pour adapter le comportement
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Sur mobile, ouvrir le PDF dans un nouvel onglet pour permettre le téléchargement/impression natif
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = `facture-${invoiceId}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Nettoyage
        setTimeout(() => {
            window.URL.revokeObjectURL(fileUrl);
        }, 1000);
    } else {
        // Sur desktop, impression silencieuse via iframe invisible
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = fileUrl;
        
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                // Nettoyage
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    window.URL.revokeObjectURL(fileUrl);
                }, 10000);
            }, 500);
        };
    }
}

export async function listInvoices(shopId) {
    const response = await api.get(`/invoices?shopId=${shopId}`);
    return response.data;
}

export async function getInvoice(invoiceId) {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data;
}