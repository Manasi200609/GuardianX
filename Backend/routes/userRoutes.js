const express = require('express');
const router = express.Router();


const {
  registerUser,
  loginUser,
  enableGuardianMode,
  enableGuardianModeByEmail,
  triggerSOS,
  triggerSOSByEmail,
  updateContacts,
  updateContactsByEmail,
  updateGesture,
  getContactsById,           // ← add this
} = require('../controllers/userController');


router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/guardian-mode/:id', setGuardianMode);
router.put('/guardian-mode-by-email/:email', enableGuardianModeByEmail);

router.post('/sos/:id', triggerSOS);
router.post('/sos-by-email/:email', triggerSOSByEmail);

router.put('/contacts/:id', updateContacts);
router.get('/contacts/:id', getContactsById);       // ← new GET route

router.put('/contacts-by-email/:email', updateContactsByEmail);

router.put('/gesture/:id', updateGesture);

module.exports = router;
