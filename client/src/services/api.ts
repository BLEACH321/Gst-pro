import {
  User,
  Business,
  Product,
  Customer,
  Invoice,
  Rule,
  HsnSuggestion,
  ValidationSummaryResponse
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getHeaders() {
  const token = localStorage.getItem("gst_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

// --- Auth APIs ---
export async function loginApi(email?: string, password?: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function registerApi(data: any) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function getMeApi() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

// --- Business Profile APIs ---
export async function getBusinessProfile(): Promise<Business> {
  const res = await fetch(`${API_BASE}/business`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function updateBusinessProfile(data: Partial<Business>): Promise<{ message: string; business: Business }> {
  const res = await fetch(`${API_BASE}/business`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

// --- Product Master APIs ---
export async function getProducts(search?: string, category?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category && category !== "All") params.append("category", category);
  const res = await fetch(`${API_BASE}/products?${params.toString()}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  return handleResponse(res);
}

export async function suggestHsnSacApi(query: string): Promise<{ query: string; count: number; suggestions: HsnSuggestion[] }> {
  const res = await fetch(`${API_BASE}/products/suggest-hsn?q=${encodeURIComponent(query)}`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

// --- Customer APIs ---
export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/customers`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

// --- Invoice APIs ---
export async function getInvoices(filters?: {
  search?: string;
  riskLevel?: string;
  status?: string;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Invoice[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.riskLevel && filters.riskLevel !== "ALL") params.append("riskLevel", filters.riskLevel);
  if (filters?.status && filters.status !== "ALL") params.append("status", filters.status);
  if (filters?.customer && filters.customer !== "ALL") params.append("customer", filters.customer);
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);

  const res = await fetch(`${API_BASE}/invoices?${params.toString()}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/invoices/${id}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function validateInvoicePreview(invoiceData: any): Promise<ValidationSummaryResponse> {
  const res = await fetch(`${API_BASE}/invoices/validate-preview`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(invoiceData)
  });
  return handleResponse(res);
}

export async function createInvoice(invoiceData: any): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/invoices`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(invoiceData)
  });
  return handleResponse(res);
}

export async function finalizeInvoice(id: string): Promise<{ message: string; invoice: Invoice }> {
  const res = await fetch(`${API_BASE}/invoices/${id}/finalize`, {
    method: "POST",
    headers: getHeaders()
  });
  return handleResponse(res);
}

export async function deleteInvoice(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/invoices/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  return handleResponse(res);
}

// --- Dashboard & Analytics APIs ---
export async function getDashboardData() {
  const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getAnomalyDashboardData() {
  const res = await fetch(`${API_BASE}/anomalies`, { headers: getHeaders() });
  return handleResponse(res);
}

// --- Rules & Reports APIs ---
export async function getRules(): Promise<Rule[]> {
  const res = await fetch(`${API_BASE}/rules`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createRule(ruleData: Partial<Rule>): Promise<Rule> {
  const res = await fetch(`${API_BASE}/rules`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(ruleData)
  });
  return handleResponse(res);
}

export async function updateRule(id: string, ruleData: Partial<Rule>): Promise<Rule> {
  const res = await fetch(`${API_BASE}/rules/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(ruleData)
  });
  return handleResponse(res);
}

export async function getReportsSummary(fromDate?: string, toDate?: string) {
  const params = new URLSearchParams();
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);
  const res = await fetch(`${API_BASE}/reports/summary?${params.toString()}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function getAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`, { headers: getHeaders() });
  return handleResponse(res);
}

// --- Agentic AI APIs ---
export async function sendPublicAgentPrompt(prompt: string) {
  const res = await fetch(`${API_BASE}/agent/public-ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  return handleResponse(res);
}

export async function sendAuthenticatedAgentCommand(prompt: string, context?: any) {
  const res = await fetch(`${API_BASE}/agent/command`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ prompt, context })
  });
  return handleResponse(res);
}

