<script>
    import { link, push } from 'svelte-spa-router';
    import { Lock, Mail, ArrowRight } from 'lucide-svelte';
    import { fly, scale } from 'svelte/transition';
    import { authStore } from '../lib/auth.js';

    let email = '';
    let password = '';
    let errorMessage = '';
    let isLoading = false;

    async function handleLogin(e) {
        e.preventDefault();
        errorMessage = '';
        isLoading = true;

        const result = await authStore.login(email, password);

        if (result.success) {
            if (result.role === 'admin') push('/admin');
            else if (result.role === 'teacher') push('/teacher');
            else push('/student');
        } else {
            errorMessage = result.message;
        }

        isLoading = false;
    }

</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center" in:fly={{ y: -20, duration: 500 }}>
        <div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/30" in:scale={{ duration: 500, delay: 200, start: 0.5 }}>
            Z
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            Inicia sesión en tu cuenta
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Portal Estudiantil ZRM
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md" in:fly={{ y: 20, duration: 500, delay: 100 }}>
        <div class="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800 transition-all">

            {#if errorMessage}
                <div class="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                    {errorMessage}
                </div>
            {/if}

            <form class="space-y-6" onsubmit={handleLogin}>
                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Correo electrónico
                    </label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Mail size={18} />
                        </div>
                        <input id="email" type="email" bind:value={email} required class="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="tu@email.com">
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Contraseña
                    </label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Lock size={18} />
                        </div>
                        <input id="password" type="password" bind:value={password} required class="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="••••••••">
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input id="remember-me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded">
                        <label for="remember-me" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            Recordarme
                        </label>
                    </div>

                    <div class="text-sm">
                        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </div>

                <div>
                    <button type="submit" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        Iniciar Sesión
                    </button>
                </div>
            </form>

            <div class="mt-6 text-center">
                 <a href="/" use:link class="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1">
                    Volver al inicio <ArrowRight size={14} />
                 </a>
            </div>
        </div>
    </div>
</div>
