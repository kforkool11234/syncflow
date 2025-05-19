import express from "express"
const router=express.Router()
import project from "../controller/project.js"
import projectu from "../controller/projectupdate.js"
import authenticate from "../middleware/authMiddleware.js"

router.post('/createproject/',authenticate.authenticateJWT,project.createproject)
router.get('/',authenticate.authenticateJWT,project.sproject)
router.get('/pinfo',project.pinfo)
router.patch('/addtask/:id',authenticate.adminOnly,projectu.addtask)
router.patch('/addteam/:id',authenticate.adminOnly,projectu.addteam)
router.patch('/addlink/:id',authenticate.adminOnly,projectu.addlink)
router.patch('/taskdone/:id',authenticate.adminOnly,projectu.taskdone)

export default router;