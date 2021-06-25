const express = require('express')
const router = express.Router()
const auth = require('../controllers/authenticate')
const user = require('../controllers/user')
const health = require('../controllers/health')

//const api = '/api/v1'

// APPLICATION HEALTH
router.get('/isalive', health.isAlive())

router.get('/metrics', health.metrics())

// AUTHENTICATION
router.get('/login/:param1?/:param2?/:param3?', auth.authenticateAzure())

router.get('/auth/openid/callback', auth.authenticateAzureCallback())

router.get(`/auth/logout`, auth.logout())

// USER
router.get('/user/profile', auth.ensureAuthenticated(), user.getUserProfile())

router.get('/user/session', auth.ensureAuthenticated(), user.userSessionLookup())

router.get('/', auth.ensureAuthenticated())

module.exports = router