import {
  getFilters,
  getPagination,
  getSearch,
  successResponse,
  type ApiResponse,
} from "core-backend";

const pagination = getPagination({ page: "1", limit: "10" });
const filters = getFilters({ status: "ACTIVE", password: "secret" }, [
  "status",
]);
const search = getSearch({ q: "student" });

const response: ApiResponse = successResponse({
  message: "TypeScript example",
  data: {
    pagination,
    filters,
    search,
  },
});

console.log(response);
