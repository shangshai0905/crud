let express = require('express');
let router = express.Router();
let register_controller = require('../controllers/auth_account')

router.post('/register', register_controller.addAccount);
router.post('/login', register_controller.loginAccount);

router.get('/updateForm/:student_id', register_controller.updateForm);

router.post('/updateUser', register_controller.updateUser);

router.get('/deleteUser/:student_id', register_controller.deleteUser);

router.get('/logout', register_controller.logoutAccount);

router.get('/back', register_controller.back);

module.exports = router;