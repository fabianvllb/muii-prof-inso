function generateNumberInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // within min, max, both included
}

function generateValidPassword() {
    let password = "";
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let passwordLength = generateNumberInRange(process.env.MIN_PASSWORD_LENGTH, process.env.MAX_PASSWORD_LENGTH);
    for (let i = 0; i < passwordLength; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}

export { generateValidPassword };