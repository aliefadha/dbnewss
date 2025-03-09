import { column, defineDb, defineTable, NOW } from "astro:db";

// https://astro.build/db/config

const Users = defineTable({
  columns: {
    id: column.text({ primaryKey: true, }),
    email: column.text({ unique: true }),
    password_hash: column.text(),
    image: column.text({ optional: true }),
    created_at: column.date({ default: NOW }),
  },
});

export default defineDb({
  tables: { Users },
});
