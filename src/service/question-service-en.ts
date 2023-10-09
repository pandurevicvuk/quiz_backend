import { db } from "../data/database";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../data/sequelize";
import { QuestionEN } from "../data/models/questions/questions-en";

const limit = 10;

const getGameQuestions = async (
  player1Id: number,
  player2Id: number
): Promise<QuestionEN[]> => {
  //
  const [player1] = await db.QuestionsAnsweredEn.findOrCreate({
    where: { userId: player1Id },
    defaults: { userId: player1Id, questions: [] },
  });
  const [player2] = await db.QuestionsAnsweredEn.findOrCreate({
    where: { userId: player2Id },
    defaults: { userId: player2Id, questions: [] },
  });

  const combinedAnsweredQuestions = Array.from(
    new Set([...player1.questions, ...player2.questions])
  );

  const unansweredQuestionsList = await db.QuestionsEn.findAll({
    attributes: ["question_id"],
    where: { id: { [Op.notIn]: combinedAnsweredQuestions } },
    order: sequelize.random(),
    limit: limit,
  });

  const additionalQuestionsCount = limit - unansweredQuestionsList.length;
  if (additionalQuestionsCount === 0) return unansweredQuestionsList;

  // Adding additional questions that were answered first
  // Alternately - first half from player1, second half from player2

  const additionalQuestionsIdList: number[] = [];
  const list1: number[] = player1.questions;
  const list2: number[] = player2.questions;

  let i = 0;
  while (i < Math.floor(additionalQuestionsCount / 2) && list1.length > 0) {
    const questionId = list1.shift();
    if (!additionalQuestionsIdList.includes(questionId!)) {
      additionalQuestionsIdList.push(questionId!);
      i++;
    }
  }

  i = 0;
  while (i < Math.ceil(additionalQuestionsCount / 2) && list2.length > 0) {
    const questionId = list2.shift();
    if (!additionalQuestionsIdList.includes(questionId!)) {
      additionalQuestionsIdList.push(questionId!);
      i++;
    }
  }

  await db.QuestionsAnsweredEn.update(
    { questions: Sequelize.literal(`ARRAY[${list1}]::INTEGER[]`) },
    { where: { userId: player1Id } }
  );
  await db.QuestionsAnsweredEn.update(
    { questions: Sequelize.literal(` ARRAY[${list2}]::INTEGER[]`) },
    { where: { userId: player2Id } }
  );

  const additionalQuestionsList = await db.QuestionsEn.findAll({
    where: { id: additionalQuestionsIdList },
  });
  // Combine the unanswered and answered questions
  return [...unansweredQuestionsList, ...additionalQuestionsList];
};

const updateAnswered = async (
  userId: number,
  answeredInGameList: number[]
): Promise<void> => {
  if (answeredInGameList.length === 0) return;

  const answeredQuestionsRow = await db.QuestionsAnsweredEn.findOne({
    where: { userId },
  });

  if (answeredQuestionsRow) {
    const existingQuestionIds = answeredQuestionsRow.questions;
    if (!existingQuestionIds) return;

    const nerQuestionIdsSet = new Set([
      ...existingQuestionIds,
      ...answeredInGameList,
    ]);
    const newQuestionIds = Array.from(nerQuestionIdsSet);

    const totalQuestions = await db.QuestionsEn.count();
    if (newQuestionIds.length >= totalQuestions - 200) {
      newQuestionIds.splice(0, newQuestionIds.length - (totalQuestions - 200));
    }
    answeredQuestionsRow.questions = newQuestionIds;
    await answeredQuestionsRow.save();
  } else {
    await db.QuestionsAnsweredEn.create({
      userId,
      questions: answeredInGameList,
    });
  }
};

const getUnanswered = async (userId: number): Promise<number[]> => {
  //
  const [player] = await db.QuestionsAnsweredEn.findOrCreate({
    where: { userId: userId },
    defaults: { userId: userId, questions: [] },
  });

  const unansweredQuestionsIdList = await db.QuestionsEn.findAll({
    attributes: ["question_id"],
    where: { id: { [Op.notIn]: player.questions } },
    order: sequelize.random(),
    limit: limit,
  }).then((result) => result.map((e) => e.getDataValue("id")));

  return unansweredQuestionsIdList;
};

export default {
  getGameQuestions,
  updateAnswered,
  getUnanswered,
};
