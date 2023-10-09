import sequelize from "../../sequelize";
import { Model, DataTypes, Optional } from "sequelize";
import { UserTypeAttributes } from "./user_type.def";
import { User } from "../users/users";

export class UserType
  extends Model<UserTypeAttributes, Optional<UserTypeAttributes, "id">>
  implements UserTypeAttributes
{
  public id!: number;
  public type!: string;
  public description!: string | null;
}

const instance = UserType.init(
  {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "user_types",
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

User.belongsTo(UserType, { foreignKey: "typeId" });
UserType.hasMany(User, { foreignKey: "typeId" });

export { instance };
