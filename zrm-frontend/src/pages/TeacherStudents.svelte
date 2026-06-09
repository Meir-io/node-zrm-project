<script>

    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import Modal from '../lib/components/Modal.svelte';
    import { Search, Filter, TrendingUp, User, BookOpen, Calendar, FileText, ChevronRight, BarChart2 } from 'lucide-svelte';
    import { fly, fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';

    import { authStore } from '../lib/auth.js';

    let students = $state([]);
    let groups = $state(['Todos']);
    const avatarColors = [
        'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
        'bg-rose-500', 'bg-sky-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];

    let search = $state('');
    let selectedGroup = $state('Todos');
    let selectedStudent = $state(null);
    let modalOpen = $state(false);
    let showChart = $state(false);
    let chartCanvas = $state(null);
    let chartInstance = $state(null);
    let studentNotes = $state({});

    let filtered = $derived(students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                            s.id.includes(search) ||
                            s.email.toLowerCase().includes(search.toLowerCase());
        const matchGroup = selectedGroup === 'Todos' || s.group === selectedGroup;
        return matchSearch && matchGroup;
    }));

    function getInitials(name) {
        return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    }

    function getAvatarColor(index) {
        return avatarColors[index % avatarColors.length];
    }

    function getBadgeClass(avg) {
        if (avg >= 8) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700';
        if (avg >= 6) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700';
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-700';
    }

    function getStatusBadge(status) {
        if (status === 'Activo') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
        if (status === 'En riesgo') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    }

    function calcSubjectAvg(subj) {
        return ((subj.p1 + subj.p2 + subj.p3 + subj.final) / 4).toFixed(1);
    }

    function openStudent(student) {
        selectedStudent = student;
        if (!studentNotes[student.id]) studentNotes[student.id] = student.notes;
        showChart = false;
        chartInstance = null;
        modalOpen = true;
    }

    // ─── Chart ────────────────────────────────────────────────────────────────────
    async function renderChart() {
        if (!selectedStudent) return;
        showChart = true;
        // Wait for canvas to mount
        await new Promise(r => setTimeout(r, 80));
        if (!chartCanvas) return;
        const { Chart, registerables } = await import('chart.js/auto');
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'],
                datasets: [{
                    label: 'Promedio',
                    data: selectedStudent.performanceData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.12)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 10, grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    $effect(() => {
        if (!modalOpen) {
            if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
            showChart = false;
        }
    });

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/teacher/groups', {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                const teacherGroups = await res.json();
                let grps = ['Todos'];
                let allStudents = [];

                for (let g of teacherGroups) {
                    grps.push(g.name);

                    const resStudents = await fetch(`http://localhost:5000/api/teacher/groups/${g.id}/students`, {
                        headers: authStore.getAuthHeaders()
                    });

                    if (resStudents.ok) {
                        const stds = await resStudents.json();
                        stds.forEach(s => {
                            allStudents.push({
                                id: s.student_id,
                                name: `${s.first_name} ${s.last_name}`,
                                email: s.email,
                                group: g.name,
                                average: parseFloat(s.average) || 0,
                                attendance: s.attendance || 0,
                                status: s.status === 'ACTIVE' ? 'Activo' : s.status,
                                subjects: [{
                                    enrollment_id: s.enrollment_id,
                                    name: g.subject_name,
                                    p1: s.p1 || '', p2: s.p2 || '', p3: s.p3 || '', final: s.final || ''
                                }],
                                attendanceHistory: s.attendance_history || [],
                                notes: '',
                                performanceData: [7.8, 8.2, 8.5, parseFloat(s.average) || 8.0]
                            });
                        });
                    }
                }
                groups = grps;
                students = allStudents;
            }
        } catch (error) {
            console.error('Failed to load teacher students', error);
        }
    });

    async function saveGrades(subj) {
        try {
            const res = await fetch('http://localhost:5000/api/teacher/grades', {
                method: 'PUT',
                headers: {
                    ...authStore.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    enrollment_id: subj.enrollment_id,
                    p1: subj.p1 === '' ? null : parseFloat(subj.p1),
                    p2: subj.p2 === '' ? null : parseFloat(subj.p2),
                    p3: subj.p3 === '' ? null : parseFloat(subj.p3),
                    final: subj.final === '' ? null : parseFloat(subj.final)
                })
            });
            if (res.ok) {
                const updated = await res.json();
                subj.average = updated.average;

                if (selectedStudent) {
                    selectedStudent.average = parseFloat(updated.average) || 0;
                }
            } else {
                console.error('Error saving grades');
            }
        } catch (error) {
            console.error(error);
        }
    }

</script>

<DashboardLayout role="teacher">

    <div class="mb-8" in:fly={{ y: -10, duration: 350 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Mis Estudiantes</h1>
        <p class="text-slate-500 dark:text-slate-400">Visualiza y gestiona el rendimiento de tus alumnos.</p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-8" in:fly={{ y: 10, duration: 350, delay: 80 }}>
        <div class="relative flex-1">
            <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                placeholder="Buscar por nombre, ID o correo..."
                bind:value={search}
                class="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
        </div>
        <div class="relative">
            <Filter size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
                bind:value={selectedGroup}
                class="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
            >
                {#each groups as g}
                    <option value={g}>{g}</option>
                {/each}
            </select>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5">
            <User size={15} />
            <span>{filtered.length} estudiante{filtered.length !== 1 ? 's' : ''}</span>
        </div>
    </div>

    {#if filtered.length === 0}
        <div class="flex flex-col items-center justify-center py-24 text-slate-400" in:fade={{ duration: 200 }}>
            <User size={48} class="mb-4 opacity-30" />
            <p class="text-lg font-medium">No se encontraron estudiantes</p>
            <p class="text-sm mt-1">Intenta ajustar la búsqueda o el filtro.</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {#each filtered as student, i}
                <button
                    onclick={() => openStudent(student)}
                    class="text-left bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                    in:fly={{ y: 20, duration: 300, delay: i * 50 }}
                >

                    <div class="p-5 pb-4">
                        <div class="flex items-start gap-4">

                            <div class="w-12 h-12 rounded-xl {getAvatarColor(i)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                                {getInitials(student.name)}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2">
                                    <h3 class="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</h3>
                                    <ChevronRight size={16} class="text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                </div>
                                <p class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{student.email}</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{student.group}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 mt-4">
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {getBadgeClass(student.average)}">
                                <BookOpen size={11} />
                                Prom. {student.average.toFixed(1)}
                            </span>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {getStatusBadge(student.status)}">
                                {student.status}
                            </span>
                        </div>
                    </div>

                    <div class="px-5 pb-5">
                        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                            <span class="flex items-center gap-1"><Calendar size={11} /> Asistencia</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-300">{student.attendance}%</span>
                        </div>
                        <div class="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                class="h-full rounded-full transition-all duration-700 {student.attendance >= 85 ? 'bg-emerald-500' : student.attendance >= 70 ? 'bg-amber-500' : 'bg-red-500'}"
                                style="width: {student.attendance}%"
                            ></div>
                        </div>
                    </div>
                </button>
            {/each}
        </div>
    {/if}

    <Modal bind:isOpen={modalOpen} title={selectedStudent ? selectedStudent.name : ''}>
        {#if selectedStudent}

            <div class="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div class="w-14 h-14 rounded-xl {getAvatarColor(students.indexOf(selectedStudent))} flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {getInitials(selectedStudent.name)}
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{selectedStudent.email}</p>
                    <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedStudent.group}</p>
                    <div class="flex gap-2 mt-2">
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold {getBadgeClass(selectedStudent.average)}">Promedio: {selectedStudent.average.toFixed(1)}</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium {getStatusBadge(selectedStudent.status)}">{selectedStudent.status}</span>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <BookOpen size={15} class="text-blue-500" /> Calificaciones por Materia
                </h4>
                <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                    <table class="w-full text-sm">
                        <thead class="bg-slate-50 dark:bg-slate-900">
                            <tr class="text-xs text-slate-500 dark:text-slate-400">
                                <th class="px-4 py-2.5 text-left font-medium">Materia</th>
                                <th class="px-3 py-2.5 text-center font-medium">P1</th>
                                <th class="px-3 py-2.5 text-center font-medium">P2</th>
                                <th class="px-3 py-2.5 text-center font-medium">P3</th>
                                <th class="px-3 py-2.5 text-center font-medium">Final</th>
                                <th class="px-3 py-2.5 text-center font-medium">Prom</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            {#each selectedStudent.subjects as subj}
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                    <td class="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{subj.name}</td>
                                    <td class="px-3 py-2.5 text-center">
                                        <input type="number" min="0" max="10" step="0.1" bind:value={subj.p1} onblur={() => saveGrades(subj)} class="w-14 px-2 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </td>
                                    <td class="px-3 py-2.5 text-center">
                                        <input type="number" min="0" max="10" step="0.1" bind:value={subj.p2} onblur={() => saveGrades(subj)} class="w-14 px-2 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </td>
                                    <td class="px-3 py-2.5 text-center">
                                        <input type="number" min="0" max="10" step="0.1" bind:value={subj.p3} onblur={() => saveGrades(subj)} class="w-14 px-2 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </td>
                                    <td class="px-3 py-2.5 text-center">
                                        <input type="number" min="0" max="10" step="0.1" bind:value={subj.final} onblur={() => saveGrades(subj)} class="w-14 px-2 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </td>
                                    <td class="px-3 py-2.5 text-center font-bold">
                                        <span class="px-2 py-0.5 rounded-full text-xs {getBadgeClass(selectedStudent.average)}">
                                            {selectedStudent.average.toFixed(1)}
                                        </span>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Calendar size={15} class="text-emerald-500" /> Historial de Asistencia
                </h4>
                <div class="grid grid-cols-4 gap-2">
                    {#each selectedStudent.attendanceHistory as h}
                        {@const pct = Math.round((h.present / h.total) * 100)}
                        <div class="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-center border border-slate-100 dark:border-slate-800">
                            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{h.month}</p>
                            <p class="text-lg font-bold {pct >= 85 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-500'}">{pct}%</p>
                            <p class="text-xs text-slate-400">{h.present}/{h.total}</p>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <TrendingUp size={15} class="text-violet-500" /> Rendimiento Semanal
                    </h4>
                    {#if !showChart}
                        <button
                            onclick={renderChart}
                            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                            <BarChart2 size={13} />
                            Ver Rendimiento
                        </button>
                    {/if}
                </div>
                {#if showChart}
                    <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800" in:fade={{ duration: 300 }}>
                        <canvas bind:this={chartCanvas} height="180"></canvas>
                    </div>
                {:else}
                    <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <p class="text-sm text-slate-400">Haz clic en "Ver Rendimiento" para cargar la gráfica.</p>
                    </div>
                {/if}
            </div>

            <div>
                <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <FileText size={15} class="text-amber-500" /> Notas del Docente
                </h4>
                <textarea
                    bind:value={studentNotes[selectedStudent.id]}
                    rows="3"
                    placeholder="Escribe notas o comentarios sobre este estudiante..."
                    class="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                ></textarea>
                <button class="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                    Guardar Nota
                </button>
            </div>
        {/if}
    </Modal>
</DashboardLayout>
