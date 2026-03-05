import { api } from "../config/axios";

const getEnrollmentStatus = async (courseId) => {
    try {
        const { data } = await api.get(`/enrollment/courses/${courseId}/status`);
        return data;
    } catch (error) {
        throw error?.response?.data || { message: 'Failed to fetch enrollment status' };
    }
};

const enrollInCourse = async (courseId) => {
    try {
        const { data } = await api.post(`/enrollment/courses/${courseId}/enroll`);
        return data;
    } catch (error) {
        throw error?.response?.data || { message: 'Failed to enroll in course' };
    }
};

const verifyEnrollmentPayment = async (pidx) => {
    try {
        const { data } = await api.get(`/enrollment/verify`, { params: { pidx } });
        return data;
    } catch (error) {
        throw error?.response?.data || { message: 'Payment verification failed' };
    }
};

const getMyCourses = async () => {
    try {
        const { data } = await api.get('/enrollment/my-courses');
        return data;
    } catch (error) {
        throw error?.response?.data || { message: 'Failed to fetch enrolled courses' };
    }
};

const confirmCourseCompletion = async (enrollmentId) => {
    try {
        const { data } = await api.post(`/enrollment/${enrollmentId}/confirm-completion`);
        return data;
    } catch (error) {
        throw error?.response?.data || { message: 'Failed to confirm course completion' };
    }
};

const getTrainerEnrollments = async (params = {}) => {
    try {
        const { data } = await api.get('/enrollment/trainer/my-enrollments', { params });
        return data;
    } catch (error) {
        throw error?.response?.data || { message: 'Failed to fetch trainer enrollments' };
    }
};

export {
    getEnrollmentStatus,
    enrollInCourse,
    verifyEnrollmentPayment,
    getMyCourses,
    confirmCourseCompletion,
    getTrainerEnrollments
}