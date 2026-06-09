<script>

    import { link, push } from 'svelte-spa-router';
    import { authUser, authStore } from '../auth.js';
    import { isDark, toggleTheme } from '../theme.js';
    import { Sun, Moon, LogIn, LogOut, UserCircle, ChevronDown } from 'lucide-svelte';

    let dropdownOpen = $state(false);

    function handleLogout() {
        authStore.logout();
        dropdownOpen = false;
        push('/');
    }

    function goToDashboard() {
        dropdownOpen = false;
        if (!$authUser) return;
        if ($authUser.role === 'admin') push('/admin');
        else if ($authUser.role === 'teacher') push('/teacher');
        else push('/student');
    }

</script>

<header class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
                <a href="/" use:link class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">
                        E
                    </div>
                    <span class="font-bold text-xl text-slate-900 dark:text-white">EI</span>
                </a>
            </div>

            <div class="flex items-center gap-3">

                <button
                    onclick={toggleTheme}
                    class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                    {#if $isDark}
                        <Sun size={20} />
                    {:else}
                        <Moon size={20} />
                    {/if}
                </button>

                {#if $authUser}

                    <div class="relative">
                        <button
                            onclick={() => dropdownOpen = !dropdownOpen}
                            class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors"
                        >
                            <div class="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {$authUser.name.slice(0,1).toUpperCase()}
                            </div>
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{$authUser.name}</span>
                            <ChevronDown size={14} class="text-slate-500 transition-transform {dropdownOpen ? 'rotate-180' : ''}" />
                        </button>

                        {#if dropdownOpen}
                            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50">
                                <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <p class="text-xs text-slate-500 dark:text-slate-400">Conectado como</p>
                                    <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{$authUser.name}</p>
                                </div>
                                <button onclick={goToDashboard} class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <UserCircle size={16} /> Mi Portal
                                </button>
                                <button onclick={handleLogout} class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <LogOut size={16} /> Cerrar Sesión
                                </button>
                            </div>
                        {/if}
                    </div>
                {:else}

                    <a
                        href="/login"
                        use:link
                        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                    >
                        <LogIn size={16} />
                        Iniciar Sesión
                    </a>
                {/if}
            </div>
        </div>
    </div>
</header>

{#if dropdownOpen}
    <button class="fixed inset-0 z-40 w-full h-full cursor-default border-0 bg-transparent" onclick={() => dropdownOpen = false} aria-label="Cerrar menú"></button>
{/if}
