import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decode.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
};

export default protect;