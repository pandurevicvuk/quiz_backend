import { sequelize } from "../../sequelize";
import { QuestionsReportedEN } from "../questions_reported/questions-reported-en";
import { QuestionAttributes } from "./questions.def";
import { DataTypes, Model, Optional } from "sequelize";

export class QuestionEN
  extends Model<QuestionAttributes, Optional<QuestionAttributes, "id">>
  implements QuestionAttributes
{
  public id!: number;
  public q!: string;
  public a!: string;
  public b!: string;
  public c!: string;
  public version!: number;
}

const instance = QuestionEN.init(
  {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    q: { type: DataTypes.STRING(5000), allowNull: false },
    a: { type: DataTypes.STRING(1000), allowNull: false },
    b: { type: DataTypes.STRING(1000), allowNull: false },
    c: { type: DataTypes.STRING(1000), allowNull: false },
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "questions_en",
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

export { instance };
