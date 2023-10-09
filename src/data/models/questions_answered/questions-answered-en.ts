import sequelize from "../../sequelize";
import { User } from "../users/users";
import { Model, DataTypes, Optional } from "sequelize";
import { AnsweredQuestionsAttributes } from "./questions-answered.def";

export class QuestionAnsweredEN
  extends Model<
    AnsweredQuestionsAttributes,
    Optional<AnsweredQuestionsAttributes, "userId">
  >
  implements AnsweredQuestionsAttributes
{
  userId!: number;
  questions!: number[];
}

const instance = QuestionAnsweredEN.init(
  {
    userId: {
      field: "user_id",
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    questions: {
      field: "questions",
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "questions_answered_en",
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);
User.hasOne(QuestionAnsweredEN, { foreignKey: "userId", onDelete: "cascade" });
QuestionAnsweredEN.belongsTo(User, { foreignKey: "userId" });
export { instance };
