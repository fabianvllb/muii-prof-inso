// Run: npm test

// 1. import dependencies
import "../set-test-env/set-end2end-test-env.js"; // before importing app
import { generateValidPassword } from "../helper-functions";
import { app, mongoose, User } from "../app.js";
import puppeteer from "puppeteer";

// 2. define variables
const port = 3000;
const validEmail = "test@hotmail.com";
const screenshotsPath = "tests/screenshots/";
let page;
let browser;
let appServer;

// 3. End to end tests
beforeAll(async () => {
    appServer = app.listen(port); // start app (server)
});

afterAll(async () => {
    await mongoose.connection.close(); // close mongoose connection
    await appServer.close(); // close app (server)
    await browser.close(); // close puppeteer browser
});

beforeEach(async () => {
    await User.deleteMany({}); // clean collection before each test
});

describe("Authentication", () => {

    test("Correct register, correct login, correct logout", async() => {
        let testNumber = 0;
        let screenShotNumber = 0;
        // open / page [defaultViewport: null -> take viewport size]
        browser = await puppeteer.launch({ headless: true, defaultViewport: null});
        page = await browser.newPage();
        await page.goto("http://localhost:" + port);
        expect(page.url()).toContain("http://localhost:" + port) // expect / page
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
        // switch from login to signup form
        let switchToSignUp = await page.waitForSelector("a.signup-instead");
        await switchToSignUp.click();
         // await for signup form
        await page.waitForSelector(".login-instead");
        expect(page.url()).toContain("http://localhost:" + port) // expect / page
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
        // register
        let pageEmail = await page.waitForSelector("input[type='email']");
        await pageEmail.type(validEmail);
        let pagePassword = await page.waitForSelector("input[type='password']");
        let password = generateValidPassword();
        await pagePassword.type(password);
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
        let pageBtn = await page.waitForSelector("#button");
        await pageBtn.click();
        // await for switch to login form
        await page.waitForSelector(".signup-instead");
        expect(page.url()).toContain("http://localhost:" + port) // expect / page
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
        // login
        pageEmail = await page.waitForSelector("input[type='email']");
        await pageEmail.type(validEmail);
        pagePassword = await page.waitForSelector("input[type='password']");
        await pagePassword.type(password);
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
        pageBtn = await page.waitForSelector("#button");
        await pageBtn.click();
        // await for redirection to user page
        await page.waitForSelector(".user-content");
        expect(page.url()).toContain("http://localhost:" + port + "/user") // expect /user page
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
        // logout
        pageBtn = await page.waitForSelector("#button");
        await pageBtn.click();
        // await for redirection to / page (login form)
        await page.waitForSelector(".signup-instead");
        expect(page.url()).toContain("http://localhost:" + port) // expect / page
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
    }, 12000); // 12s

    test("Unauthenticated access to /user", async () => {
        let testNumber = 1;
        let screenShotNumber = 0;
        // open /user page
        await page.goto("http://localhost:" + port + "/user");
        expect(page.url()).not.toBe("http://localhost:" + port + "/user") // expect / redirection
        await page.screenshot({ path: screenshotsPath + "screenshot-test" + testNumber + "#" + screenShotNumber + ".png" });
        screenShotNumber += 1;
    }, 12000); // 12s
});