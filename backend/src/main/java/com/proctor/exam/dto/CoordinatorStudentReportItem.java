package com.proctor.exam.dto;

import java.math.BigDecimal;

public record CoordinatorStudentReportItem(
        Long studentId,
        String registerNumber,
        String name,
        String profName,
        String department,
        int totalQuestions,
        int completedQuestions,
        int incompleteQuestions,
        String studentEmail,
        Long attemptId,
        String attemptStatus,
        int warningStrikes,
        boolean isTerminated,
        BigDecimal score,
        BigDecimal riskScore,
        Boolean flaggedForReview
) {
    public CoordinatorStudentReportItem(Long studentId, String registerNumber, String name, String profName, String department, int totalQuestions, int completedQuestions, int incompleteQuestions) {
        this(studentId, registerNumber, name, profName, department, totalQuestions, completedQuestions, incompleteQuestions, null, null, null, 0, false, null, null, false);
    }

    public CoordinatorStudentReportItem(Long studentId, String registerNumber, String name, String profName, String department, int totalQuestions, int completedQuestions, int incompleteQuestions, String studentEmail, Long attemptId, String attemptStatus, int warningStrikes, boolean isTerminated) {
        this(studentId, registerNumber, name, profName, department, totalQuestions, completedQuestions, incompleteQuestions, studentEmail, attemptId, attemptStatus, warningStrikes, isTerminated, null, null, false);
    }
}
