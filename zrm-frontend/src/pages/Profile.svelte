<script>

    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { authUser } from '../lib/auth.js';
    import { UserCircle, Mail, Phone, MapPin, Shield, Edit3, Save, X } from 'lucide-svelte';
    import { fly, scale } from 'svelte/transition';

    let editMode = $state(false);

    let currentRole = $derived($authUser?.role || 'student');
    let currentName = $derived($authUser?.name || ($authUser ? `${$authUser.first_name} ${$authUser.last_name}` : 'Usuario'));
    let initials = $derived(currentName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase());

    const roleLabels = {
        admin: 'Administrador del Sistema',
        teacher: 'Docente Académico',
        student: 'Estudiante Universitario'
    };

    let form = $state({
        phone: '+52 123 456 7890',
        location: 'Campus Principal',
        bio: 'Este es el perfil de tu usuario. Puedes editar tu biografía y datos de contacto aquí.'
    });

    $effect(() => {
        if ($authUser) {
            form.phone = $authUser.phone || form.phone;
            form.location = $authUser.location || form.location;
            form.bio = $authUser.bio || form.bio;
        }
    });

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

</script>

<DashboardLayout role={currentRole}>
    <div class="max-w-4xl mx-auto" in:fly={{ y: -10, duration: 350 }}>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Mi Perfil</h1>

        <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

            <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div class="px-6 sm:px-8 pb-8">

                <div class="relative flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-6 gap-4">
                    <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-md flex-shrink-0 text-white text-3xl font-bold">
                        {initials}
                    </div>
                    <div class="flex gap-2">
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
                                class="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg transition-colors"
                            >
                                <Edit3 size={15} /> Editar Perfil
                            </button>
                        {/if}
                    </div>
                </div>

                <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currentName}</h2>
                <p class="text-blue-600 dark:text-blue-400 font-medium mb-6 flex items-center gap-2">
                    <Shield size={16} /> {roleLabels[currentRole]}
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

                    <div class="space-y-5">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                            Información de Contacto
                        </h3>

                        <div>
                            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Correo Electrónico</label>
                            <div class="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                <Mail size={16} class="text-slate-400" />
                                <span>{$authUser?.email || 'demo@zrm.edu'}</span>
                            </div>
                        </div>

                        <div>
                            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Teléfono</label>
                            {#if editMode}
                                <div class="relative">
                                    <Phone size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        bind:value={form.phone}
                                        class="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                                    />
                                </div>
                            {:else}
                                <div class="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <Phone size={16} class="text-slate-400" />
                                    <span>{form.phone}</span>
                                </div>
                            {/if}
                        </div>

                        <div>
                            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Ubicación principal</label>
                            {#if editMode}
                                <div class="relative">
                                    <MapPin size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        bind:value={form.location}
                                        class="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                                    />
                                </div>
                            {:else}
                                <div class="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <MapPin size={16} class="text-slate-400" />
                                    <span>{form.location}</span>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="space-y-5">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                            Acerca de mí
                        </h3>

                        <div>
                            {#if editMode}
                                <textarea
                                    bind:value={form.bio}
                                    rows="6"
                                    class="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none shadow-sm leading-relaxed"
                                ></textarea>
                            {:else}
                                <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 h-full">
                                    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {form.bio}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</DashboardLayout>
