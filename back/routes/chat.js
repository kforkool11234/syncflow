import express from "express"
const router=express.Router()
import authenticate from "../middleware/authMiddleware.js"
import chat from "../controller/chat.js"

router.get('/',authenticate.authenticateJWT,chat.schat)
router.get('/getchat',chat.getchat)

export default router