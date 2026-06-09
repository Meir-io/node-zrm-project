<script>
    import { onMount } from 'svelte';
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import Modal from '../lib/components/Modal.svelte';
    import { BookOpen, Calendar, TrendingUp, Bell, Clock, Maximize2 } from 'lucide-svelte';
    import Chart from 'chart.js/auto';

    let chartCanvas;
    let modalChartCanvas;

    let modalKardex = $state(false);
    let modalHorario = $state(false);
    let modalRendimiento = $state(false);
    let isModalAvisoOpen = $state(false);
    let modalAviso = $state(null);

    import { authStore } from '../lib/auth.js';

    let kardex = $state([]);
    let schedule = $state([]);
    let updates = $state([]);

    onMount(async () => {
        try {
            // Load dashboard grades
            const resGrades = await fetch('http://localhost:5000/api/student/dashboard', { headers: authStore.getAuthHeaders() });
            if (resGrades.ok) {
                const data = await resGrades.json();
                kardex = data.map(d => ({
                    course: d.subject_name,
                    grade: d.average || 'N/A',
                    credits: d.credits,
                    status: d.average >= 7 ? 'Aprobado' : (d.average < 7 ? 'Reprobado' : 'Cursando')
                }));
            }

            // Load Full Kardex for charts
            const resKardex = await fetch('http://localhost:5000/api/student/kardex', { headers: authStore.getAuthHeaders() });
            if (resKardex.ok) {
                const kardexData = await resKardex.json();

                let sems = [];
                for (const [semStr, subjects] of Object.entries(kardexData)) {
                    const total = subjects.reduce((acc, s) => acc + (s.average ? parseFloat(s.average) : 0), 0);
                    const avg = subjects.length ? +(total / subjects.length).toFixed(2) : 0;
                    sems.push({ sem: parseInt(semStr) || 0, avg, label: `Semestre ${semStr}` });
                }
                sems.sort((a, b) => a.sem - b.sem);

                chartLabels = sems.map(s => s.label);
                chartData = sems.map(s => s.avg);
            }

            // Load schedule
            const resSchedule = await fetch('http://localhost:5000/api/student/schedule', { headers: authStore.getAuthHeaders() });
            if (resSchedule.ok) {
                const data = await resSchedule.json();
                schedule = data.map(d => ({
                    time: d.schedule,
                    course: d.subject_name,
                    room: d.room,
                    day: 'Lunes'
                }));
            }

            // Load events
            const resEvents = await fetch('http://localhost:5000/api/events', { headers: authStore.getAuthHeaders() });
            if (resEvents.ok) {
                updates = await resEvents.json();
            }
        } catch (error) {
            console.error(error);
        }
    });

    let chartLabels = $state([]);
    let chartData = $state([]);
    let chartInstanceBar = null;
    let chartInstanceLine = null;

    $effect(() => {
        if (modalRendimiento && modalChartCanvas && chartLabels.length > 0) {
            if (chartInstanceBar) chartInstanceBar.destroy();
            const ctx = modalChartCanvas.getContext('2d');
            chartInstanceBar = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Promedio Obtenido',
                        data: chartData,
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 0, max: 10 } }
                }
            });
        }
    });

    $effect(() => {
        if (chartCanvas && chartLabels.length > 0) {
            if (chartInstanceLine) chartInstanceLine.destroy();

            // Pad to at least 2 points so it looks like a graph
            let renderLabels = [...chartLabels];
            let renderData = [...chartData];
            if (renderLabels.length === 1) {
                renderLabels.unshift('Inicio');
                renderData.unshift(0);
            }

            chartInstanceLine = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: renderLabels,
                    datasets: [{
                        label: 'Promedio por Semestre',
                        data: renderData,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#2563eb',
                        pointRadius: 5,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { min: 0, max: 10 }
                    }
                }
            });
        }
    });
</script>

<DashboardLayout role="student">
    <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Portal Estudiantil</h1>
        <p class="text-slate-600 dark:text-slate-400">Resumen académico de tu semestre actual.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <button onclick={() => modalKardex = true} class="text-left bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col hover:border-blue-500 hover:shadow-md transition-all group">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BookOpen size={20} />
                    </div>
                    <h2 class="text-lg font-bold text-slate-900 dark:text-white">Kardex Reciente</h2>
                </div>
                <Maximize2 size={18} class="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div class="flex-1 w-full space-y-4">
                {#each kardex as item}
                    <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0">
                        <div>
                            <p class="font-medium text-slate-900 dark:text-white text-sm">{item.course}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">{item.credits} Créditos</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-blue-600 dark:text-blue-400">{item.grade}</p>
                            <p class="text-xs text-emerald-500">{item.status}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </button>

        <button onclick={() => modalHorario = true} class="text-left bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col hover:border-blue-500 hover:shadow-md transition-all group">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Calendar size={20} />
                    </div>
                    <h2 class="text-lg font-bold text-slate-900 dark:text-white">Próximas Clases</h2>
                </div>
                <Maximize2 size={18} class="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div class="flex-1 w-full space-y-4">
                {#each schedule as item}
                    <div class="flex gap-4 items-start">
                        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-0.5">
                            {item.time}
                        </div>
                        <div>
                            <p class="font-medium text-slate-900 dark:text-white text-sm">{item.course}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">{item.room} • {item.day}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </button>

        <button onclick={() => modalRendimiento = true} class="text-left bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col hover:border-blue-500 hover:shadow-md transition-all group">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <TrendingUp size={20} />
                    </div>
                    <h2 class="text-lg font-bold text-slate-900 dark:text-white">Rendimiento Histórico</h2>
                </div>
                <Maximize2 size={18} class="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div class="flex-1 w-full min-h-[200px] relative pointer-events-none">
                <canvas bind:this={chartCanvas}></canvas>
            </div>
        </button>
    </div>

    <div>
        <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Bell size={20} />
            </div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Actualizaciones de Maestros e Institución</h2>
        </div>

        <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
            {#each updates as update}
                <button onclick={() => { modalAviso = update; isModalAvisoOpen = true; }} class="w-full text-left p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 {update.type === 'Institución' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}">
                        {#if update.type === 'Institución'}
                            <BookOpen size={18} />
                        {:else}
                            <Calendar size={18} />
                        {/if}
                    </div>
                    <div>
                        <h4 class="font-semibold text-slate-900 dark:text-white">{update.title}</h4>
                        <div class="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span class="font-medium">{update.first_name} {update.last_name} ({update.author_role})</span>
                            <span class="flex items-center gap-1"><Clock size={14} /> {new Date(update.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </button>
            {:else}
                <div class="p-6 text-center text-slate-500">No hay actualizaciones recientes.</div>
            {/each}
        </div>
    </div>

    <Modal bind:isOpen={modalKardex} title="Kardex Completo">
        <div class="space-y-4">
            {#each kardex as item}
                <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <p class="font-bold text-lg text-slate-900 dark:text-white">{item.course}</p>
                    <div class="mt-2 flex justify-between text-sm">
                        <span class="text-slate-600 dark:text-slate-400">Calificación: <strong class="text-blue-600 dark:text-blue-400">{item.grade}</strong></span>
                        <span class="text-emerald-600 dark:text-emerald-400">{item.status}</span>
                    </div>
                </div>
            {/each}
        </div>
    </Modal>

    <Modal bind:isOpen={modalHorario} title="Horario Detallado">
        <div class="space-y-4">
            {#each schedule as item}
                <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="inline-block px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-bold rounded mb-2">{item.day} • {item.time}</span>
                        <p class="font-bold text-slate-900 dark:text-white">{item.course}</p>
                    </div>
                    <div class="text-slate-500 dark:text-slate-400 font-medium">
                        {item.room}
                    </div>
                </div>
            {/each}
        </div>
    </Modal>

    <Modal bind:isOpen={modalRendimiento} title="Análisis de Rendimiento Detallado">
        <div class="h-[400px] w-full relative">
            <canvas bind:this={modalChartCanvas}></canvas>
        </div>
    </Modal>

    <Modal bind:isOpen={isModalAvisoOpen} title="Detalles del Aviso">
        {#if modalAviso}
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
                    <span class="font-bold text-slate-700 dark:text-slate-300">{modalAviso.first_name} {modalAviso.last_name}</span>
                    <span>•</span>
                    <span class="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded text-xs">{modalAviso.type}</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{modalAviso.title}</h3>
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {modalAviso.description}
                </p>
                <div class="mt-6 flex justify-end">
                    <button onclick={() => modalAviso = null} class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Cerrar Aviso</button>
                </div>
            </div>
        {/if}
    </Modal>
</DashboardLayout>
