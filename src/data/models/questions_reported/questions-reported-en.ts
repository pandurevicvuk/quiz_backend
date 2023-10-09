import sequelize from "../../sequelize";
import { User } from "../users/users";
import { Model, DataTypes, Optional } from "sequelize";
import { QuestionsReportedAttributes } from "./questions-reported.def";

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
      primaryKey: true,
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
User.hasMany(QuestionsReportedEN, {
  foreignKey: "userId",
  onDelete: "cascade",
});
QuestionsReportedEN.belongsTo(User, {
  foreignKey: "userId",
});
export { instance };
