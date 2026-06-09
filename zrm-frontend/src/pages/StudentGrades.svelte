<script>
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import Modal from '../lib/components/Modal.svelte';
    import { Award, TrendingUp, ChevronDown, Maximize2 } from 'lucide-svelte';
    import { fly } from 'svelte/transition';

    let modalGrade = $state(null);
    let modalOpen = $state(false);

    const subjects = [
        {
            id: 1,
            name: 'Programación Avanzada',
            teacher: 'Prof. María González',
            credits: 8,
            p1: 9.0, p2: 9.5, p3: 9.2, final: 9.8,
            get avg() { return +((this.p1 + this.p2 + this.p3 + this.final) / 4).toFixed(1); },
            status: 'Aprobado',
            group: 'Grupo A',
            desc: 'Programación orientada a objetos avanzada, patrones de diseño y estructuras de datos complejas.',
        },
        {
            id: 2,
            name: 'Sistemas de Bases de Datos',
            teacher: 'Prof. Carlos Ramírez',
            credits: 8,
            p1: 8.5, p2: 8.0, p3: 9.0, final: 9.0,
            get avg() { return +((this.p1 + this.p2 + this.p3 + this.final) / 4).toFixed(1); },
            status: 'Aprobado',
            group: 'Grupo B',
            desc: 'Diseño y administración de bases de datos relacionales y no relacionales.',
        },
        {
            id: 3,
            name: 'Ingeniería de Software',
            teacher: 'Prof. Ana López',
            credits: 6,
            p1: 9.5, p2: 9.0, p3: 9.2, final: 9.5,
            get avg() { return +((this.p1 + this.p2 + this.p3 + this.final) / 4).toFixed(1); },
            status: 'Aprobado',
            group: 'Grupo A',
            desc: 'Metodologías ágiles, diseño de software y pruebas de calidad.',
        },
        {
            id: 4,
            name: 'Redes de Computadoras',
            teacher: 'Prof. Jorge Vargas',
            credits: 6,
            p1: 7.5, p2: 8.0, p3: 8.5, final: 8.0,
            get avg() { return +((this.p1 + this.p2 + this.p3 + this.final) / 4).toFixed(1); },
            status: 'Aprobado',
            group: 'Grupo A',
            desc: 'Modelos OSI/TCP-IP, protocolos de red y seguridad en redes.',
        },
        {
            id: 5,
            name: 'Matemáticas Discretas',
            teacher: 'Prof. Luis Morales',
            credits: 6,
            p1: 7.0, p2: 7.5, p3: 8.0, final: 7.5,
            get avg() { return +((this.p1 + this.p2 + this.p3 + this.final) / 4).toFixed(1); },
            status: 'Aprobado',
            group: 'Grupo B',
            desc: 'Lógica matemática, combinatoria, grafos y teoría de números.',
        },
    ];

    const semesterAvg = +(subjects.reduce((s, m) => s + m.avg, 0) / subjects.length).toFixed(2);
    const totalCredits = subjects.filter(s => s.status === 'Aprobado').reduce((s, m) => s + m.credits, 0);

    function gradeColor(g) {
        if (g >= 9) return 'text-emerald-600 dark:text-emerald-400 font-bold';
        if (g >= 8) return 'text-blue-600 dark:text-blue-400 font-bold';
        if (g >= 6) return 'text-amber-600 dark:text-amber-400 font-bold';
        return 'text-red-600 dark:text-red-400 font-bold';
    }

    function openModal(subject) {
        modalGrade = subject;
        modalOpen = true;
    }
</script>

<DashboardLayout role="student">
    <div class="mb-8" in:fly={{ y: -10, duration: 350 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Mis Calificaciones</h1>
        <p class="text-slate-500 dark:text-slate-400">Semestre Actual · Agosto – Diciembre 2025</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" in:fly={{ y: 10, duration: 350, delay: 60 }}>
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <div class="flex items-center justify-between mb-3">
                <p class="text-blue-100 text-sm font-medium">Promedio del Semestre</p>
                <TrendingUp size={20} class="text-blue-200" />
            </div>
            <p class="text-4xl font-extrabold">{semesterAvg}</p>
            <p class="text-blue-200 text-xs mt-1">sobre 10.0</p>
        </div>
        <div class="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-3">
                <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Materias Activas</p>
                <Award size={20} class="text-blue-500" />
            </div>
            <p class="text-4xl font-extrabold text-slate-900 dark:text-white">{subjects.length}</p>
            <p class="text-slate-400 text-xs mt-1">este semestre</p>
        </div>
        <div class="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-3">
                <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Créditos Acumulados</p>
                <Award size={20} class="text-emerald-500" />
            </div>
            <p class="text-4xl font-extrabold text-slate-900 dark:text-white">{totalCredits}</p>
            <p class="text-slate-400 text-xs mt-1">este semestre</p>
        </div>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" in:fly={{ y: 10, duration: 350, delay: 120 }}>
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 class="font-bold text-slate-900 dark:text-white">Detalle por Materia</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Haz clic en una fila para ver el detalle completo</p>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-slate-50 dark:bg-slate-900/50 text-left">
                    <tr>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Materia</th>
                        <th class="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">P1</th>
                        <th class="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">P2</th>
                        <th class="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">P3</th>
                        <th class="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Final</th>
                        <th class="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Promedio</th>
                        <th class="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Estado</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    {#each subjects as subject, i}
                        <tr
                            onclick={() => openModal(subject)}
                            class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                            in:fly={{ x: -10, duration: 250, delay: 150 + i * 50 }}
                        >
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{subject.name}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">{subject.teacher} · {subject.credits} créditos</p>
                                    </div>
                                    <Maximize2 size={14} class="text-slate-300 group-hover:text-blue-400 transition-colors ml-4 opacity-0 group-hover:opacity-100" />
                                </div>
                            </td>
                            <td class="px-4 py-4 text-center {gradeColor(subject.p1)}">{subject.p1}</td>
                            <td class="px-4 py-4 text-center {gradeColor(subject.p2)}">{subject.p2}</td>
                            <td class="px-4 py-4 text-center {gradeColor(subject.p3)}">{subject.p3}</td>
                            <td class="px-4 py-4 text-center {gradeColor(subject.final)}">{subject.final}</td>
                            <td class="px-4 py-4 text-center">
                                <span class="inline-block px-2.5 py-1 rounded-lg text-sm font-extrabold {gradeColor(subject.avg)} bg-slate-50 dark:bg-slate-900">
                                    {subject.avg}
                                </span>
                            </td>
                            <td class="px-4 py-4 text-center">
                                <span class="inline-flex items-center gap-1 text-xs font-semibold {subject.status === 'Aprobado' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">
                                    <span class="w-1.5 h-1.5 rounded-full {subject.status === 'Aprobado' ? 'bg-emerald-500' : 'bg-red-500'} inline-block"></span>
                                    {subject.status}
                                </span>
                            </td>
                        </tr>
                    {/each}
                </tbody>
                <tfoot class="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <tr>
                        <td class="px-6 py-3 font-bold text-slate-700 dark:text-slate-300">Promedio General</td>
                        <td colspan="4"></td>
                        <td class="px-4 py-3 text-center">
                            <span class="text-blue-600 dark:text-blue-400 font-extrabold text-lg">{semesterAvg}</span>
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</DashboardLayout>

<Modal bind:isOpen={modalOpen} title={modalGrade ? modalGrade.name : ''}>
    {#if modalGrade}
        <div class="space-y-5">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Award size={24} />
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{modalGrade.teacher}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{modalGrade.group} · {modalGrade.credits} créditos</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{modalGrade.desc}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {#each [
                    { label: 'Parcial 1', value: modalGrade.p1 },
                    { label: 'Parcial 2', value: modalGrade.p2 },
                    { label: 'Parcial 3', value: modalGrade.p3 },
                    { label: 'Examen Final', value: modalGrade.final },
                ] as item}
                    <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-center">
                        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                        <p class="text-2xl font-extrabold {gradeColor(item.value)}">{item.value}</p>
                    </div>
                {/each}
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 flex items-center justify-between border border-blue-100 dark:border-blue-800">
                <div>
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Promedio Final</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">(P1 + P2 + P3 + Final) / 4</p>
                </div>
                <p class="text-4xl font-extrabold {gradeColor(modalGrade.avg)}">{modalGrade.avg}</p>
            </div>

            <div class="flex items-center gap-2 justify-end">
                <span class="text-sm font-semibold {modalGrade.status === 'Aprobado' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">
                    Estado: {modalGrade.status}
                </span>
            </div>
        </div>
    {/if}
</Modal>
