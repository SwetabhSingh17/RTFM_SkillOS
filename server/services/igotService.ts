export const igotService = {
  async searchCourses(query: string) {
    // Mock implementation of iGOT search
    return [
      {
        id: "igot-1",
        title: "Introduction to Official Statistics",
        description: "A comprehensive guide to India's statistical system.",
        provider: "NSSTA",
        duration: "4 hours",
        difficulty: "Beginner"
      }
    ];
  },
  
  async enrollUser(courseId: string, userId: number) {
    console.log(`Enrolling user ${userId} in course ${courseId}`);
    return { success: true, enrollmentId: `enr_${Date.now()}` };
  }
};
