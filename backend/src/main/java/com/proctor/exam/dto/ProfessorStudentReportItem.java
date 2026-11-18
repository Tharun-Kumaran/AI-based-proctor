package com.proctor.exam.dto;

import java.math.BigDecimal;

public record ProfessorStudentReportItem(
        Long studentId,
        String registerNumber,
        String name,
        int totalQuestions,
        int completedQuestions,
        int incompleteQuestions,
        String studentEmail,
        Long attemptId,
        String attemptStatus,
        BigDecimal score,
        int warningStrikes,
        boolean isTerminated,
        BigDecimal riskScore,
        Boolean flaggedForReview
) {
    public ProfessorStudentReportItem(Long studentId, String registerNumber, String name, int totalQuestions, int completedQuestions, int incompleteQuestions) {
        this(studentId, registerNumber, name, totalQuestions, completedQuestions, incompleteQuestions, null, null, null, null, 0, false, null, false);
    }
}
