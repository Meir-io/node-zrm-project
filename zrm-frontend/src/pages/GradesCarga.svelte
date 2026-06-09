<script>
    import { onMount } from 'svelte';
    import DashboardLayout from '../lib/layouts/DashboardLayout.svelte';
    import { Save, Download, Eye, CheckCircle } from 'lucide-svelte';
    import { authStore } from '../lib/auth.js';

    let groups = $state([]);
    let selectedGroupId = $state('');
    let students = $state([]);
    let isSaving = $state(false);
    let showSaved = $state(false);

    onMount(async () => {
        try {
            // Load Teacher's Groups
            const res = await fetch('http://localhost:5000/api/teacher/groups', {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                groups = await res.json();
                if (groups.length > 0) {
                    selectedGroupId = groups[0].id;
                }
            }
        } catch (e) {
            console.error('Error fetching groups', e);
        }
    });

    $effect(() => {
        if (selectedGroupId) {
            loadStudents(selectedGroupId);
        }
    });

    async function loadStudents(groupId) {
        try {
            const res = await fetch(`http://localhost:5000/api/teacher/groups/${groupId}/students`, {
                headers: authStore.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                students = data.map(s => ({
                    enrollment_id: s.enrollment_id,
                    student_id: s.student_id,
                    name: `${s.first_name} ${s.last_name}`,
                    p1: s.p1 != null ? parseFloat(s.p1) : '',
                    p2: s.p2 != null ? parseFloat(s.p2) : '',
                    p3: s.p3 != null ? parseFloat(s.p3) : '',
                    final: s.final != null ? parseFloat(s.final) : '',
                    average: s.average != null ? parseFloat(s.average) : '-',
                    status: s.status === 'ACTIVE' ? 'Pendiente' : 'Finalizado' // Simplified
                }));
            }
        } catch (e) {
            console.error('Error loading students for group', e);
        }
    }

    function calcPromedio(student) {
        const p1 = student.p1 !== '' ? parseFloat(student.p1) : null;
        const p2 = student.p2 !== '' ? parseFloat(student.p2) : null;
        const p3 = student.p3 !== '' ? parseFloat(student.p3) : null;
        const final = student.final !== '' ? parseFloat(student.final) : null;

        let sum = 0; let count = 0;
        if (p1 !== null) { sum += p1; count++; }
        if (p2 !== null) { sum += p2; count++; }
        if (p3 !== null) { sum += p3; count++; }

        return count === 0 ? '-' : (sum / count).toFixed(2);
    }

    let groupPromedio = $derived(() => {
        let sum = 0;
        let count = 0;
        students.forEach(s => {
            const prom = parseFloat(calcPromedio(s));
            if (!isNaN(prom)) {
                sum += prom;
                count++;
            }
        });
        return count === 0 ? '0.00' : (sum / count).toFixed(2);
    });

    async function saveGradesBatch() {
        if (students.length === 0) return;
        isSaving = true;
        try {
            const res = await fetch('http://localhost:5000/api/teacher/grades/batch', {
                method: 'PUT',
                headers: {
                    ...authStore.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ grades: students })
            });
            if (res.ok) {
                showSaved = true;
                setTimeout(() => showSaved = false, 3000);
            }
        } catch (e) {
            console.error('Error saving grades', e);
        } finally {
            isSaving = false;
        }
    }

    function exportCSV() {
        if (students.length === 0) return;
        const groupInfo = groups.find(g => g.id === selectedGroupId);
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID Estudiante,Nombre,P1,P2,P3,Final,Promedio\r\n";
        students.forEach(s => {
            const row = [
                s.student_id,
                `"${s.name}"`,
                s.p1, s.p2, s.p3, s.final,
                calcPromedio(s)
            ].join(",");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Calificaciones_${groupInfo ? groupInfo.name.replace(/\s+/g, '_') : 'Grupo'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>

<DashboardLayout role="teacher">

    <div class="flex items-center justify-between mb-6">
        <div class="flex gap-4">
            <button onclick={saveGradesBatch} disabled={isSaving} class="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50">
                {#if isSaving}
                    <svg class="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    Guardando...
                {:else if showSaved}
                    <CheckCircle size={18} class="text-emerald-400" />
                    ¡Guardado!
                {:else}
                    <Save size={18} />
                    Guardar Calificaciones
                {/if}
            </button>
            <button onclick={exportCSV} class="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
                <Download size={18} />
                Exportar a Excel
            </button>
        </div>

        <div>
            <select bind:value={selectedGroupId} class="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {#each groups as g}
                    <option value={g.id}>{g.subject_name} - {g.name}</option>
                {/each}
            </select>
        </div>
    </div>

    <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Carga de Calificaciones</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Ingresa las calificaciones para cada período de evaluación. El promedio se calcula automáticamente (25% cada uno).</p>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <tr>
                        <th class="px-6 py-4 font-medium">ID Estudiante</th>
                        <th class="px-6 py-4 font-medium">Nombre del Estudiante</th>
                        <th class="px-6 py-4 font-medium text-center">Parcial 1<br><span class="text-xs font-normal">(25%)</span></th>
                        <th class="px-6 py-4 font-medium text-center">Parcial 2<br><span class="text-xs font-normal">(25%)</span></th>
                        <th class="px-6 py-4 font-medium text-center">Parcial 3<br><span class="text-xs font-normal">(25%)</span></th>
                        <th class="px-6 py-4 font-medium text-center">Final<br><span class="text-xs font-normal">(25%)</span></th>
                        <th class="px-6 py-4 font-medium text-center">Promedio</th>
                        <th class="px-6 py-4 font-medium text-center">Estado</th>
                        <th class="px-6 py-4 font-medium text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {#each students as student}
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{student.student_id}</td>
                            <td class="px-6 py-4 text-slate-700 dark:text-slate-300">{student.name}</td>
                            <td class="px-6 py-4 text-center">
                                <input type="number" bind:value={student.p1} class="w-16 px-2 py-1 text-center bg-transparent border border-slate-300 dark:border-slate-700 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" min="0" max="10" step="0.1" />
                            </td>
                            <td class="px-6 py-4 text-center">
                                <input type="number" bind:value={student.p2} class="w-16 px-2 py-1 text-center bg-transparent border border-slate-300 dark:border-slate-700 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" min="0" max="10" step="0.1" />
                            </td>
                            <td class="px-6 py-4 text-center">
                                <input type="number" bind:value={student.p3} class="w-16 px-2 py-1 text-center bg-transparent border border-slate-300 dark:border-slate-700 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" min="0" max="10" step="0.1" />
                            </td>
                            <td class="px-6 py-4 text-center">
                                <input type="number" bind:value={student.final} placeholder="0" class="w-16 px-2 py-1 text-center bg-transparent border border-slate-300 dark:border-slate-700 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" min="0" max="10" step="0.1" />
                            </td>
                            <td class="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                                {calcPromedio(student)}
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">{student.status}</span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="9" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                No hay estudiantes inscritos o selecciona un grupo.
                            </td>
                        </tr>
                    {/each}
                </tbody>
                <tfoot class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium">
                    <tr>
                        <td colspan="4" class="px-6 py-4 text-slate-600 dark:text-slate-400">Total de Estudiantes: {students.length}</td>
                        <td colspan="5" class="px-6 py-4 text-right text-slate-900 dark:text-white font-bold">Promedio del Grupo: {groupPromedio()}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</DashboardLayout>
