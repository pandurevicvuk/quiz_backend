import { db } from "../../database";
import { sequelize } from "../../sequelize";
import { UserAttributes } from "./users.def";

import { Model, DataTypes, Optional } from "sequelize";

export class User
  extends Model<UserAttributes, Optional<UserAttributes, "id">>
  implements UserAttributes
{
  public id!: number;

  public firstName!: string;
  public lastName!: string;
  public email?: string;
  public googleId?: string;
  public photo?: string;
}

const instance = User.init(
  {
    id: {
      field: "id",
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
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
  },
  {
    sequelize,
    tableName: "users",
    freezeTableName: true,
    updatedAt: false,
    createdAt: false,
    defaultScope: {
      attributes: {
        exclude: ["typeId", "active", "googleId", "email"],
      },
    },
  }
);
export { instance };
