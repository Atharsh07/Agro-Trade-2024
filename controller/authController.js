// authController.js
import { error } from 'console';
import userModel from '../models/userModels.js';
import { comparePassword, hashPassword } from '../helper/authHelper.js';
import JWT from 'jsonwebtoken';
import orderModel from "../models/orderModel.js"

// ... rest of the code remains the same

export const registerController = async(req, res) => {
    try {
        const {name, email, password, phone, address, answer} = req.body
        //validations
        if(!name){
            return res.send({message: "Name is requried"})
        }
        if(!email){
            return res.send({message: "Email is requried"})
        }
        if(!password){
            return res.send({message: "Password is requried"})
        }
        if(!phone){
            return res.send({message: "PhoneNumber is requried"})
        }
        if(!address){
            return res.send({message: "Address is requried"})
        }
        if(!answer){
          return res.send({message: "Answer is requried"})
      }
        // checking users
        const exisitingUser = await userModel.findOne({email})
        // exisiting users
        if(exisitingUser){
            return res.status(200).send({
                success:false,
                message: 'Already registered please Login'
            })
        }
        //resgister user
        const hashedPassword = await hashPassword(password)
        //save
        const user = await new userModel({name, email, phone, address, password:hashedPassword, answer}).save()

        res.status(201).send({
            success: true,
            message: 'User Register Successfully',
            user,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message: 'Error in Registration',
            error
        })
    }
}
// POST LOGIN
export const loginController = async(req, res) => {
    try {
      const {email,password} = req.body
      //validation
      if(!email || !password){
        return res.status(404).send({
            success: false,
            message: 'Invalid password or email'
        })
      } 
      //check user
      const user = await userModel.findOne({email})
      if(!user){
        return res.status(404).send({
            success: false,
            message: 'Email is not registerd'
        })
      }
      const match = await comparePassword(password,user.password) 
      if(!match){
        return res.status(200).send({
            success: false,
            message: 'Invalid Password'
        })
      }
      //token 
      const token = await JWT.sign({_id:user._id}, process.env.JWT_SECERT, {expiresIn: "7d"});
      res.status(200).send({
        success: true,
        message: 'Login successfully',
        user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
        },
        token,
      })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Erro in login',
            error
        })
    }
}
//forgot password controller
export const forgotPasswordController = async (req, res) => {
    try {
      const { email, answer, newPassword } = req.body;
      if (!email) {
        res.status(400).send({ message: "Emai is required" });
      }
      if (!answer) {
        res.status(400).send({ message: "answer is required" });
      }
      if (!newPassword) {
        res.status(400).send({ message: "New Password is required" });
      }
      //check
      const user = await userModel.findOne({ email, answer });
      //validation
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Wrong Email Or Answer",
        });
      }
      const hashed = await hashPassword(newPassword);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });
      res.status(200).send({
        success: true,
        message: "Password Reset Successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Something went wrong",
        error,
      });
    }
  };
  

//test controller
export const testController = (req, res) => {
    try {
      res.send("Protected Routes");
    } catch (error) {
      console.log(error);
      res.send({ error });
    }
  };



//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};


//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
//orders all
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 }); // Use -1 for descending order
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};


//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};