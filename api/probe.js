module.exports = (req, res) => {
    res.status(200).json({
        message: "Vercel Function is working!",
        env: process.env.NODE_ENV,
        cwd: process.cwd()
    });
};
