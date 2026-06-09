<script>

    import { onMount } from 'svelte';
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { Shield, Filter, Search, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-svelte';
    import { fly } from 'svelte/transition';

    let search = $state('');
    let filterType = $state('Todos');

    const types = ['Todos', 'Login', 'Modificación', 'Error', 'Sistema'];

    const logs = [
        { id: 1, user: 'Admin Principal', action: 'Inicio de sesión exitoso', type: 'Login', ip: '192.168.1.10', date: '2025-06-07 08:14:22', status: 'ok' },
        { id: 2, user: 'Prof. María González', action: 'Calificaciones cargadas - CS401-A', type: 'Modificación', ip: '192.168.1.45', date: '2025-06-07 09:32:10', status: 'ok' },
        { id: 3, user: 'Admin Principal', action: 'Usuario nuevo registrado: Fernández M.', type: 'Modificación', ip: '192.168.1.10', date: '2025-06-07 10:01:55', status: 'ok' },
        { id: 4, user: 'Sistema', action: 'Respaldo automático completado', type: 'Sistema', ip: 'localhost', date: '2025-06-07 03:00:00', status: 'ok' },
        { id: 5, user: 'juan.perez@zrm.edu', action: 'Intento de inicio de sesión fallido (3 intentos)', type: 'Error', ip: '201.99.15.200', date: '2025-06-06 22:45:33', status: 'error' },
        { id: 6, user: 'Prof. Carlos Ramírez', action: 'Descarga de reporte mensual PDF', type: 'Modificación', ip: '192.168.1.78', date: '2025-06-06 17:20:11', status: 'ok' },
        { id: 7, user: 'Sistema', action: 'Error de conexión a base de datos (recuperado)', type: 'Error', ip: 'localhost', date: '2025-06-06 14:05:00', status: 'warning' },
        { id: 8, user: 'Admin Auxiliar', action: 'Configuración del sistema modificada', type: 'Modificación', ip: '192.168.1.12', date: '2025-06-06 11:30:45', status: 'ok' },
        { id: 9, user: 'Sistema', action: 'Envío masivo de notificaciones completado', type: 'Sistema', ip: 'localhost', date: '2025-06-06 08:00:01', status: 'ok' },
        { id: 10, user: 'Prof. Ana López', action: 'Inicio de sesión exitoso', type: 'Login', ip: '192.168.1.55', date: '2025-06-05 07:58:12', status: 'ok' },
    ];

    let filtered = $derived(
        logs.filter(l => {
            const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase());
            const matchType = filterType === 'Todos' || l.type === filterType;
            return matchSearch && matchType;
        })
    );

    function statusIcon(s) {
        if (s === 'ok') return CheckCircle;
        if (s === 'warning') return AlertTriangle;
        return XCircle;
    }
    function statusColor(s) {
        if (s === 'ok') return 'text-emerald-500';
        if (s === 'warning') return 'text-yellow-500';
        return 'text-red-500';
    }
    function typeBadge(t) {
        const map = {
            'Login': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
            'Modificación': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
            'Error': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
            'Sistema': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        };
        return map[t] || 'bg-slate-100 text-slate-700';
    }

</script>

<DashboardLayout role="admin">
    <div class="mb-8" in:fly={{ y: 20, duration: 400 }}>
        <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                <Shield size={22} />
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Auditoría del Sistema</h1>
        </div>
        <p class="text-slate-500 dark:text-slate-400 ml-13">Registro completo de actividades e incidentes del sistema.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" in:fly={{ y: 20, duration: 400, delay: 100 }}>
        {#each [
            { label: 'Eventos Hoy', value: '47', color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Inicios de Sesión', value: '23', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Modificaciones', value: '18', color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Errores', value: '2', color: 'text-red-600 dark:text-red-400' }
        ] as s}
            <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div class="text-2xl font-bold {s.color} mb-1">{s.value}</div>
                <div class="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
        {/each}
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 p-4" in:fly={{ y: 20, duration: 400, delay: 150 }}>
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div class="relative flex-1 max-w-md">
                <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" bind:value={search} placeholder="Buscar por usuario o acción..." class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div class="flex gap-2 flex-wrap">
                {#each types as t}
                    <button onclick={() => filterType = t} class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {filterType === t ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}">
                        {t}
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" in:fly={{ y: 20, duration: 400, delay: 200 }}>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                        <th class="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                        <th class="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Usuario</th>
                        <th class="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Acción</th>
                        <th class="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Tipo</th>
                        <th class="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">IP</th>
                        <th class="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    {#each filtered as log (log.id)}
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <td class="px-4 py-3">
                                <svelte:component this={statusIcon(log.status)} size={18} class={statusColor(log.status)} />
                            </td>
                            <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{log.user}</td>
                            <td class="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.action}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold {typeBadge(log.type)}">{log.type}</span>
                            </td>
                            <td class="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.ip}</td>
                            <td class="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{log.date}</td>
                        </tr>
                    {/each}
                    {#if filtered.length === 0}
                        <tr>
                            <td colspan="6" class="px-4 py-12 text-center text-slate-400 dark:text-slate-600">
                                No se encontraron registros con los filtros aplicados.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</DashboardLayout>
