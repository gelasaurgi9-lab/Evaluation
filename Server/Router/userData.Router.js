import express from "express";
import { protect, authorize } from "../Middleware/protect.js";
import { adminResetPassword, deleteUser, editUser, fetchAllUser, fetchUserSingle } from "../Controller/UserData.Controller.js";

const router = express.Router();

// Apply both protect and authorize middlewares
router.get('/', protect, authorize(['department_head', 'quality_officer', 'Student','instructor','college_dean','Human_resours','Vice_academy']), fetchAllUser);
router.delete('/delete-user/:id', protect, authorize('department_head'), deleteUser);
router.put('/edit-user/:id', protect, authorize('department_head'), editUser);
router.get('/search-user', protect, authorize('department_head','Student'), fetchUserSingle);
router.patch("/reset-password/:id", protect, authorize('department_head'), adminResetPassword);

export default router;