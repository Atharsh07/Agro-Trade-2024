// authroute.js
import express from 'express';
import { registerController, loginController, testController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController} from '../controller/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authmiddleware.js';
//router object 
const router = express.Router();
//routing 
//REGISTER || METHOD POST
router.post('/register', registerController);
//LOGIN || METHOD POST
router.post('/login', loginController);
//Forgot password || POST
router.post('/forgot-password', forgotPasswordController);
//TEST ROUTES
router.get('/test', requireSignIn, isAdmin ,testController);
//PROTECT USER AUTH
router.get('/user-auth', requireSignIn, (req,res) => {
    res.status(200).send({ ok: true});
});
//PROTECT AUTH ADMIN
router.get('/admin-auth', requireSignIn,isAdmin, (req,res) => {
    res.status(200).send({ ok: true});
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
