<script>

    import { onMount } from 'svelte';
    import { fly, fade, scale } from 'svelte/transition';
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import Chart from 'chart.js/auto';
    import { Download, CheckCircle, BookOpen, TrendingUp, Award, CreditCard, GraduationCap, User, Hash } from 'lucide-svelte';

    import { authStore } from '../lib/auth.js';

    let activeSemester = $state(0);
    let downloadState = $state('idle');
    let chartCanvas = $state(null);
    /** @type {Chart | null} */
    let chartInstance = null;

    let student = $state({
        name: 'Cargando...',
        id: '...',
        program: 'Ingeniería',
        gpa: 0,
        creditsTotal: 240,
        creditsEarned: 0,
    });

    let semesters = $state([]);

    const semesterAverages = $derived(semesters.map(sem => {
        const total = sem.subjects.reduce((a, s) => a + s.grade, 0);
        return sem.subjects.length ? +(total / sem.subjects.length).toFixed(2) : 0;
    }));

    // --- Derived: active semester data ---
    const activeSem = $derived(semesters[activeSemester] || { label: '', subjects: [] });
    const activeSemCredits = $derived(activeSem.subjects.reduce((a, s) => a + s.credits, 0));
    const activeSemAvg = $derived(activeSem.subjects.length ? +(activeSem.subjects.reduce((a, s) => a + s.grade, 0) / activeSem.subjects.length).toFixed(2) : 0);

    onMount(async () => {
        try {

            let currentUser = null;
            authStore.subscribe(s => { if (s) currentUser = s.user; })();
            if (currentUser) {
                student.name = currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
                student.id = currentUser.id;
            }

            const resKardex = await fetch('http://localhost:5000/api/student/kardex', { headers: authStore.getAuthHeaders() });
            if (resKardex.ok) {
                const kardexData = await resKardex.json();

                let sems = [];
                for (const [semStr, subjects] of Object.entries(kardexData)) {
                    sems.push({
                        label: `Semestre ${semStr}`,
                        number: parseInt(semStr) || 0,
                        subjects: subjects.map(s => ({
                            name: s.subject_name,
                            credits: s.credits,
                            grade: s.average ? parseFloat(s.average) : 0,
                            status: s.status || 'Cursando'
                        }))
                    });
                }
                sems.sort((a, b) => a.number - b.number);
                if (sems.length > 0) {
                    sems[sems.length - 1].label += ' (Actual)';
                    activeSemester = sems.length - 1;
                }
                semesters = sems;
            }

            const resPerf = await fetch('http://localhost:5000/api/student/performance', { headers: authStore.getAuthHeaders() });
            if (resPerf.ok) {
                const perfData = await resPerf.json();
                student.gpa = parseFloat(perfData.general_average) || 0;
                student.creditsEarned = parseInt(perfData.accumulated_credits) || 0;
            }
        } catch (error) {
            console.error(error);
        }
    });

    function gradeColor(g) {
        if (g >= 8) return 'text-emerald-600 dark:text-emerald-400';
        if (g >= 6) return 'text-amber-500 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    }
    function gradeBg(g) {
        if (g >= 8) return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
        if (g >= 6) return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300';
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
    }
    function statusBadge(s) {
        if (s === 'Aprobado') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (s === 'Reprobado') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }

    function handleDownload() {
        if (downloadState !== 'idle') return;
        downloadState = 'loading';
        setTimeout(() => {
            downloadState = 'done';
            setTimeout(() => { downloadState = 'idle'; }, 2000);
        }, 1000);
    }

    $effect(() => {
        if (!chartCanvas) return;
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        chartInstance = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: semesters.map(s => s.label),
                datasets: [{
                    label: 'Promedio Semestral',
                    data: semesterAverages,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37,99,235,0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#2563eb',
                    pointRadius: 6,
                    fill: true,
                    tension: 0.4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => ` Promedio: ${ctx.parsed.y}` } },
                },
                scales: {
                    y: { min: 6, max: 10, ticks: { stepSize: 0.5 }, grid: { color: 'rgba(148,163,184,0.15)' } },
                    x: { grid: { display: false } },
                },
            },
        });
        return () => { if (chartInstance) { chartInstance.destroy(); chartInstance = null; } };
    });

</script>

<DashboardLayout role="student">

    <div class="mb-8" in:fly={{ y: -16, duration: 400 }}>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Kardex Académico</h1>
                <p class="text-slate-500 dark:text-slate-400 mt-1">Historial completo de calificaciones por semestre</p>
            </div>

            <button
                onclick={handleDownload}
                disabled={downloadState !== 'idle'}
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                    {downloadState === 'done'
                        ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none shadow-lg'
                        : downloadState === 'loading'
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none shadow-md'}"
            >
                {#if downloadState === 'loading'}
                    <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Descargando...
                {:else if downloadState === 'done'}
                    <CheckCircle size={16} />
                    ¡Descargado!
                {:else}
                    <Download size={16} />
                    Descargar Kardex
                {/if}
            </button>
        </div>
    </div>

    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30" in:fly={{ y: 16, duration: 400, delay: 80 }}>
        <div class="flex flex-col md:flex-row md:items-center gap-6">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-white">
                <GraduationCap size={32} />
            </div>
            <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p class="text-blue-200 text-xs font-medium uppercase tracking-wide">Estudiante</p>
                    <p class="font-bold text-sm mt-0.5 leading-snug">{student.name}</p>
                </div>
                <div>
                    <p class="text-blue-200 text-xs font-medium uppercase tracking-wide flex items-center gap-1"><Hash size={10}/> Matrícula</p>
                    <p class="font-bold text-sm mt-0.5">{student.id}</p>
                </div>
                <div class="col-span-2 md:col-span-1">
                    <p class="text-blue-200 text-xs font-medium uppercase tracking-wide">Programa</p>
                    <p class="font-bold text-sm mt-0.5 leading-snug">{student.program}</p>
                </div>
                <div class="flex flex-col items-start md:items-end">
                    <p class="text-blue-200 text-xs font-medium uppercase tracking-wide">Promedio General</p>
                    <p class="font-extrabold text-3xl mt-0.5">{student.gpa}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="flex gap-2 mb-6 overflow-x-auto pb-1" in:fly={{ y: 10, duration: 400, delay: 120 }}>
        {#each semesters as sem, i}
            <button
                onclick={() => activeSemester = i}
                class="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border
                    {activeSemester === i
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'}"
            >
                {sem.label}
            </button>
        {/each}
    </div>

    {#key activeSemester}
        <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 overflow-hidden"
             in:fly={{ y: 12, duration: 300 }}>
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BookOpen size={16} />
                </div>
                <h2 class="font-bold text-slate-900 dark:text-white">{activeSem.label}</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/50">
                            <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Materia</th>
                            <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Créditos</th>
                            <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Calificación</th>
                            <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        {#each activeSem.subjects as subject, idx}
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors" in:fly={{ y: 6, duration: 200, delay: idx * 40 }}>
                                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{subject.name}</td>
                                <td class="px-4 py-4 text-center text-slate-600 dark:text-slate-400">{subject.credits}</td>
                                <td class="px-4 py-4 text-center">
                                    <span class="inline-block px-3 py-1 rounded-lg font-bold text-base {gradeBg(subject.grade)}">
                                        {subject.grade}
                                    </span>
                                </td>
                                <td class="px-4 py-4 text-center">
                                    <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold {statusBadge(subject.status)}">
                                        {subject.status}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                    <tfoot>
                        <tr class="bg-blue-50 dark:bg-blue-950/30 border-t-2 border-blue-100 dark:border-blue-900">
                            <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Totales del Semestre</td>
                            <td class="px-4 py-4 text-center font-bold text-blue-600 dark:text-blue-400">{activeSemCredits} cr.</td>
                            <td class="px-4 py-4 text-center">
                                <span class="font-extrabold text-blue-700 dark:text-blue-300 text-base">{activeSemAvg}</span>
                            </td>
                            <td class="px-4 py-4 text-center text-slate-500 text-xs">Promedio sem.</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    {/key}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <div class="space-y-4">
            {#each [
                { icon: Award,      label: 'Promedio General',          value: student.gpa,                       color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: CreditCard, label: 'Créditos Acumulados',       value: `${student.creditsEarned} cr.`,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: TrendingUp, label: 'Créditos para Titulación',  value: `${student.creditsTotal - student.creditsEarned} cr.`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ] as card, i}
                <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm"
                     in:fly={{ x: -16, duration: 400, delay: i * 80 }}>
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 {card.bg} {card.color}">
                        <svelte:component this={card.icon} size={22} />
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
                        <p class="text-2xl font-extrabold {card.color}">{card.value}</p>
                    </div>
                </div>
            {/each}
        </div>

        <div class="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
             in:fly={{ x: 16, duration: 400, delay: 100 }}>
            <div class="flex items-center gap-3 mb-5">
                <div class="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <TrendingUp size={16} />
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white">Progresión del Promedio por Semestre</h3>
            </div>
            <div class="h-52 relative">
                <canvas bind:this={chartCanvas}></canvas>
            </div>
        </div>
    </div>
</DashboardLayout>
