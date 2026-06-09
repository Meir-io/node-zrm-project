
import { writable } from 'svelte/store';

const API_URL = 'http://localhost:5000/api';

function createAuthStore() {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('zrm_user') : null;
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('zrm_token') : null;

    const initial = storedUser && storedToken ? { user: JSON.parse(storedUser), token: storedToken } : null;

    const { subscribe, set } = writable(initial);

    return {
        subscribe,

        async login(email, password) {
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al iniciar sesión');
                }

                const roleLower = data.user.role.toLowerCase();
                const user = {
                    ...data.user,
                    role: roleLower
                };

                const session = { user, token: data.token };
                set(session);

                localStorage.setItem('zrm_user', JSON.stringify(user));
                localStorage.setItem('zrm_token', data.token);

                return { success: true, role: roleLower };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: error.message };
            }
        },

        logout() {
            set(null);
            localStorage.removeItem('zrm_user');
            localStorage.removeItem('zrm_token');
            window.location.hash = '/login';
        },

        getAuthHeaders() {
            const token = localStorage.getItem('zrm_token');
            return {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
        }
    };
}

export const authStore = createAuthStore();

import { derived } from 'svelte/store';
export const authUser = derived(authStore, $state => $state ? $state.user : null);
