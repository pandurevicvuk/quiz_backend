import { User } from "../users/users";
import { sequelize } from "../../sequelize";
import { UserStatsAttributes } from "./user-stats.def";
import { Model, DataTypes, Optional } from "sequelize";

export class UserStats
  extends Model<
    UserStatsAttributes,
    Optional<UserStatsAttributes, "id" | "wins" | "losses" | "draws" | "coins">
  >
  implements UserStatsAttributes
{
  public id!: number;
  public wins!: number;
  public coins!: number;
  public losses!: number;
  public draws!: number;
}

const instance = UserStats.init(
  {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    wins: {
      field: "wins",
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    losses: {
      field: "losses",
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    draws: {
      field: "draws",
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    coins: {
      field: "coins",
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "user_stats",
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);
User.hasOne(UserStats, { foreignKey: "id", onDelete: "cascade" });
UserStats.belongsTo(User, { foreignKey: "id", targetKey: "id" });
export { instance };
