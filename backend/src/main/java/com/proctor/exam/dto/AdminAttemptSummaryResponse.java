package com.proctor.exam.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminAttemptSummaryResponse(
        Long attemptId,
        Long examId,
        String studentEmail,
        Integer attemptNumber,
        String status,
        Instant startTime,
        Instant endTime,
        BigDecimal score,
        long totalEvents,
        long infoEvents,
        long lowEvents,
        long mediumEvents,
        long highEvents,
        long criticalEvents,
        BigDecimal currentRiskScore,
        Boolean flaggedForReview,
        ProctoringSessionResponse proctoringSession,
        Integer totalQuestions,
        Integer completedQuestions,
        Integer warningStrikes
) {
    public AdminAttemptSummaryResponse(Long attemptId, Long examId, String studentEmail, Integer attemptNumber,
                                      String status, Instant startTime, Instant endTime, BigDecimal score,
                                      long totalEvents, long infoEvents, long lowEvents, long mediumEvents,
                                      long highEvents, long criticalEvents, BigDecimal currentRiskScore,
                                      Boolean flaggedForReview, ProctoringSessionResponse proctoringSession) {
        this(attemptId, examId, studentEmail, attemptNumber, status, startTime, endTime, score, totalEvents,
                infoEvents, lowEvents, mediumEvents, highEvents, criticalEvents, currentRiskScore, flaggedForReview,
                proctoringSession, null, null, 0);
    }
}
