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
    
    // Impression silencieuse via iframe invisible
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

export async function listInvoices(shopId) {
    const response = await api.get(`/invoices?shopId=${shopId}`);
    return response.data;
}

export async function getInvoice(invoiceId) {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data;
}