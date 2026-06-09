<script>
    import { link } from 'svelte-spa-router';
    import {
        LayoutDashboard,
        Users,
        BookOpen,
        Award,
        Calendar,
        TrendingUp,
        Settings,
        LogOut,
        FileEdit,
        UserCircle,
        BarChart2,
        Shield
    } from 'lucide-svelte';

    let { role = 'student' } = $props();

    let currentPath = $state(window.location.hash.replace('#', '') || '/');

    $effect(() => {
        const onHashChange = () => {
            currentPath = window.location.hash.replace('#', '') || '/';
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    });

    const adminLinks = [
        { path: '/admin', icon: LayoutDashboard, label: 'Vista General' },
        { path: '/admin/users', icon: Users, label: 'Usuarios' },
        { path: '/admin/reports', icon: BarChart2, label: 'Reportes' },
        { path: '/admin/audit', icon: Shield, label: 'Auditoría' },
        { path: '/admin/settings', icon: Settings, label: 'Configuración' },
        { path: '/profile', icon: UserCircle, label: 'Mi Perfil' }
    ];

    const teacherLinks = [
        { path: '/teacher', icon: LayoutDashboard, label: 'Mis Grupos' },
        { path: '/teacher/grades', icon: FileEdit, label: 'Cargar Actas' },
        { path: '/teacher/students', icon: Users, label: 'Mis Estudiantes' },
        { path: '/teacher/schedule', icon: Calendar, label: 'Mi Horario' },
        { path: '/teacher/profile', icon: UserCircle, label: 'Mi Perfil' },
    ];

    const studentLinks = [
        { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/student/kardex', icon: BookOpen, label: 'Kardex' },
        { path: '/student/schedule', icon: Calendar, label: 'Horario' },
        { path: '/student/performance', icon: TrendingUp, label: 'Rendimiento' },
        { path: '/student/grades', icon: Award, label: 'Calificaciones' },
        { path: '/profile', icon: UserCircle, label: 'Mi Perfil' }
    ];

    let links = $derived(role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks);
</script>

<aside class="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
    <div class="p-4 flex-1 overflow-y-auto">
        <div class="space-y-1">
            <div class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-3">
                Navegación Principal
            </div>
            {#each links as item}
                <a
                    href={item.path}
                    use:link
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors { currentPath === item.path ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900' }"
                >
                    <svelte:component this={item.icon} size={20} />
                    {item.label}
                </a>
            {/each}
        </div>
</aside>
