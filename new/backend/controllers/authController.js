const users = [
    {
        id: 1,
        name: "aliqyaan",
        email: "aliqyaan@example.com",
        password: "123456",
        language: "English"
    },
    {
        id: 2,
        name: "reniyas",
        email: "reniyas@example.com",
        password: "123456",
        language: "Hindi"
    },
    {
        id: 3,
        name: "dylan",
        email: "dylan@example.com",
        password: "123456",
        language: "Urdu"
    },
    {
        id: 4,
        name: "romeiro",
        email: "romeiro@example.com",
        password: "123456",
        language: "Spanish"
    }
];

// Demo login: match email and password
const login = (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    // Redirect based on user (customize as needed)
    if (user.name === "aliqyaan") {
        return res.redirect("/dashboard-aliqyaan");
    } else if (user.name === "reniyas") {
        return res.redirect("/dashboard-reniyas");
    } else if (user.name === "dylan") {
        return res.redirect("/dashboard-dylan");
    } else {
        return res.redirect("/dashboard-romeiro");
    }
};

// Demo signup: not implemented, just return error
const signup = (req, res) => {
    return res.status(403).json({
        success: false,
        message: "Signup disabled for demo"
    });
};

module.exports = { signup, login };