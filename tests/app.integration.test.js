// Run: npm test

// 1. import dependencies
import "../set-test-env/set-integration-test-env.js"; // before importing app
import { generateValidPassword } from "../helper-functions";
import { app, mongoose, User } from "../app.js";
import request from "supertest";

// 2. define variables
const validEmail = "test@hotmail.com";
const invalidEmail = "test@test";
const invalidPassword = "";

// 3. integration tests
beforeEach(async () => {
    await User.deleteMany({}); // clean collection before each test
});

afterAll(async () => {
    await mongoose.connection.close(); // close mongoose connection
});

describe("POST /register", () => {
    
    test("Without payload", async () => {
        const response = await request(app).post("/register").send({});
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).not.toEqual(expect.anything());
        expect(response.body.errors.generalError).toEqual(expect.anything()); // expected
        expect(response.body.errors.emailAlreadyInUseError).not.toEqual(expect.anything());
    });

    test("Invalid email and valid password in payload", async () => {
        const response = await request(app).post("/register").send( {
            "email": invalidEmail,
            "password": generateValidPassword()
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).toEqual(expect.anything()); // expected
        expect(response.body.errors.passwordError).not.toEqual(expect.anything());
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailAlreadyInUseError).not.toEqual(expect.anything());
    });

    test("Valid (new) email and invalid password in payload", async () => {
        const response = await request(app).post("/register").send( {
            "email": validEmail,
            "password": invalidPassword
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).toEqual(expect.anything()); // expected
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailAlreadyInUseError).not.toEqual(expect.anything());
    });

    test("Valid (new) email and valid password in payload", async () => {
        const response = await request(app).post("/register").send( {
            "email": validEmail,
            "password": generateValidPassword()
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors).not.toEqual(expect.anything());
    });

    test("Invalid email and invalid password in payload", async () => {
        const response = await request(app).post("/register").send( {
            "email": invalidEmail,
            "password": invalidPassword
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).toEqual(expect.anything()); // expected
        expect(response.body.errors.passwordError).toEqual(expect.anything()); // expected
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailAlreadyInUseError).not.toEqual(expect.anything());
    });

    test("Valid (registered) email and valid password in payload", async () => {
        await request(app).post("/register").send( {
            "email": validEmail,
            "password": generateValidPassword()
        });
        const response = await request(app).post("/register").send( {
            "email": validEmail,
            "password": generateValidPassword()
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).not.toEqual(expect.anything());
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailAlreadyInUseError).toEqual(expect.anything()); // expected
    });

    test("Valid (registered) email and invalid password in payload", async () => {
        await request(app).post("/register").send( {
            "email": validEmail,
            "password": generateValidPassword()
        });
        const response = await request(app).post("/register").send( {
            "email": validEmail,
            "password": invalidPassword
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).toEqual(expect.anything()); // expected
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailAlreadyInUseError).not.toEqual(expect.anything());
    });
});

describe("POST /login", () => {

    test("Without payload", async () => {
        const response = await request(app).post("/login").send({});
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).not.toEqual(expect.anything());
        expect(response.body.errors.generalError).toEqual(expect.anything()); // expected
        expect(response.body.errors.emailPassCombinationError).not.toEqual(expect.anything());
    });

    test("Invalid email and valid password in payload", async () => {
        const response = await request(app).post("/login").send( {
            "email": invalidEmail,
            "password": generateValidPassword()
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).toEqual(expect.anything()); // expected
        expect(response.body.errors.passwordError).not.toEqual(expect.anything());
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailPassCombinationError).not.toEqual(expect.anything());
    });

    test("Valid (unregistered) email and invalid password in payload", async () => {
        const response = await request(app).post("/login").send( {
            "email": validEmail,
            "password": invalidPassword
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).toEqual(expect.anything()); // expected
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailPassCombinationError).not.toEqual(expect.anything());
    });

    test("Valid (unregistered) email and valid password in payload", async () => {
        const response = await request(app).post("/login").send( {
            "email": validEmail,
            "password": generateValidPassword()
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).not.toEqual(expect.anything());
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailPassCombinationError).toEqual(expect.anything()); // expected
    });

    test("Invalid email and invalid password in payload", async () => {
        const response = await request(app).post("/login").send( {
            "email": invalidEmail,
            "password": invalidPassword
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).toEqual(expect.anything()); // expected
        expect(response.body.errors.passwordError).toEqual(expect.anything()); // expected
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailPassCombinationError).not.toEqual(expect.anything());
    });

    test("Valid (registered) email and invalid password in payload", async () => {
        await request(app).post("/register").send( {
            "email": validEmail,
            "password": generateValidPassword()
        });
        const response = await request(app).post("/login").send( {
            "email": validEmail,
            "password": invalidPassword
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).toEqual(expect.anything()); // expected
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailPassCombinationError).not.toEqual(expect.anything());
    });

    test("Valid (registered) email and valid (correct) password in payload", async () => {
        let validPassword = generateValidPassword();
        await request(app).post("/register").send( {
            "email": validEmail,
            "password": validPassword
        });
        const response = await request(app).post("/login").send( {
            "email": validEmail,
            "password": validPassword
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors).not.toEqual(expect.anything());
    });

    test("Valid (registered) email and valid (incorrect) password in payload", async () => {
        await request(app).post("/register").send( {
            "email": validEmail,
            "password": generateValidPassword()
        });
        const response = await request(app).post("/login").send( {
            "email": validEmail,
            "password": generateValidPassword() // most likely it's different
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
        expect(response.body.errors.emailError).not.toEqual(expect.anything());
        expect(response.body.errors.passwordError).not.toEqual(expect.anything());
        expect(response.body.errors.generalError).not.toEqual(expect.anything());
        expect(response.body.errors.emailPassCombinationError).toEqual(expect.anything()); // expected
    });
});

describe("POST /logout", () => {
    test ("Without payload", async () => {
        const response = await request(app).post("/register").send({});
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("json");
    });
});

describe("GET /", () => {
    test ("Initial view", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});

describe("GET /user", () => {
    test ("(Unauthorized) access to user view", async () => {
        const response = await request(app).get("/user");
        expect(response.statusCode).toBe(302); // redirected
    });
    // Authorized access tested via end2end test
});