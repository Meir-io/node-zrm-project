import { writable } from 'svelte/store';

export const isDark = writable(false);

export function toggleTheme() {
    isDark.update(v => {
        const next = !v;
        if (next) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return next;
    });
}
