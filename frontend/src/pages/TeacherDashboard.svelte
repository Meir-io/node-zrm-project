<script>

    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { link } from 'svelte-spa-router';
    import { Users, BookOpen, FileText, Calendar } from 'lucide-svelte';

    import { onMount } from 'svelte';
    import { authUser, authStore } from '../lib/auth.js';
    import Modal from '../lib/components/Modal.svelte';

    let stats = $state([
        { label: 'Grupos Asignados', value: '...', icon: Users, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Avisos Recientes', value: '...', icon: Calendar, color: 'text-emerald-500 dark:text-emerald-400' },
        { label: 'Calificaciones Pendientes', value: 'Por revisar', icon: FileText, color: 'text-red-500 dark:text-red-400' }
    ]);

    let groups = $state([]);
    let events = $state([]);
    let modalAviso = $state(null);

    onMount(async () => {
        try {

            const resGroups = await fetch('http://localhost:5000/api/teacher/groups', { headers: authStore.getAuthHeaders() });
            if (resGroups.ok) {
                const data = await resGroups.json();
                groups = data.map(g => ({
                    id: g.id,
                    name: `${g.subject_name} - ${g.name}`,
                    schedule: g.schedule,
                    room: g.room,
                    students: 'Varios'
                }));
                stats[0].value = groups.length.toString();
            }

            const resEvents = await fetch('http://localhost:5000/api/events', { headers: authStore.getAuthHeaders() });
            if (resEvents.ok) {
                const data = await resEvents.json();
                events = data;
                stats[1].value = events.length.toString();
            }
        } catch(e) {
            console.error('Error fetching teacher dashboard data:', e);
        }
    });

</script>

<DashboardLayout role="teacher">
    <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bienvenido(a), {$authUser?.name || 'Profesor'}</h1>
        <p class="text-slate-600 dark:text-slate-400">Administra tus cursos y revisa los avisos institucionales.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {#each stats as stat}
            <div class="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
                    <svelte:component this={stat.icon} size={20} class={stat.color} />
                </div>
                <div class="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
            </div>
        {/each}
    </div>

    <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Mis Grupos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each groups as group}
                <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
                    <div class="p-6 flex-1">
                        <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                            <Users size={20} class="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-4 line-clamp-2">{group.name}</h3>
                        <div class="space-y-2 mb-6">
                            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                <Users size={16} />
                                <span>{group.students} estudiantes</span>
                            </div>
                            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                <FileText size={16} />
                                <span>{group.schedule}</span>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 pb-6 mt-auto">
                        <a
                            href="/teacher/grades"
                            use:link
                            class="block w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-center font-medium rounded-lg transition-colors"
                        >
                            Cargar Actas
                        </a>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="mt-10">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Avisos Institucionales</h2>
        <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
            {#each events as event}
                <button onclick={() => modalAviso = event} class="w-full text-left p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 {event.type === 'Institución' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <h4 class="font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                        <div class="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span class="font-medium">{event.first_name} {event.last_name} ({event.author_role})</span>
                            <span>•</span>
                            <span>{new Date(event.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </button>
            {:else}
                <div class="p-6 text-center text-slate-500">No hay avisos recientes.</div>
            {/each}
        </div>
    </div>

    <Modal bind:isOpen={modalAviso} title={modalAviso ? modalAviso.title : ''}>
        {#if modalAviso}
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
                    <span class="font-bold text-slate-700 dark:text-slate-300">{modalAviso.first_name} {modalAviso.last_name}</span>
                    <span>•</span>
                    <span class="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded text-xs">{modalAviso.type}</span>
                </div>
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {modalAviso.description}
                </p>
                <div class="mt-6 flex justify-end">
                    <button onclick={() => modalAviso = null} class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Cerrar</button>
                </div>
            </div>
        {/if}
    </Modal>
</DashboardLayout>
