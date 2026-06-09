<script>
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { push } from 'svelte-spa-router';
    import { Users, UserPlus, BookOpen, ShieldCheck, Settings, UserCircle, Activity, FileText, Database, BarChart2, Shield, Bell } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { authStore } from '../lib/auth.js';
    import Modal from '../lib/components/Modal.svelte';

    let stats = $state([
        { label: 'Estudiantes Totales', value: '...', sub: 'Cargando...', icon: Users, color: 'text-blue-600', subColor: 'text-emerald-500' },
        { label: 'Docentes Totales', value: '...', sub: 'Cargando...', icon: UserPlus, color: 'text-blue-600', subColor: 'text-emerald-500' },
        { label: 'Materias Activas', value: '...', sub: 'En sistema', icon: BookOpen, color: 'text-blue-600', subColor: 'text-slate-500' },
        { label: 'Salud del Sistema', value: '98%', sub: 'Operativo', icon: ShieldCheck, color: 'text-emerald-500', subColor: 'text-emerald-500' }
    ]);

    let isEventModalOpen = $state(false);
    let newEvent = $state({ title: '', description: '', type: 'Institución', target_role: 'ALL' });

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/stats', { headers: authStore.getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                stats[0].value = data.students;
                stats[0].sub = 'Activos';
                stats[1].value = data.teachers;
                stats[1].sub = 'Activos';
                stats[2].value = data.subjects;
            }
        } catch(e) {
            console.error('Error fetching stats:', e);
        }
    });

    async function createEvent(e) {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/admin/events', {
                method: 'POST',
                headers: authStore.getAuthHeaders(),
                body: JSON.stringify(newEvent)
            });
            if (res.ok) {
                isEventModalOpen = false;
                newEvent = { title: '', description: '', type: 'Institución', target_role: 'ALL' };
                // Optionally show a success toast here
            }
        } catch(err) {
            console.error('Error creating event:', err);
        }
    }

    const actions = [
        { label: 'Agregar Usuarios', desc: 'Gestionar usuarios del sistema', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', action: () => push('/admin/users') },
        { label: 'Crear Evento/Noticia', desc: 'Publicar para estudiantes y docentes', icon: Bell, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', action: () => isEventModalOpen = true },
        { label: 'Reportes', desc: 'Ver reportes y estadísticas', icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', action: () => push('/admin/reports') },
        { label: 'Configuración', desc: 'Configurar parámetros del sistema', icon: Settings, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', action: () => push('/admin/settings') },
        { label: 'Mi Perfil', desc: 'Configuración personal y de cuenta', icon: UserCircle, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', action: () => push('/profile') }
    ];

    const activities = [
        { title: 'Nuevo estudiante registrado', desc: 'María Fernández (ID: 2024098) • Hace 15 minutos', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { title: 'Calificaciones cargadas para CS401-A', desc: 'Prof. María González • Hace 1 hora', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { title: 'Respaldo del sistema completado exitosamente', desc: 'Tarea automatizada • Hace 3 horas', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        { title: 'Reporte mensual generado', desc: 'Sistema • Hace 5 horas', icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' }
    ];
</script>

<DashboardLayout role="admin">
    <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Vista General del Sistema</h1>
        <p class="text-slate-600 dark:text-slate-400">Administra usuarios, monitorea la actividad del sistema y configura ajustes.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {#each stats as stat}
            <div class="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
                    <svelte:component this={stat.icon} size={20} class={stat.color} />
                </div>
                <div class="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <div class="text-sm font-medium {stat.subColor}">{stat.sub}</div>
            </div>
        {/each}
    </div>

    <div class="mb-10">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {#each actions as action}
                <button onclick={action.action} class="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                    <div class="w-12 h-12 {action.bg} rounded-lg flex items-center justify-center mb-4">
                        <svelte:component this={action.icon} size={24} class={action.color} />
                    </div>
                    <h3 class="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.label}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{action.desc}</p>
                </button>
            {/each}
        </div>
    </div>

    <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Actividad Reciente del Sistema</h2>
        <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-200 dark:divide-slate-800">
            {#each activities as activity}
                <div class="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div class="w-10 h-10 {activity.bg} rounded-full flex items-center justify-center flex-shrink-0">
                        <svelte:component this={activity.icon} size={20} class={activity.color} />
                    </div>
                    <div>
                        <h4 class="font-medium text-slate-900 dark:text-white">{activity.title}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400">{activity.desc}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <Modal bind:isOpen={isEventModalOpen} title="Crear Evento / Noticia">
        <form onsubmit={createEvent} class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título del Evento</label>
                <input type="text" bind:value={newEvent.title} required class="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Ej. Fecha límite de exámenes" />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                <textarea bind:value={newEvent.description} required class="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white h-24" placeholder="Cuerpo del mensaje..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                    <select bind:value={newEvent.type} class="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                        <option value="Institución">Institución</option>
                        <option value="Académico">Académico</option>
                        <option value="Sistema">Sistema</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Para quién</label>
                    <select bind:value={newEvent.target_role} class="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                        <option value="ALL">Todos</option>
                        <option value="STUDENT">Estudiantes</option>
                        <option value="TEACHER">Docentes</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end pt-4 gap-2">
                <button type="button" onclick={() => isEventModalOpen = false} class="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">Cancelar</button>
                <button type="submit" class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Publicar Evento</button>
            </div>
        </form>
    </Modal>
</DashboardLayout>
