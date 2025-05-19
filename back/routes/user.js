import express from "express"
const router=express.Router()
import user from "../controller/user.js"
router.post('/signup',user.usersignup)
router.post('/login',user.userlogin)

export default  router