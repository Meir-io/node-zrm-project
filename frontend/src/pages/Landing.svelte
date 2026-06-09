<script>

    import { onMount, onDestroy } from 'svelte';
    import Header from '../lib/components/Header.svelte';
    import { link } from 'svelte-spa-router';
    import { BookOpen, Users, Award, TrendingUp, GraduationCap, BarChart2, MapPin, Phone, Clock, ChevronRight, ChevronLeft, Star } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';

    const services = [
        { icon: BookOpen, title: 'Gestión Académica', desc: 'Sistema integral de gestión de cursos, planes de estudio y programas académicos.' },
        { icon: Users, title: 'Portal Estudiantil', desc: 'Seguimiento de calificaciones, asistencia y rendimiento académico en tiempo real.' },
        { icon: Award, title: 'Seguimiento de Calificaciones', desc: 'Visualiza tu progreso académico con reportes detallados por materia y semestre.' },
        { icon: TrendingUp, title: 'Panel de Análisis', desc: 'Estadísticas detalladas y análisis de rendimiento para tomar mejores decisiones.' },
        { icon: GraduationCap, title: 'Herramientas para Docentes', desc: 'Carga eficiente de actas, gestión de grupos y comunicación con estudiantes.' },
        { icon: BarChart2, title: 'Reportes e Informes', desc: 'Generación automática de reportes académicos completos en PDF.' }
    ];

    const stats = [
        { value: '1,247', label: 'Estudiantes Activos' },
        { value: '87', label: 'Docentes' },
        { value: '142', label: 'Materias Activas' },
        { value: '98%', label: 'Tasa de Aprobación' }
    ];

    const roles = [
        { icon: GraduationCap, title: 'Estudiantes', desc: 'Consulta tu kardex, horario, calificaciones y rendimiento desde un solo lugar.' },
        { icon: BookOpen, title: 'Docentes', desc: 'Carga actas, gestiona tus grupos y da seguimiento a tus alumnos fácilmente.' },
        { icon: BarChart2, title: 'Administradores', desc: 'Control total del sistema: usuarios, reportes, configuración y auditoría.' }
    ];

    const testimonials = [
        { name: 'Ana Rodríguez', program: 'Ingeniería en Sistemas, 7º semestre', quote: 'Los profesores son excelentes y siempre están dispuestos a apoyarte. Las instalaciones del laboratorio de redes están súper equipadas.', initials: 'AR', stars: 5, color: 'bg-blue-500' },
        { name: 'Miguel Herrera', program: 'Ingeniería en Computación, 5º semestre', quote: 'Me encanta el ambiente en el campus. La biblioteca es gigante y siempre encuentro el material que necesito para mis proyectos.', initials: 'MH', stars: 5, color: 'bg-violet-500' },
        { name: 'Valeria Salinas', program: 'Licenciatura en Sistemas, 3er semestre', quote: 'El nivel académico es muy exigente pero vale la pena. Los maestros realmente saben de lo que hablan y te preparan para el mundo real.', initials: 'VS', stars: 5, color: 'bg-emerald-500' },
        { name: 'Carlos Jiménez', program: 'Ingeniería en Sistemas, 8º semestre', quote: 'El programa de prácticas profesionales me ayudó a conseguir trabajo antes de graduarme. La bolsa de trabajo de la institución es buenísima.', initials: 'CJ', stars: 4, color: 'bg-amber-500' },
        { name: 'Paola Méndez', program: 'Ingeniería en Computación, 6º semestre', quote: 'Las áreas verdes y la cafetería son perfectas para relajarse entre clases. La infraestructura en general está muy bien cuidada.', initials: 'PM', stars: 5, color: 'bg-rose-500' },
        { name: 'Rodrigo Castillo', program: 'Licenciatura en Informática, 4º semestre', quote: 'Los talleres y conferencias extracurriculares siempre traen temas muy actuales. Se nota que la institución se preocupa por mantenernos al día.', initials: 'RC', stars: 5, color: 'bg-cyan-500' },
    ];

    let currentSlide = $state(0);
    let autoTimer;

    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonials.length;
    }
    function prevSlide() {
        currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
    }

    onMount(() => {
        autoTimer = setInterval(nextSlide, 4000);
    });
    onDestroy(() => {
        clearInterval(autoTimer);
    });

    function pauseAuto() { clearInterval(autoTimer); }
    function resumeAuto() { autoTimer = setInterval(nextSlide, 4000); }

</script>

<div class="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
    <Header />

    <section class="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white" in:fly={{ y: 30, duration: 600, delay: 100 }}>
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 30px 30px;"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
            <span class="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
                Sistema de Gestión Educativa
            </span>
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                English<br />
                <span class="bg-gradient-to-r from-red-500 via-white to-blue-500 text-transparent bg-clip-text drop-shadow-sm">Informatics</span>
            </h1>
            <p class="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
                La plataforma académica más completa para gestionar calificaciones, horarios y rendimiento estudiantil.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="/login" use:link class="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl text-lg shadow-xl shadow-blue-900/30 transition-all hover:scale-105 hover:shadow-2xl">
                    Iniciar Sesión
                    <ChevronRight size={20} />
                </a>
                <a href="#servicios" class="inline-flex items-center gap-2 border-2 border-white/50 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:bg-white/10">
                    Ver Servicios
                </a>
            </div>
        </div>
        <div class="relative h-16 overflow-hidden">
            <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute bottom-0 w-full">
                <path d="M0 64L1440 64L1440 0C1440 0 1080 64 720 64C360 64 0 0 0 0L0 64Z" fill="white" class="dark:fill-slate-950"/>
            </svg>
        </div>
    </section>

    <section class="py-10 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800" in:fly={{ y: 20, duration: 500, delay: 200 }}>
        <div class="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {#each stats as stat}
                <div>
                    <div class="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</div>
                    <div class="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</div>
                </div>
            {/each}
        </div>
    </section>

    <section id="servicios" class="py-24 bg-slate-50 dark:bg-slate-900" in:fly={{ y: 30, duration: 600, delay: 300 }}>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Nuestros Servicios</h2>
                <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                    Herramientas completas diseñadas para cada actor del ecosistema educativo.
                </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each services as service, i}
                    <div class="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" in:fly={{ y: 20, duration: 400, delay: 400 + (i * 80) }}>
                        <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <svelte:component this={service.icon} size={28} />
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">{service.title}</h3>
                        <p class="text-slate-500 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <section class="py-24 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Una plataforma para todos</h2>
                <p class="text-slate-500 dark:text-slate-400 text-lg">Diseñada pensando en cada usuario de la institución.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                {#each roles as role, i}
                    <div class="text-center p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg group" in:fly={{ y: 20, duration: 400, delay: 200 + (i * 100) }}>
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                            <svelte:component this={role.icon} size={32} />
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">{role.title}</h3>
                        <p class="text-slate-500 dark:text-slate-400 leading-relaxed">{role.desc}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <section class="py-24 bg-blue-700 text-white overflow-hidden">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-14">
                <h2 class="text-4xl font-bold mb-2">Lo que dicen nuestros alumnos</h2>
                <p class="text-blue-200 text-lg">Opiniones reales de estudiantes que usan ZRM cada día.</p>
            </div>

            <div
                class="relative"
                onmouseenter={pauseAuto}
                onmouseleave={resumeAuto}
            >

                <div class="overflow-hidden">
                    <div
                        class="flex transition-transform duration-500 ease-in-out"
                        style="transform: translateX(-{currentSlide * (100 / 3)}%); width: {testimonials.length * (100/3)}%"
                    >
                        {#each testimonials as t}
                            <div class="px-3" style="width: {100 / testimonials.length}%">
                                <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-full flex flex-col">

                                    <div class="flex gap-1 mb-4">
                                        {#each Array(5) as _, si}
                                            <Star size={14} class="{si < t.stars ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}" />
                                        {/each}
                                    </div>
                                    <p class="text-blue-100 leading-relaxed mb-5 italic flex-1">"{t.quote}"</p>
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 {t.color} rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0">{t.initials}</div>
                                        <div>
                                            <p class="text-white font-semibold text-sm">{t.name}</p>
                                            <p class="text-blue-300 text-xs">{t.program}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <button
                    onclick={prevSlide}
                    class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onclick={nextSlide}
                    class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div class="flex justify-center gap-2 mt-8">
                {#each testimonials as _, i}
                    <button
                        onclick={() => currentSlide = i}
                        class="w-2 h-2 rounded-full transition-all {currentSlide === i ? 'bg-white w-6' : 'bg-white/40'}"
                    ></button>
                {/each}
            </div>
        </div>
    </section>

    <section class="py-24 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Encuéntranos</h2>
                <p class="text-slate-500 dark:text-slate-400 text-lg">Estamos aquí para ayudarte.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="space-y-6">
                    <div class="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900 dark:text-white mb-1">Dirección</h4>
                            <p class="text-slate-500 dark:text-slate-400">Av. Tecnológico #100, Campus Sur<br/>Ciudad Universitaria, CP 44600</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900 dark:text-white mb-1">Horario de Atención</h4>
                            <p class="text-slate-500 dark:text-slate-400">Lunes a Viernes: 8:00 - 20:00<br/>Sábados: 9:00 - 14:00</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900 dark:text-white mb-1">Contacto</h4>
                            <p class="text-slate-500 dark:text-slate-400">Tel: +52 (33) 3615-0000<br/>Email: contacto@englishinformatics.edu</p>
                        </div>
                    </div>
                </div>
                <div class="h-80 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative">
                    <div class="absolute inset-0" style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); opacity: 0.4;"></div>
                    <div class="relative text-center">
                        <MapPin size={48} class="text-blue-500 mx-auto mb-3" />
                        <p class="text-slate-600 dark:text-slate-400 font-medium">Campus Principal EI</p>
                        <p class="text-slate-400 dark:text-slate-500 text-sm">Ciudad Universitaria</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div class="max-w-3xl mx-auto px-4">
            <h2 class="text-4xl font-bold mb-4">¿Listo para empezar?</h2>
            <p class="text-blue-100 text-xl mb-10">Accede a tu portal con tus credenciales institucionales.</p>
            <a href="/login" use:link class="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl text-xl shadow-2xl transition-all hover:scale-105">
                Iniciar Sesión
                <ChevronRight size={22} />
            </a>
        </div>
    </section>

    <footer class="bg-slate-900 text-slate-400 py-10 text-center text-sm">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex items-center justify-center gap-2 mb-4">
                <div class="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold">E</div>
                <span class="text-white font-bold">EI</span>
                <span>— English Informatics</span>
            </div>
            <p>© 2025 Institución Educativa English Informatics. Todos los derechos reservados.</p>
        </div>
    </footer>
</div>
