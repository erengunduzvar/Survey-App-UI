// Base URL tanımı.
// Gerekirse burayı değiştirerek backend adresini tek yerden yönetebilirsin.
// Örn: "http://localhost:8080" veya production URL.
const BASE_URL = "http://localhost:8080";

export const authService = {
  // URL oluşturma yardımcısı (URL'nin başına base ekler)
  buildUrl(endpoint) {
    if (endpoint.startsWith("http")) return endpoint;
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${BASE_URL}${cleanEndpoint}`;
  },

  async register(userData) {
    // Kendi yazdığımız fetchWithAuth'u kullanıyoruz (Token henüz yoksa eklemez)
    const response = await this.fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");

    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  async login(credentials) {
    const response = await this.fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Tüm API istekleri için merkezi metod.
   * 1. URL'yi otomatik tamamlar (8080 ekler).
   * 2. Varsa Bearer Token'ı header'a ekler.
   * 3. Content-Type'ı ayarlar.
   */
  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    const fullUrl = this.buildUrl(url);

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(fullUrl, {
      ...options,
      headers,
    });
  },
};
