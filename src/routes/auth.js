import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import User from './../model/user';
import express from 'express';

const router = express.Router();

const TOKEN_KEY = process.env.TOKEN_KEY;

async function authenticate(req, res) {
	try {
		const { username, password } = req.body;
		const encryptedPassword = await bcrypt.hash(password, 10);

		const token = jwt.sign({ username, encryptedPassword }, TOKEN_KEY, {
			expiresIn: '2h',
		});

		var role = 'STUDENT';

		if (req.path.endsWith('/admin')) {
			role = 'ADMIN';
		}

		const findUser = await User.findOne({ username }).exec();

		if (findUser) {
			if (findUser.encryptedPassword != encryptedPassword) {
				return res.status(403).send(`Incorrect password provided for username: ${username}`);
			}

			await User.findOneAndUpdate({
				username: username.toLowerCase(),
			}, {
				token
			}, {
				new: true
			});
		} else {
			const user = await User.create({
				username: username.toLowerCase(),
				encryptedPassword,
				token,
				role
			});

			await user.save(function (err) {
				if (err) {
					console.error(err);
				}
			});
		}

		res.send({
			token,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
}

router.post('/admin', authenticate);
router.post('/student', authenticate);

export default router;