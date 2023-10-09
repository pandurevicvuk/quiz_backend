import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../sequelize";
import { UserAttributes } from "./users.def";
// import { Bank } from '../bank/bank';

export class User
  extends Model<UserAttributes, Optional<UserAttributes, "id">>
  implements UserAttributes
{
  public id!: number;
  public active!: boolean;
  public firstName!: string;
  public lastName!: string;
  public username!: string;
  public email?: string;
  public google_token?: string;
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
      allowNull: false,
    },
    lastName: {
      field: "last_name",
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      field: "username",
      type: DataTypes.STRING(),
      allowNull: false,
      unique: true,
    },
    email: {
      field: "email",
      type: DataTypes.STRING(),
      allowNull: true,
      unique: true,
    },
    google_token: {
      field: "google_token",
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
  }
);
export { instance };
