<script>
    import { onMount } from 'svelte';
    import { fly, fade, scale } from 'svelte/transition';
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { X, MapPin, User, Phone, Mail, BookOpen, FileText, Clock, Calendar, Info } from 'lucide-svelte';

    import { authStore } from '../lib/auth.js';

    // ─── Helpers ─────────────────────────────────────────────────────────────────
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 – 20
    const days  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    // Today's day name (for highlighting)
    const todayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const todayName  = todayNames[new Date().getDay()];

    // ─── Schedule blocks ─────────────────────────────────────────────────────────
    let classes = $state([]);
    let exams = $state([]);

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/student/schedule', {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                let newClasses = [];
                const colors = ['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan'];

                data.forEach((c, i) => {
                    // Parse "Lun & Mié 10:00–12:00"
                    const parts = c.schedule.split(' ');
                    const timePart = parts[parts.length - 1];
                    const [startStr, endStr] = timePart.split('–');
                    const startHour = parseInt(startStr.split(':')[0]);
                    const endHour = parseInt(endStr.split(':')[0]);

                    const dayMap = { 'Lun': 'Lunes', 'Mar': 'Martes', 'Mié': 'Miércoles', 'Jue': 'Jueves', 'Vie': 'Viernes' };
                    const colorName = colors[i % colors.length];

                    parts.slice(0, -1).forEach(p => {
                        if (dayMap[p]) {
                            newClasses.push({
                                id: `${c.group_id}-${p}`,
                                subject: c.subject_name,
                                teacher: `${c.teacher_first_name} ${c.teacher_last_name}`,
                                room: c.room,
                                day: dayMap[p],
                                startHour,
                                endHour,
                                color: `bg-${colorName}-500`,
                                colorLight: `bg-${colorName}-50 dark:bg-${colorName}-900/30 border-${colorName}-300 dark:border-${colorName}-700`,
                                colorText: `text-${colorName}-700 dark:text-${colorName}-300`,
                                email: `contacto@zrm.edu`,
                                phone: `+52 555 000 0000`,
                                syllabus: `Plan de estudios para ${c.subject_name}.`,
                                materials: ['Cuaderno', 'Computadora']
                            });
                        }
                    });
                });
                classes = newClasses;
            }

            const evRes = await fetch('http://localhost:5000/api/student/evaluations', {
                headers: authStore.getAuthHeaders()
            });
            if (evRes.ok) {
                exams = await evRes.json();
            }
        } catch (error) {
            console.error('Failed to load schedule', error);
        }
    });

    // ─── Exams ───────────────────────────────────────────────────────────────────

    const today = new Date().toISOString().split('T')[0];

    function formatDate(d) {
        const [y, m, day] = d.split('-');
        const months = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        return `${parseInt(day)} ${months[parseInt(m)]} ${y}`;
    }
    function daysUntil(d) {
        const diff = Math.ceil((new Date(d) - new Date(today)) / 86400000);
        if (diff === 0) return '¡Hoy!';
        if (diff === 1) return 'Mañana';
        if (diff < 0) return 'Pasado';
        return `En ${diff} días`;
    }
    function examUrgency(d) {
        const diff = Math.ceil((new Date(d) - new Date(today)) / 86400000);
        if (diff < 0) return 'text-slate-400 dark:text-slate-600';
        if (diff <= 3) return 'text-red-600 dark:text-red-400 font-bold';
        if (diff <= 7) return 'text-amber-600 dark:text-amber-400 font-semibold';
        return 'text-emerald-600 dark:text-emerald-400';
    }
    function examTypeBadge(t) {
        if (t === 'Final') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        if (t.startsWith('Parcial 2')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }

    // ─── Grid logic ──────────────────────────────────────────────────────────────
    function getClassForCell(day, hour) {
        return classes.find(c => c.day === day && c.startHour === hour) || null;
    }
    function isOccupied(day, hour) {
        return classes.some(c => c.day === day && hour > c.startHour && hour < c.endHour);
    }
    function classSpan(c) { return c.endHour - c.startHour; }

    // ─── Modal ───────────────────────────────────────────────────────────────────
    let selectedClass = $state(null);
    let modalOpen = $state(false);

    function openModal(cls) {
        selectedClass = cls;
        modalOpen = true;
    }
    function closeModal() {
        modalOpen = false;
        setTimeout(() => { selectedClass = null; }, 200);
    }
</script>

<DashboardLayout role="student">

    <div class="mb-8" in:fly={{ y: -16, duration: 400 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Horario Semanal</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
            Semestre Agosto – Diciembre 2026 ·
            <span class="font-semibold text-blue-600 dark:text-blue-400">Hoy: {todayName}</span>
        </p>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8"
         in:fly={{ y: 16, duration: 400, delay: 80 }}>

        <div class="grid border-b border-slate-200 dark:border-slate-800"
             style="grid-template-columns: 64px repeat(5, 1fr);">
            <div class="py-3 px-2 text-center text-xs font-semibold text-slate-400 border-r border-slate-200 dark:border-slate-800 dark:text-slate-600">Hora</div>
            {#each days as day}
                <div class="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider
                    {day === todayName
                        ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                        : 'text-slate-600 dark:text-slate-400'}
                    border-r last:border-r-0 border-slate-200 dark:border-slate-800">
                    {day}
                    {#if day === todayName}
                        <span class="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 align-middle"></span>
                    {/if}
                </div>
            {/each}
        </div>

        <div class="overflow-y-auto" style="max-height: 600px;">
            {#each hours as hour}
                <div class="grid border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                     style="grid-template-columns: 64px repeat(5, 1fr); min-height: 56px;">

                    <div class="flex items-start justify-center pt-2 text-xs font-semibold text-slate-400 dark:text-slate-600 border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
                        {hour}:00
                    </div>

                    {#each days as day}
                        {@const cls = getClassForCell(day, hour)}
                        {@const occupied = isOccupied(day, hour)}
                        {#if cls}
                            <button
                                onclick={() => openModal(cls)}
                                class="relative border-r last:border-r-0 border-slate-100 dark:border-slate-800/60
                                       {cls.colorLight} border-l-4 text-left p-2 hover:brightness-95 dark:hover:brightness-110 transition-all group"
                                style="grid-row: span {classSpan(cls)};"
                            >
                                <p class="font-bold text-xs {cls.colorText} leading-tight">{cls.subject}</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                    <MapPin size={10}/>{cls.room}
                                </p>
                                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                                    <User size={10}/>{cls.teacher.split(' ')[0]} {cls.teacher.split(' ').at(-1)}
                                </p>
                                <span class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                    <Info size={12}/>
                                </span>
                            </button>
                        {:else if !occupied}
                            <div class="border-r last:border-r-0 border-slate-100 dark:border-slate-800/60
                                        {day === todayName ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}">
                            </div>
                        {/if}
                    {/each}
                </div>
            {/each}
        </div>

        <div class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
            {#each classes as cls}
                <div class="flex items-center gap-1.5 text-xs {cls.colorText}">
                    <div class="w-2.5 h-2.5 rounded-sm {cls.color}"></div>
                    <span class="text-slate-600 dark:text-slate-400">{cls.subject.split(' ').slice(0,2).join(' ')}</span>
                </div>
            {/each}
        </div>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
         in:fly={{ y: 20, duration: 400, delay: 180 }}>
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div class="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-500 dark:text-red-400">
                <Calendar size={16}/>
            </div>
            <h2 class="font-bold text-slate-900 dark:text-white">Calendario de Exámenes</h2>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-800">
            {#each exams as exam, i}
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                     in:fly={{ x: -10, duration: 300, delay: i * 50 }}>

                    <div class="flex-shrink-0 w-14 text-center bg-slate-100 dark:bg-slate-800 rounded-xl py-2">
                        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">{exam.date.split('-')[2]}</p>
                        <p class="text-base font-bold text-slate-700 dark:text-slate-200">
                            {['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(exam.date.split('-')[1])]}
                        </p>
                    </div>

                    <div class="flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <p class="font-semibold text-slate-900 dark:text-white">{exam.subject}</p>
                            <span class="px-2 py-0.5 rounded-full text-xs font-bold {examTypeBadge(exam.type)}">{exam.type}</span>
                        </div>
                        <div class="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span class="flex items-center gap-1"><Clock size={11}/>{exam.time}</span>
                            <span class="flex items-center gap-1"><MapPin size={11}/>{exam.room}</span>
                        </div>
                    </div>

                    <div class="flex-shrink-0 text-sm {examUrgency(exam.date)}">
                        {daysUntil(exam.date)}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</DashboardLayout>

{#if modalOpen && selectedClass}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
         in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
        <button class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm w-full h-full border-0 cursor-default"
                onclick={closeModal} aria-label="Cerrar"></button>
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
             in:scale={{ duration: 200, start: 0.95 }} out:scale={{ duration: 150, start: 0.97 }}>

            <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl {selectedClass.color} flex items-center justify-center text-white flex-shrink-0">
                        <BookOpen size={18}/>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-900 dark:text-white text-lg leading-tight">{selectedClass.subject}</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400">{selectedClass.day} · {selectedClass.startHour}:00 – {selectedClass.endHour}:00</p>
                    </div>
                </div>
                <button onclick={closeModal} class="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X size={22}/>
                </button>
            </div>

            <div class="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
                    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Docente</p>
                    <p class="font-bold text-slate-900 dark:text-white flex items-center gap-2"><User size={14}/>{selectedClass.teacher}</p>
                    <a href="mailto:{selectedClass.email}" class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <Mail size={14}/>{selectedClass.email}
                    </a>
                    <p class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Phone size={14}/>{selectedClass.phone}</p>
                </div>

                <div class="flex items-center gap-3 text-sm">
                    <div class="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                        <MapPin size={15}/>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Salón / Laboratorio</p>
                        <p class="font-semibold text-slate-900 dark:text-white">{selectedClass.room}</p>
                    </div>
                </div>

                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <FileText size={14} class="text-slate-500 dark:text-slate-400"/>
                        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Descripción del Programa</p>
                    </div>
                    <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedClass.syllabus}</p>
                </div>

                <div>
                    <div class="flex items-center gap-2 mb-3">
                        <BookOpen size={14} class="text-slate-500 dark:text-slate-400"/>
                        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Materiales Requeridos</p>
                    </div>
                    <ul class="space-y-2">
                        {#each selectedClass.materials as m}
                            <li class="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <span class="mt-1.5 w-1.5 h-1.5 rounded-full {selectedClass.color} flex-shrink-0"></span>
                                {m}
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
    </div>
{/if}
