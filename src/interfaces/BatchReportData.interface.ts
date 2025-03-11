interface BatchReportData {
    questionnaireId: string;
    totalAnswers: number;
    averageAIRating: number;
    averageUserMood: number;
    importanceDistribution: Record<string, number>; // e.g., { "1-3": 5, "4-6": 3, "7-10": 2 }
    categories: Record<string, number>; // e.g., { "Service": 4, "Product": 3 }
    tags: Record<string, number>; // e.g., { "positive": 5, "urgent": 2 }
    needsActionCount: number;
    prosCount: number;
    consCount: number;
    summaryStats: {
        totalPros: number;
        totalCons: number;
        actionStepsRequired: number;
    };
    lastUpdatedAnswers: string[]; // IDs of the last 10 answers processed
}