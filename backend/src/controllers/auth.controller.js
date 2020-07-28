const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const AuthMiddleware = require("../middlewares/auth.middleware");

const AuthService = require("../services/auth.service");
const { handleError } = require("../helpers/error");
const jwtConfig = require("../jwt");

router.post(
  "/login",
  [
    check("email").not().isEmpty().withMessage("Email is missing"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must have at least 5 chars long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    try {
      const { email, password } = req.body;
      const user = await AuthService.getUserWithPassword({ email });
      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "Invalid credentials",
        });
      }

      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        return res.status(401).json({
          status: 401,
          message: "Invalid credentials",
        });
      }
      const { TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        TOKEN_SECRET,
        {
          expiresIn: jwtConfig.TOKEN_EXP,
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        REFRESH_TOKEN_SECRET,
        {
          expiresIn: jwtConfig.REFRESH_TOKEN_EXP,
        }
      );
      user.password = null;
      return res
        .cookie("token", token, { httpOnly: false })
        .cookie("refresh_token", refreshToken, { httpOnly: false })
        .status(200)
        .json({
          status: 200,
          user,
        });
    } catch (e) {
      handleError(e, res);
    }
  }
);

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = await AuthMiddleware.verifyAuth(
      req.headers.cookie
    );

    if (!refreshToken) {
      return res.status(400).json({
        status: 400,
        message: "Invalid refresh token",
      });
    }

    const { TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

    const { id, email, name } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const token = jwt.sign({ id, email, name }, TOKEN_SECRET, {
      expiresIn: jwtConfig.TOKEN_EXP,
    });

    return res.cookie("token", token, { httpOnly: false }).status(200).json({
      status: 200,
    });
  } catch (e) {
    handleError(e, res);
  }
});

module.exports = router;
