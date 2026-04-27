const { getPagination, successResponse } = require("core-backend");

const pagination = getPagination({
  page: "2",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "desc",
});

console.log(pagination);
console.log(
  successResponse({
    message: "Loaded from JavaScript",
    data: { ready: true },
  }),
);
