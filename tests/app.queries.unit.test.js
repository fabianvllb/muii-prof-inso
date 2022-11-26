/*******************************************************************************
 * FILE TO TEST THE FUNCTIONALITY RELATED WITH QUERIES MANAGEMENT (TAIGA-EPIC #5)
 * 
 * To run: npm test 
 ******************************************************************************/

// Import dependencies
import "../set-test-env/set-integration-test-env.js"; // before importing app
import { app, mongoose, Query } from "../app.js";
import request from "supertest";

// Tests execution
beforeEach(async () => {
    await Query.deleteMany({}); // clean collection before each test
});

afterAll(async () => {
    await mongoose.connection.close(); // close mongoose connection
});

// Add Query Tests
describe("POST /addQuery", () => {
    /**
     * TEST 1
     * Test: Create a query without payload
     * Expected result: Query creation error (generalError)
     */
    test("Create a query without payload", async () => {
        const response = await request(app).post("/addQuery").send({});
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.generalError).toEqual(expect.anything());
    });

    /**
     * TEST 2
     * Test: Create a new query
     * Expected result: New query created (no errors)
     */
    test("Create a new query", async () => {
        const response = await request(app).post("/addQuery").send( {
            "description": "Test2 description",
            "type": "Test2Type",
            "userEmail": "test2@email.com"
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors).not.toEqual(expect.anything());
    });

    /**
     * TEST 3
     * Test: Create a query that already exists
     * Expected result: Query already exists error (queryAlreadyExists)
     */
    test("Create a query that already exists", async () => {
        await request(app).post("/addQuery").send( {
            "description": "Test3 description",
            "type": "Test3Type",
            "userEmail": "test3@email.com"
        });
        
        const response = await request(app).post("/addQuery").send( {
            "description": "Test3 description",
            "type": "Test3Type",
            "userEmail": "test3@email.com"
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.queryAlreadyExists).toEqual(expect.anything());
    });
});


// Remove Query Tests
describe("POST /delQuery", () => {
    /**
     * TEST 1
     * Test: Delete a query without payload
     * Expected result: Query remove error (generalError)
     */
    test("Delete a query without payload", async () => {
        const response = await request(app).post("/delQuery").send({});
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.generalError).toEqual(expect.anything());
    });

    /**
     * TEST 2
     * Test: Delete an existing query
     * Expected result: Query removed (no errors)
     */
    test("Delete an existing query", async () => {
        await request(app).post("/addQuery").send( {
            "description": "Test2 description",
            "type": "Test2Type",
            "userEmail": "test2@email.com"
        });

        const response = await request(app).post("/delQuery").send( {
            "description": "Test2 description",
            "type": "Test2Type",
            "userEmail": "test2@email.com"
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors).not.toEqual(expect.anything());
    });

    /** 
     * TEST 3
     * Test: Delete a non-existing query
     * Expected result: Query does not exist error (queryNonExists)
     */
    test("Delete a non-existing query", async () => {
        const response = await request(app).post("/delQuery").send( {
            "description": "Test3 description",
            "type": "Test3Type",
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.queryNonExists).toEqual(expect.anything());
    });
});