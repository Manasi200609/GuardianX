const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser ,
  enableGuardianMode,
   triggerSOS ,
   updateContacts,
  updateGesture,
} = require("../controllers/userController");

// Register user
router.post("/register", registerUser);
router.post("/login", loginUser );

// Toggle Guardian Mode
router.put("/guardian-mode/:id", enableGuardianMode);

router.post("/sos/:id", triggerSOS);

// new
router.put('/contacts/:id', updateContacts);
router.put('/gesture/:id', updateGesture);



module.exports = router;