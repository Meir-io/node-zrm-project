<script>

  import Router from 'svelte-spa-router';
  import Landing from './pages/Landing.svelte';
  import Login from './pages/Login.svelte';

  import AdminDashboard from './pages/AdminDashboard.svelte';
  import AdminUsers from './pages/AdminUsers.svelte';
  import AdminReports from './pages/AdminReports.svelte';
  import AdminSettings from './pages/AdminSettings.svelte';
  import AdminAudit from './pages/AdminAudit.svelte';

  import TeacherDashboard from './pages/TeacherDashboard.svelte';
  import TeacherStudents from './pages/TeacherStudents.svelte';
  import TeacherProfile from './pages/TeacherProfile.svelte';
  import TeacherSchedule from './pages/TeacherSchedule.svelte';
  import GradesCarga from './pages/GradesCarga.svelte';

  import StudentDashboard from './pages/StudentDashboard.svelte';
  import StudentKardex from './pages/StudentKardex.svelte';
  import StudentSchedule from './pages/StudentSchedule.svelte';
  import StudentPerformance from './pages/StudentPerformance.svelte';
  import StudentGrades from './pages/StudentGrades.svelte';

  import Profile from './pages/Profile.svelte';

  const routes = {
    '/': Landing,
    '/login': Login,

    '/admin': AdminDashboard,
    '/admin/users': AdminUsers,
    '/admin/reports': AdminReports,
    '/admin/settings': AdminSettings,
    '/admin/audit': AdminAudit,

    '/teacher': TeacherDashboard,
    '/teacher/grades': GradesCarga,
    '/teacher/students': TeacherStudents,
    '/teacher/schedule': TeacherSchedule,
    '/teacher/profile': TeacherProfile,

    '/student': StudentDashboard,
    '/student/kardex': StudentKardex,
    '/student/schedule': StudentSchedule,
    '/student/performance': StudentPerformance,
    '/student/grades': StudentGrades,

    '/profile': Profile,

    '*': Landing
  };

</script>

<Router {routes} />
