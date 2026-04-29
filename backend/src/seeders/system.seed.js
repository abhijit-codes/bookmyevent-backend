import { Admin, Category } from "../models/index.js"
import { logger } from "../config/logger.js"

const categories = [
  "Photography",
  "Catering",
  "Decoration",
  "Entertainment",
  "DJs",
  "Venues",
  "Florists",
]

export const seedSystemData = async () => {
  const [admin, created] = await Admin.findOrCreate({
    where: { email: "pandaabhijit326@gmail.com" },
    defaults: {
      name: "Abhijit Panda",
      email: "pandaabhijit326@gmail.com",
      password: "admin123",
    },
  })

  if (!created && !(await admin.comparePassword("admin123"))) {
    admin.password = "admin123"
    await admin.save()
  }

  await Promise.all(
    categories.map((name) =>
      Category.findOrCreate({
        where: { name },
        defaults: {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          created_by_admin_id: admin.id,
        },
      }),
    ),
  )

  logger.info("System seed completed")
}
