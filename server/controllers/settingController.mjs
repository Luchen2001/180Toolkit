// settingController.mjs

export const authPrivilegeCode = (req, res) => {
    // Assuming you have the privilege code stored in an environment variable
    const correctPrivilegeCode = process.env.PASSWORD;
    const receivedPrivilegeCode = req.body.privilegeCode;

    if (receivedPrivilegeCode === correctPrivilegeCode) {
        res.json({ isValidCode: true });
    } else {
        res.json({ isValidCode: false });
    }
};
