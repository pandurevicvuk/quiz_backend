import { User } from "../users/users";
import { sequelize } from "../../sequelize";
import { Model, DataTypes, Optional } from "sequelize";
import { QuestionsReportedAttributes } from "./questions-reported.def";
import { QuestionEN } from "../questions/questions-en";

export class QuestionsReportedEN
  extends Model<
    QuestionsReportedAttributes,
    Optional<QuestionsReportedAttributes, "id">
  >
  implements QuestionsReportedAttributes
{
  id!: number;
  questionId!: number;
  comment!: string | null;
  userId!: number;
}

const instance = QuestionsReportedEN.init(
  {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    questionId: {
      field: "question_id",
      type: DataTypes.INTEGER,
    },
    comment: {
      field: "comment",
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      field: "user_id",
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "questions_reported_en",
    freezeTableName: true,
    createdAt: true,
    updatedAt: false,
  }
);

QuestionsReportedEN.belongsTo(QuestionEN, {
  foreignKey: "questionId",
  targetKey: "id",
});

export { instance };
