import app from "./app.js"
import { config } from "./config/env.js"
import { sequelize } from "./config/database.js"
import { logger } from "./config/logger.js"
import "./models/index.js"
import { seedSystemData } from "./seeders/system.seed.js"

const startServer = async () => {
  try {
    await sequelize.authenticate()
    logger.info("MySQL connection established")

    if (config.nodeEnv === "development" || config.syncDb) {
      await sequelize.sync({ alter: true })
      logger.info("Sequelize models synced")
    }

    if (config.nodeEnv === "development" || config.seedDb) {
      await seedSystemData()
    }

    app.listen(config.port, "0.0.0.0", () => {
      logger.info(`API server running on port ${config.port}`)
    })
  } catch (error) {
    logger.error("Unable to start server", error)
    process.exit(1)
  }
}

startServer()
