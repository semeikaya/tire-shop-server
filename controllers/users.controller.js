const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

module.exports.userController = {
  signUp: async (req, res) => {
    try {
      const { name, email, login, password } = req.body;
      const isLogin = await User.findOne({ login });
      const isEmail = await User.findOne({ email });

      if (!name) {
        return res.json({
          error: "Вы не ввели имя",
        });
      }

      if (!login) {
        return res.json({
          error: "Придумайте логин",
        });
      }

      if (!password) {
        return res.json({
          error: "Придумайте пароль",
        });
      }

      if (isLogin) {
        return res.json({
          error: "Пользователь с таким логином уже существует",
        });
      }

      if (isEmail) {
        return res.json({
          error: "Пользователь с таким email уже существует",
        });
      }
      const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SEC));
      const user = await User.create({ name, email, login, password: hash });

      const payload = {
        name: user.name,
        id: user._id,
      };

      const token = await jwt.sign(payload, process.env.SECRET_JWT_KEY, {
        expiresIn: "24h",
      });

      return res.json(token);
    } catch (error) {
      res.json(error + "Ошибка при регистрации.");
    }
  },

  signIn: async (req, res) => {
    const { login, password } = req.body;
    const candidate = await User.findOne({ login });
    if (login === "") {
      return res.status(401).json({ error: "Вы не ввели имя" });
    }
    if (!candidate) {
      return res.status(401).json({ error: "Неверный логин" });
    }

    const valid = await bcrypt.compare(password, candidate.password);
    if (password === "") {
      return res.status(401).json({ error: "Вы не ввели пароль" });
    }
    if (!valid) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    const payload = {
      name: candidate.name,
      id: candidate._id,
    };

    const token = await jwt.sign(payload, process.env.SECRET_JWT_KEY, {
      expiresIn: "24h",
    });
    return res.json(token);
  },
  toUpYourAccount: async (req, res) => {
    const { id } = req.user;
    const { sum } = req.body;
    try {
      const user = await User.findById(id);
      user.capital = sum + user.capital;
      await user.save();
      return res.json("Счет пополнен.");
    } catch (error) {
      return res.json(error);
    }
  },
  isAuth: async (req, res) => {
    const { id } = req.user;
    try {
      if (id === undefined || id.length === 0) {
        return res.json(Error);
      }

      return res.json("auth");
    } catch (error) {
      return res.json(Error);
    }
  },
};
