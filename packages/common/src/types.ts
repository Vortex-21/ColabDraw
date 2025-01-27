import z from "zod";
export const SignUpSchema = z.object({
  username: z.string().min(3, {
    message: "Username should contain atleast 3 characters.",
  }),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
  name: z.string().min(3, {
    message: "Name should contain atleast 3 characters.",
  }),
  photo: z.string().url({
    message: "Invalid URL format.",
  }).or(z.string().length(0)),
});

export const CreateRoomSchema = z.object({
  slug: z.string().min(3, {
    message: "Slug should contain atleast 3 characters.",
  }),
})
