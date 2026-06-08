import { Routes, Route } from 'react-router-dom'

// Public
import Home from './pages/public/Home'
import Courses from './pages/public/Courses'
import CourseDetail from './pages/public/CourseDetail'
import About from './pages/public/About'
import FAQ from './pages/public/FAQ'
import Contact from './pages/public/Contact'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Payment
import { PaymentSuccess, PaymentFailed, PaymentCancel } from './pages/payment/PaymentPages'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import LearnCourse from './pages/student/LearnCourse'

// Instructor
import CompleteProfile from './pages/instructor/CompleteProfile'
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import InstructorCourses from './pages/instructor/InstructorCourses'
import CourseEditor from './pages/instructor/CourseEditor'
import InstructorStudents from './pages/instructor/InstructorStudents'
import InstructorEarnings from './pages/instructor/InstructorEarnings'
import InstructorSchedule from './pages/instructor/InstructorSchedule'
import InstructorSettings from './pages/instructor/InstructorSettings'

// Admin
import AdminMain from './pages/admin/AdminMain'
import AdminCourses from './pages/admin/AdminCourses'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminFAQs from './pages/admin/AdminFAQs'
import AdminArticles from './pages/admin/AdminArticles'
import AdminHomepage from './pages/admin/AdminHomepage'
import AdminHeaderFooter from './pages/admin/AdminHeaderFooter'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSEO from './pages/admin/AdminSEO'
import AdminTransactions from './pages/admin/AdminTransactions'

// Zaki
import Zaki from './components/Zaki'

import './index.css'

function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Payment */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses/:id/learn" element={<LearnCourse />} />

        {/* Instructor */}
        <Route path="/instructor/complete-profile" element={<CompleteProfile />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/courses" element={<InstructorCourses />} />
        <Route path="/instructor/courses/new" element={<CourseEditor />} />
        <Route path="/instructor/courses/:id/edit" element={<CourseEditor />} />
        <Route path="/instructor/students" element={<InstructorStudents />} />
        <Route path="/instructor/earnings" element={<InstructorEarnings />} />
        <Route path="/instructor/schedule" element={<InstructorSchedule />} />
        <Route path="/instructor/settings" element={<InstructorSettings />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminMain />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/faqs" element={<AdminFAQs />} />
        <Route path="/admin/articles" element={<AdminArticles />} />
        <Route path="/admin/homepage" element={<AdminHomepage />} />
        <Route path="/admin/header-footer" element={<AdminHeaderFooter />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/seo" element={<AdminSEO />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
      </Routes>

      {/* زكي — عائم في كل الصفحات */}
      <Zaki />
    </>
  )
}

export default App