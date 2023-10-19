import {
  user,
  userType,
  questionEN,
  questionsReportedEN,
  questionsAnsweredEN,
  userStats,
} from "./models";

export const db = {
  User: user,
  UserType: userType,
  UserStats: userStats,
  QuestionsEn: questionEN,
  QuestionsAnsweredEn: questionsAnsweredEN,
  QuestionsReportedEn: questionsReportedEN,
};
