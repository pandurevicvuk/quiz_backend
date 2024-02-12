import { db } from "../../database";
import { sequelize } from "../../sequelize";
import { UserAttributes } from "./users.def";
import { UserType } from "../user_types/user_types";
import { Model, DataTypes, Optional } from "sequelize";
import { QuestionAnsweredEN } from "../questions_answered/questions-answered-en";
import { QuestionsReportedEN } from "../questions_reported/questions-reported-en";

export class User
  extends Model<UserAttributes, Optional<UserAttributes, "id">>
  implements UserAttributes
{
  public id!: number;
  public active!: boolean;
  public firstName!: string;
  public lastName!: string;
  public email?: string;
  public googleId?: string;
  public photo?: string;
  public typeId!: number;
}

const instance = User.init(
  {
    id: {
      field: "id",
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    active: {
      field: "active",
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    firstName: {
      field: "first_name",
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastName: {
      field: "last_name",
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      field: "email",
      type: DataTypes.STRING(),
      allowNull: true,
      unique: true,
    },
    googleId: {
      field: "google_id",
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    photo: {
      field: "photo",
      type: DataTypes.TEXT,
      allowNull: true,
    },
    typeId: {
      field: "type_id",
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "users",
    freezeTableName: true,
    updatedAt: false,
    createdAt: false,
    hooks: {
      afterCreate: async (user, options) => {
        await db.UserStats.create({ id: user.id });
      },
    },
    defaultScope: {
      attributes: {
        exclude: ["typeId", "active", "googleId", "email"],
      },
    },
  }
);

UserType.hasMany(User, { foreignKey: "typeId" });
User.belongsTo(UserType, { foreignKey: "typeId" });
User.hasOne(QuestionAnsweredEN, { foreignKey: "userId", onDelete: "cascade" });
User.hasMany(QuestionsReportedEN, {
  foreignKey: "userId",
  onDelete: "cascade",
});

export { instance };
