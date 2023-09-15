import express from 'express';
import { authPrivilegeCode } from '../controllers/settingController.mjs';  // Adjust the path if it's in a different directory

const router = express.Router();

router.post('/auth', authPrivilegeCode);

// Register other routes and bind them to their respective controller functions

export default router;
