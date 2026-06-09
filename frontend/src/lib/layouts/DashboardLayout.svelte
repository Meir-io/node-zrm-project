<script>

    import Header from '../components/Header.svelte';
    import Sidebar from '../components/Sidebar.svelte';
    import { fade, fly } from 'svelte/transition';

    let { role = 'student', children } = $props();

</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
    <Header />
    <div class="flex max-w-7xl mx-auto">
        <Sidebar {role} />
        <main class="flex-1 p-6 lg:p-8 overflow-x-hidden" in:fly={{ y: 20, duration: 400, delay: 100 }}>
            {@render children()}
        </main>
    </div>
</div>
