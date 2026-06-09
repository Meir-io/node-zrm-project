<script>
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import {
        Mail, Phone, Clock, MapPin, Edit3, Save, X,
        Users, Calendar, Award, Star, BookOpen, Shield, Zap
    } from 'lucide-svelte';
    import { fly, fade, scale } from 'svelte/transition';

    import { authStore } from '../lib/auth.js';
    import { onMount } from 'svelte';

    // ─── State ─────────────────────────────────────────────────────────────────
    let editMode = $state(false);

    let form = $state({
        name: 'Cargando...',
        department: 'Departamento de Computación',
        email: '...',
        phone: '+52 (000) 000-0000',
        officeHours: 'Lun–Vie 10:00–12:00',
        office: 'Edificio C, Oficina 204',
        bio: 'Docente titular en la institución.',
    });

    let initials = $state('MG');

    // Snapshot for cancel
    let snapshot = $state({ ...form });

    function startEdit() {
        snapshot = { ...form };
        editMode = true;
    }

    function saveEdit() {
        editMode = false;
    }

    function cancelEdit() {
        form = { ...snapshot };
        editMode = false;
    }

    // ─── Data ──────────────────────────────────────────────────────────────────
    let groups = $state([]);

    const achievements = [
        { label: '5 Años de Docencia', icon: Shield, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
        { label: 'Mejor Profesor 2023', icon: Star, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
        { label: 'Publicación Académica', icon: BookOpen, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30' },
        { label: 'Certificación TIC', icon: Zap, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
        { label: 'Tutor Destacado', icon: Award, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' },
    ];

    const groupColorMap = {
        blue:    { card: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', dot: 'bg-blue-500' },
        violet:  { card: 'border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400', dot: 'bg-violet-500' },
        emerald: { card: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-500' },
        amber:   { card: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', dot: 'bg-amber-500' },
    };

    let totalStudents = $state(0);

    onMount(async () => {
        let currentUser = null;
        authStore.subscribe(s => { if (s) currentUser = s.user; })();
        if (currentUser) {
            form.name = `Prof. ${currentUser.name || (currentUser.first_name + ' ' + currentUser.last_name)}`;
            form.email = currentUser.email;

            const nameParts = currentUser.name ? currentUser.name.split(' ') : [currentUser.first_name, currentUser.last_name];
            initials = nameParts.length > 1
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : nameParts[0].substring(0, 2).toUpperCase();
        }

        try {
            const res = await fetch('http://localhost:5000/api/teacher/groups', {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                let grps = [];
                const colors = ['blue', 'violet', 'emerald', 'amber'];

                for (let i = 0; i < data.length; i++) {
                    const c = data[i];

                    const resStudents = await fetch(`http://localhost:5000/api/teacher/groups/${c.id}/students`, {
                        headers: authStore.getAuthHeaders()
                    });
                    let studentsCount = 0;
                    if (resStudents.ok) {
                        const stds = await resStudents.json();
                        studentsCount = stds.length;
                        totalStudents += studentsCount;
                    }

                    grps.push({
                        name: c.subject_name,
                        section: c.name,
                        students: studentsCount,
                        schedule: c.schedule,
                        room: c.room,
                        color: colors[i % colors.length]
                    });
                }
                groups = grps;
            }
        } catch (error) {
            console.error('Failed to load profile data', error);
        }
    });
</script>

<DashboardLayout role="teacher">

    <div class="relative mb-8 rounded-2xl overflow-hidden" in:fly={{ y: -10, duration: 350 }}>

        <div class="h-36 bg-gradient-to-br from-blue-700 via-blue-600 to-violet-600"></div>

        <div class="absolute top-0 right-0 w-64 h-36 opacity-20" style="background: radial-gradient(circle at 80% 20%, white 0%, transparent 60%)"></div>
        <div class="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 bg-white -translate-y-1/2"></div>

        <div class="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-b-2xl px-6 py-5">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-4">

                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-white dark:ring-slate-950 flex-shrink-0">
                    {initials}
                </div>
                <div class="flex-1 pt-10 sm:pt-0">
                    {#if editMode}
                        <input
                            bind:value={form.name}
                            class="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full mb-1"
                        />
                        <input
                            bind:value={form.department}
                            class="text-sm text-slate-500 dark:text-slate-400 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none w-full"
                        />
                    {:else}
                        <h1 class="text-xl font-bold text-slate-900 dark:text-white">{form.name}</h1>
                        <p class="text-sm text-slate-500 dark:text-slate-400">{form.department}</p>
                    {/if}
                </div>

                <div class="flex gap-2 sm:pb-0 pb-1">
                    {#if editMode}
                        <button
                            onclick={saveEdit}
                            class="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            in:scale={{ duration: 200 }}
                        >
                            <Save size={15} /> Guardar
                        </button>
                        <button
                            onclick={cancelEdit}
                            class="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                            in:scale={{ duration: 200 }}
                        >
                            <X size={15} /> Cancelar
                        </button>
                    {:else}
                        <button
                            onclick={startEdit}
                            class="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            <Edit3 size={15} /> Editar Perfil
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-6">

            <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6" in:fly={{ y: 15, duration: 350, delay: 80 }}>
                <h2 class="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <span class="w-1 h-5 bg-blue-500 rounded-full inline-block"></span>
                    Información de Contacto
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                            <Mail size={12} /> Correo Electrónico
                        </label>
                        {#if editMode}
                            <input
                                type="email"
                                bind:value={form.email}
                                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        {:else}
                            <p class="text-sm text-slate-700 dark:text-slate-300 font-medium">{form.email}</p>
                        {/if}
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                            <Phone size={12} /> Teléfono
                        </label>
                        {#if editMode}
                            <input
                                type="text"
                                bind:value={form.phone}
                                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        {:else}
                            <p class="text-sm text-slate-700 dark:text-slate-300 font-medium">{form.phone}</p>
                        {/if}
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                            <Clock size={12} /> Horario de Atención
                        </label>
                        {#if editMode}
                            <input
                                type="text"
                                bind:value={form.officeHours}
                                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        {:else}
                            <p class="text-sm text-slate-700 dark:text-slate-300 font-medium">{form.officeHours}</p>
                        {/if}
                    </div>

                    <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                            <MapPin size={12} /> Oficina
                        </label>
                        {#if editMode}
                            <input
                                type="text"
                                bind:value={form.office}
                                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        {:else}
                            <p class="text-sm text-slate-700 dark:text-slate-300 font-medium">{form.office}</p>
                        {/if}
                    </div>
                </div>

                <div class="mt-5">
                    <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Biografía</label>
                    {#if editMode}
                        <textarea
                            bind:value={form.bio}
                            rows="4"
                            class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                        ></textarea>
                    {:else}
                        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{form.bio}</p>
                    {/if}
                </div>
            </div>

            <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6" in:fly={{ y: 15, duration: 350, delay: 160 }}>
                <h2 class="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <span class="w-1 h-5 bg-violet-500 rounded-full inline-block"></span>
                    Mis Grupos
                </h2>
                <div class="space-y-3">
                    {#each groups as g}
                        {@const colors = groupColorMap[g.color]}
                        <div class="flex items-center gap-4 p-4 rounded-xl border {colors.card} transition-all hover:shadow-sm">
                            <div class="w-2.5 h-2.5 rounded-full {colors.dot} flex-shrink-0"></div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-slate-900 dark:text-white text-sm">{g.name}</p>
                                <div class="flex items-center gap-3 mt-1 flex-wrap">
                                    <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Calendar size={11} /> {g.schedule}
                                    </span>
                                    <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <MapPin size={11} /> {g.room}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold {colors.badge}">
                                    {g.section}
                                </span>
                                <span class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    <Users size={11} /> {g.students}
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div class="space-y-6">

            <div class="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg" in:fly={{ y: 15, duration: 350, delay: 120 }}>
                <p class="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-4">Resumen Académico</p>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-blue-100 text-sm">Grupos Activos</span>
                        <span class="text-2xl font-bold">{groups.length}</span>
                    </div>
                    <div class="h-px bg-white/20"></div>
                    <div class="flex items-center justify-between">
                        <span class="text-blue-100 text-sm">Total Estudiantes</span>
                        <span class="text-2xl font-bold">{totalStudents}</span>
                    </div>
                    <div class="h-px bg-white/20"></div>
                    <div class="flex items-center justify-between">
                        <span class="text-blue-100 text-sm">Años de Servicio</span>
                        <span class="text-2xl font-bold">12</span>
                    </div>
                    <div class="h-px bg-white/20"></div>
                    <div class="flex items-center justify-between">
                        <span class="text-blue-100 text-sm">Promedio de Grupo</span>
                        <span class="text-2xl font-bold">8.4</span>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6" in:fly={{ y: 15, duration: 350, delay: 200 }}>
                <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="w-1 h-5 bg-amber-500 rounded-full inline-block"></span>
                    Logros
                </h2>
                <div class="flex flex-wrap gap-2">
                    {#each achievements as ach, i}
                        <div
                            class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium {ach.color} transition-all hover:scale-105 cursor-default"
                            in:scale={{ duration: 250, delay: 200 + i * 60 }}
                        >
                            <svelte:component this={ach.icon} size={14} />
                            {ach.label}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</DashboardLayout>
