import { Sequelize } from "sequelize"
import { config } from "./env.js"
import { logger } from "./logger.js"

const commonOptions = {
  dialect: config.db.dialect,
  logging: (message) => logger.debug(message),
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

export const sequelize = config.db.url ? new Sequelize(config.db.url, {
  ...commonOptions,
  dialectOptions: config.nodeEnv === "production" ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : undefined,
}) : new Sequelize(config.db.name, config.db.user, config.db.password, {
  ...commonOptions,
  host: config.db.host,
  port: config.db.port,
})
