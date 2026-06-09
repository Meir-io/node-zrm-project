<script>
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import Modal from '../lib/components/Modal.svelte';
    import { Search, UserPlus, Eye, Pencil, User } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { authStore } from '../lib/auth.js';

    // ── State ──────────────────────────────────────────────────────────────────
    let search        = $state('');
    let activeTab     = $state('Todos');
    let addModalOpen  = $state(false);
    let viewModalOpen = $state(false);
    let editModalOpen = $state(false);
    let isLoading     = $state(true);

    /** @type {null | typeof users[0]} */
    let selectedUser  = $state(null);

    // Add-user form state
    let newName     = $state('');
    let newEmail    = $state('');
    let newRole     = $state('Estudiante');
    let newPassword = $state('');

    // Edit-user form state
    let editName    = $state('');
    let editEmail   = $state('');
    let editRole    = $state('');
    let editStatus  = $state('');

    let users = $state([]);

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users', {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                // Map the DB format to the component's expected format
                users = data.map(u => ({
                    id: u.id,
                    name: `${u.first_name} ${u.last_name}`,
                    email: u.email,
                    role: u.role_name === 'ADMIN' ? 'Admin' : (u.role_name === 'TEACHER' ? 'Docente' : 'Estudiante'),
                    status: u.status === 'ACTIVE' ? 'Activo' : 'Inactivo',
                    created: u.created_at ? u.created_at.split('T')[0] : ''
                }));
            }
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            isLoading = false;
        }
    });

    const tabs = ['Todos', 'Estudiantes', 'Docentes'];

    // ── Derived filtered list ──────────────────────────────────────────────────
    let filtered = $derived(
        users.filter(u => {
            const matchesTab =
                activeTab === 'Todos' ||
                (activeTab === 'Estudiantes' && u.role === 'Estudiante') ||
                (activeTab === 'Docentes'    && u.role === 'Docente');
            const q = search.toLowerCase();
            const matchesSearch =
                u.name.toLowerCase().includes(q)  ||
                u.email.toLowerCase().includes(q) ||
                u.role.toLowerCase().includes(q);
            return matchesTab && matchesSearch;
        })
    );

    // ── Helpers ────────────────────────────────────────────────────────────────
    function initials(name) {
        return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }

    function openView(user) {
        selectedUser  = user;
        viewModalOpen = true;
    }

    function openEdit(user) {
        selectedUser  = { ...user };
        editModalOpen = true;
    }

    async function addUser() {
        if (!newName || !newEmail || !newPassword) return;

        const [first_name, ...last_name_parts] = newName.split(' ');
        const last_name = last_name_parts.join(' ') || ' ';

        let roleMap = { 'Admin': 'ADMIN', 'Docente': 'TEACHER', 'Estudiante': 'STUDENT' };

        try {
            const res = await fetch('http://localhost:5000/api/admin/users', {
                method: 'POST',
                headers: authStore.getAuthHeaders(),
                body: JSON.stringify({
                    first_name,
                    last_name,
                    email: newEmail,
                    password: newPassword,
                    role: roleMap[newRole] || 'STUDENT'
                })
            });

            if (res.ok) {
                // Refresh list
                const resUsers = await fetch('http://localhost:5000/api/admin/users', {
                    headers: authStore.getAuthHeaders()
                });
                const data = await resUsers.json();
                users = data.map(u => ({
                    id: u.id,
                    name: `${u.first_name} ${u.last_name}`,
                    email: u.email,
                    role: u.role_name === 'ADMIN' ? 'Admin' : (u.role_name === 'TEACHER' ? 'Docente' : 'Estudiante'),
                    status: u.status === 'ACTIVE' ? 'Activo' : 'Inactivo',
                    created: u.created_at ? u.created_at.split('T')[0] : ''
                }));
            }
        } catch (error) {
            console.error('Failed to add user', error);
        }

        newName = '';
        newEmail = '';
        newPassword = '';
        addModalOpen = false;
    }

    async function saveEdit() {
        if (selectedUser) {
            try {
                let roleMap = { 'Admin': 'ADMIN', 'Docente': 'TEACHER', 'Estudiante': 'STUDENT' };
                let statusMap = { 'Activo': 'ACTIVE', 'Inactivo': 'INACTIVE' };

                const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        ...authStore.getAuthHeaders(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: selectedUser.name,
                        email: selectedUser.email,
                        role: roleMap[selectedUser.role] || 'STUDENT',
                        status: statusMap[selectedUser.status] || 'ACTIVE'
                    })
                });

                if (res.ok) {
                    const idx = users.findIndex(u => u.id === selectedUser.id);
                    if (idx !== -1) {
                        users[idx] = { ...selectedUser };
                    }
                } else {
                    console.error('Error updating user');
                }
            } catch (error) {
                console.error('Failed to update user', error);
            }
        }
        editModalOpen = false;
    }
</script>

<DashboardLayout role="admin">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8" in:fly={{ y: -16, duration: 350 }}>
        <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Usuarios</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-1">Administra estudiantes, docentes y sus permisos.</p>
        </div>
        <button
            onclick={() => addModalOpen = true}
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-200 dark:shadow-blue-900/40 transition-all duration-150"
        >
            <UserPlus size={18} />
            Agregar Usuario
        </button>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6" in:fly={{ y: 16, duration: 350, delay: 60 }}>
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">

            <div class="relative flex-1">
                <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o rol…"
                    bind:value={search}
                    class="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div class="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {#each tabs as tab}
                    <button
                        onclick={() => activeTab = tab}
                        class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                            {activeTab === tab
                                ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
                    >
                        {tab}
                    </button>
                {/each}
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-slate-50 dark:bg-slate-900/50 text-left">
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuario</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Creado</th>
                        <th class="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    {#each filtered as user (user.id)}
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors" in:fade={{ duration: 180 }}>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow">
                                        {initials(user.name)}
                                    </div>
                                    <span class="font-medium text-slate-900 dark:text-white">{user.name}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                            <td class="px-6 py-4">
                                {#if user.role === 'Docente'}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Docente</span>
                                {:else}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Estudiante</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4">
                                {#if user.status === 'Activo'}
                                    <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Activo
                                    </span>
                                {:else}
                                    <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>Inactivo
                                    </span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 text-slate-500 dark:text-slate-400">{user.created}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <button
                                        onclick={() => openView(user)}
                                        class="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Eye size={13} /> Ver
                                    </button>
                                    <button
                                        onclick={() => openEdit(user)}
                                        class="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Pencil size={13} /> Editar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                    {#if filtered.length === 0}
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                <User size={36} class="mx-auto mb-2 opacity-30" />
                                No se encontraron usuarios.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        <div class="px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            Mostrando {filtered.length} de {users.length} usuarios
        </div>
    </div>

    <Modal bind:isOpen={addModalOpen} title="Agregar Nuevo Usuario">
        <form onsubmit={(e) => { e.preventDefault(); addUser(); }} class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre completo</label>
                <input type="text" bind:value={newName} required placeholder="Ej. Juan Pérez"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico</label>
                <input type="email" bind:value={newEmail} required placeholder="usuario@zrm.edu"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rol</label>
                <select bind:value={newRole} class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Estudiante">Estudiante</option>
                    <option value="Docente">Docente</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contraseña temporal</label>
                <input type="password" bind:value={newPassword} placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="flex justify-end gap-3 pt-2">
                <button type="button" onclick={() => addModalOpen = false}
                    class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancelar
                </button>
                <button type="submit"
                    class="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                    Crear Usuario
                </button>
            </div>
        </form>
    </Modal>

    <Modal bind:isOpen={viewModalOpen} title="Detalles del Usuario">
        {#if selectedUser}
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {initials(selectedUser.name)}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">{selectedUser.email}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    {#each [
                        { label: 'Rol', value: selectedUser.role },
                        { label: 'Estado', value: selectedUser.status },
                        { label: 'ID', value: `#${selectedUser.id}` },
                        { label: 'Creado', value: selectedUser.created },
                    ] as item}
                        <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
                            <p class="text-xs text-slate-400 mb-1">{item.label}</p>
                            <p class="font-semibold text-slate-900 dark:text-white">{item.value}</p>
                        </div>
                    {/each}
                </div>
                <div class="flex justify-end">
                    <button onclick={() => { viewModalOpen = false; openEdit(selectedUser); }}
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        <Pencil size={14} /> Editar usuario
                    </button>
                </div>
            </div>
        {/if}
    </Modal>

    <Modal bind:isOpen={editModalOpen} title="Editar Usuario">
        {#if selectedUser}
            <form onsubmit={(e) => { e.preventDefault(); saveEdit(); }} class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre completo</label>
                    <input type="text" bind:value={selectedUser.name} required
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Correo electrónico</label>
                    <input type="email" bind:value={selectedUser.email} required
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rol</label>
                        <select bind:value={selectedUser.role}
                            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Estudiante">Estudiante</option>
                            <option value="Docente">Docente</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Estado</label>
                        <select bind:value={selectedUser.status}
                            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick={() => editModalOpen = false}
                        class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit"
                        class="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                        Guardar cambios
                    </button>
                </div>
            </form>
        {/if}
    </Modal>
</DashboardLayout>