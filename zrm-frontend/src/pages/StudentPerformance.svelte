<script>
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import Chart from 'chart.js/auto';
    import { TrendingUp, Award, BookCheck, CreditCard, Users, Star, AlertCircle } from 'lucide-svelte';

    import { authStore } from '../lib/auth.js';

    // ─── Hero Stats ───────────────────────────────────────────────────────────────
    let stats = $state([
        { icon: TrendingUp, label: 'Promedio General',    value: '0',   sub: 'Escala 0 – 10',        color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800' },
        { icon: BookCheck,  label: 'Materias Cursadas',  value: '0',    sub: 'Total Histórico',            color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
        { icon: CreditCard, label: 'Créditos Acumulados', value: '0',   sub: 'de 240 totales',        color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
        { icon: Users,      label: 'Posición en Grupo',   value: 'N/A',  sub: 'Top 10% del grupo',     color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-200 dark:border-amber-800' },
    ]);

    // ─── Best / Worst subjects ────────────────────────────────────────────────────
    let allSubjects = $state([]);
    let best  = $derived([...allSubjects].sort((a, b) => b.grade - a.grade).slice(0, 3));
    let worst = $derived([...allSubjects].sort((a, b) => a.grade - b.grade).slice(0, 3));

    // ─── Chart canvas refs ────────────────────────────────────────────────────────
    let lineCanvas  = $state(null);
    let radarCanvas = $state(null);
    let barCanvas   = $state(null);

    let lineChart  = null;
    let radarChart = null;
    let barChart   = null;

    // ─── Mount: create all 3 charts and fetch data ──────────────────────────────
    onMount(async () => {
        try {
            // Fetch Performance Stats
            const resPerf = await fetch('http://localhost:5000/api/student/performance', { headers: authStore.getAuthHeaders() });
            if (resPerf.ok) {
                const perfData = await resPerf.json();
                stats[0].value = perfData.general_average || '0';
                stats[1].value = perfData.total_subjects || '0';
                stats[2].value = perfData.accumulated_credits || '0';
            }

            // Fetch Kardex for Charts
            const resKardex = await fetch('http://localhost:5000/api/student/kardex', { headers: authStore.getAuthHeaders() });
            let semesterLabels = [];
            let semesterAverages = [];
            let gradeDist = [0, 0, 0, 0, 0]; // 5, 6, 7, 8, 9-10

            if (resKardex.ok) {
                const kardexData = await resKardex.json();
                let flatSubjects = [];

                for (const [sem, subjects] of Object.entries(kardexData)) {
                    semesterLabels.push(`Semestre ${sem}`);
                    let semTotal = 0;
                    subjects.forEach(s => {
                        const grade = parseFloat(s.average) || 0;
                        if (grade > 0) flatSubjects.push({ name: s.subject_name, grade });
                        semTotal += grade;

                        if (grade >= 9) gradeDist[4]++;
                        else if (grade >= 8) gradeDist[3]++;
                        else if (grade >= 7) gradeDist[2]++;
                        else if (grade >= 6) gradeDist[1]++;
                        else if (grade > 0) gradeDist[0]++;
                    });
                    semesterAverages.push(subjects.length ? semTotal / subjects.length : 0);
                }

                allSubjects = flatSubjects;

                // Render Charts
                if (lineCanvas) {
                    lineChart = new Chart(lineCanvas, {
                        type: 'line',
                        data: {
                            labels: semesterLabels.length ? semesterLabels : ['Semestre 1'],
                            datasets: [{
                                label: 'Promedio',
                                data: semesterAverages.length ? semesterAverages : [0],
                                borderColor: '#2563eb',
                                backgroundColor: 'rgba(37,99,235,0.12)',
                                borderWidth: 3,
                                pointBackgroundColor: '#2563eb',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointRadius: 7,
                                fill: true,
                                tension: 0.4,
                            }],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { min: 6, max: 10, ticks: { stepSize: 0.5 } },
                                x: { grid: { display: false } },
                            },
                        },
                    });
                }

                if (barCanvas) {
                    barChart = new Chart(barCanvas, {
                        type: 'bar',
                        data: {
                            labels: ['0 – 5.9', '6.0 – 6.9', '7.0 – 7.9', '8.0 – 8.9', '9.0 – 10'],
                            datasets: [{
                                label: 'Materias',
                                data: gradeDist,
                                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
                                borderRadius: 8,
                            }],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                                x: { grid: { display: false } },
                            },
                        },
                    });
                }

                if (radarCanvas) {
                    // Extract unique subjects for the radar chart or use flatSubjects
                    // We'll take the first 5 or unique subjects
                    const radarLabels = flatSubjects.map(s => s.name).slice(0, 6);
                    const radarData = flatSubjects.map(s => s.grade).slice(0, 6);

                    // Pad to 6 to make a hexagon shape
                    while (radarLabels.length < 6) {
                        radarLabels.push('');
                        radarData.push(0);
                    }

                    radarChart = new Chart(radarCanvas, {
                        type: 'radar',
                        data: {
                            labels: radarLabels,
                            datasets: [{
                                label: 'Desempeño',
                                data: radarData,
                                borderColor: '#2563eb',
                                backgroundColor: 'rgba(37,99,235,0.15)',
                                pointBackgroundColor: '#2563eb',
                            }],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                r: { min: 0, max: 10, ticks: { stepSize: 2 } },
                            },
                        },
                    });
                }
            }
        } catch (err) {
            console.error('Error loading performance:', err);
        }

        return () => {
            lineChart?.destroy();
            radarChart?.destroy();
            barChart?.destroy();
        };
    });
</script>

<DashboardLayout role="student">

    <div class="mb-8" in:fly={{ y: -16, duration: 400 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Análisis de Rendimiento</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Estadísticas académicas completas · Semestres 1 – 4</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {#each stats as stat, i}
            <div class="bg-white dark:bg-slate-950 rounded-2xl border {stat.border} shadow-sm p-5 flex flex-col gap-3"
                 in:fly={{ y: 20, duration: 400, delay: i * 80 }}>
                <div class="w-11 h-11 rounded-xl {stat.bg} flex items-center justify-center {stat.color}">
                    <svelte:component this={stat.icon} size={22}/>
                </div>
                <div>
                    <p class="text-2xl font-extrabold {stat.color}">{stat.value}</p>
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{stat.label}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{stat.sub}</p>
                </div>
            </div>
        {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

        <div class="lg:col-span-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
             in:fly={{ x: -20, duration: 400, delay: 160 }}>
            <div class="flex items-center gap-3 mb-5">
                <div class="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <TrendingUp size={16}/>
                </div>
                <div>
                    <h2 class="font-bold text-slate-900 dark:text-white text-sm">Evolución del Promedio</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Semestres 1 al 4</p>
                </div>
            </div>
            <div class="h-64 relative">
                <canvas bind:this={lineCanvas}></canvas>
            </div>
        </div>

        <div class="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
             in:fly={{ x: 20, duration: 400, delay: 200 }}>
            <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Award size={16}/>
                </div>
                <div>
                    <h2 class="font-bold text-slate-900 dark:text-white text-sm">Desempeño por Área</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400">vs. promedio del grupo</p>
                </div>
            </div>
            <div class="h-64 relative">
                <canvas bind:this={radarCanvas}></canvas>
            </div>
        </div>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-8"
         in:fly={{ y: 20, duration: 400, delay: 240 }}>
        <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CreditCard size={16}/>
            </div>
            <div>
                <h2 class="font-bold text-slate-900 dark:text-white text-sm">Distribución de Calificaciones</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Número de materias por rango de calificación</p>
            </div>
        </div>
        <div class="h-56 relative">
            <canvas bind:this={barCanvas}></canvas>
        </div>
    </div>

    <div in:fly={{ y: 20, duration: 400, delay: 300 }}>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5">Materias Destacadas</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30">
                    <Star size={16} class="text-emerald-600 dark:text-emerald-400"/>
                    <h3 class="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Mejores Calificaciones</h3>
                </div>
                <div class="divide-y divide-slate-100 dark:divide-slate-800">
                    {#each best as s, i}
                        <div class="flex items-center gap-4 px-6 py-4" in:fly={{ x: -8, duration: 300, delay: i * 60 + 320 }}>
                            <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-extrabold flex-shrink-0">
                                {i + 1}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-slate-900 dark:text-white text-sm truncate">{s.name}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">{s.grade}</span>
                                <div class="w-1.5 h-6 rounded-full bg-emerald-400 dark:bg-emerald-600"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-red-50 dark:bg-red-950/30">
                    <AlertCircle size={16} class="text-red-500 dark:text-red-400"/>
                    <h3 class="font-bold text-red-600 dark:text-red-400 text-sm">Áreas de Oportunidad</h3>
                </div>
                <div class="divide-y divide-slate-100 dark:divide-slate-800">
                    {#each worst as s, i}
                        <div class="flex items-center gap-4 px-6 py-4" in:fly={{ x: 8, duration: 300, delay: i * 60 + 320 }}>
                            <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-extrabold flex-shrink-0">
                                {i + 1}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-slate-900 dark:text-white text-sm truncate">{s.name}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-extrabold text-xl {s.grade >= 6 ? 'text-amber-500 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}">{s.grade}</span>
                                <div class="w-1.5 h-6 rounded-full {s.grade >= 6 ? 'bg-amber-400' : 'bg-red-500'}"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</DashboardLayout>
