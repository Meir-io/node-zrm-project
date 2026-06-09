<script>

    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { Users, UserCheck, TrendingUp, Award, Download, BarChart2, FileText, Calendar } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';
    import { onMount } from 'svelte';

    import { authStore } from '../lib/auth.js';

    let stats = $state([
        { label: 'Total Estudiantes',   value: '...', change: 'Activos',   icon: Users,      color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/30',    border: 'border-blue-100 dark:border-blue-800' },
        { label: 'Total Docentes',      value: '...', change: 'Activos',    icon: UserCheck,   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-100 dark:border-violet-800' },
        { label: 'Materias',            value: '...', change: 'En el sistema', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-100 dark:border-emerald-800' },
        { label: 'Tasa de Aprobación',  value: '94%', change: 'Meta: 90%',      icon: Award,      color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/30',   border: 'border-amber-100 dark:border-amber-800' },
    ]);

    let chkCalificaciones = $state(true);
    let chkAsistencia     = $state(false);
    let chkRendimiento    = $state(false);
    let dateFrom          = $state('2025-01-01');
    let dateTo            = $state('2025-06-30');
    let generating        = $state(false);

    function generateReport() {
        generating = true;
        setTimeout(() => { generating = false; }, 1800);
    }

    const recentReports = [
        { name: 'Reporte de Calificaciones 2025-A', by: 'Admin Sistema', date: '2025-06-01', type: 'Calificaciones' },
        { name: 'Lista de Asistencia Mayo',         by: 'Lic. García',   date: '2025-05-31', type: 'Asistencia' },
        { name: 'Rendimiento por Materia Q1',       by: 'Admin Sistema', date: '2025-04-15', type: 'Rendimiento' },
        { name: 'Reporte Anual 2024',               by: 'Dir. Guzmán',   date: '2024-12-20', type: 'Calificaciones' },
        { name: 'Asistencia Primer Semestre',       by: 'Admin Sistema', date: '2024-07-10', type: 'Asistencia' },
    ];

    const typeBadge = {
        'Calificaciones': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        'Asistencia':     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        'Rendimiento':    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    };

    /** @type {HTMLCanvasElement} */
    let chartCanvas = $state(null);

    const chartData = {
        labels: ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Inglés', 'Arte'],
        values: [8.2, 9.1, 7.8, 8.5, 8.9, 9.4],
    };

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/stats', {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                stats[0].value = data.students.toString();
                stats[1].value = data.teachers.toString();
                stats[2].value = data.subjects.toString();
            }
        } catch (error) {
            console.error('Error fetching admin stats', error);
        }

        const { default: Chart } = await import('chart.js/auto');

        if (!chartCanvas) return;

        new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Promedio',
                    data: chartData.values,
                    backgroundColor: [
                        'rgba(59,130,246,0.75)',
                        'rgba(139,92,246,0.75)',
                        'rgba(16,185,129,0.75)',
                        'rgba(245,158,11,0.75)',
                        'rgba(236,72,153,0.75)',
                        'rgba(99,102,241,0.75)',
                    ],
                    borderColor: [
                        'rgba(59,130,246,1)',
                        'rgba(139,92,246,1)',
                        'rgba(16,185,129,1)',
                        'rgba(245,158,11,1)',
                        'rgba(236,72,153,1)',
                        'rgba(99,102,241,1)',
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15,23,42,0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1',
                        cornerRadius: 10,
                        padding: 12,
                        callbacks: {
                            label: ctx => ` Promedio: ${ctx.parsed.y.toFixed(1)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 12 } }
                    },
                    y: {
                        min: 6,
                        max: 10,
                        grid: { color: 'rgba(148,163,184,0.12)' },
                        border: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 12 }, stepSize: 1 }
                    }
                }
            }
        });
    });

</script>

<DashboardLayout role="admin">

    <div class="mb-8" in:fly={{ y: -16, duration: 350 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Reportes y Análisis</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Visualiza estadísticas y genera reportes institucionales.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8" in:fly={{ y: 16, duration: 350, delay: 60 }}>
        {#each stats as stat, i}
            <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
                 in:fly={{ y: 20, duration: 300, delay: 80 + i * 60 }}>
                <div class="w-11 h-11 rounded-xl {stat.bg} border {stat.border} flex items-center justify-center flex-shrink-0">
                    <svelte:component this={stat.icon} size={20} class={stat.color} />
                </div>
                <div>
                    <p class="text-xs text-slate-400 mb-0.5">{stat.label}</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p class="text-xs text-emerald-500 font-medium mt-0.5">{stat.change}</p>
                </div>
            </div>
        {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
             in:fly={{ y: 20, duration: 350, delay: 140 }}>
            <div class="flex items-center gap-2 mb-5">
                <FileText size={18} class="text-blue-600 dark:text-blue-400" />
                <h2 class="font-semibold text-slate-900 dark:text-white">Generar Reporte</h2>
            </div>

            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Incluir en el reporte</p>
            <div class="space-y-3 mb-5">
                {#each [
                    { label: 'Reporte de Calificaciones', key: 'cal' },
                    { label: 'Lista de Asistencia',       key: 'asis' },
                    { label: 'Rendimiento por Materia',   key: 'rend' },
                ] as item}
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={item.key === 'cal' ? chkCalificaciones : item.key === 'asis' ? chkAsistencia : chkRendimiento}
                            onchange={() => {
                                if (item.key === 'cal') chkCalificaciones = !chkCalificaciones;
                                else if (item.key === 'asis') chkAsistencia = !chkAsistencia;
                                else chkRendimiento = !chkRendimiento;
                            }}
                            class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span class="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.label}</span>
                    </label>
                {/each}
            </div>

            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Rango de fechas</p>
            <div class="grid grid-cols-2 gap-3 mb-5">
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Desde</label>
                    <input type="date" bind:value={dateFrom}
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-1">Hasta</label>
                    <input type="date" bind:value={dateTo}
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
            </div>

            <button
                onclick={generateReport}
                disabled={generating}
                class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white
                    bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
                {#if generating}
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Generando…
                {:else}
                    <Download size={16} /> Descargar PDF
                {/if}
            </button>
        </div>

        <div class="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
             in:fly={{ y: 20, duration: 350, delay: 200 }}>
            <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2">
                    <BarChart2 size={18} class="text-violet-600 dark:text-violet-400" />
                    <h2 class="font-semibold text-slate-900 dark:text-white">Promedio por Materia</h2>
                </div>
                <span class="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">Periodo 2025-A</span>
            </div>
            <div class="h-64 relative">
                <canvas bind:this={chartCanvas}></canvas>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                {#each chartData.labels as label, i}
                    <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                        {label}: <span class="font-semibold">{chartData.values[i]}</span>
                    </span>
                {/each}
            </div>
        </div>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
         in:fly={{ y: 20, duration: 350, delay: 260 }}>
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Calendar size={18} class="text-slate-500 dark:text-slate-400" />
            <h2 class="font-semibold text-slate-900 dark:text-white">Reportes Recientes</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-slate-50 dark:bg-slate-900/50 text-left">
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Generado por</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    {#each recentReports as report, i}
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors" in:fade={{ duration: 200, delay: i * 40 }}>
                            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{report.name}</td>
                            <td class="px-6 py-4 text-slate-500 dark:text-slate-400">{report.by}</td>
                            <td class="px-6 py-4 text-slate-500 dark:text-slate-400">{report.date}</td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold {typeBadge[report.type] ?? ''}">
                                    {report.type}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <button class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">
                                    <Download size={13} /> Descargar
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

</DashboardLayout>
