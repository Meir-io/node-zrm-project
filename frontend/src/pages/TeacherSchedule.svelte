<script>

    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import Modal from '../lib/components/Modal.svelte';
    import { authStore } from '../lib/auth.js';
    import { onMount } from 'svelte';
    import { Users, MapPin, BookOpen, FileText, Calendar, Clock, AlertTriangle } from 'lucide-svelte';
    import { fly, fade, scale } from 'svelte/transition';

    const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const START_HOUR = 7;
    const END_HOUR = 19;
    const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

    let subjects = $state({});
    let classes = $state([]);

    let upcomingEvaluations = $state([]);

    let selectedClass = $state(null);
    let modalOpen = $state(false);

    let modalEvalOpen = $state(false);
    let newEval = $state({
        title: '',
        group_id: '',
        type: 'Examen',
        due_date: '',
        urgency: 'medium'
    });

    let isSavingEval = $state(false);

    function openClass(cls) {
        selectedClass = cls;
        modalOpen = true;
    }

    function formatHour(h) {
        return `${h}:00`;
    }

    function getUrgencyClass(u) {
        if (u === 'urgent') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800';
        if (u === 'high') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
        if (u === 'medium') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }

    function getTypeIcon(type) {
        if (type === 'Examen') return FileText;
        if (type === 'Proyecto') return BookOpen;
        if (type === 'Quiz') return AlertTriangle;
        return Calendar;
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function daysUntil(dateStr) {
        const today = new Date();
        const target = new Date(dateStr + 'T00:00:00');
        const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Vencido';
        if (diff === 0) return 'Hoy';
        if (diff === 1) return 'Mañana';
        return `En ${diff} días`;
    }

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/teacher/schedule', {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                let newClasses = [];
                let newSubjects = {};
                const colors = ['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan'];

                data.forEach((c, i) => {
                    const colorName = colors[i % colors.length];
                    const subjKey = `S${c.group_id}`;

                    if (!newSubjects[subjKey]) {
                        newSubjects[subjKey] = {
                            name: c.subject_name,
                            short: c.subject_name.substring(0, 15) + (c.subject_name.length > 15 ? '...' : ''),
                            color: `bg-${colorName}-500 dark:bg-${colorName}-600`,
                            text: 'text-white',
                            ring: `ring-${colorName}-300 dark:ring-${colorName}-700`
                        };
                    }

                    const parts = c.schedule.split(' ');
                    const timePart = parts[parts.length - 1];
                    const [startStr, endStr] = timePart.split('–');
                    const startHour = parseInt(startStr.split(':')[0]);
                    const endHour = parseInt(endStr.split(':')[0]);

                    const dayMap = { 'Lun': 0, 'Mar': 1, 'Mié': 2, 'Jue': 3, 'Vie': 4 };

                    parts.slice(0, -1).forEach(p => {
                        if (dayMap[p] !== undefined) {
                            newClasses.push({
                                id: `${c.group_id}-${p}`,
                                subject: subjKey,
                                col: dayMap[p],
                                rowStart: startHour - START_HOUR,
                                rowSpan: endHour - startHour,
                                group: c.group_name,
                                room: c.room,
                                students: '...',
                                description: `Impartición de materia ${c.subject_name}.`,
                                materials: ['Programa de estudio', 'Registro de asistencia']
                            });
                        }
                    });
                });

                subjects = newSubjects;
                classes = newClasses;
            }

            await fetchEvaluations();
        } catch (error) {
            console.error('Failed to load teacher schedule', error);
        }
    });

    async function fetchEvaluations() {
        const evRes = await fetch('http://localhost:5000/api/teacher/evaluations', {
            headers: authStore.getAuthHeaders()
        });
        if (evRes.ok) {
            upcomingEvaluations = await evRes.json();
        }
    }

    async function saveEvaluation() {
        if (!newEval.title || !newEval.group_id || !newEval.due_date) return;
        isSavingEval = true;
        try {
            const res = await fetch('http://localhost:5000/api/teacher/evaluations', {
                method: 'POST',
                headers: {
                    ...authStore.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEval)
            });
            if (res.ok) {
                await fetchEvaluations();
                modalEvalOpen = false;
                newEval = { title: '', group_id: '', type: 'Examen', due_date: '', urgency: 'medium' };
            }
        } catch(e) {
            console.error('Error saving evaluation', e);
        } finally {
            isSavingEval = false;
        }
    }

</script>

<DashboardLayout role="teacher">

    <div class="mb-8" in:fly={{ y: -10, duration: 350 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Mi Horario Semanal</h1>
        <p class="text-slate-500 dark:text-slate-400">Visualiza tus clases y próximas evaluaciones. Haz clic en un bloque para ver detalles.</p>
    </div>

    <div class="flex flex-wrap gap-3 mb-6" in:fly={{ y: 10, duration: 350, delay: 60 }}>
        {#each Object.entries(subjects) as [key, subj]}
            <div class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                <div class="w-3 h-3 rounded-sm {subj.color}"></div>
                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{subj.name}</span>
            </div>
        {/each}
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8" in:fly={{ y: 15, duration: 350, delay: 100 }}>

        <div class="grid border-b border-slate-200 dark:border-slate-800" style="grid-template-columns: 3.5rem repeat(5, 1fr)">
            <div class="py-3 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">Hora</div>
            {#each DAY_LABELS as day, i}
                <div class="py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide bg-slate-50 dark:bg-slate-900/50 {i < 4 ? 'border-r border-slate-100 dark:border-slate-800' : ''}">
                    {day}
                </div>
            {/each}
        </div>

        <div style="display: grid; grid-template-columns: 3.5rem repeat(5, 1fr); grid-template-rows: repeat({HOURS.length}, 3.5rem); position: relative;">

            {#each HOURS as hour, rowIdx}
                <div
                    class="flex items-start justify-center pt-1 text-xs text-slate-400 dark:text-slate-600 font-mono border-r border-slate-100 dark:border-slate-800 {rowIdx < HOURS.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}"
                    style="grid-column: 1; grid-row: {rowIdx + 1};"
                >
                    {formatHour(hour)}
                </div>

                {#each DAY_LABELS as _, colIdx}
                    <div
                        class="{colIdx < 4 ? 'border-r' : ''} {rowIdx < HOURS.length - 1 ? 'border-b' : ''} border-slate-100 dark:border-slate-800"
                        style="grid-column: {colIdx + 2}; grid-row: {rowIdx + 1};"
                    ></div>
                {/each}
            {/each}

            {#each classes as cls, i}
                {@const subj = subjects[cls.subject]}
                <button
                    onclick={() => openClass(cls)}
                    class="m-0.5 rounded-xl {subj.color} {subj.text} shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150 focus:outline-none focus:ring-2 {subj.ring} overflow-hidden text-left"
                    style="grid-column: {cls.col + 2}; grid-row: {cls.rowStart + 1} / span {cls.rowSpan}; z-index: 10;"
                    in:scale={{ duration: 250, delay: 150 + i * 40 }}
                    title="{subj.name} – {cls.group}"
                >
                    <div class="p-2 h-full flex flex-col justify-between">
                        <div>
                            <p class="text-xs font-bold leading-tight truncate opacity-95">{subj.short}</p>
                            {#if cls.rowSpan > 1}
                                <p class="text-xs opacity-80 truncate mt-0.5">{cls.group}</p>
                            {/if}
                        </div>
                        {#if cls.rowSpan > 1}
                            <p class="text-xs opacity-70 truncate flex items-center gap-1">
                                <MapPin size={10} />{cls.room}
                            </p>
                        {/if}
                    </div>
                </button>
            {/each}
        </div>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6" in:fly={{ y: 20, duration: 350, delay: 200 }}>
        <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="w-1 h-5 bg-amber-500 rounded-full inline-block"></span>
                Próximas Evaluaciones
            </h2>
            <button onclick={() => modalEvalOpen = true} class="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/60 px-3 py-1.5 rounded-lg text-sm font-semibold transition">
                + Crear
            </button>
        </div>
        <div class="space-y-3">
            {#each upcomingEvaluations as ev, i}
                {@const Icon = getTypeIcon(ev.type)}
                <div
                    class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
                    in:fly={{ x: -10, duration: 280, delay: 250 + i * 55 }}
                >
                    <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 transition-colors">
                        <svelte:component this={Icon} size={17} class="text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{ev.name}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                            <span class="flex items-center gap-1"><Users size={11} />{ev.group}</span>
                            <span class="flex items-center gap-1"><Calendar size={11} />{formatDate(ev.date)}</span>
                        </p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{ev.type}</span>
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold {getUrgencyClass(ev.urgency)}">
                            {daysUntil(ev.date)}
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <Modal bind:isOpen={modalOpen} title={selectedClass ? `${subjects[selectedClass.subject].name} – ${selectedClass.group}` : ''}>
        {#if selectedClass}
            {@const subj = subjects[selectedClass.subject]}

            <div class="h-2 -mt-6 -mx-6 mb-6 {subj.color} rounded-t-none"></div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-center gap-1"><Users size={11} /> Alumnos</p>
                    <p class="text-xl font-bold text-slate-900 dark:text-white">{selectedClass.students}</p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-center gap-1"><MapPin size={11} /> Aula</p>
                    <p class="text-base font-bold text-slate-900 dark:text-white">{selectedClass.room}</p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-center gap-1"><Clock size={11} /> Duración</p>
                    <p class="text-base font-bold text-slate-900 dark:text-white">{selectedClass.rowSpan} hora{selectedClass.rowSpan > 1 ? 's' : ''}</p>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <BookOpen size={14} class="text-blue-500" /> Descripción de la Clase
                </h4>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    {selectedClass.description}
                </p>
            </div>

            <div>
                <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <FileText size={14} class="text-violet-500" /> Materiales y Recursos
                </h4>
                <ul class="space-y-2">
                    {#each selectedClass.materials as mat, i}
                        <li
                            class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                            in:fly={{ x: -8, duration: 200, delay: i * 50 }}
                        >
                            <span class="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                            {mat}
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </Modal>

    <Modal bind:isOpen={modalEvalOpen} title="Programar Evaluación">
        <form onsubmit={(e) => { e.preventDefault(); saveEvaluation(); }} class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Título</label>
                <input type="text" bind:value={newEval.title} required placeholder="Ej. Examen Parcial 1"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Grupo</label>
                    <select bind:value={newEval.group_id} required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" disabled>Seleccione un grupo</option>

                        {#each [...new Map(classes.map(c => [c.id.split('-')[0], { id: c.id.split('-')[0], name: c.group, subj: subjects[c.subject].short }])).values()] as g}
                            <option value={g.id}>{g.subj} - {g.name}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
                    <select bind:value={newEval.type} class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Examen">Examen</option>
                        <option value="Proyecto">Proyecto</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Tarea">Tarea</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha límite</label>
                    <input type="date" bind:value={newEval.due_date} required
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Urgencia</label>
                    <select bind:value={newEval.urgency} class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="urgent">Urgente</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" onclick={() => modalEvalOpen = false}
                    class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={isSavingEval}
                    class="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40 disabled:opacity-50">
                    {isSavingEval ? 'Guardando...' : 'Crear Evaluación'}
                </button>
            </div>
        </form>
    </Modal>
</DashboardLayout>
