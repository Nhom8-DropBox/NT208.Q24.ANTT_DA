//import User from '../models/userModel.js';// import User model
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const authController = {
    register: async (req, res) => {
        const { user_email, password} = req.body;

        try {
            const email = await User.findOne({ email : user_email});
            
            if(email )
            {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
        
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User(
                {
                    email: email,
                    password: hashedPassword
                }
            )

            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        }
        catch (err)
        {
            console.log('Error register!');
            res.status(500).json({ message: 'Server error' });
        }
    },

    login: async (req, res) =>
    {
        const { user_email, password } = req.body;
        
        try {
            const email = await User.findOne({email : user_email});

            if(!email)
            {
                return res.status(400).json({message: 'Invalid email or password' }); // Email is not found in db
            }

            const passwordMatch = await bcrypt.compare(password, email.password);

            if(!passwordMatch)
            {
                return res.status(400).json({message: 'Invalid email or password' }); // Password does not match
            }

            const token = jwt.sign({ userId: email.id }, process.env.JWT_SECRET);
            res.json({token});
        }
        catch (err)
        {
            console.log('Error login!');
            res.status(500).json({ message: 'Server error' });
        }
    }

};

export default authController;
