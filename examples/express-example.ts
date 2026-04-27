import express from "express";
import {
  asyncHandler,
  errorMiddleware,
  notFoundMiddleware,
  successResponse,
} from "core-backend";

const app = express();

app.use(express.json());

app.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = [{ id: 1, name: "Ada Lovelace" }];

    res.json(
      successResponse({
        message: "Users fetched successfully",
        data: users,
      }),
    );
  }),
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
