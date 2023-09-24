import express from 'express';
import { authPrivilegeCode, restart_DB, updateCompanyIndustry } from '../controllers/settingController.mjs';  // Adjust the path if it's in a different directory

const router = express.Router();

router.post('/auth', authPrivilegeCode);
router.get('/restart_DB', restart_DB);
router.post('/updateIndustry', updateCompanyIndustry);

// Register other routes and bind them to their respective controller functions

export default router;
