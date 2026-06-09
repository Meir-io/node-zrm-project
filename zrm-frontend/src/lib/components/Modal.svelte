<script>

    import { X } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';

    let { isOpen = $bindable(false), title, children } = $props();

    function close() {
        isOpen = false;
    }

</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" in:fade={{duration: 200}} out:fade={{duration: 200}}>

        <button class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-default w-full h-full border-0" onclick={close} aria-label="Close modal"></button>

        <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" in:scale={{duration: 200, start: 0.95}}>
            <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                <button onclick={close} class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X size={24} />
                </button>
            </div>
            <div class="p-6 overflow-y-auto flex-1">
                {@render children()}
            </div>
        </div>
    </div>
{/if}
