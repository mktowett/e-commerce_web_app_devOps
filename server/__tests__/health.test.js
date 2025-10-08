const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

describe("Health API", () => {
  it("GET /api/health should return status ok", async () => {
    const response = await api
      .get("/api/health")
      .expect(200);
    
    expect(response.body).toEqual({ status: "ok" });
  });
});
