<script>
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { Building2, BookOpen, Bell, Shield, CheckCircle, Eye, EyeOff } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';

    // ── Institutional Info ─────────────────────────────────────────────────────
    let schoolName    = $state('Centro Escolar Zenith');
    let address       = $state('Av. Educación 1024, Col. Universidad, CDMX');
    let phone         = $state('+52 55 1234 5678');
    let contactEmail  = $state('contacto@zenith.edu.mx');

    // ── Academic Config ────────────────────────────────────────────────────────
    let currentPeriod    = $state('2025-B');
    let maxStudentsGroup = $state(35);

    // ── Notifications ──────────────────────────────────────────────────────────
    let emailNotifs   = $state(true);
    let systemAlerts  = $state(true);
    let maintenanceMode = $state(false);

    // ── Security ───────────────────────────────────────────────────────────────
    let oldPassword     = $state('');
    let newPassword     = $state('');
    let confirmPassword = $state('');
    let showOld         = $state(false);
    let showNew         = $state(false);
    let showConfirm     = $state(false);

    // ── Toast state ────────────────────────────────────────────────────────────
    let toastSection = $state('');   // which section saved most recently

    function save(section) {
        toastSection = section;
        setTimeout(() => { toastSection = ''; }, 2200);
    }

    function changePassword(e) {
        e.preventDefault();
        save('security');
        oldPassword = ''; newPassword = ''; confirmPassword = '';
    }
</script>

<DashboardLayout role="admin">

    <div class="mb-8" in:fly={{ y: -16, duration: 350 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Configuración del Sistema</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Personaliza y administra los parámetros globales de ZRM.</p>
    </div>

    <div class="space-y-6">

        <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
             in:fly={{ y: 20, duration: 350, delay: 60 }}>
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building2 size={18} class="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 class="font-semibold text-slate-900 dark:text-white">Información Institucional</h2>
                    <p class="text-xs text-slate-400">Datos de la institución educativa</p>
                </div>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre del plantel</label>
                    <input type="text" bind:value={schoolName}
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dirección</label>
                    <input type="text" bind:value={address}
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Teléfono</label>
                    <input type="tel" bind:value={phone}
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correo de contacto</label>
                    <input type="email" bind:value={contactEmail}
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
            </div>
            <div class="px-6 pb-5 flex items-center justify-between">
                {#if toastSection === 'institutional'}
                    <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
                        <CheckCircle size={16} /> ¡Guardado!
                    </span>
                {:else}
                    <span></span>
                {/if}
                <button onclick={() => save('institutional')}
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                    Guardar cambios
                </button>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
             in:fly={{ y: 20, duration: 350, delay: 120 }}>
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div class="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <BookOpen size={18} class="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <h2 class="font-semibold text-slate-900 dark:text-white">Configuración Académica</h2>
                    <p class="text-xs text-slate-400">Parámetros del ciclo escolar actual</p>
                </div>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Periodo actual</label>
                    <input type="text" bind:value={currentPeriod} placeholder="Ej. 2025-B"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    <p class="text-xs text-slate-400 mt-1">Formato recomendado: AAAA-A o AAAA-B</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Máx. estudiantes por grupo</label>
                    <input type="number" bind:value={maxStudentsGroup} min="1" max="100"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    <p class="text-xs text-slate-400 mt-1">Capacidad máxima por aula</p>
                </div>
            </div>
            <div class="px-6 pb-5 flex items-center justify-between">
                {#if toastSection === 'academic'}
                    <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
                        <CheckCircle size={16} /> ¡Guardado!
                    </span>
                {:else}
                    <span></span>
                {/if}
                <button onclick={() => save('academic')}
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                    Guardar cambios
                </button>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
             in:fly={{ y: 20, duration: 350, delay: 180 }}>
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <Bell size={18} class="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h2 class="font-semibold text-slate-900 dark:text-white">Notificaciones</h2>
                    <p class="text-xs text-slate-400">Control de alertas y avisos del sistema</p>
                </div>
            </div>
            <div class="p-6 space-y-5">
                {#each [
                    { label: 'Notificaciones por correo', desc: 'Recibe actualizaciones en tu email institucional', key: 'email' },
                    { label: 'Alertas del sistema',       desc: 'Notificaciones en tiempo real sobre el sistema',   key: 'alerts' },
                    { label: 'Modo mantenimiento',        desc: 'Restringe el acceso mientras se realizan cambios', key: 'maintenance' },
                ] as item}
                    <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div>
                            <p class="text-sm font-medium text-slate-800 dark:text-white">{item.label}</p>
                            <p class="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                        </div>

                        <button
                            role="switch"
                            aria-checked={item.key === 'email' ? emailNotifs : item.key === 'alerts' ? systemAlerts : maintenanceMode}
                            onclick={() => {
                                if (item.key === 'email') emailNotifs = !emailNotifs;
                                else if (item.key === 'alerts') systemAlerts = !systemAlerts;
                                else maintenanceMode = !maintenanceMode;
                            }}
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                                {(item.key === 'email' ? emailNotifs : item.key === 'alerts' ? systemAlerts : maintenanceMode)
                                    ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}"
                        >
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200
                                {(item.key === 'email' ? emailNotifs : item.key === 'alerts' ? systemAlerts : maintenanceMode)
                                    ? 'translate-x-6' : 'translate-x-1'}">
                            </span>
                        </button>
                    </div>
                {/each}
            </div>
            <div class="px-6 pb-5 flex items-center justify-between">
                {#if toastSection === 'notifications'}
                    <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
                        <CheckCircle size={16} /> ¡Guardado!
                    </span>
                {:else}
                    <span></span>
                {/if}
                <button onclick={() => save('notifications')}
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                    Guardar cambios
                </button>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
             in:fly={{ y: 20, duration: 350, delay: 240 }}>
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div class="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                    <Shield size={18} class="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                    <h2 class="font-semibold text-slate-900 dark:text-white">Seguridad</h2>
                    <p class="text-xs text-slate-400">Actualiza las credenciales de acceso del administrador</p>
                </div>
            </div>
            <form onsubmit={changePassword} class="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contraseña actual</label>
                    <div class="relative">
                        <input
                            type={showOld ? 'text' : 'password'}
                            bind:value={oldPassword}
                            required
                            placeholder="••••••••"
                            class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <button type="button" onclick={() => showOld = !showOld}
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            {#if showOld}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nueva contraseña</label>
                    <div class="relative">
                        <input
                            type={showNew ? 'text' : 'password'}
                            bind:value={newPassword}
                            required
                            placeholder="••••••••"
                            class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <button type="button" onclick={() => showNew = !showNew}
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            {#if showNew}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirmar contraseña</label>
                    <div class="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            bind:value={confirmPassword}
                            required
                            placeholder="••••••••"
                            class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <button type="button" onclick={() => showConfirm = !showConfirm}
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            {#if showConfirm}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
                        </button>
                    </div>
                </div>
                <div class="md:col-span-3 flex items-center justify-between pt-1">
                    {#if toastSection === 'security'}
                        <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
                            <CheckCircle size={16} /> ¡Contraseña actualizada!
                        </span>
                    {:else}
                        <p class="text-xs text-slate-400">La contraseña debe tener al menos 8 caracteres.</p>
                    {/if}
                    <button type="submit"
                        class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-200 dark:shadow-rose-900/40">
                        Cambiar contraseña
                    </button>
                </div>
            </form>
        </div>

    </div>
</DashboardLayout>
