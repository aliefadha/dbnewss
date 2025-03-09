import { ActionError, defineAction } from "astro:actions";
import { db, eq, Users } from "astro:db";
import { z } from "astro:schema";
import path from "node:path";
import fs from "node:fs/promises";

import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt"

export const user = {
    postUser: defineAction({
        accept: "form",
        input: z.object({
            email: z.string({ message: "Email harus diisi" }).email("Format email salah"),
            password: z.string().min(4, "Harus lebih dari 4"),
            image: z.instanceof(File)
                .refine(
                    (file) =>
                        [
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                        ].includes(file.type),
                    { message: "Invalid image file type" }
                )
                .refine((file) => file.size <= 3 * 1024 * 1024, {
                    message: "File size should not exceed 3MB",
                }).optional()
        }),
        handler: async (input) => {
            const existingUsers = await db.select().from(Users).where(eq(Users.email, input.email));
            if (existingUsers.length > 0) {
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Email telah digunakan"
                })
            }

            let imageFilename = null;
            if (input.image) {
                const timestamp = Date.now();
                const filename = `${timestamp}-${input.image.name}`;
                const uploadDir = path.join(process.cwd(), "public", "uploads");

                await fs.mkdir(uploadDir, { recursive: true });

                const buffer = Buffer.from(await input.image.arrayBuffer());
                await fs.writeFile(path.join(uploadDir, filename), buffer);

                imageFilename = filename;
            }

            const hashedPassword = await bcrypt.hash(input.password, 10)
            const userData = db.insert(Users).values({
                id: uuidv4(),
                email: input.email,
                password_hash: hashedPassword,
                image: imageFilename,
            })
                .returning();
            return userData
        }
    })
}